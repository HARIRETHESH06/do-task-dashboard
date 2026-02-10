import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleSwitcher } from '@/components/RoleSwitcher';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('admin' | 'manager' | 'employee')[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: CheckSquare
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: FileText
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    roles: ['admin']
  },
];

const AppSidebarContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentRole, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const filteredNavItems = navItems.filter(
    item => !item.roles || item.roles.includes(currentRole)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all mb-3",
          isCollapsed && "justify-center"
        )}>
          <img
            src="/do-task-logo.png"
            alt="DO_TASK Logo"
            className="h-8 w-8 rounded-lg object-cover"
          />
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground">
              DO_TASK
            </span>
          )}
        </div>
        {!isCollapsed && (
          <RoleSwitcher />
        )}
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-medium text-muted-foreground uppercase tracking-wider",
            isCollapsed && "sr-only"
          )}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== '/dashboard' && location.pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Separator className="bg-sidebar-border mb-4" />

        {/* Theme Toggle */}
        <div className={cn(
          "flex items-center gap-2 mb-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground">Theme</span>
          )}
          <ThemeToggle />
        </div>

        <Separator className="bg-sidebar-border mb-3" />

        {/* User Info */}
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {currentUser?.name ? getInitials(currentUser.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentRole}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebar: React.FC = () => {
  return <AppSidebarContent />;
};

export { SidebarProvider, SidebarTrigger };
