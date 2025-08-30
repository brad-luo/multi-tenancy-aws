import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceList from '../WorkspaceList';
import { Workspace } from '@/types';
import { LIMITS } from '@/config/global-config';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WorkspaceList', () => {
  const mockOnWorkspaceSelect = jest.fn();
  const testUserId = 'test-user-id';
  
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Test Workspace 1',
      description: 'First test workspace',
      userId: testUserId,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Workspace 2',
      description: 'Second test workspace',
      userId: testUserId,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnWorkspaceSelect.mockClear();
  });

  it('renders workspace list with data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    // Should show loading initially
    expect(screen.getByText('Loading workspaces...')).toBeInTheDocument();

    // Wait for workspaces to load
    await waitFor(() => {
      expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
      expect(screen.getByText('Test Workspace 2')).toBeInTheDocument();
    });

    expect(screen.getByText('First test workspace')).toBeInTheDocument();
    expect(screen.getByText('Second test workspace')).toBeInTheDocument();
  });

  it('renders empty state when no workspaces', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first workspace to get started')).toBeInTheDocument();
    });
  });

  it('calls onWorkspaceSelect when workspace is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    const user = userEvent.setup();
    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Workspace 1'));

    expect(mockOnWorkspaceSelect).toHaveBeenCalledWith(mockWorkspaces[0]);
  });

  it('opens create workspace dialog', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    const user = userEvent.setup();
    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Create Workspace'));

    expect(screen.getByText('Create New Workspace')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
  });

  it('creates new workspace successfully', async () => {
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    // Mock create workspace
    const newWorkspace = {
      id: '3',
      name: 'New Workspace',
      description: 'New test workspace',
      userId: testUserId,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspace: newWorkspace }),
    });

    const user = userEvent.setup();
    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    });

    // Open dialog
    await user.click(screen.getByText('Create Workspace'));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Workspace');
    await user.type(screen.getByLabelText('Description (optional)'), 'New test workspace');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Workspace' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Workspace',
          description: 'New test workspace',
          userId: testUserId,
        }),
      });
    });
  });

  it('shows workspace limit warning when at maximum', async () => {
    const maxWorkspaces = Array.from({ length: LIMITS.WORKSPACES_PER_USER }, (_, i) => ({
      id: `${i + 1}`,
      name: `Workspace ${i + 1}`,
      description: `Test workspace ${i + 1}`,
      userId: testUserId,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: maxWorkspaces }),
    });

    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      expect(screen.getByText(`Maximum workspace limit reached (${LIMITS.WORKSPACES_PER_USER}/${LIMITS.WORKSPACES_PER_USER})`)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Create Workspace/ })).toBeDisabled();
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />);

    await waitFor(() => {
      // Should stop loading even on error
      expect(screen.queryByText('Loading workspaces...')).not.toBeInTheDocument();
    });

    // Should show empty state as fallback
    expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
  });
});