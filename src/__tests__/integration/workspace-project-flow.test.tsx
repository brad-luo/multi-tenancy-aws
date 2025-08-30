import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Workspace, Project } from '@/types';
import { LIMITS } from '@/config/global-config';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Workspace and Project Flow Integration', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockWorkspaces: Workspace[] = [
    {
      id: 'workspace-1',
      name: 'Test Workspace',
      description: 'A test workspace',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      workspaceId: 'workspace-1',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      isLoading: false,
    });
  });

  it('completes full workspace creation and navigation flow', async () => {
    const user = userEvent.setup();

    // Mock initial empty workspaces
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    // Mock workspace creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspace: mockWorkspaces[0] }),
    });

    render(<Dashboard />);

    // Should show empty workspace state
    await waitFor(() => {
      expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
    });

    // Create new workspace
    await user.click(screen.getByText('Create Workspace'));
    
    // Fill workspace form
    await user.type(screen.getByLabelText('Name'), 'Test Workspace');
    await user.type(screen.getByLabelText('Description (optional)'), 'A test workspace');
    await user.click(screen.getByRole('button', { name: 'Create Workspace' }));

    // Should show the new workspace
    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    expect(screen.getByText('A test workspace')).toBeInTheDocument();

    // Mock projects fetch for when workspace is selected
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: [] }),
    });

    // Click on workspace to navigate
    await user.click(screen.getByText('Test Workspace'));

    // Should show workspace projects view
    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    // Should show back button
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('completes full project creation and navigation flow', async () => {
    const user = userEvent.setup();

    // Mock workspaces fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    render(<Dashboard />);

    // Wait for workspaces to load and click on one
    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    // Mock empty projects initially
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: [] }),
    });

    await user.click(screen.getByText('Test Workspace'));

    // Should show empty projects state
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    // Mock project creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ project: mockProjects[0] }),
    });

    // Create new project
    await user.click(screen.getByText('Create Project'));
    
    // Fill project form
    await user.type(screen.getByLabelText('Name'), 'Test Project');
    await user.type(screen.getByLabelText('Description (optional)'), 'A test project');
    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    // Should show the new project
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Mock files fetch for when project is selected
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    // Click on project to navigate
    await user.click(screen.getByText('Test Project'));

    // Should show file manager
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    // Should show back button
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('handles navigation back through the hierarchy', async () => {
    const user = userEvent.setup();

    // Start with workspaces
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    render(<Dashboard />);

    // Navigate to workspace
    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });

    await user.click(screen.getByText('Test Workspace'));

    // Navigate to project
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    await user.click(screen.getByText('Test Project'));

    // Should be in file manager
    await waitFor(() => {
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    // Go back to projects
    await user.click(screen.getByText('← Back'));

    // Should be in projects view
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText('Files')).not.toBeInTheDocument();
    });

    // Go back to workspaces
    await user.click(screen.getByText('← Back'));

    // Should be in workspaces view
    await waitFor(() => {
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.queryByText('← Back')).not.toBeInTheDocument();
    });
  });

  it('handles workspace limit enforcement', async () => {
    const user = userEvent.setup();

    // Create maximum workspaces
    const maxWorkspaces = Array.from({ length: LIMITS.WORKSPACES_PER_USER }, (_, i) => ({
      id: `workspace-${i + 1}`,
      name: `Workspace ${i + 1}`,
      description: `Test workspace ${i + 1}`,
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: maxWorkspaces }),
    });

    render(<Dashboard />);

    // Should show limit warning
    await waitFor(() => {
      expect(screen.getByText(`Maximum workspace limit reached (${LIMITS.WORKSPACES_PER_USER}/${LIMITS.WORKSPACES_PER_USER})`)).toBeInTheDocument();
    });

    // Create button should be disabled
    expect(screen.getByRole('button', { name: /Create Workspace/ })).toBeDisabled();
  });

  it('handles project limit enforcement within workspace', async () => {
    const user = userEvent.setup();

    // Mock workspaces fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    // Create maximum projects
    const maxProjects = Array.from({ length: LIMITS.PROJECTS_PER_WORKSPACE }, (_, i) => ({
      id: `project-${i + 1}`,
      name: `Project ${i + 1}`,
      description: `Test project ${i + 1}`,
      workspaceId: 'workspace-1',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: maxProjects }),
    });

    await user.click(screen.getByText('Test Workspace'));

    // Should show limit warning
    await waitFor(() => {
      expect(screen.getByText(`Maximum project limit reached (${LIMITS.PROJECTS_PER_WORKSPACE}/${LIMITS.PROJECTS_PER_WORKSPACE})`)).toBeInTheDocument();
    });

    // Create button should be disabled
    expect(screen.getByRole('button', { name: /Create Project/ })).toBeDisabled();
  });

  it('handles API errors gracefully during navigation', async () => {
    const user = userEvent.setup();

    // Mock successful workspace fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    // Mock failed projects fetch
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await user.click(screen.getByText('Test Workspace'));

    // Should handle error gracefully and show empty state
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    // Should still show the workspace name
    expect(screen.getByText('Test Workspace')).toBeInTheDocument();
  });
});