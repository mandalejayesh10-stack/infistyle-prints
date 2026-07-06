const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });

async function run() {
  try {
    const res = await client.send(new ScanCommand({ TableName: 'infistyle-db-table', Limit: 5 }));
    console.log('DB_SUCCESS: Successfully scanned infistyle-db-table');
    console.log('Items found:', res.Items ? res.Items.length : 0);
  } catch (err) {
    console.error('DB_ERROR:', err.message);
  }
}

run();
