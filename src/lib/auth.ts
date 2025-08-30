import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './aws-config';
import { User } from '@/types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function createUser(username: string, password: string, email?: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      username,
      password: hashedPassword,
      email,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAMES.USERS,
      Item: user,
    }));

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAMES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    }));

    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAMES.USERS,
      Key: { id },
    }));

    if (result.Item) {
      return result.Item as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}