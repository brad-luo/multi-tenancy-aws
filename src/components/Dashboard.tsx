'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import WorkspaceList from '@/components/WorkspaceList';
import ProjectView from '@/components/ProjectView';
import FileManager from '@/components/FileManager';
import { Workspace, Project } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setSelectedProject(null);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    if (selectedProject) {
      setSelectedProject(null);
    } else if (selectedWorkspace) {
      setSelectedWorkspace(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Multi-Tenancy AWS
              </h1>
              {(selectedWorkspace || selectedProject) && (
                <Button variant="outline" onClick={handleBack}>
                  ← Back
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedWorkspace && !selectedProject && (
          <WorkspaceList
            userId={user?.id || ''}
            onWorkspaceSelect={handleWorkspaceSelect}
          />
        )}

        {selectedWorkspace && !selectedProject && (
          <ProjectView
            workspace={selectedWorkspace}
            userId={user?.id || ''}
            onProjectSelect={handleProjectSelect}
          />
        )}

        {selectedProject && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject.name}</CardTitle>
                {selectedProject.description && (
                  <p className="text-gray-600">{selectedProject.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <FileManager
                  project={selectedProject}
                  userId={user?.id || ''}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

