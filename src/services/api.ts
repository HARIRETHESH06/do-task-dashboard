/**
 * API Service Layer
 * 
 * This file provides a centralized API wrapper for all backend calls.
 * Currently uses mock data, but can be easily switched to real API endpoints.
 * 
 * Configuration:
 * - Set API_BASE_URL to your backend server URL
 * - All endpoints are relative to this base URL
 */

import { Task, Report, User, TaskFilters, ReportFilters, DashboardStats, ApiResponse } from '@/types';
import { mockTasks, mockReports, mockUsers, mockActivities, getEnrichedTasks, getEnrichedReports, getEnrichedActivities, getUserById } from '@/data/mockData';

// API Configuration - Change this when connecting to real backend
const API_BASE_URL = '/api';

// Simulated API delay for realistic UX
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// TASK API
// ============================================

export const taskApi = {
  // GET /api/tasks
  async getAll(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    await simulateDelay(300);
    
    let tasks = getEnrichedTasks();
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        tasks = tasks.filter(t => t.status === filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        tasks = tasks.filter(t => t.priority === filters.priority);
      }
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        tasks = tasks.filter(t => t.assignedTo === filters.assignedTo);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(search) || 
          t.description.toLowerCase().includes(search)
        );
      }
    }
    
    return { data: tasks, success: true };
  },

  // GET /api/tasks/:id
  async getById(id: string): Promise<ApiResponse<Task | null>> {
    await simulateDelay(200);
    const task = getEnrichedTasks().find(t => t.id === id) || null;
    return { data: task, success: !!task };
  },

  // POST /api/tasks
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> {
    await simulateDelay(400);
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedToUser: getUserById(task.assignedTo),
    };
    mockTasks.push(newTask);
    return { data: newTask, success: true, message: 'Task created successfully' };
  },

  // PUT /api/tasks/:id
  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    await simulateDelay(300);
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      return { data: null as any, success: false, message: 'Task not found' };
    }
    mockTasks[index] = { 
      ...mockTasks[index], 
      ...updates, 
      updatedAt: new Date().toISOString(),
      assignedToUser: getUserById(updates.assignedTo || mockTasks[index].assignedTo),
    };
    return { data: mockTasks[index], success: true, message: 'Task updated successfully' };
  },

  // DELETE /api/tasks/:id
  async delete(id: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(300);
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      return { data: false, success: false, message: 'Task not found' };
    }
    mockTasks.splice(index, 1);
    return { data: true, success: true, message: 'Task deleted successfully' };
  },

  // PATCH /api/tasks/:id/status
  async updateStatus(id: string, status: Task['status']): Promise<ApiResponse<Task>> {
    return this.update(id, { status });
  },
};

// ============================================
// REPORT API
// ============================================

export const reportApi = {
  // GET /api/reports
  async getAll(filters?: ReportFilters): Promise<ApiResponse<Report[]>> {
    await simulateDelay(300);
    
    let reports = getEnrichedReports();
    
    if (filters) {
      if (filters.type && filters.type !== 'all') {
        reports = reports.filter(r => r.type === filters.type);
      }
      if (filters.userId && filters.userId !== 'all') {
        reports = reports.filter(r => r.userId === filters.userId);
      }
    }
    
    // Sort by date, newest first
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { data: reports, success: true };
  },

  // GET /api/reports/:id
  async getById(id: string): Promise<ApiResponse<Report | null>> {
    await simulateDelay(200);
    const report = getEnrichedReports().find(r => r.id === id) || null;
    return { data: report, success: !!report };
  },

  // POST /api/reports
  async create(report: Omit<Report, 'id' | 'createdAt'>): Promise<ApiResponse<Report>> {
    await simulateDelay(400);
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      user: getUserById(report.userId),
    };
    mockReports.push(newReport);
    return { data: newReport, success: true, message: 'Report submitted successfully' };
  },
};

// ============================================
// USER API
// ============================================

export const userApi = {
  // GET /api/users
  async getAll(): Promise<ApiResponse<User[]>> {
    await simulateDelay(300);
    return { data: mockUsers, success: true };
  },

  // GET /api/users/:id
  async getById(id: string): Promise<ApiResponse<User | null>> {
    await simulateDelay(200);
    const user = mockUsers.find(u => u.id === id) || null;
    return { data: user, success: !!user };
  },

  // PUT /api/users/:id
  async update(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await simulateDelay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return { data: null as any, success: false, message: 'User not found' };
    }
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return { data: mockUsers[index], success: true, message: 'User updated successfully' };
  },

  // PATCH /api/users/:id/role
  async updateRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    return this.update(id, { role });
  },

  // PATCH /api/users/:id/status
  async toggleActive(id: string): Promise<ApiResponse<User>> {
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return { data: null as any, success: false, message: 'User not found' };
    }
    return this.update(id, { isActive: !user.isActive });
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  // GET /api/dashboard/stats
  async getStats(userId?: string): Promise<ApiResponse<DashboardStats>> {
    await simulateDelay(300);
    
    let tasks = mockTasks;
    
    // If userId provided, filter to that user's tasks
    if (userId) {
      tasks = tasks.filter(t => t.assignedTo === userId);
    }
    
    const stats: DashboardStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      totalReports: userId 
        ? mockReports.filter(r => r.userId === userId).length 
        : mockReports.length,
      totalUsers: mockUsers.length,
    };
    
    return { data: stats, success: true };
  },

  // GET /api/dashboard/activities
  async getActivities(limit: number = 10): Promise<ApiResponse<typeof mockActivities>> {
    await simulateDelay(200);
    const activities = getEnrichedActivities()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    return { data: activities, success: true };
  },
};

// ============================================
// AUTH API (Mock Implementation)
// ============================================

export const authApi = {
  // POST /api/auth/login
  async login(email: string, password: string): Promise<ApiResponse<User | null>> {
    await simulateDelay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 4) { // Simple mock validation
      return { data: user, success: true, message: 'Login successful' };
    }
    return { data: null, success: false, message: 'Invalid credentials' };
  },

  // POST /api/auth/register
  async register(name: string, email: string, password: string, role: User['role'] = 'employee'): Promise<ApiResponse<User | null>> {
    await simulateDelay(500);
    const exists = mockUsers.find(u => u.email === email);
    if (exists) {
      return { data: null, success: false, message: 'Email already registered' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { data: newUser, success: true, message: 'Registration successful' };
  },
};
