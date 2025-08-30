import { POST as registerPOST } from '../auth/register/route';
import { POST as loginPOST } from '../auth/login/route';
import { NextRequest } from 'next/server';
import * as auth from '@/lib/auth';
import * as dbSchema from '@/lib/db-schema';

// Mock the auth and db-schema modules
jest.mock('@/lib/auth');
jest.mock('@/lib/db-schema');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockDbSchema = dbSchema as jest.Mocked<typeof dbSchema>;

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('successfully registers a new user', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockDbSchema.createTablesIfNotExist.mockResolvedValue();
      mockAuth.createUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toEqual(mockUser);
      expect(mockDbSchema.createTablesIfNotExist).toHaveBeenCalled();
      expect(mockAuth.createUser).toHaveBeenCalledWith('testuser', 'password123', 'test@example.com');
    });

    it('returns 400 when username is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Username and password are required');
    });

    it('returns 400 when password is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: '123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password must be at least 6 characters long');
    });

    it('returns 400 when user creation fails', async () => {
      mockDbSchema.createTablesIfNotExist.mockResolvedValue();
      mockAuth.createUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'existinguser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Username already exists or registration failed');
    });

    it('handles internal server errors', async () => {
      mockDbSchema.createTablesIfNotExist.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('successfully authenticates a user', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockAuth.authenticateUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual(mockUser);
      expect(mockAuth.authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('returns 400 when username is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Username and password are required');
    });

    it('returns 401 when authentication fails', async () => {
      mockAuth.authenticateUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'wronguser',
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('handles internal server errors', async () => {
      mockAuth.authenticateUser.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});