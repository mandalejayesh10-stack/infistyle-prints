import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'ap-south-1';
const tableName = process.env.TABLE_NAME || 'infistyle-db-table';

const client = new DynamoDBClient({ region });
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const db = {
  tableName,
  
  async get(pk: string, sk: string) {
    const response = await ddbDocClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
      })
    );
    return response.Item;
  },

  async put(item: Record<string, any>) {
    await ddbDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );
    return item;
  },

  async query(pk: string, skPrefix?: string) {
    let keyConditionExpression = 'PK = :pk';
    const expressionAttributeValues: Record<string, any> = { ':pk': pk };

    if (skPrefix) {
      keyConditionExpression += ' AND begins_with(SK, :skPrefix)';
      expressionAttributeValues[':skPrefix'] = skPrefix;
    }

    const response = await ddbDocClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
    return response.Items || [];
  },

  async queryGSI1(gsi1Pk: string, gsi1SkPrefix?: string) {
    let keyConditionExpression = '#gsi1Pk = :gsi1Pk';
    const expressionAttributeValues: Record<string, any> = { ':gsi1Pk': gsi1Pk };
    const expressionAttributeNames: Record<string, string> = { '#gsi1Pk': 'GSI1-PK' };

    if (gsi1SkPrefix) {
      keyConditionExpression += ' AND begins_with(#gsi1Sk, :gsi1SkPrefix)';
      expressionAttributeValues[':gsi1SkPrefix'] = gsi1SkPrefix;
      expressionAttributeNames['#gsi1Sk'] = 'GSI1-SK';
    }

    const response = await ddbDocClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
      })
    );
    return response.Items || [];
  },

  async update(pk: string, sk: string, updateExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string>) {
    const response = await ddbDocClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      })
    );
    return response.Attributes;
  },

  async delete(pk: string, sk: string) {
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
      })
    );
    return true;
  },

  async scan() {
    const response = await ddbDocClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    );
    return response.Items || [];
  }
};
