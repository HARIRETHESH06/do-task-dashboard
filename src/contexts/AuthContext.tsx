import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthContextType } from '@/types';
import { authApi } from '@/services/api';
import { mockUsers } from '@/data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'taskReportingAuth';
const TOKEN_KEY = 'taskReportingToken';
const USER_KEY = 'taskReportingUser';
const ROLE_SWITCH_KEY = 'pendingRoleSwitch';

interface StoredAuth {
  user: User | null;
  role: UserRole;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        setCurrentUser(user);
        setCurrentRole(user.role);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        // Note: TOKEN_KEY is set during login, not managed here.
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY); // Also clear token if user logs out
      }
    }
  }, [currentUser, isLoading]); // currentRole is derived from currentUser.role

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const user = response.data; // API returns User directly

        // Check if there's a pending role switch
        const pendingRole = localStorage.getItem(ROLE_SWITCH_KEY);

        if (pendingRole) {
          // Validate that the user is logging in with the correct role
          if (user.role !== pendingRole) {
            // Clear the pending role switch
            localStorage.removeItem(ROLE_SWITCH_KEY);
            return false; // Login failed - wrong role
          }
          // Clear the pending role switch on successful login with correct role
          localStorage.removeItem(ROLE_SWITCH_KEY);
        }

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
        setCurrentRole(user.role);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'employee'
  ): Promise<boolean> => {
    const response = await authApi.register(name, email, password, role);
    if (response.success && response.data) {
      setCurrentUser(response.data);
      setCurrentRole(response.data.role);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole('employee');
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_SWITCH_KEY);
  }, []);

  // Secure role switching - requires re-authentication
  const requestRoleSwitch = useCallback((targetRole: UserRole) => {
    // Store the requested role
    localStorage.setItem(ROLE_SWITCH_KEY, targetRole);
    // Log out the user
    logout();
  }, [logout]);

  // Permission helper methods
  const canCreateTasks = useCallback(() => {
    return currentRole === 'admin' || currentRole === 'manager';
  }, [currentRole]);

  const canAssignTasks = useCallback(() => {
    return currentRole === 'admin' || currentRole === 'manager';
  }, [currentRole]);

  const canModifyAssignments = useCallback(() => {
    return currentRole === 'admin' || currentRole === 'manager';
  }, [currentRole]);

  const value: AuthContextType = {
    currentUser,
    currentRole,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    requestRoleSwitch,
    canCreateTasks,
    canAssignTasks,
    canModifyAssignments,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
