import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileManager from '../FileManager';
import { Project, FileItem } from '@/types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe('FileManager', () => {
  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test project description',
    workspaceId: 'workspace-1',
    userId: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockFiles: FileItem[] = [
    {
      key: 'users/user-1/workspaces/workspace-1/projects/project-1/test.txt',
      name: 'test.txt',
      size: 1024,
      lastModified: '2025-01-01T00:00:00Z',
      projectId: 'project-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
    },
    {
      key: 'users/user-1/workspaces/workspace-1/projects/project-1/document.pdf',
      name: 'document.pdf',
      size: 2048,
      lastModified: '2025-01-01T00:00:00Z',
      projectId: 'project-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    
    // Mock document methods
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          target: '',
          click: jest.fn(),
          remove: jest.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return {} as HTMLElement;
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  it('renders files list with data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: mockFiles }),
    });

    render(<FileManager project={mockProject} userId="user-1" />);

    // Should show loading initially
    expect(screen.getByText('Loading files...')).toBeInTheDocument();

    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    expect(screen.getByText('1 KB • 1/1/2025')).toBeInTheDocument();
    expect(screen.getByText('2 KB • 1/1/2025')).toBeInTheDocument();
  });

  it('renders empty state when no files', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Upload your first file')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    // Mock initial files fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    // Mock file upload
    const uploadedFile = {
      key: 'users/user-1/workspaces/workspace-1/projects/project-1/new-file.txt',
      name: 'new-file.txt',
      size: 512,
      lastModified: '2025-01-01T00:00:00Z',
      projectId: 'project-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ file: uploadedFile }),
    });

    const user = userEvent.setup();
    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    // Create a mock file
    const file = new File(['file content'], 'new-file.txt', {
      type: 'text/plain',
    });

    // Find the hidden file input
    const fileInput = screen.getByRole('button', { name: 'Upload File' })
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();

    // Simulate file selection
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/files/upload', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });
  });

  it('handles file download', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: mockFiles }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ downloadUrl: 'https://example.com/download' }),
    });

    const user = userEvent.setup();
    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    // Find and click download button
    const downloadButtons = screen.getAllByRole('button');
    const downloadButton = downloadButtons.find(button => 
      button.querySelector('svg') // Looking for the download icon
    );

    expect(downloadButton).toBeInTheDocument();
    await user.click(downloadButton!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/files?'),
        expect.objectContaining({
          method: undefined, // GET request
        })
      );
    });
  });

  it('formats file sizes correctly', async () => {
    const filesWithSizes: FileItem[] = [
      { ...mockFiles[0], size: 0, name: 'empty.txt' },
      { ...mockFiles[0], size: 512, name: 'small.txt' },
      { ...mockFiles[0], size: 1536, name: 'medium.txt' }, // 1.5 KB
      { ...mockFiles[0], size: 1048576, name: 'large.txt' }, // 1 MB
      { ...mockFiles[0], size: 1073741824, name: 'huge.txt' }, // 1 GB
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: filesWithSizes }),
    });

    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('0 Bytes • 1/1/2025')).toBeInTheDocument();
      expect(screen.getByText('512 Bytes • 1/1/2025')).toBeInTheDocument();
      expect(screen.getByText('1.5 KB • 1/1/2025')).toBeInTheDocument();
      expect(screen.getByText('1 MB • 1/1/2025')).toBeInTheDocument();
      expect(screen.getByText('1 GB • 1/1/2025')).toBeInTheDocument();
    });
  });

  it('shows uploading state during file upload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    // Mock slow upload
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();
    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: 'Upload File' })
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    // Button should be disabled during upload
    expect(screen.getByRole('button', { name: 'Uploading...' })).toBeDisabled();
  });

  it('handles upload error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    // Mock failed upload
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    // Mock window.alert
    window.alert = jest.fn();

    const user = userEvent.setup();
    render(<FileManager project={mockProject} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: 'Upload File' })
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to upload file');
    });
  });
});