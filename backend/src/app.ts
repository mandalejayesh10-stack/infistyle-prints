import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './services/dynamodb';
import { authMiddleware, adminMiddleware, AuthUser } from './middlewares/auth';

const app = new Hono().basePath('/api');

// Enable CORS
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://infistyle-prints.vercel.app'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Origin-Verify'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// ----------------------------------------------------
// 1. PUBLIC CATALOG ENDPOINTS
// ----------------------------------------------------

// Get all categories & products
app.get('/catalog', async (c) => {
  try {
    const items = await db.queryGSI1('STATUS#ACTIVE', 'CATEGORY#');
    // Map single-table items into categories list
    const categoriesMap: Record<string, any> = {};

    for (const item of items) {
      const categorySlug = item.SK.replace('CATEGORY#', '');
      categoriesMap[categorySlug] = {
        name: item.name,
        slug: categorySlug,
        description: item.description,
        image: item.image,
        items: [],
      };
    }

    // Fetch all products (items under categories)
    const allProducts = await db.scan();
    for (const prod of allProducts) {
      if (prod.PK.startsWith('PRODUCT#') && prod.SK === 'METADATA') {
        const catSlug = prod.categorySlug;
        if (categoriesMap[catSlug]) {
          categoriesMap[catSlug].items.push({
            name: prod.name,
            slug: prod.PK.replace('PRODUCT#', ''),
            price: prod.price,
            features: prod.features || [],
            images: prod.images || [],
          });
        }
      }
    }

    return c.json({ categories: Object.values(categoriesMap) });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch catalog: ' + err.message }, 500);
  }
});

// Save or Update catalog product (Admin only)
app.post('/catalog/products', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    
    // Map category name to slug
    const categoryName = body.category || 'Visiting Cards';
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    const productItem = {
      PK: `PRODUCT#${slug}`,
      SK: 'METADATA',
      categorySlug,
      name: body.name,
      price: Number(body.base_price),
      features: body.features || [],
      images: body.images || [],
      options_json: body.options_json || { finishes: ['Standard Matte', 'Standard Glossy'], corners: ['Square'], quantities: [100, 200, 500] },
      updatedAt: new Date().toISOString(),
    };

    await db.put(productItem);
    return c.json({ success: true, slug });
  } catch (err: any) {
    return c.json({ error: 'Failed to save product: ' + err.message }, 500);
  }
});

// Update product base pricing (Admin only)
app.put('/catalog/products/:slug/price', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { slug } = c.req.param();
    const { price } = await c.req.json();

    if (typeof price !== 'number' || price < 0) {
      return c.json({ error: 'Invalid price value' }, 400);
    }

    const updated = await db.update(
      `PRODUCT#${slug}`,
      'METADATA',
      'SET price = :price',
      { ':price': price }
    );

    return c.json({ success: true, updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to update pricing: ' + err.message }, 500);
  }
});

// Delete catalog product (Admin only)
app.delete('/catalog/products/:slug', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { slug } = c.req.param();
    await db.delete(`PRODUCT#${slug}`, 'METADATA');
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: 'Failed to delete product: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 1.5. LIVE SHOPPING CART ENDPOINTS
// ----------------------------------------------------

// Sync/Save user cart
app.post('/cart', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, userEmail, userName, items } = body;

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const cartItem = {
      PK: `CART#${userId}`,
      SK: 'METADATA',
      userId,
      userEmail: userEmail || 'Guest',
      userName: userName || 'Guest Customer',
      items: items || [],
      updatedAt: new Date().toISOString(),
    };

    await db.put(cartItem);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: 'Failed to sync cart: ' + err.message }, 500);
  }
});

