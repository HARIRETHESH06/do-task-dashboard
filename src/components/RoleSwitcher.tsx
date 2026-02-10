import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { ChevronDown, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RoleSwitchDialog } from './RoleSwitchDialog';
import { cn } from '@/lib/utils';

export const RoleSwitcher: React.FC = () => {
    const { currentRole } = useAuth();
    const [showDialog, setShowDialog] = useState(false);
    const [targetRole, setTargetRole] = useState<UserRole>('employee');

    const roles: { value: UserRole; label: string; color: string }[] = [
        { value: 'admin', label: 'Admin', color: 'text-red-500' },
        { value: 'manager', label: 'Manager', color: 'text-blue-500' },
        { value: 'employee', label: 'Employee', color: 'text-green-500' },
    ];

    const currentRoleData = roles.find(r => r.value === currentRole);

    const handleRoleClick = (role: UserRole) => {
        if (role !== currentRole) {
            setTargetRole(role);
            setShowDialog(true);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="gap-2 border-border"
                    >
                        <User className={cn("h-4 w-4", currentRoleData?.color)} />
                        <span className={currentRoleData?.color}>{currentRoleData?.label}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Switch Role (Testing)
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.map((role) => (
                        <DropdownMenuItem
                            key={role.value}
                            onClick={() => handleRoleClick(role.value)}
                            className={cn(
                                "cursor-pointer",
                                currentRole === role.value && "bg-accent"
                            )}
                        >
                            <User className={cn("mr-2 h-4 w-4", role.color)} />
                            <span className={role.color}>{role.label}</span>
                            {currentRole === role.value && (
                                <span className="ml-auto text-xs text-muted-foreground">Current</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <RoleSwitchDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                targetRole={targetRole}
            />
        </>
    );
};
