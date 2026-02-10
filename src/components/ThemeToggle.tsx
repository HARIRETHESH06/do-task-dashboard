import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Toggle theme"
                >
                    {resolvedTheme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className={cn(theme === 'light' && 'bg-accent')}
                >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className={cn(theme === 'dark' && 'bg-accent')}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
