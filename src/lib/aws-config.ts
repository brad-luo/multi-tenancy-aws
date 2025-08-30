import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

export const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const TABLE_NAMES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'multi-tenancy-users',
  WORKSPACES: process.env.DYNAMODB_WORKSPACES_TABLE || 'multi-tenancy-workspaces',
  PROJECTS: process.env.DYNAMODB_PROJECTS_TABLE || 'multi-tenancy-projects',
};

export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'multi-tenancy-files-bucket';