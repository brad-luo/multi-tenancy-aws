import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const workspaceId = formData.get('workspaceId') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !userId || !workspaceId || !projectId) {
      return NextResponse.json(
        { error: 'File, user ID, workspace ID, and project ID are required' },
        { status: 400 }
      );
    }

    const fileItem = await uploadFile(file, userId, workspaceId, projectId);

    if (!fileItem) {
      return NextResponse.json(
        { error: 'Failed to upload file or access denied' },
        { status: 400 }
      );
    }

    return NextResponse.json({ file: fileItem }, { status: 201 });
  } catch (error) {
    console.error('Upload file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}