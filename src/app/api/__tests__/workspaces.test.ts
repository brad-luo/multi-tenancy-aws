import { GET as workspacesGET, POST as workspacesPOST } from '../workspaces/route';
import { NextRequest } from 'next/server';
import * as workspace from '@/lib/workspace';

// Mock the workspace module
jest.mock('@/lib/workspace');

const mockWorkspace = workspace as jest.Mocked<typeof workspace>;

describe('Workspaces API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/workspaces', () => {
    it('successfully retrieves user workspaces', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Test Workspace',
          description: 'A test workspace',
          userId: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockWorkspace.getWorkspacesByUserId.mockResolvedValue(mockWorkspaces);

      const request = new NextRequest('http://localhost:3000/api/workspaces?userId=user-1');
      const response = await workspacesGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.workspaces).toEqual(mockWorkspaces);
      expect(mockWorkspace.getWorkspacesByUserId).toHaveBeenCalledWith('user-1');
    });

    it('returns 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/workspaces');
      const response = await workspacesGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User ID is required');
    });

    it('handles internal server errors', async () => {
      mockWorkspace.getWorkspacesByUserId.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/workspaces?userId=user-1');
      const response = await workspacesGET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/workspaces', () => {
    it('successfully creates a workspace', async () => {
      const mockCreatedWorkspace = {
        id: 'workspace-1',
        name: 'New Workspace',
        description: 'A new workspace',
        userId: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockWorkspace.createWorkspace.mockResolvedValue(mockCreatedWorkspace);

      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workspace',
          description: 'A new workspace',
          userId: 'user-1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.workspace).toEqual(mockCreatedWorkspace);
      expect(mockWorkspace.createWorkspace).toHaveBeenCalledWith(
        'New Workspace',
        'user-1',
        'A new workspace'
      );
    });

    it('returns 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and user ID are required');
    });

    it('returns 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workspace',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and user ID are required');
    });

    it('returns 400 when workspace creation fails', async () => {
      mockWorkspace.createWorkspace.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workspace',
          userId: 'user-1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to create workspace or limit reached');
    });

    it('handles internal server errors', async () => {
      mockWorkspace.createWorkspace.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workspace',
          userId: 'user-1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('creates workspace without description', async () => {
      const mockCreatedWorkspace = {
        id: 'workspace-1',
        name: 'New Workspace',
        description: undefined,
        userId: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockWorkspace.createWorkspace.mockResolvedValue(mockCreatedWorkspace);

      const request = new NextRequest('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workspace',
          userId: 'user-1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await workspacesPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.workspace).toEqual(mockCreatedWorkspace);
      expect(mockWorkspace.createWorkspace).toHaveBeenCalledWith(
        'New Workspace',
        'user-1',
        undefined
      );
    });
  });
});