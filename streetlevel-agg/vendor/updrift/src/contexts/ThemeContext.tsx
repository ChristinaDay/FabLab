'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, Theme, applyTheme } from '@/lib/themes';
import { loadFigmaTokens } from '@/lib/designTokens';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Only two themes: 'cyberlight' (light) and 'cyber' (dark)
  const lightTheme = themes.find(t => t.name === 'cyberlight');
  const darkTheme = themes.find(t => t.name === 'cyber');
  const [currentTheme, setCurrentTheme] = useState<Theme>(darkTheme!);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only access localStorage after component mounts on client
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('updrift-mode') || 'dark';
      const theme = savedMode === 'dark' ? darkTheme : lightTheme;
      setCurrentTheme(theme!);
      applyTheme(theme!.name);
      
      // Load Figma design tokens if available (enhances existing theme system)
      loadFigmaTokens('local').then(tokens => {
        if (tokens) {
          console.log('✅ Figma design tokens loaded and applied');
        }
      }).catch(error => {
        // Silently continue without Figma tokens - all existing functionality preserved
        console.log('ℹ️ No Figma design tokens found, using default theme system');
      });
    } else {
      // Server-side: use default dark theme
      applyTheme(darkTheme!.name);
    }
    
    setIsLoading(false);
  }, []);

  // Only allow 'light' or 'dark' as themeName
  const setTheme = (themeName: string) => {
    let theme: Theme | undefined;
    if (themeName === 'dark') {
      theme = darkTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('updrift-mode', 'dark');
      }
    } else {
      theme = lightTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('updrift-mode', 'light');
      }
    }
    if (!theme) return;
    setCurrentTheme(theme);
    applyTheme(theme.name);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 