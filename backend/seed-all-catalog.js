const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const fs = require("fs");
const path = require("path");

const ddbClient = new DynamoDBClient({ region: "ap-south-1" });
const db = DynamoDBDocumentClient.from(ddbClient);
const tableName = "infistyle-db-table";

// Simple custom TS parser to read PRODUCT_CATALOG array from catalog.ts
function parseCatalogFile() {
  const filePath = path.join(__dirname, "../src/lib/catalog.ts");
  const content = fs.readFileSync(filePath, "utf8");
  
  // Use regex to locate export const PRODUCT_CATALOG
  const startIndex = content.indexOf("export const PRODUCT_CATALOG");
  if (startIndex === -1) {
    throw new Error("Could not find PRODUCT_CATALOG array in catalog.ts");
  }

  // Evaluate the typescript module by stripping types and exporting it as JS
  let jsContent = content
    .replace(/export interface [^{]*{[^}]*}/g, "")
    .replace(/: Category\[\]/g, "")
    .replace(/: SubProduct\[\]/g, "")
    .replace(/export const PRODUCT_CATALOG/g, "module.exports = PRODUCT_CATALOG");

  // Save temporary JS representation to evaluate
  const tempPath = path.join(__dirname, "temp-catalog.js");
  fs.writeFileSync(tempPath, jsContent, "utf8");
  
  const catalog = require(tempPath);
  fs.unlinkSync(tempPath); // cleanup
  
  return catalog;
}

async function run() {
  try {
    const catalog = parseCatalogFile();
    console.log(`Parsed ${catalog.length} categories from catalog.ts.`);

    for (const cat of catalog) {
      console.log(`Seeding Category: ${cat.name} (${cat.slug}) with ${cat.items.length} products...`);
      
      // 1. Put Category Item
      await db.send(new PutCommand({
        TableName: tableName,
        Item: {
          PK: `CATEGORY#${cat.slug}`,
          SK: "METADATA",
          name: cat.name,
          description: cat.description,
          image: cat.image,
          "GSI1-PK": "STATUS#ACTIVE",
          "GSI1-SK": `CATEGORY#${cat.slug}`,
        }
      }));

      // 2. Put each product item under category
      for (const prod of cat.items) {
        await db.send(new PutCommand({
          TableName: tableName,
          Item: {
            PK: `PRODUCT#${prod.slug}`,
            SK: "METADATA",
            categorySlug: cat.slug,
            name: prod.name,
            price: prod.price,
            features: prod.features,
            images: prod.images || [],
          }
        }));
      }
    }

    console.log("SUCCESS: All categories and products successfully seeded in the live database.");
  } catch (err) {
    console.error("SEEDING_ERROR:", err.message);
  }
}

run();
