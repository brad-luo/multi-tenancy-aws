'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Workspace, Project } from '@/types';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import { LIMITS, canAddProject, UI_CONFIG } from '@/config/global-config';

interface ProjectViewProps {
  workspace: Workspace;
  userId: string;
  onProjectSelect: (project: Project) => void;
}

export default function ProjectView({ workspace, userId, onProjectSelect }: ProjectViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?workspaceId=${workspace.id}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [workspace.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workspaceId: workspace.id,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [...prev, data.project]);
        setFormData({ name: '', description: '' });
        setDialogOpen(false);
      } else {
        alert('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects?id=${project.id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== project.id));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  if (loading) {
    return <div className="text-center">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{workspace.name}</h2>
          {workspace.description && (
            <p className="text-gray-600 mt-1">{workspace.description}</p>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canAddProject(projects.length)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {UI_CONFIG.SHOW_LIMITS.PROJECT_COUNT && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Projects: {projects.length}/{LIMITS.PROJECTS_PER_WORKSPACE}
          </p>
        </div>
      )}

      {!canAddProject(projects.length) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Maximum project limit reached ({LIMITS.PROJECTS_PER_WORKSPACE}/{LIMITS.PROJECTS_PER_WORKSPACE}) for this workspace. Delete a project to create a new one.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="cursor-pointer flex-1" onClick={() => onProjectSelect(project)}>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-blue-500" />
                    {project.name}
                  </CardTitle>
                  {project.description && (
                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project);
                  }}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => onProjectSelect(project)}>
                <p className="text-xs text-gray-500">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-2">Create your first project to get started</p>
        </div>
      )}
    </div>
  );
}