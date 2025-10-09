'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle() {
  const { currentTheme, setTheme, isLoading } = useTheme();

  if (isLoading) return null;

  const isDark = currentTheme.name === 'cyber';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 border-0 text-muted-foreground hover:text-foreground transition-colors group"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4 group-hover:text-black" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
} 