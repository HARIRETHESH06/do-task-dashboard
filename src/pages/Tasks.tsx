import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskFilters, User } from '@/types';
import { taskApi, userApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge, PriorityBadge } from '@/components/badges/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Filter,
  LayoutGrid,
  List,
  CheckCircle,
  Clock,
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, [filters, currentUser, currentRole]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        taskApi.getAll(filters),
        userApi.getAll(),
      ]);

      if (tasksRes.success) {
        let taskData = tasksRes.data;
        // For employees, only show their tasks
        if (currentRole === 'employee' && currentUser) {
          taskData = taskData.filter(t => t.assignedTo === currentUser.id);
        }
        setTasks(taskData);
      }
      if (usersRes.success) setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      const result = await taskApi.updateStatus(taskId, status);
      if (result.success) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
        toast({
          title: 'Status Updated',
          description: `Task status changed to ${status.replace('-', ' ')}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;

    try {
      const result = await taskApi.delete(deleteTaskId);
      if (result.success) {
        setTasks(tasks.filter(t => t.id !== deleteTaskId));
        toast({
          title: 'Task Deleted',
          description: 'The task has been permanently deleted.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    } finally {
      setDeleteTaskId(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderTableView = () => (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/tasks/new')}
                    className="mt-2"
                  >
                    Create your first task
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignedToUser?.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(task.assignedToUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden lg:inline">
                      {task.assignedToUser?.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none">
                        <StatusBadge status={task.status} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'pending')}>
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in-progress')}>
                        <PlayCircle className="h-4 w-4 mr-2 text-info" />
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                        <CheckCircle className="h-4 w-4 mr-2 text-success" />
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(task.deadline), 'MMM d, yyyy')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTaskId(task.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : tasks.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks found</p>
          </div>
        </div>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-medium text-foreground line-clamp-1">{task.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTaskId(task.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {task.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignedToUser?.avatar} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(task.assignedToUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.assignedToUser?.name?.split(' ')[0]}</span>
                </div>
                <span>Due: {format(new Date(task.deadline), 'MMM d')}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-muted-foreground">
            {currentRole === 'employee' ? 'Your assigned tasks' : 'Manage all tasks'}
          </p>
        </div>
        {(currentRole === 'admin' || currentRole === 'manager') && (
          <Button onClick={() => navigate('/tasks/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value as any })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => setFilters({ ...filters, priority: value as any })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {currentRole !== 'employee' && (
                <Select
                  value={filters.assignedTo || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex border border-input rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {viewMode === 'table' ? renderTableView() : renderGridView()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
