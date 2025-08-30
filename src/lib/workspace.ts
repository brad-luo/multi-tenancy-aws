import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './aws-config';
import { Workspace } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { LIMITS, canAddWorkspace } from '@/config/global-config';
import { deleteWorkspaceFiles } from './storage';

export async function createWorkspace(
  name: string, 
  userId: string, 
  description?: string
): Promise<Workspace | null> {
  try {
    // Check workspace limit
    const userWorkspaces = await getWorkspacesByUserId(userId);
    if (!canAddWorkspace(userWorkspaces.length)) {
      throw new Error(`Maximum workspace limit (${LIMITS.WORKSPACES_PER_USER}) reached`);
    }

    const workspaceId = uuidv4();
    const now = new Date().toISOString();

    const workspace: Workspace = {
      id: workspaceId,
      name,
      description,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      Item: workspace,
    }));

    return workspace;
  } catch (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
}

export async function getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return (result.Items || []) as Workspace[];
  } catch (error) {
    console.error('Error getting workspaces by user ID:', error);
    return [];
  }
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      Key: { id },
    }));

    if (result.Item) {
      return result.Item as Workspace;
    }
    return null;
  } catch (error) {
    console.error('Error getting workspace by ID:', error);
    return null;
  }
}

export async function updateWorkspace(
  id: string, 
  userId: string, 
  updates: { name?: string; description?: string }
): Promise<Workspace | null> {
  try {
    // Verify ownership
    const workspace = await getWorkspaceById(id);
    if (!workspace || workspace.userId !== userId) {
      throw new Error('Workspace not found or access denied');
    }

    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, string> = {};

    if (updates.name) {
      updateExpression.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = updates.name;
    }

    if (updates.description !== undefined) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = updates.description;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Workspace;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
}

export async function deleteWorkspace(id: string, userId: string): Promise<boolean> {
  try {
    // Verify ownership
    const workspace = await getWorkspaceById(id);
    if (!workspace || workspace.userId !== userId) {
      throw new Error('Workspace not found or access denied');
    }

    // Delete all S3 files for this workspace
    const s3DeleteSuccess = await deleteWorkspaceFiles(userId, id);
    if (!s3DeleteSuccess) {
      console.warn('Failed to delete some S3 files for workspace:', id);
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAMES.WORKSPACES,
      Key: { id },
    }));

    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
}