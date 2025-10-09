'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const themes = [
  {
    id: 'dawn',
    name: 'Dawn',
    color: '#f97575',
    emoji: '🌅',
    description: 'Sunrise pastels',
    category: 'Light'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    color: '#ff00ff',
    emoji: '🌃',
    description: 'Neon electric',
    category: 'Dark'
  },
  {
    id: 'ocean',
    name: 'Ocean Depth',
    color: '#00ccff',
    emoji: '🌊',
    description: 'Deep blue aqua',
    category: 'Dark'
  },
  {
    id: 'forest',
    name: 'Forest',
    color: '#22c55e',
    emoji: '🍃',
    description: 'Natural greens',
    category: 'Light'
  },
  {
    id: 'mono',
    name: 'Midnight Mono',
    color: '#d4d4d4',
    emoji: '🌙',
    description: 'Sophisticated grayscale',
    category: 'Dark'
  },
  {
    id: 'ember',
    name: 'Ember',
    color: '#dc2626',
    emoji: '🔥',
    description: 'Warm fire colors',
    category: 'Light'
  },
  {
    id: 'electric',
    name: 'Electric',
    color: '#ffff00',
    emoji: '⚡',
    description: 'High contrast neon',
    category: 'Dark'
  },
  {
    id: 'sakura',
    name: 'Sakura',
    color: '#f472b6',
    emoji: '🌸',
    description: 'Japanese soft pinks',
    category: 'Light'
  },
  {
    id: 'goldenhour',
    name: 'Golden Hour Explorer',
    color: '#f59e0b',
    emoji: '🌇',
    description: 'Warm sunset glow for flow states',
    category: 'Light'
  },
  {
    id: 'goldenhour-twilight',
    name: 'Golden Hour Twilight',
    color: '#6366f1',
    emoji: '🌆',
    description: 'Warm sunset meets starlit night sky',
    category: 'Light'
  },
  {
    id: 'coastal',
    name: 'Coastal Expedition',
    color: '#0ea5e9',
    emoji: '🏖️',
    description: 'Fresh ocean adventure vibes',
    category: 'Light'
  },
  {
    id: 'coastal-deep',
    name: 'Coastal Deep',
    color: '#0891b2',
    emoji: '🌊',
    description: 'Dive into crystal-clear tropical waters',
    category: 'Light'
  },
  {
    id: 'summit',
    name: 'Morning Summit',
    color: '#3b82f6',
    emoji: '🏔️',
    description: 'Crisp mountain air energy',
    category: 'Light'
  },
  {
    id: 'nomad',
    name: 'Café Nomad',
    color: '#92400e',
    emoji: '☕',
    description: 'Warm productivity spaces',
    category: 'Light'
  },
  {
    id: 'nomad-forest',
    name: 'Café Nomad Forest',
    color: '#228b22',
    emoji: '🌲',
    description: 'Warm café vibes with forest green accents',
    category: 'Light'
  },
  {
    id: 'tropical',
    name: 'Tropical Paradise',
    color: '#00d4aa',
    emoji: '🏝️',
    description: 'Turquoise escape vibes',
    category: 'Luxury'
  },
  {
    id: 'riviera',
    name: 'French Riviera',
    color: '#0369a1',
    emoji: '🛥️',
    description: 'Elegant Mediterranean',
    category: 'Luxury'
  },
  {
    id: 'tuscany',
    name: 'Tuscany Sunset',
    color: '#ea580c',
    emoji: '🍷',
    description: 'Warm Italian evenings',
    category: 'Luxury'
  },
  {
    id: 'alps',
    name: 'Swiss Alps',
    color: '#0891b2',
    emoji: '🏔️',
    description: 'Crisp mountain air',
    category: 'Luxury'
  },
  {
    id: 'napa',
    name: 'Napa Valley',
    color: '#92400e',
    emoji: '🍾',
    description: 'Rich wine country',
    category: 'Luxury'
  },
  {
    id: 'penthouse',
    name: 'Manhattan Penthouse',
    color: '#374151',
    emoji: '🏙️',
    description: 'Sophisticated urban luxury',
    category: 'Luxury'
  },
  {
    id: 'maldives',
    name: 'Maldives Escape',
    color: '#06b6d4',
    emoji: '🏖️',
    description: 'Crystal clear waters',
    category: 'Luxury'
  },
  {
    id: 'tokyonights',
    name: 'Tokyo Nights',
    color: '#ec4899',
    emoji: '🌃',
    description: 'Neon-lit adventures',
    category: 'Luxury'
  },
  {
    id: 'champagne',
    name: 'Champagne Dreams',
    color: '#fbbf24',
    emoji: '🥂',
    description: 'Golden celebration',
    category: 'Luxury'
  },
  {
    id: 'firstclass',
    name: 'First Class Lounge',
    color: '#1e293b',
    emoji: '✈️',
    description: 'Premium travel vibes',
    category: 'Luxury'
  },
  {
    id: 'yacht',
    name: 'Yacht Club',
    color: '#0f172a',
    emoji: '⛵',
    description: 'Nautical elegance',
    category: 'Luxury'
  },
  {
    id: 'spa',
    name: 'Luxury Spa',
    color: '#84cc16',
    emoji: '🧘',
    description: 'Zen relaxation',
    category: 'Luxury'
  },
  {
    id: 'neon',
    name: 'Neon District',
    color: '#ec4899',
    emoji: '🌆',
    description: 'Cyberpunk meets Tokyo',
    category: 'Luxury'
  }
]

