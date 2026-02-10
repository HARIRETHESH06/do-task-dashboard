import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats, Activity, Task } from '@/types';
import { dashboardApi, taskApi } from '@/services/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StatusBadge, PriorityBadge } from '@/components/badges/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // Load stats based on role
        const userId = currentRole === 'employee' ? currentUser?.id : undefined;
        const [statsRes, activitiesRes, tasksRes] = await Promise.all([
          dashboardApi.getStats(userId),
          dashboardApi.getActivities(8),
          taskApi.getAll(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (activitiesRes.success) setActivities(activitiesRes.data);

        if (tasksRes.success) {
          // Get upcoming tasks (pending or in-progress, sorted by deadline)
          let tasks = tasksRes.data.filter(t => t.status !== 'completed');

          // For employees, only show their tasks
          if (currentRole === 'employee' && currentUser) {
            tasks = tasks.filter(t => t.assignedTo === currentUser.id);
          }

          // Sort by deadline and take first 5
          tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
          setUpcomingTasks(tasks.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [currentUser, currentRole]);

  const formatDeadline = (deadline: string) => {
    const date = parseISO(deadline);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getDeadlineColor = (deadline: string) => {
    const date = parseISO(deadline);
    if (isToday(date)) return 'text-destructive';
    if (isTomorrow(date)) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {currentUser?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your {currentRole === 'employee' ? 'tasks' : 'team'} today.
          </p>
        </div>
        <div className="flex gap-2">
          {(currentRole === 'admin' || currentRole === 'manager') && (
            <Button onClick={() => navigate('/tasks/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          )}
          {currentRole === 'employee' && (
            <Button onClick={() => navigate('/reports/new')} className="gap-2">
              <FileText className="h-4 w-4" />
              Submit Report
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={<CheckSquare className="h-4 w-4" />}
          description={currentRole === 'employee' ? 'assigned to you' : 'across all users'}
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingTasks ?? 0}
          icon={<Clock className="h-4 w-4" />}
          description="waiting to start"
          isLoading={isLoading}
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgressTasks ?? 0}
          icon={<PlayCircle className="h-4 w-4" />}
          description="currently active"
          isLoading={isLoading}
        />
        <StatsCard
          title="Completed"
          value={stats?.completedTasks ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          description="finished tasks"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className={`h-5 w-5 ${getDeadlineColor(task.deadline)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {task.title}
                      </p>
                      <p className={`text-xs ${getDeadlineColor(task.deadline)}`}>
                        Due: {formatDeadline(task.deadline)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} isLoading={isLoading} />
      </div>

      {/* Role-specific content */}
      {currentRole === 'admin' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="h-4 w-4" />}
            description="registered accounts"
            isLoading={isLoading}
          />
          <StatsCard
            title="Reports Submitted"
            value={stats?.totalReports ?? 0}
            icon={<FileText className="h-4 w-4" />}
            description="this period"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
