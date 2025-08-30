import { NextRequest, NextResponse } from 'next/server';
import { createProject, getProjectsByWorkspaceId, deleteProject } from '@/lib/project';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const projects = await getProjectsByWorkspaceId(workspaceId);

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Get projects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, workspaceId, userId } = await request.json();

    if (!name || !workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Name, workspace ID, and user ID are required' },
        { status: 400 }
      );
    }

    const project = await createProject(name, workspaceId, userId, description);

    if (!project) {
      return NextResponse.json(
        { error: 'Failed to create project, access denied, or limit reached' },
        { status: 400 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and user ID are required' },
        { status: 400 }
      );
    }

    const success = await deleteProject(projectId, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project or access denied' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete project API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}