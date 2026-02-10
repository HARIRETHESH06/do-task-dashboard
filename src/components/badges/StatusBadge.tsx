import React from 'react';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  'pending': { 
    label: 'Pending', 
    className: 'bg-muted text-muted-foreground' 
  },
  'in-progress': { 
    label: 'In Progress', 
    className: 'bg-info/10 text-info' 
  },
  'completed': { 
    label: 'Completed', 
    className: 'bg-success/10 text-success' 
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  'low': { 
    label: 'Low', 
    className: 'bg-muted text-muted-foreground' 
  },
  'medium': { 
    label: 'Medium', 
    className: 'bg-info/10 text-info' 
  },
  'high': { 
    label: 'High', 
    className: 'bg-warning/10 text-warning' 
  },
  'urgent': { 
    label: 'Urgent', 
    className: 'bg-destructive/10 text-destructive' 
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const config = priorityConfig[priority];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
};

interface RoleBadgeProps {
  role: 'admin' | 'manager' | 'employee';
  className?: string;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  'admin': { 
    label: 'Admin', 
    className: 'bg-destructive/10 text-destructive' 
  },
  'manager': { 
    label: 'Manager', 
    className: 'bg-warning/10 text-warning' 
  },
  'employee': { 
    label: 'Employee', 
    className: 'bg-primary/10 text-primary' 
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const config = roleConfig[role];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
};
