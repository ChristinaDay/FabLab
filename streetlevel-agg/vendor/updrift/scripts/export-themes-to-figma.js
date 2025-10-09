#!/usr/bin/env node

/**
 * Export UpDrift Themes to Figma Design Tokens
 * 
 * This script extracts color values from UpDrift's CSS theme system
 * and exports them in a Figma-compatible design token format.
 * 
 * Usage: node scripts/export-themes-to-figma.js
 */

const fs = require('fs');
const path = require('path');

// Read the globals.css file to extract theme colors
const cssPath = path.join(__dirname, '../src/app/globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Extract theme definitions from CSS
function extractThemeColors(css) {
  const themes = {};
  
  // Regex to match theme classes and their color properties
  const themeRegex = /\.theme-(\w+)\s*\{([^}]+)\}/g;
  const colorRegex = /--(\w+(?:-\w+)*)\s*:\s*([^;]+);/g;
  
  let themeMatch;
  while ((themeMatch = themeRegex.exec(css)) !== null) {
    const themeName = themeMatch[1];
    const themeBody = themeMatch[2];
    
    themes[themeName] = {
      name: themeName,
      displayName: themeName.charAt(0).toUpperCase() + themeName.slice(1),
      colors: {}
    };
    
    let colorMatch;
    while ((colorMatch = colorRegex.exec(themeBody)) !== null) {
      const propertyName = colorMatch[1];
      const propertyValue = colorMatch[2].trim();
      
      // Convert HSL values to hex for Figma compatibility
      if (propertyValue.includes('%')) {
        const hslMatch = propertyValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const [, h, s, l] = hslMatch;
          const hex = hslToHex(parseInt(h), parseInt(s), parseInt(l));
          themes[themeName].colors[propertyName] = {
            value: hex,
            hsl: `${h} ${s}% ${l}%`,
            type: 'color',
            description: `${themeName} theme ${propertyName} color`
          };
        }
      }
    }
  }
  
  return themes;
}

// Convert HSL to Hex for Figma compatibility
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Get cosmic-specific styling information
function extractCosmicElements(css) {
  const cosmic = {
    animations: {
      'cosmic-river': {
        description: 'Dynamic wave animation system with mathematical sine functions',
        implementation: 'JavaScript-based with requestAnimationFrame',
        parameters: {
          topAmplitude: 10,
          topFrequency: 1.2,
          bottomAmplitude: 7,
          bottomFrequency: 1.7,
          animationSpeed: 0.02
        }
      },
      'starfield-parallax': {
        description: 'Multi-layer parallax star movement',
        layers: {
          layer0: { duration: '60s', speed: 'fastest' },
          layer1: { duration: '90s', speed: 'medium' },
          layer2: { duration: '120s', speed: 'slowest' }
        }
      },
      'particle-flow': {
        description: 'Physics-based particle system within cosmic river',
        physics: {
          velocity: 'variable based on river area',
          boundaries: 'detected via mathematical river path',
          opacity: 'animated with twinkling effect'
        }
      }
    },
    effects: {
      glassmorphism: {
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        description: 'Applied throughout UI for depth and modern aesthetic'
      },
      gradients: {
        'gradient-text': {
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
          webkitBackgroundClip: 'text',
          webkitTextFillColor: 'transparent',
          description: 'Theme-aware gradient text effect'
        }
      }
    }
  };
  
  return cosmic;
}

