'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';

export function ThemePills() {
  const { currentTheme, setTheme } = useTheme();
  
  const lightThemes = themes.filter(t => t.category === 'Light');
  const darkThemes = themes.filter(t => t.category === 'Dark');
  const luxuryThemes = themes.filter(t => t.category === 'Luxury');

  const renderThemeButton = (theme: typeof themes[0]) => (
    <button
      key={theme.name}
      onClick={() => setTheme(theme.name)}
      className={`
        px-4 py-3 rounded-full text-sm font-medium transition-all duration-200
        bg-card hover:bg-accent hover:text-accent-foreground
        border-2 border-border
        ${currentTheme.name === theme.name ? 'ring-2 ring-primary shadow-lg' : ''}
      `}
    >
      <span className="mr-2">{theme.emoji}</span>
      {theme.displayName}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-3">🎨 Choose Your Theme</h2>
        <p className="text-muted-foreground">
          Select from 23 professionally designed themes. Each transforms the entire interface.
        </p>
      </div>

      {/* Light Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          ☀️ Light Themes
        </h3>
        <div className="flex flex-wrap gap-2">
          {lightThemes.map(renderThemeButton)}
        </div>
      </div>

      {/* Dark Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          🌙 Dark Themes
        </h3>
        <div className="flex flex-wrap gap-2">
          {darkThemes.map(renderThemeButton)}
        </div>
      </div>

      {/* Luxury Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          ✨ Luxury Themes
        </h3>
        <div className="flex flex-wrap gap-2">
          {luxuryThemes.map(renderThemeButton)}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Current theme: <span className="font-semibold">{currentTheme.emoji} {currentTheme.displayName}</span>
        </p>
      </div>
    </div>
  );
} 