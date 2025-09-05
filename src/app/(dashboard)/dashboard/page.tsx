'use client';

import { useAuth } from '@/contexts/AuthContext';
import WorkspaceList from '@/components/workspace/WorkspaceList';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleWorkspaceSelect = (workspace: { id: string }) => {
    router.push(`/workspace/${workspace.id}`);
  };

  return (
    <WorkspaceList
      userId={user?.id || ''}
      onWorkspaceSelect={handleWorkspaceSelect}
    />
  );
}