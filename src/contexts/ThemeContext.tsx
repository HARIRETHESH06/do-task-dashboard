import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'do-task-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Load from localStorage or default to system
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored as Theme) || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        // Determine the actual theme to apply
        let actualTheme: 'dark' | 'light' = 'light';

        if (theme === 'system') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            actualTheme = theme;
        }

        setResolvedTheme(actualTheme);

        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(actualTheme);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setResolvedTheme(e.matches ? 'dark' : 'light');
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const value: ThemeContextType = {
        theme,
        setTheme,
        resolvedTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
