import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  FileText, 
  RefreshCw, 
  Plus, 
  LogIn,
  UserPlus 
} from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  className?: string;
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'task_completed': CheckCircle,
  'report_submitted': FileText,
  'task_updated': RefreshCw,
  'task_created': Plus,
  'user_login': LogIn,
  'task_assigned': UserPlus,
};

const actionColors: Record<string, string> = {
  'task_completed': 'text-success bg-success/10',
  'report_submitted': 'text-primary bg-primary/10',
  'task_updated': 'text-info bg-info/10',
  'task_created': 'text-warning bg-warning/10',
  'user_login': 'text-muted-foreground bg-muted',
  'task_assigned': 'text-primary bg-primary/10',
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  isLoading,
  className 
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent activity
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {activities.map((activity, index) => {
                const Icon = actionIcons[activity.action] || RefreshCw;
                const colorClass = actionColors[activity.action] || 'text-muted-foreground bg-muted';
                
                return (
                  <div 
                    key={activity.id} 
                    className={cn(
                      "flex items-start gap-3 py-3",
                      index !== activities.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      colorClass
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user?.name}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {activity.description.replace(activity.user?.name || '', '').trim()}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