export default function ThemeSelector({ showPreview = false }: { showPreview?: boolean }) {
  const [currentTheme, setCurrentTheme] = useState<string>('cyber')

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('updrift-theme') || 'cyber'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) return

    console.log('🎨 Applying theme:', themeId, theme.name)

    // Remove all existing theme classes
    const html = document.documentElement
    const existingClasses = html.className.split(' ')
    const filteredClasses = existingClasses.filter(cls => !cls.startsWith('theme-'))
    
    // Add new theme class
    html.className = filteredClasses.join(' ') + ` theme-${themeId}`
    
    // Save to localStorage
    localStorage.setItem('updrift-theme', themeId)
    setCurrentTheme(themeId)
    
    console.log('✅ Theme applied successfully!', {
      themeId,
      themeName: theme.name,
      className: html.className,
      appliedClass: `theme-${themeId}`,
      htmlElement: html,
      computedPrimary: getComputedStyle(html).getPropertyValue('--primary')
    })
    
    // Force a style recalculation
    setTimeout(() => {
      const primary = getComputedStyle(html).getPropertyValue('--primary')
      console.log('🔍 CSS Variable check:', { 
        themeId, 
        primaryColor: primary,
        expectedForNeon: '315 100% 65%'
      })
    }, 100)
  }

  const currentThemeData = themes.find(t => t.id === currentTheme)

  if (showPreview) {
    const lightThemes = themes.filter(t => t.category === 'Light')
    const darkThemes = themes.filter(t => t.category === 'Dark')
    const luxuryThemes = themes.filter(t => t.category === 'Luxury')
    
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">🎨 Sophisticated Theme Collection</h2>
            <p className="text-muted-foreground">
              Experience the power of shadcn/ui theming with these carefully crafted color systems.
              <br />
              Each theme transforms the entire interface with professional color palettes.
            </p>
          </div>
          
          {/* Light Themes */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ☀️ Light Themes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {lightThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    currentTheme === theme.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.color }}
                    />
                    <h3 className="font-semibold text-sm mb-1">
                      {theme.emoji} {theme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {theme.description}
                    </p>
                    {currentTheme === theme.id && (
                      <Badge className="mt-2 w-full">
                        ✨ Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Dark Themes */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🌙 Dark Themes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {darkThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    currentTheme === theme.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.color }}
                    />
                    <h3 className="font-semibold text-sm mb-1">
                      {theme.emoji} {theme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {theme.description}
                    </p>
                    {currentTheme === theme.id && (
                      <Badge className="mt-2 w-full">
                        ✨ Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Luxury Themes */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ✨ Luxury & Aspirational Themes
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Premium
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              🎉 <strong>Celebrate your career success</strong> with these luxury-inspired themes that feel like rewards for landing that dream job!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {luxuryThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    currentTheme === theme.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.color }}
                    />
                    <h3 className="font-semibold text-sm mb-1">
                      {theme.emoji} {theme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {theme.description}
                    </p>
                    {currentTheme === theme.id && (
                      <Badge className="mt-2 w-full">
                        ✨ Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              🎨 Each theme uses shadcn/ui's complete CSS variable system for seamless component integration
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Simple button version instead of complex dropdown
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground hidden sm:inline">Theme:</span>
      {themes.map((theme) => (
        <Button
          key={theme.id}
          variant={currentTheme === theme.id ? "default" : "outline"}
          size="sm"
          onClick={() => applyTheme(theme.id)}
          className="w-8 h-8 p-0"
          title={`${theme.name} - ${theme.description} (${theme.category})`}
        >
          {theme.emoji}
        </Button>
      ))}
    </div>
  )
}