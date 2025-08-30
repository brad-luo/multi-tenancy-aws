import { NextRequest, NextResponse } from 'next/server';
import { createWorkspace, getWorkspacesByUserId, deleteWorkspace } from '@/lib/workspace';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const workspaces = await getWorkspacesByUserId(userId);

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error('Get workspaces API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and user ID are required' },
        { status: 400 }
      );
    }

    const workspace = await createWorkspace(name, userId, description);

    if (!workspace) {
      return NextResponse.json(
        { error: 'Failed to create workspace or limit reached' },
        { status: 400 }
      );
    }

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Create workspace API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Workspace ID and user ID are required' },
        { status: 400 }
      );
    }

    const success = await deleteWorkspace(workspaceId, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete workspace or access denied' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Workspace deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete workspace API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}