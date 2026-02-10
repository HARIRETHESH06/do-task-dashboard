// User roles
export type UserRole = 'admin' | 'manager' | 'employee';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

// Task priority and status
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  assignedTo: string;
  assignedToUser?: User;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Report type
export type ReportType = 'daily' | 'weekly';

// Report attachment interface
export interface ReportAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

// Report interface
export interface Report {
  id: string;
  type: ReportType;
  description: string;
  userId: string;
  user?: User;
  taskIds?: string[];
  attachments?: ReportAttachment[];
  createdAt: string;
}

// Activity log
export interface Activity {
  id: string;
  action: string;
  description: string;
  userId: string;
  user?: User;
  timestamp: string;
}

// Auth context type
export interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  requestRoleSwitch: (targetRole: UserRole) => void;
  canCreateTasks: () => boolean;
  canAssignTasks: () => boolean;
  canModifyAssignments: () => boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assignedTo?: string | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ReportFilters {
  type?: ReportType | 'all';
  userId?: string | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
}

// Dashboard stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalReports: number;
  totalUsers?: number;
}
