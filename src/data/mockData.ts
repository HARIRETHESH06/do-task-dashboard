import { User, Task, Report, Activity } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Sarah Williams',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'employee@example.com',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-5',
    name: 'James Brown',
    email: 'james@example.com',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    isActive: false,
    createdAt: '2024-01-20T00:00:00Z',
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new admin dashboard with improved UX.',
    priority: 'high',
    status: 'in-progress',
    deadline: '2026-02-15T00:00:00Z',
    assignedTo: 'user-3',
    createdBy: 'user-2',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-05T14:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication with login, register, and password reset functionality.',
    priority: 'urgent',
    status: 'completed',
    deadline: '2026-02-10T00:00:00Z',
    assignedTo: 'user-4',
    createdBy: 'user-1',
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints using Swagger/OpenAPI specification.',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-02-20T00:00:00Z',
    assignedTo: 'user-3',
    createdBy: 'user-2',
    createdAt: '2026-02-03T11:00:00Z',
    updatedAt: '2026-02-03T11:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Fix mobile responsiveness issues',
    description: 'Address layout problems on mobile devices, especially the navigation menu and data tables.',
    priority: 'high',
    status: 'in-progress',
    deadline: '2026-02-12T00:00:00Z',
    assignedTo: 'user-4',
    createdBy: 'user-2',
    createdAt: '2026-02-04T08:30:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment to staging environment.',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-02-25T00:00:00Z',
    assignedTo: 'user-5',
    createdBy: 'user-1',
    createdAt: '2026-02-05T13:00:00Z',
    updatedAt: '2026-02-05T13:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Database optimization',
    description: 'Review and optimize MongoDB queries, add proper indexes for performance improvement.',
    priority: 'low',
    status: 'pending',
    deadline: '2026-03-01T00:00:00Z',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    createdAt: '2026-02-06T09:00:00Z',
    updatedAt: '2026-02-06T09:00:00Z',
  },
  {
    id: 'task-7',
    title: 'User feedback survey',
    description: 'Create and distribute a user satisfaction survey, compile results into a report.',
    priority: 'low',
    status: 'completed',
    deadline: '2026-02-05T00:00:00Z',
    assignedTo: 'user-4',
    createdBy: 'user-2',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-02-04T15:00:00Z',
  },
  {
    id: 'task-8',
    title: 'Security audit preparation',
    description: 'Prepare documentation and access logs for the upcoming security audit.',
    priority: 'urgent',
    status: 'in-progress',
    deadline: '2026-02-11T00:00:00Z',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    createdAt: '2026-02-07T08:00:00Z',
    updatedAt: '2026-02-08T11:00:00Z',
  },
  {
    id: 'task-9',
    title: 'Onboarding documentation',
    description: 'Create comprehensive onboarding guide for new team members.',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-02-28T00:00:00Z',
    assignedTo: 'user-4',
    createdBy: 'user-2',
    createdAt: '2026-02-08T14:00:00Z',
    updatedAt: '2026-02-08T14:00:00Z',
  },
  {
    id: 'task-10',
    title: 'Performance monitoring setup',
    description: 'Integrate application performance monitoring tools (APM) for production environment.',
    priority: 'high',
    status: 'pending',
    deadline: '2026-02-18T00:00:00Z',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    createdAt: '2026-02-08T16:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: 'report-1',
    type: 'daily',
    description: 'Completed the user authentication implementation. All test cases passing. Ready for code review.',
    userId: 'user-4',
    taskIds: ['task-2'],
    createdAt: '2026-02-08T17:00:00Z',
  },
  {
    id: 'report-2',
    type: 'weekly',
    description: 'This week focused on dashboard redesign. Created 5 wireframes and 3 high-fidelity mockups. Received feedback from stakeholders and made revisions.',
    userId: 'user-3',
    taskIds: ['task-1'],
    createdAt: '2026-02-07T18:00:00Z',
  },
  {
    id: 'report-3',
    type: 'daily',
    description: 'Fixed 3 critical mobile layout issues. Navigation menu now collapses properly. Data tables scroll horizontally on small screens.',
    userId: 'user-4',
    taskIds: ['task-4'],
    createdAt: '2026-02-07T17:30:00Z',
  },
  {
    id: 'report-4',
    type: 'daily',
    description: 'Started security audit preparation. Gathered access logs for the past 30 days. Documenting all API endpoints with their access levels.',
    userId: 'user-3',
    taskIds: ['task-8'],
    createdAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'report-5',
    type: 'weekly',
    description: 'Survey completed with 87% response rate. Key findings: users want better search functionality and improved mobile experience. Detailed report attached.',
    userId: 'user-4',
    taskIds: ['task-7'],
    createdAt: '2026-02-04T16:00:00Z',
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    action: 'task_completed',
    description: 'Completed task "Implement user authentication"',
    userId: 'user-4',
    timestamp: '2026-02-08T16:00:00Z',
  },
  {
    id: 'activity-2',
    action: 'report_submitted',
    description: 'Submitted daily report',
    userId: 'user-3',
    timestamp: '2026-02-08T16:00:00Z',
  },
  {
    id: 'activity-3',
    action: 'task_updated',
    description: 'Updated status of "Security audit preparation" to In Progress',
    userId: 'user-3',
    timestamp: '2026-02-08T11:00:00Z',
  },
  {
    id: 'activity-4',
    action: 'task_created',
    description: 'Created new task "Performance monitoring setup"',
    userId: 'user-1',
    timestamp: '2026-02-08T16:00:00Z',
  },
  {
    id: 'activity-5',
    action: 'user_login',
    description: 'Logged into the system',
    userId: 'user-2',
    timestamp: '2026-02-08T09:00:00Z',
  },
  {
    id: 'activity-6',
    action: 'report_submitted',
    description: 'Submitted weekly report',
    userId: 'user-4',
    timestamp: '2026-02-07T18:00:00Z',
  },
  {
    id: 'activity-7',
    action: 'task_assigned',
    description: 'Assigned "Onboarding documentation" to Emily Davis',
    userId: 'user-2',
    timestamp: '2026-02-08T14:00:00Z',
  },
  {
    id: 'activity-8',
    action: 'task_completed',
    description: 'Completed task "User feedback survey"',
    userId: 'user-4',
    timestamp: '2026-02-04T15:00:00Z',
  },
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get enriched tasks with user data
export const getEnrichedTasks = (): Task[] => {
  return mockTasks.map(task => ({
    ...task,
    assignedToUser: getUserById(task.assignedTo),
  }));
};

// Helper function to get enriched reports with user data
export const getEnrichedReports = (): Report[] => {
  return mockReports.map(report => ({
    ...report,
    user: getUserById(report.userId),
  }));
};

// Helper function to get enriched activities with user data
export const getEnrichedActivities = (): Activity[] => {
  return mockActivities.map(activity => ({
    ...activity,
    user: getUserById(activity.userId),
  }));
};
