import { NextRequest, NextResponse } from 'next/server';
import { listProjectFiles, getFileDownloadUrl, deleteFile } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const workspaceId = searchParams.get('workspaceId');
    const projectId = searchParams.get('projectId');
    const action = searchParams.get('action');
    const fileKey = searchParams.get('key');

    if (!userId || !workspaceId || !projectId) {
      return NextResponse.json(
        { error: 'User ID, workspace ID, and project ID are required' },
        { status: 400 }
      );
    }

    if (action === 'download' && fileKey) {
      const downloadUrl = await getFileDownloadUrl(fileKey, userId, workspaceId, projectId);
      
      if (!downloadUrl) {
        return NextResponse.json(
          { error: 'Failed to generate download URL or access denied' },
          { status: 400 }
        );
      }

      return NextResponse.json({ downloadUrl }, { status: 200 });
    }

    // Default action: list files
    const files = await listProjectFiles(userId, workspaceId, projectId);

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('Files API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const workspaceId = searchParams.get('workspaceId');
    const projectId = searchParams.get('projectId');
    const fileKey = searchParams.get('key');

    if (!userId || !workspaceId || !projectId || !fileKey) {
      return NextResponse.json(
        { error: 'User ID, workspace ID, project ID, and file key are required' },
        { status: 400 }
      );
    }

    const success = await deleteFile(fileKey, userId, workspaceId, projectId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete file or access denied' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}