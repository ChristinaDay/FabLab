/**
 * Figma Design Tokens Integration System
 * 
 * This file provides a bridge between Figma design tokens and UpDrift's 
 * existing HSL-based CSS custom property system. It preserves all existing
 * functionality while enabling design token management through Figma.
 */

export interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'border-radius' | 'shadow' | 'animation';
  description?: string;
  cssProperty: string;
  figmaPath?: string; // Path in Figma (e.g., "Colors/Primary/500")
}

export interface FigmaColorToken extends DesignToken {
  type: 'color';
  hsl: string; // HSL format for UpDrift's system
  hex: string; // Hex format from Figma
  rgb: string; // RGB format for compatibility
}

export interface FigmaSpacingToken extends DesignToken {
  type: 'spacing';
  pixels: number;
  rem: string;
}

export interface FigmaTypographyToken extends DesignToken {
  type: 'typography';
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily?: string;
}

/**
 * Core Design Token Categories
 * Maps Figma design tokens to UpDrift's CSS custom properties
 */
export const designTokenMapping = {
  colors: {
    // Primary Colors
    'primary-500': { 
      cssProperty: '--primary', 
      figmaPath: 'Colors/Primary/500',
      description: 'Main brand color used for CTAs and primary actions'
    },
    'primary-400': { 
      cssProperty: '--primary-light', 
      figmaPath: 'Colors/Primary/400',
      description: 'Lighter variant of primary color'
    },
    'primary-600': { 
      cssProperty: '--primary-dark', 
      figmaPath: 'Colors/Primary/600',
      description: 'Darker variant of primary color'
    },
    
    // Semantic Colors
    'background-light': { 
      cssProperty: '--background', 
      figmaPath: 'Colors/Semantic/Background/Light',
      description: 'Main background color for light themes'
    },
    'background-dark': { 
      cssProperty: '--background', 
      figmaPath: 'Colors/Semantic/Background/Dark',
      description: 'Main background color for dark themes'
    },
    'foreground-light': { 
      cssProperty: '--foreground', 
      figmaPath: 'Colors/Semantic/Foreground/Light',
      description: 'Main text color for light themes'
    },
    'foreground-dark': { 
      cssProperty: '--foreground', 
      figmaPath: 'Colors/Semantic/Foreground/Dark',
      description: 'Main text color for dark themes'
    },
    
    // Cosmic Theme Colors (Unique to UpDrift)
    'cosmic-river-primary': { 
      cssProperty: '--cosmic-river-primary', 
      figmaPath: 'Colors/Cosmic/River/Primary',
      description: 'Primary color for cosmic river animations'
    },
    'cosmic-river-secondary': { 
      cssProperty: '--cosmic-river-secondary', 
      figmaPath: 'Colors/Cosmic/River/Secondary',
      description: 'Secondary color for cosmic river animations'
    },
    'starfield-primary': { 
      cssProperty: '--starfield-primary', 
      figmaPath: 'Colors/Cosmic/Starfield/Primary',
      description: 'Primary color for starfield particles'
    },
    'starfield-secondary': { 
      cssProperty: '--starfield-secondary', 
      figmaPath: 'Colors/Cosmic/Starfield/Secondary',
      description: 'Secondary color for starfield particles'
    }
  },
  
  spacing: {
    'xs': { cssProperty: '--spacing-xs', figmaPath: 'Spacing/XS', description: '4px' },
    'sm': { cssProperty: '--spacing-sm', figmaPath: 'Spacing/SM', description: '8px' },
    'md': { cssProperty: '--spacing-md', figmaPath: 'Spacing/MD', description: '16px' },
    'lg': { cssProperty: '--spacing-lg', figmaPath: 'Spacing/LG', description: '24px' },
    'xl': { cssProperty: '--spacing-xl', figmaPath: 'Spacing/XL', description: '32px' },
    '2xl': { cssProperty: '--spacing-2xl', figmaPath: 'Spacing/2XL', description: '48px' },
    '3xl': { cssProperty: '--spacing-3xl', figmaPath: 'Spacing/3XL', description: '64px' }
  },
  
  typography: {
    'heading-xl': { 
      cssProperty: '--font-size-heading-xl', 
      figmaPath: 'Typography/Headings/XL',
      description: 'Main page titles and hero headings'
    },
    'heading-lg': { 
      cssProperty: '--font-size-heading-lg', 
      figmaPath: 'Typography/Headings/LG',
      description: 'Section headings'
    },
    'heading-md': { 
      cssProperty: '--font-size-heading-md', 
      figmaPath: 'Typography/Headings/MD',
      description: 'Card titles and component headings'
    },
    'body-base': { 
      cssProperty: '--font-size-body-base', 
      figmaPath: 'Typography/Body/Base',
      description: 'Standard body text'
    },
    'body-sm': { 
      cssProperty: '--font-size-body-sm', 
      figmaPath: 'Typography/Body/Small',
      description: 'Secondary text and captions'
    }
  },
  
  effects: {
    'glass-blur': { 
      cssProperty: '--glass-blur', 
      figmaPath: 'Effects/Glass/Blur',
      description: 'Backdrop blur for glassmorphic effects'
    },
    'cosmic-glow': { 
      cssProperty: '--cosmic-glow', 
      figmaPath: 'Effects/Cosmic/Glow',
      description: 'Glow effect for cosmic elements'
    },
    'particle-opacity': { 
      cssProperty: '--particle-opacity', 
      figmaPath: 'Effects/Particles/Opacity',
      description: 'Base opacity for particle systems'
    }
  }
};

/**
 * Converts Figma color values to HSL format for UpDrift's theme system
 */
