import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthContextType } from '@/types';
import { authApi, setToken, clearToken } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'taskReportingToken';
const USER_KEY = 'taskReportingUser';
const ROLE_SWITCH_KEY = 'pendingRoleSwitch';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(true);

  // ── On mount: restore session from localStorage ─────────────────
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        setCurrentUser(user);
        setCurrentRole(user.role);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem(USER_KEY);
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  // ── Persist user to localStorage whenever it changes ────────────
  useEffect(() => {
    if (!isLoading) {
      if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_KEY);
        clearToken();
      }
    }
  }, [currentUser, isLoading]);

  // ── LOGIN ────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // authApi.login calls the real backend, saves the JWT token, and returns the user
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const user = response.data;

        // Handle pending role switch (requires re-login with correct role)
        const pendingRole = localStorage.getItem(ROLE_SWITCH_KEY);
        if (pendingRole) {
          localStorage.removeItem(ROLE_SWITCH_KEY);
          if (user.role !== pendingRole) {
            clearToken();
            return false; // Wrong role — reject login
          }
        }

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

  // ── REGISTER ─────────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'employee'
  ): Promise<boolean> => {
    try {
      const response = await authApi.register(name, email, password, role);
      if (response.success && response.data) {
        setCurrentUser(response.data);
        setCurrentRole(response.data.role);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  // ── LOGOUT ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole('employee');
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_SWITCH_KEY);
    clearToken();
  }, []);

  // ── ROLE SWITCH (forces re-login) ────────────────────────────────
  const requestRoleSwitch = useCallback((targetRole: UserRole) => {
    localStorage.setItem(ROLE_SWITCH_KEY, targetRole);
    logout();
  }, [logout]);

  // ── PERMISSION HELPERS ───────────────────────────────────────────
  const canCreateTasks = useCallback(() => currentRole === 'admin' || currentRole === 'manager', [currentRole]);
  const canAssignTasks = useCallback(() => currentRole === 'admin' || currentRole === 'manager', [currentRole]);
  const canModifyAssignments = useCallback(() => currentRole === 'admin' || currentRole === 'manager', [currentRole]);

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
