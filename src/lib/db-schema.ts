import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDBClient } from './aws-config';
import { TABLE_NAMES } from './aws-config';

export async function createTablesIfNotExist() {
  try {
    // Users table
    await dynamoDBClient.send(new CreateTableCommand({
      TableName: TABLE_NAMES.USERS,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'username-index',
          KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Users table created successfully');
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'ResourceInUseException') {
      console.error('Error creating users table:', error);
    }
  }

  try {
    // Workspaces table
    await dynamoDBClient.send(new CreateTableCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Workspaces table created successfully');
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'ResourceInUseException') {
      console.error('Error creating workspaces table:', error);
    }
  }

  try {
    // Projects table
    await dynamoDBClient.send(new CreateTableCommand({
      TableName: TABLE_NAMES.PROJECTS,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'workspaceId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'workspaceId-index',
          KeySchema: [
            { AttributeName: 'workspaceId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('Projects table created successfully');
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== 'ResourceInUseException') {
      console.error('Error creating projects table:', error);
    }
  }
}