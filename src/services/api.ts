/**
 * API Service Layer — REAL backend implementation
 *
 * All calls go to /api/* which is directed to https://do-task-dashboard-xftm.vercel.app
 * JWT token is read from localStorage and sent as Authorization: Bearer <token>.
 */

import type {
  Task,
  Report,
  User,
  UserRole,
  TaskFilters,
  ReportFilters,
  DashboardStats,
  ApiResponse,
  Activity,
} from '@/types';

// ─── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'taskReportingToken';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Base fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Attach JWT if available (skip for FormData — browser sets Content-Type with boundary)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON when body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const BASE = import.meta.env.VITE_API_URL ?? 'https://do-task-dashboard-xftm.vercel.app';
    const res = await fetch(`${BASE}/api${endpoint}`, { ...options, headers });
    const json: ApiResponse<T> = await res.json();

    // Surface HTTP errors as { success: false, message }
    if (!res.ok) {
      return {
        success: false,
        data: null as unknown as T,
        message: json.message || `Request failed with status ${res.status}`,
      };
    }

    return json;
  } catch (err) {
    // Network error — backend is likely not reachable
    console.error(`[API] ${endpoint} failed:`, err);
    return {
      success: false,
      data: null as unknown as T,
      message: 'Cannot connect to server. Make sure the backend is reachable.',
    };
  }
}

// ─── Helper: build query string from filters ──────────────────────────────────

function buildQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      q.append(key, value);
    }
  }
  return q.toString() ? `?${q.toString()}` : '';
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  // POST /api/auth/register
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'employee'
  ): Promise<ApiResponse<User | null>> {
    const res = await apiFetch<User & { token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.success && res.data) {
      const { token, ...user } = res.data;
      setToken(token);
      return { ...res, data: user as User };
    }
    return { ...res, data: null };
  },

  // POST /api/auth/login
  async login(email: string, password: string): Promise<ApiResponse<User | null>> {
    const res = await apiFetch<User & { token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      const { token, ...user } = res.data;
      setToken(token);
      return { ...res, data: user as User };
    }
    return { ...res, data: null };
  },

  // GET /api/auth/me
  async me(): Promise<ApiResponse<User | null>> {
    return apiFetch<User>('/auth/me');
  },
};

// ============================================================
// TASK API
// ============================================================

export const taskApi = {
  // GET /api/tasks
  async getAll(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    const query = buildQuery({
      status: filters?.status,
      priority: filters?.priority,
      assignedTo: filters?.assignedTo,
      search: filters?.search,
    });
    return apiFetch<Task[]>(`/tasks${query}`);
  },

  // GET /api/tasks/:id
  async getById(id: string): Promise<ApiResponse<Task | null>> {
    return apiFetch<Task>(`/tasks/${id}`);
  },

  // POST /api/tasks
  async create(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Task>> {
    return apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // PUT /api/tasks/:id
  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // DELETE /api/tasks/:id
  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiFetch<boolean>(`/tasks/${id}`, { method: 'DELETE' });
  },

  // PATCH /api/tasks/:id/status
  async updateStatus(
    id: string,
    status: Task['status']
  ): Promise<ApiResponse<Task>> {
    return apiFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============================================================
// REPORT API
// ============================================================

export const reportApi = {
  // GET /api/reports
  async getAll(filters?: ReportFilters): Promise<ApiResponse<Report[]>> {
    const query = buildQuery({
      type: filters?.type,
      userId: filters?.userId,
    });
    return apiFetch<Report[]>(`/reports${query}`);
  },

  // GET /api/reports/:id
  async getById(id: string): Promise<ApiResponse<Report | null>> {
    return apiFetch<Report>(`/reports/${id}`);
  },

  // POST /api/reports — multipart/form-data for PDF uploads
  async create(
    report: Omit<Report, 'id' | 'createdAt'>,
    files?: File[]
  ): Promise<ApiResponse<Report>> {
    const formData = new FormData();
    formData.append('type', report.type);
    formData.append('description', report.description);

    if (report.taskIds && report.taskIds.length > 0) {
      formData.append('taskIds', JSON.stringify(report.taskIds));
    }

    if (files && files.length > 0) {
      files.forEach((file) => formData.append('attachments', file));
    }

    return apiFetch<Report>('/reports', {
      method: 'POST',
      body: formData, // No Content-Type header — browser sets multipart boundary automatically
    });
  },
};

// ============================================================
// USER API
// ============================================================

export const userApi = {
  // GET /api/users
  async getAll(): Promise<ApiResponse<User[]>> {
    return apiFetch<User[]>('/users');
  },

  // GET /api/users/:id
  async getById(id: string): Promise<ApiResponse<User | null>> {
    return apiFetch<User>(`/users/${id}`);
  },

  // PUT /api/users/:id
  async update(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // PATCH /api/users/:id/role
  async updateRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // PATCH /api/users/:id/status — toggle isActive
  async toggleActive(id: string): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}/status`, { method: 'PATCH' });
  },

  // DELETE /api/users/:id
  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return apiFetch<boolean>(`/users/${id}`, { method: 'DELETE' });
  },
};

// ============================================================
// DASHBOARD API
// ============================================================

export const dashboardApi = {
  // GET /api/dashboard/stats
  async getStats(_userId?: string): Promise<ApiResponse<DashboardStats>> {
    return apiFetch<DashboardStats>('/dashboard/stats');
  },

  // GET /api/dashboard/activities?limit=10
  async getActivities(
    limit: number = 10
  ): Promise<ApiResponse<Activity[]>> {
    return apiFetch<Activity[]>(`/dashboard/activities?limit=${limit}`);
  },
};
