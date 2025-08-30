import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './aws-config';
import { Project } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getWorkspaceById } from './workspace';
import { LIMITS, canAddProject } from '@/config/global-config';
import { deleteProjectFiles } from './storage';

export async function createProject(
  name: string, 
  workspaceId: string, 
  userId: string, 
  description?: string
): Promise<Project | null> {
  try {
    // Verify workspace ownership
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.userId !== userId) {
      throw new Error('Workspace not found or access denied');
    }

    // Check project limit
    const workspaceProjects = await getProjectsByWorkspaceId(workspaceId);
    if (!canAddProject(workspaceProjects.length)) {
      throw new Error(`Maximum project limit (${LIMITS.PROJECTS_PER_WORKSPACE}) reached for this workspace`);
    }

    const projectId = uuidv4();
    const now = new Date().toISOString();

    const project: Project = {
      id: projectId,
      name,
      description,
      workspaceId,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAMES.PROJECTS,
      Item: project,
    }));

    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function getProjectsByWorkspaceId(workspaceId: string): Promise<Project[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAMES.PROJECTS,
      IndexName: 'workspaceId-index',
      KeyConditionExpression: 'workspaceId = :workspaceId',
      ExpressionAttributeValues: {
        ':workspaceId': workspaceId,
      },
    }));

    return (result.Items || []) as Project[];
  } catch (error) {
    console.error('Error getting projects by workspace ID:', error);
    return [];
  }
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAMES.PROJECTS,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return (result.Items || []) as Project[];
  } catch (error) {
    console.error('Error getting projects by user ID:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAMES.PROJECTS,
      Key: { id },
    }));

    if (result.Item) {
      return result.Item as Project;
    }
    return null;
  } catch (error) {
    console.error('Error getting project by ID:', error);
    return null;
  }
}

export async function updateProject(
  id: string, 
  userId: string, 
  updates: { name?: string; description?: string }
): Promise<Project | null> {
  try {
    // Verify ownership
    const project = await getProjectById(id);
    if (!project || project.userId !== userId) {
      throw new Error('Project not found or access denied');
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
      TableName: TABLE_NAMES.PROJECTS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Project;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  try {
    // Verify ownership
    const project = await getProjectById(id);
    if (!project || project.userId !== userId) {
      throw new Error('Project not found or access denied');
    }

    // Delete all S3 files for this project
    const s3DeleteSuccess = await deleteProjectFiles(userId, project.workspaceId, id);
    if (!s3DeleteSuccess) {
      console.warn('Failed to delete some S3 files for project:', id);
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAMES.PROJECTS,
      Key: { id },
    }));

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}