import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleSwitchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetRole: UserRole;
}

export const RoleSwitchDialog: React.FC<RoleSwitchDialogProps> = ({
    open,
    onOpenChange,
    targetRole,
}) => {
    const { requestRoleSwitch } = useAuth();

    const handleConfirm = () => {
        requestRoleSwitch(targetRole);
        onOpenChange(false);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return 'border-red-500 text-red-500';
            case 'manager':
                return 'border-blue-500 text-blue-500';
            case 'employee':
                return 'border-green-500 text-green-500';
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <AlertDialogTitle>Switch Role</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-3 pt-2">
                        <p>
                            You are requesting to switch to the{' '}
                            <Badge variant="outline" className={getRoleBadgeColor(targetRole)}>
                                {targetRole}
                            </Badge>{' '}
                            role.
                        </p>
                        <div className="bg-muted p-3 rounded-md space-y-2">
                            <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">Security Notice</p>
                                    <p className="text-muted-foreground">
                                        For security reasons, you will be logged out and must log in again with
                                        credentials for the {targetRole} role.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm">Do you want to continue?</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        Log Out & Switch Role
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