export function convertFigmaColorToHSL(figmaColor: string): string {
  // Handle different Figma color formats
  if (figmaColor.startsWith('hsl(')) {
    // Already HSL, extract values without parentheses
    return figmaColor.replace('hsl(', '').replace(')', '');
  }
  
  if (figmaColor.startsWith('#')) {
    // Convert hex to HSL
    return hexToHSL(figmaColor);
  }
  
  if (figmaColor.startsWith('rgb(')) {
    // Convert RGB to HSL
    return rgbToHSL(figmaColor);
  }
  
  // Fallback to existing UpDrift theme values
  console.warn(`Unknown color format from Figma: ${figmaColor}`);
  return '217 91% 60%'; // Default primary blue
}

/**
 * Hex to HSL conversion utility
 */
function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h! /= 6;
  }
  
  return `${Math.round(h! * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * RGB to HSL conversion utility
 */
function rgbToHSL(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '217 91% 60%';
  
  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h! /= 6;
  }
  
  return `${Math.round(h! * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Applies Figma design tokens to CSS custom properties
 * This preserves all existing UpDrift functionality while integrating Figma tokens
 */
export function applyFigmaTokens(tokens: Record<string, any>) {
  const root = document.documentElement;
  
  // Process color tokens
  Object.entries(tokens.colors || {}).forEach(([tokenName, tokenValue]) => {
    const mapping = designTokenMapping.colors[tokenName as keyof typeof designTokenMapping.colors];
    if (mapping && typeof tokenValue === 'string') {
      const hslValue = convertFigmaColorToHSL(tokenValue);
      root.style.setProperty(mapping.cssProperty, hslValue);
      
      // Also set Figma-specific properties for documentation
      root.style.setProperty(`--figma-${tokenName}`, tokenValue);
    }
  });
  
  // Process spacing tokens
  Object.entries(tokens.spacing || {}).forEach(([tokenName, tokenValue]) => {
    const mapping = designTokenMapping.spacing[tokenName as keyof typeof designTokenMapping.spacing];
    if (mapping && typeof tokenValue === 'number') {
      root.style.setProperty(mapping.cssProperty, `${tokenValue}px`);
      root.style.setProperty(`${mapping.cssProperty}-rem`, `${tokenValue / 16}rem`);
    }
  });
  
  // Process typography tokens
  Object.entries(tokens.typography || {}).forEach(([tokenName, tokenData]) => {
    const mapping = designTokenMapping.typography[tokenName as keyof typeof designTokenMapping.typography];
    if (mapping && typeof tokenData === 'object') {
      if (tokenData.fontSize) {
        root.style.setProperty(mapping.cssProperty, tokenData.fontSize);
      }
      if (tokenData.fontWeight) {
        root.style.setProperty(`${mapping.cssProperty}-weight`, tokenData.fontWeight);
      }
      if (tokenData.lineHeight) {
        root.style.setProperty(`${mapping.cssProperty}-line-height`, tokenData.lineHeight);
      }
    }
  });
  
  console.log('✅ Figma design tokens applied successfully');
}

/**
 * Export current UpDrift theme as Figma-compatible design tokens
 * This allows you to import UpDrift's existing aesthetic into Figma
 */
export function exportUpDriftTokensForFigma() {
  const root = getComputedStyle(document.documentElement);
  
  return {
    colors: {
      primary: {
        value: `hsl(${root.getPropertyValue('--primary').trim()})`,
        type: 'color',
        description: 'UpDrift primary brand color'
      },
      background: {
        light: `hsl(${root.getPropertyValue('--background').trim()})`,
        dark: `hsl(${root.getPropertyValue('--background').trim()})`,
        type: 'color',
        description: 'UpDrift background colors'
      },
      foreground: {
        light: `hsl(${root.getPropertyValue('--foreground').trim()})`,
        dark: `hsl(${root.getPropertyValue('--foreground').trim()})`,
        type: 'color',
        description: 'UpDrift text colors'
      }
    },
    cosmic: {
      river: {
        description: 'Colors used in the cosmic river animation system',
        gradient: 'Custom animated gradient system - see globals.css'
      },
      starfield: {
        description: 'Colors used in the starfield particle system',
        particles: 'Dynamic opacity and color animation - see page.tsx'
      },
      effects: {
        glass: 'backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1)',
        glow: 'Custom HSL-based glow effects per theme'
      }
    },
    animations: {
      'cosmic-river': {
        description: 'Dynamic wave animation system',
        duration: 'Variable based on wave parameters',
        easing: 'Sine wave mathematical functions'
      },
      'starfield-parallax': {
        description: 'Multi-layer parallax star movement',
        layers: '3 layers with different speeds (60s, 90s, 120s)'
      },
      'particle-flow': {
        description: 'River particle flow animation',
        physics: 'Custom velocity and boundary detection'
      }
    }
  };
}

/**
 * Load design tokens from Figma API or exported JSON
 * This function can be extended to fetch from Figma's REST API
 */
export async function loadFigmaTokens(source: 'local' | 'api' = 'local') {
  if (source === 'api') {
    // Future: Implement Figma API integration
    console.log('Figma API integration not yet implemented');
    return null;
  }
  
  // Load from local JSON file (exported from Figma)
  try {
    const response = await fetch('/design-tokens.json');
    if (response.ok) {
      const tokens = await response.json();
      applyFigmaTokens(tokens);
      return tokens;
    }
  } catch (error) {
    console.log('No local design tokens found, using defaults');
  }
  
  return null;
}

export default {
  designTokenMapping,
  convertFigmaColorToHSL,
  applyFigmaTokens,
  exportUpDriftTokensForFigma,
  loadFigmaTokens
};