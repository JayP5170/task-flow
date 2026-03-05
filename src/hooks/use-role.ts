import { useAuthContext } from '@/components/providers/AuthProvider';

/**
 * Hook to check if the current user has a specific role
 */
export function useRole() {
  const { user, loading } = useAuthContext();

  const role = (user?.user_metadata?.role as 'admin' | 'employee') || 'employee';
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';

  return {
    role,
    isAdmin,
    isEmployee,
    loading,
  };
}

/**
 * Hook to check if user has permission for an action
 */
export function usePermissions() {
  const { isAdmin, isEmployee, loading } = useRole();

  const permissions = {
    // Admin permissions
    canManageUsers: isAdmin,
    canViewAllProjects: isAdmin,
    canEditAllTasks: isAdmin,
    canDeleteUsers: isAdmin,
    canChangeRoles: isAdmin,
    canViewReports: isAdmin,
    canManageSettings: isAdmin,
    
    // Employee permissions
    canViewOwnProjects: isEmployee || isAdmin,
    canEditOwnTasks: isEmployee || isAdmin,
    canCreateTasks: isEmployee || isAdmin,
    canViewDashboard: isEmployee || isAdmin,
  };

  return {
    permissions,
    loading,
  };
}