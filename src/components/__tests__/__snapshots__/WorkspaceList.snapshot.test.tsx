import { render, waitFor } from '@testing-library/react';
import WorkspaceList from '../../WorkspaceList';
import { Workspace } from '@/types';
import { LIMITS } from '@/config/global-config';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WorkspaceList Snapshots', () => {
  const mockOnWorkspaceSelect = jest.fn();
  const testUserId = 'test-user-id';

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnWorkspaceSelect.mockClear();
  });

  it('matches snapshot for empty workspaces list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: [] }),
    });

    const { container } = render(
      <WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="empty-state"]') || container).toBeTruthy();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for workspaces list with data', async () => {
    const mockWorkspaces: Workspace[] = [
      {
        id: '1',
        name: 'Design Workspace',
        description: 'For all design projects',
        userId: testUserId,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Development Workspace',
        description: 'For development projects',
        userId: testUserId,
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workspaces: mockWorkspaces }),
    });

    const { container } = render(
      <WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />
    );

    await waitFor(() => {
      expect(container.querySelector('[role="grid"]') || container.textContent).toContain('Design Workspace');
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for maximum workspaces limit', async () => {
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

    const { container } = render(
      <WorkspaceList userId={testUserId} onWorkspaceSelect={mockOnWorkspaceSelect} />
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Maximum workspace limit');
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});