export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  projectId: string;
  workspaceId: string;
  userId: string;
}