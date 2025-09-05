'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FileManager from '@/components/file/FileManager';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Workspace, Project } from '@/types';

export default function ProjectPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaceAndProject = useCallback(async () => {
    try {
      // Fetch workspace
      const workspaceResponse = await fetch(`/api/workspaces?userId=${user?.id}`);
      if (workspaceResponse.ok) {
        const workspaceData = await workspaceResponse.json();
        const foundWorkspace = workspaceData.workspaces.find((w: Workspace) => w.id === params.workspaceId);
        setWorkspace(foundWorkspace || null);

        if (foundWorkspace) {
          // Fetch projects
          const projectResponse = await fetch(`/api/projects?workspaceId=${params.workspaceId}`);
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            const foundProject = projectData.projects.find((p: Project) => p.id === params.projectId);
            setProject(foundProject || null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching workspace and project:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, params.workspaceId, params.projectId]);

  useEffect(() => {
    if (user && params.workspaceId && params.projectId) {
      fetchWorkspaceAndProject();
    }
  }, [user, params.workspaceId, params.projectId, fetchWorkspaceAndProject]);

  const handleBack = () => {
    router.push(`/workspace/${params.workspaceId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!workspace || !project) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {!workspace ? 'Workspace not found' : 'Project not found'}
          </h2>
          <Button onClick={workspace ? handleBack : handleBackToDashboard}>
            ← Back to {workspace ? 'Projects' : 'Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
          Dashboard
        </Button>
        <span className="text-gray-500">/</span>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          {workspace.name}
        </Button>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{project.name}</span>
      </div>

      {/* Project Content */}
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <FileManager
            project={project}
            userId={user?.id || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}