'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
}

const DEFAULT_WORKSPACE: Workspace = {
  id: 'demo-workspace-01',
  name: 'Canal Ofertas VIP',
  slug: 'ofertas-vip',
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(DEFAULT_WORKSPACE);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    DEFAULT_WORKSPACE,
    { id: 'demo-workspace-02', name: 'Tech Promos BR', slug: 'tech-promos' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('ofertahub_workspace_id');
    if (savedId) {
      const found = workspaces.find((w) => w.id === savedId);
      if (found) {
        setActiveWorkspaceState(found);
      }
    }
  }, []);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem('ofertahub_workspace_id', workspace.id);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces,
        setActiveWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