// Generate the complete Figma design tokens export
function generateFigmaTokens() {
  console.log('🎨 Extracting UpDrift themes for Figma export...\n');
  
  const themes = extractThemeColors(cssContent);
  const cosmic = extractCosmicElements(cssContent);
  
  const figmaTokens = {
    $schema: "https://schemas.figma.com/design-tokens/v1.0.0",
    description: "UpDrift Design System - Exported from Existing Theme System",
    version: "1.0.0",
    lastModified: new Date().toISOString().split('T')[0],
    
    // Core brand colors (from cyber theme as primary)
    colors: {
      brand: {
        primary: themes.cyber?.colors?.primary || {
          value: '#4285f4',
          type: 'color',
          description: 'UpDrift primary brand color'
        }
      }
    },
    
    // All theme variations
    themes: themes,
    
    // Unique UpDrift cosmic elements
    cosmic: cosmic,
    
    // Standard design tokens
    spacing: {
      xs: { value: 4, type: 'dimension', unit: 'px' },
      sm: { value: 8, type: 'dimension', unit: 'px' },
      md: { value: 16, type: 'dimension', unit: 'px' },
      lg: { value: 24, type: 'dimension', unit: 'px' },
      xl: { value: 32, type: 'dimension', unit: 'px' },
      '2xl': { value: 48, type: 'dimension', unit: 'px' },
      '3xl': { value: 64, type: 'dimension', unit: 'px' }
    },
    
    typography: {
      fontFamily: {
        primary: {
          value: 'Inter, sans-serif',
          type: 'fontFamily',
          description: 'Primary font family used throughout UpDrift'
        }
      },
      fontSize: {
        xs: { value: 12, type: 'dimension', unit: 'px' },
        sm: { value: 14, type: 'dimension', unit: 'px' },
        base: { value: 16, type: 'dimension', unit: 'px' },
        lg: { value: 18, type: 'dimension', unit: 'px' },
        xl: { value: 20, type: 'dimension', unit: 'px' },
        '2xl': { value: 24, type: 'dimension', unit: 'px' },
        '3xl': { value: 30, type: 'dimension', unit: 'px' },
        '4xl': { value: 36, type: 'dimension', unit: 'px' },
        '5xl': { value: 48, type: 'dimension', unit: 'px' }
      },
      fontWeight: {
        light: { value: 300, type: 'fontWeight' },
        normal: { value: 400, type: 'fontWeight' },
        medium: { value: 500, type: 'fontWeight' },
        semibold: { value: 600, type: 'fontWeight' },
        bold: { value: 700, type: 'fontWeight' }
      }
    },
    
    borderRadius: {
      sm: { value: 4, type: 'dimension', unit: 'px' },
      md: { value: 8, type: 'dimension', unit: 'px' },
      lg: { value: 12, type: 'dimension', unit: 'px' },
      xl: { value: 16, type: 'dimension', unit: 'px' }
    },
    
    // Component specifications
    components: {
      jobCard: {
        minHeight: { value: 180, type: 'dimension', unit: 'px' },
        padding: { value: 24, type: 'dimension', unit: 'px' },
        borderRadius: { value: 12, type: 'dimension', unit: 'px' },
        background: 'glassmorphic with theme colors'
      },
      heroSection: {
        minHeight: { value: 600, type: 'dimension', unit: 'px' },
        cosmicRiver: {
          height: { value: 200, type: 'dimension', unit: 'px' },
          position: 'absolute background layer'
        },
        starfield: {
          layers: 3,
          coverage: 'full viewport',
          position: 'behind river and content'
        }
      }
    },
    
    _metadata: {
      exportedFrom: 'UpDrift CSS Theme System',
      exportDate: new Date().toISOString(),
      totalThemes: Object.keys(themes).length,
      preservedElements: [
        'Cosmic river animations',
        'Starfield parallax background',
        'Particle physics system',
        'Glassmorphic effects',
        'Custom theme engine',
        'HSL-based color system'
      ],
      usage: 'Import this into Figma to document and enhance the existing UpDrift design system'
    }
  };
  
  return figmaTokens;
}

// Export the tokens
function main() {
  try {
    const tokens = generateFigmaTokens();
    
    // Write to output file
    const outputPath = path.join(__dirname, '../public/updrift-figma-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
    
    console.log(`✅ UpDrift themes exported to Figma format:`);
    console.log(`   ${outputPath}`);
    console.log(`\n📊 Export Summary:`);
    console.log(`   • Themes extracted: ${Object.keys(tokens.themes).length}`);
    console.log(`   • Total colors: ${Object.values(tokens.themes).reduce((acc, theme) => acc + Object.keys(theme.colors).length, 0)}`);
    console.log(`   • Cosmic animations documented: ${Object.keys(tokens.cosmic.animations).length}`);
    console.log(`   • Component specifications: ${Object.keys(tokens.components).length}`);
    
    console.log(`\n🎨 Next Steps:`);
    console.log(`   1. Import this file into Figma using Design Tokens plugin`);
    console.log(`   2. Organize tokens into logical groups`);
    console.log(`   3. Create component documentation using these specifications`);
    console.log(`   4. Export refined tokens back to /public/design-tokens.json`);
    
    console.log(`\n⚠️  Remember:`);
    console.log(`   • All cosmic elements are preserved and documented`);
    console.log(`   • This enhances the design workflow without replacing functionality`);
    console.log(`   • Use this for portfolio documentation and design system management`);
    
  } catch (error) {
    console.error('❌ Error exporting themes:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  extractThemeColors,
  extractCosmicElements,
  generateFigmaTokens,
  hslToHex
};