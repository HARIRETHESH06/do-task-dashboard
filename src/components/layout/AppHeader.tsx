import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Shield, Users, User } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/new': 'Create Task',
  '/reports': 'Reports',
  '/reports/new': 'Submit Report',
  '/users': 'User Management',
};

const roleConfig: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-destructive/10 text-destructive' },
  manager: { label: 'Manager', icon: Users, color: 'bg-warning/10 text-warning' },
  employee: { label: 'Employee', icon: User, color: 'bg-primary/10 text-primary' },
};

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { currentRole, switchRole } = useAuth();
  
  const getPageTitle = () => {
    // Check for task detail/edit page
    if (location.pathname.match(/^\/tasks\/[^/]+$/)) {
      return 'Task Details';
    }
    return pageTitles[location.pathname] || 'Dashboard';
  };

  const currentRoleConfig = roleConfig[currentRole];
  const RoleIcon = currentRoleConfig.icon;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          {getPageTitle()}
        </h1>
      </div>

      {/* Role Switcher for Testing */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Badge variant="secondary" className={currentRoleConfig.color}>
              <RoleIcon className="h-3 w-3 mr-1" />
              {currentRoleConfig.label}
            </Badge>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Switch Role (Testing)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(roleConfig) as UserRole[]).map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => switchRole(role)}
                className="gap-2 cursor-pointer"
              >
                <Badge variant="secondary" className={config.color}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                {role === currentRole && (
                  <span className="ml-auto text-xs text-muted-foreground">Current</span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
