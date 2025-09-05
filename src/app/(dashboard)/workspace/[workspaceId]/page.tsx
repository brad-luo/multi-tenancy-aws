'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProjectView from '@/components/project/ProjectView';
import { Button } from '@/components/ui/button';
import { Workspace, Project } from '@/types';

export default function WorkspacePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspace = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        const foundWorkspace = data.workspaces.find((w: Workspace) => w.id === params.workspaceId);
        setWorkspace(foundWorkspace || null);
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, params.workspaceId]);

  useEffect(() => {
    if (user && params.workspaceId) {
      fetchWorkspace();
    }
  }, [user, params.workspaceId, fetchWorkspace]);

  const handleProjectSelect = (project: Project) => {
    router.push(`/workspace/${params.workspaceId}/project/${project.id}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Workspace not found</h2>
          <Button onClick={handleBack}>← Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleBack}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Project View */}
      <ProjectView
        workspace={workspace}
        userId={user?.id || ''}
        onProjectSelect={handleProjectSelect}
      />
    </div>
  );
}