import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { userApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBadge } from '@/components/badges/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Shield, Users as UsersIcon, User as UserIcon, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Users: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<User['role']>('employee');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getAll();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!editingUser) return;

    try {
      const result = await userApi.updateRole(editingUser.id, newRole);
      if (result.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
        toast({
          title: 'Role Updated',
          description: `${editingUser.name}'s role has been changed to ${newRole}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setEditingUser(null);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const result = await userApi.toggleActive(user.id);
      if (result.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        toast({
          title: user.isActive ? 'User Disabled' : 'User Enabled',
          description: `${user.name}'s account has been ${user.isActive ? 'disabled' : 'enabled'}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <UsersIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-muted-foreground ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-success/10 text-success" : ""}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                          }}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-2">Change Role</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.isActive ? (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Disable Account
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enable Account
                            </>
                          )}
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

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={editingUser?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {editingUser?.name ? getInitials(editingUser.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{editingUser?.name}</p>
                <p className="text-sm text-muted-foreground">{editingUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(value: User['role']) => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
