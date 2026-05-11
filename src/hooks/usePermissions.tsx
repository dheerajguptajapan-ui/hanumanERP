import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import React, { createContext, useContext, ReactNode } from 'react';

interface PermissionsContextType {
  can: (module: string, subModule: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'full') => boolean;
  isAdmin: boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  // For this demo, we'll assume the first user in the DB is the "Current User"
  // In a real app, this would come from auth state
  const currentUser = useLiveQuery(() => db.users.toCollection().first());
  const userRole = useLiveQuery(async () => {
    if (!currentUser) return null;
    return await db.roles.get(currentUser.roleId);
  }, [currentUser]);

  const can = (module: string, subModule: string, action: string): boolean => {
    if (!userRole) return false;
    if (userRole.name === 'Admin') return true;
    
    const perms = userRole.permissions;
    if (!perms || !perms[module] || !perms[module][subModule]) return false;
    
    const subPerms = perms[module][subModule];
    if (typeof subPerms === 'boolean') return subPerms;
    return !!subPerms[action as keyof typeof subPerms];
  };

  const isAdmin = userRole?.name === 'Admin';
  const loading = currentUser === undefined || userRole === undefined;

  return (
    <PermissionsContext.Provider value={{ can, isAdmin, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export function PermissionGate({ 
  module, 
  subModule, 
  action = 'view', 
  children, 
  fallback = null 
}: { 
  module: string; 
  subModule: string; 
  action?: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'full'; 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  return can(module, subModule, action) ? <>{children}</> : <>{fallback}</>;
}