// Get all active carts (Admin only)
app.get('/admin/carts', authMiddleware, adminMiddleware, async (c) => {
  try {
    const allItems = await db.scan();
    // Filter active carts where items array is not empty
    const carts = allItems.filter(item => item.PK.startsWith('CART#') && item.SK === 'METADATA' && Array.isArray(item.items) && item.items.length > 0);
    return c.json({ carts });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch active carts: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 2. USER DESIGNS ENDPOINTS
// ----------------------------------------------------

// Save user design
app.post('/designs', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const designId = body.designId || `design_${Date.now()}`;

    const designItem = {
      PK: `USER#${user.id}`,
      SK: `DESIGN#${designId}`,
      designId,
      name: body.name || 'Untitled Design',
      productSlug: body.productSlug,
      canvasState: body.canvasState, // Fabric.js JSON state
      previewUrl: body.previewUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put(designItem);
    return c.json({ success: true, designId });
  } catch (err: any) {
    return c.json({ error: 'Failed to save design: ' + err.message }, 500);
  }
});

// Get user designs list
app.get('/designs', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthUser;
    const designs = await db.query(`USER#${user.id}`, 'DESIGN#');
    return c.json({ designs });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch designs: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 3. ORDERS & CHECKOUT ENDPOINTS
// ----------------------------------------------------

// Create/Place custom print order
app.post('/orders', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const orderId = `order_${Date.now()}`;

    const orderItem = {
      PK: `USER#${user.id}`,
      SK: `ORDER#${orderId}`,
      orderId,
      userEmail: user.email,
      userName: user.name,
      items: body.items || [], // Items in shopping cart
      totalAmount: body.totalAmount,
      taxAmount: body.taxAmount,
      shippingAmount: body.shippingAmount,
      paymentMethod: body.paymentMethod, // Razorpay or COD
      paymentStatus: body.paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
      orderStatus: 'RECEIVED', // RECEIVED -> PRINTING -> SHIPPED -> DELIVERED
      shippingAddress: body.shippingAddress, // Google Maps geo coords included
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      'GSI1-PK': 'STATUS#ACTIVE',
      'GSI1-SK': `ORDER#${orderId}`,
    };

    await db.put(orderItem);

    // If Razorpay, integrate with SDK logic here and return receipt
    return c.json({ success: true, orderId, orderStatus: 'RECEIVED' });
  } catch (err: any) {
    return c.json({ error: 'Failed to place order: ' + err.message }, 500);
  }
});

// Get user orders list
app.get('/orders', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthUser;
    const orders = await db.query(`USER#${user.id}`, 'ORDER#');
    return c.json({ orders });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch orders: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 4. ADMIN PANEL MANAGEMENT
// ----------------------------------------------------

// Fetch Admin dashboard statistics (Admin only)
app.get('/admin/stats', authMiddleware, adminMiddleware, async (c) => {
  try {
    const allItems = await db.scan();
    
    let totalRevenue = 0;
    let activeOrdersCount = 0;
    let pendingPrintProofs = 0;
    const orders: any[] = [];

    for (const item of allItems) {
      if (item.SK.startsWith('ORDER#')) {
        orders.push(item);
        totalRevenue += item.totalAmount || 0;
        if (item.orderStatus !== 'DELIVERED') {
          activeOrdersCount++;
        }
        pendingPrintProofs += item.items?.length || 0;
      }
    }

    return c.json({
      revenue: totalRevenue,
      activeOrders: activeOrdersCount,
      pendingProofs: pendingPrintProofs,
      orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  } catch (err: any) {
    return c.json({ error: 'Failed to load statistics: ' + err.message }, 500);
  }
});

// Update order status (Admin only)
app.put('/admin/orders/:userId/:orderId/status', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { userId, orderId } = c.req.param();
    const { status } = await c.req.json();

    const updated = await db.update(
      `USER#${userId}`,
      `ORDER#${orderId}`,
      'SET orderStatus = :status, updatedAt = :now',
      {
        ':status': status,
        ':now': new Date().toISOString(),
      }
    );

    return c.json({ success: true, updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to update status: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 5. PUBLIC DESIGN TEMPLATES ENDPOINTS
// ----------------------------------------------------

// Save or Update design template (Admin only)
app.post('/templates', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const templateId = body.id || `template_${Date.now()}`;
    const productSlug = body.productSlug;

    if (!productSlug) {
      return c.json({ error: 'Product slug is required' }, 400);
    }

    const templateItem = {
      PK: `PRODUCT#${productSlug}`,
      SK: `TEMPLATE#${templateId}`,
      id: templateId,
      name: body.name || 'Untitled Template',
      productSlug,
      color: body.color || 'White',
      orientation: body.orientation || 'Horizontal',
      industry: body.industry || 'Corporate',
      theme: body.theme || 'Minimal',
      canvasJson: body.canvasJson,
      thumbnail: body.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put(templateItem);
    return c.json({ success: true, id: templateId });
  } catch (err: any) {
    return c.json({ error: 'Failed to save template: ' + err.message }, 500);
  }
});

// Get all templates across all products (Admin only)
app.get('/templates', authMiddleware, adminMiddleware, async (c) => {
  try {
    const allItems = await db.scan();
    const templates = allItems.filter(item => item.PK.startsWith('PRODUCT#') && item.SK.startsWith('TEMPLATE#'));
    return c.json({ templates });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch templates: ' + err.message }, 500);
  }
});

// Get templates by product slug
app.get('/templates/:productSlug', async (c) => {
  try {
    const { productSlug } = c.req.param();
    const templates = await db.query(`PRODUCT#${productSlug}`, 'TEMPLATE#');
    return c.json({ templates });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch templates: ' + err.message }, 500);
  }
});

// Delete template (Admin only)
app.delete('/templates/:productSlug/:templateId', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { productSlug, templateId } = c.req.param();
    await db.delete(`PRODUCT#${productSlug}`, `TEMPLATE#${templateId}`);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: 'Failed to delete template: ' + err.message }, 500);
  }
});

// ----------------------------------------------------
// 6. SEEDING ROUTE (FOR QUICK DATABASE SETUP ON AWS)
// ----------------------------------------------------
app.post('/seed', async (c) => {
  try {
    // Categories list to seed
    const categories = [
      { slug: 'visiting-cards', name: 'Visiting Cards', description: 'Premium visiting card layouts.', image: '/ai_model_visiting_card.png' },
      { slug: 'apparel', name: 'Apparel', description: 'Corporate shirts and custom clothing.', image: '/ai_model_polo_tshirt.png' },
      { slug: 'stationery', name: 'Stationery & Diaries', description: 'Corporate notebooks, diaries, and writing materials.', image: '/ai_model_nfc_keychain.png' }
    ];

    // Seed Categories
    for (const cat of categories) {
      await db.put({
        PK: `CATEGORY#${cat.slug}`,
        SK: 'METADATA',
        name: cat.name,
        description: cat.description,
        image: cat.image,
        'GSI1-PK': 'STATUS#ACTIVE',
        'GSI1-SK': `CATEGORY#${cat.slug}`,
      });
    }

    // Products list to seed
    const products = [
      { slug: 'standard-visiting-cards', categorySlug: 'visiting-cards', name: 'Standard Visiting Cards', price: 200, features: ['350 GSM paper', 'Matte finish', 'Double-sided printing'] },
      { slug: 'rounded-corner-visiting-cards', categorySlug: 'visiting-cards', name: 'Rounded Corner Cards', price: 300, features: ['400 GSM premium stock', 'Rounded edges'] },
      { slug: 'keychains', categorySlug: 'stationery', name: 'NFC Instagram Keychains', price: 150, features: ['Embedded NFC microchip', 'Direct social callback profile', 'Metal / acrylic body'] },
      { slug: 'mens-polo', categorySlug: 'apparel', name: 'Embroidered Polo Shirt', price: 490, features: ['100% pique cotton', 'Corporate chest embroidery'] }
    ];

    // Seed Products
    for (const prod of products) {
      await db.put({
        PK: `PRODUCT#${prod.slug}`,
        SK: 'METADATA',
        categorySlug: prod.categorySlug,
        name: prod.name,
        price: prod.price,
        features: prod.features,
      });
    }

    return c.json({ success: true, message: 'DynamoDB catalog seeded successfully.' });
  } catch (err: any) {
    return c.json({ error: 'Database seeding failed: ' + err.message }, 500);
  }
});

export default app;
