'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Workspace } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { LIMITS, canAddWorkspace, UI_CONFIG } from '@/config/global-config';

interface WorkspaceListProps {
  userId: string;
  onWorkspaceSelect?: (workspace: Workspace) => void; // Made optional for backward compatibility
}

export default function WorkspaceList({ userId, onWorkspaceSelect }: WorkspaceListProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(prev => [...prev, data.workspace]);
        setFormData({ name: '', description: '' });
        setDialogOpen(false);
      } else {
        alert('Failed to create workspace');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Error creating workspace');
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

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    if (!confirm(`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces?id=${workspace.id}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== workspace.id));
      } else {
        alert('Failed to delete workspace');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert('Error deleting workspace');
    }
  };

  if (loading) {
    return <div className="text-center">Loading workspaces...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Workspaces</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild className='dark:text-white dark:bg-gray-600'>
            <Button disabled={!canAddWorkspace(workspaces?.length || 0)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
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
              <Button type="submit" disabled={creating} className="w-full dark:text-white dark:bg-gray-600">
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {UI_CONFIG.SHOW_LIMITS.WORKSPACE_COUNT && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:text-white dark:bg-gray-600">
          <p className="text-blue-800 text-sm dark:text-white">
            Workspaces: {workspaces?.length || 0}/{LIMITS.WORKSPACES_PER_USER}
          </p>
        </div>
      )}

      {!canAddWorkspace(workspaces?.length || 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Maximum workspace limit reached ({LIMITS.WORKSPACES_PER_USER}/{LIMITS.WORKSPACES_PER_USER}). Delete a workspace to create a new one.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces?.map((workspace) => (
          <Card
            key={workspace.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="cursor-pointer flex-1" onClick={() => {
                  if (onWorkspaceSelect) {
                    onWorkspaceSelect(workspace);
                  } else {
                    router.push(`/workspace/${workspace.id}`);
                  }
                }}>
                  <CardTitle>{workspace.name}</CardTitle>
                  {workspace.description && (
                    <p className="text-gray-600 text-sm">{workspace.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkspace(workspace);
                  }}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => {
                if (onWorkspaceSelect) {
                  onWorkspaceSelect(workspace);
                } else {
                  router.push(`/workspace/${workspace.id}`);
                }
              }}>
                <p className="text-xs text-gray-500">
                  Created: {new Date(workspace.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!workspaces || workspaces.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No workspaces yet</h3>
          <p className="text-gray-500 mt-2">Create your first workspace to get started</p>
        </div>
      )}
    </div>
  );
}