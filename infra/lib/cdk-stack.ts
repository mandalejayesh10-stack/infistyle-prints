import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as path from 'path';

export class InfistyleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Amazon DynamoDB Single-Table Design Table
    const singleTable = new dynamodb.Table(this, 'InfistyleSingleTable', {
      tableName: 'infistyle-db-table',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
    });

    // Add Global Secondary Index 1 (GSI1) for alternate queries
    singleTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1-PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1-SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // 2. Amazon Cognito User Pool for Authentication
    const userPool = new cognito.UserPool(this, 'InfistyleUserPool', {
      userPoolName: 'infistyle-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Client for Frontend Apps
    const userPoolClient = new cognito.UserPoolClient(this, 'InfistyleUserPoolClient', {
      userPool: userPool,
      userPoolClientName: 'infistyle-web-client',
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        callbackUrls: [
          'http://localhost:3000/auth/callback',
          'https://infistyle-prints.vercel.app/auth/callback',
        ],
        logoutUrls: [
          'http://localhost:3000',
          'https://infistyle-prints.vercel.app',
        ],
      },
    });

    // 3. Amazon S3 Storage Buckets
    // Public Assets Bucket (mockup templates, category imagery)
    const publicAssetsBucket = new s3.Bucket(this, 'InfistylePublicAssetsBucket', {
      bucketName: `infistyle-public-assets-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Private Uploads Bucket (User customized SVG designs, output PDFs)
    const userUploadsBucket = new s3.Bucket(this, 'InfistyleUserUploadsBucket', {
      bucketName: `infistyle-user-uploads-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['http://localhost:3000', 'https://infistyle-prints.vercel.app'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          // Automatically transition objects to Intelligent-Tiering
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(0),
            },
          ],
        },
      ],
    });

    // 4. AWS Lambda for Hono Backend Service
    const honoBackendLambda = new lambda.Function(this, 'HonoBackendLambda', {
      functionName: 'infistyle-hono-api',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/dist')), // Pointing to compiled bundle
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: singleTable.tableName,
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
        PUBLIC_BUCKET_NAME: publicAssetsBucket.bucketName,
        UPLOADS_BUCKET_NAME: userUploadsBucket.bucketName,
      },
    });

    // Grant Lambda CRUD permissions to DynamoDB & S3 Buckets
    singleTable.grantReadWriteData(honoBackendLambda);
    publicAssetsBucket.grantReadWrite(honoBackendLambda);
    userUploadsBucket.grantReadWrite(honoBackendLambda);

    // 5. Lambda Function URL (For lowest-cost serverless invoke)
    const functionUrl = honoBackendLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['http://localhost:3000', 'https://infistyle-prints.vercel.app'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ['content-type', 'authorization', 'x-origin-verify'],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'DynamoDBTableName', { value: singleTable.tableName });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'PublicAssetsBucketName', { value: publicAssetsBucket.bucketName });
    new cdk.CfnOutput(this, 'UserUploadsBucketName', { value: userUploadsBucket.bucketName });
    new cdk.CfnOutput(this, 'HonoBackendUrl', { value: functionUrl.url });
  }
}
