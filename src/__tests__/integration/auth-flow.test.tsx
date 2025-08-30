import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Wrapper component with AuthProvider
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Default localStorage to empty (no saved user)
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('completes full registration and login flow', async () => {
    const user = userEvent.setup();

    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        }
      }),
    });

    // Mock workspaces fetch (empty initially)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Should start with auth form
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    // Switch to registration
    await user.click(screen.getByText('Need an account? Sign up'));
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();

    // Fill registration form
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Email (optional)'), 'test@example.com');
    
    // Submit registration
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    // Should transition to dashboard after successful registration
    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });

    // Should show workspaces view
    expect(screen.getByText('Workspaces')).toBeInTheDocument();
    expect(screen.getByText('No workspaces yet')).toBeInTheDocument();

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      })
    );
  });

  it('handles login with existing user', async () => {
    const user = userEvent.setup();

    // Mock successful login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 'user-2',
          username: 'existinguser',
          email: 'existing@example.com',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        }
      }),
    });

    // Mock workspaces fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Fill login form
    await user.type(screen.getByLabelText('Username'), 'existinguser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit login
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    // Should transition to dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome, existinguser!')).toBeInTheDocument();
    });

    expect(screen.getByText('Workspaces')).toBeInTheDocument();
  });

  it('persists user session across page loads', async () => {
    // Mock user in localStorage
    const savedUser = {
      id: 'user-3',
      username: 'persisteduser',
      email: 'persisted@example.com',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedUser));

    // Mock workspaces fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Should directly show dashboard with persisted user
    await waitFor(() => {
      expect(screen.getByText('Welcome, persisteduser!')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.getByText('Workspaces')).toBeInTheDocument();
  });

  it('handles logout flow', async () => {
    const user = userEvent.setup();

    // Start with logged in user
    const loggedInUser = {
      id: 'user-4',
      username: 'logoutuser',
      email: 'logout@example.com',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(loggedInUser));

    // Mock workspaces fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Should show dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome, logoutuser!')).toBeInTheDocument();
    });

    // Click logout
    await user.click(screen.getByText('Sign Out'));

    // Should return to auth form
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    // Should clear localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('handles authentication errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock failed login
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Fill login form
    await user.type(screen.getByLabelText('Username'), 'wronguser');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    // Submit login
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Should remain on auth form
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });

  it('handles network errors during authentication', async () => {
    const user = userEvent.setup();

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    );

    // Fill login form
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit login
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    // Should show generic error
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    // Should remain on auth form
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});