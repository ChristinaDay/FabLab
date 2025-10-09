export interface Theme {
  name: string;
  displayName: string;
  emoji: string;
  description: string;
  category: 'Light' | 'Dark' | 'Luxury';
}

export const themes: Theme[] = [
  // Light Themes
  {
    name: 'dawn',
    displayName: 'Dawn',
    emoji: '🌅',
    description: 'Warm sunrise tones',
    category: 'Light'
  },
  {
    name: 'forest',
    displayName: 'Forest',
    emoji: '🍃',
    description: 'Natural woodland vibes',
    category: 'Light'
  },
  {
    name: 'ember',
    displayName: 'Ember',
    emoji: '🔥',
    description: 'Passionate fire colors',
    category: 'Light'
  },
  {
    name: 'sakura',
    displayName: 'Sakura',
    emoji: '🌸',
    description: 'Cherry blossom dreams',
    category: 'Light'
  },
  {
    name: 'goldenhour',
    displayName: 'Golden Hour Explorer',
    emoji: '🌇',
    description: 'Warm sunset glow for flow states',
    category: 'Light'
  },
  {
    name: 'goldenhour-twilight',
    displayName: 'Golden Hour Twilight',
    emoji: '🌆',
    description: 'Warm sunset meets starlit night sky',
    category: 'Light'
  },
  {
    name: 'coastal',
    displayName: 'Coastal Expedition',
    emoji: '🏖️',
    description: 'Fresh ocean adventure vibes',
    category: 'Light'
  },
  {
    name: 'coastal-deep',
    displayName: 'Coastal Deep',
    emoji: '🌊',
    description: 'Dive into crystal-clear tropical waters',
    category: 'Light'
  },
  {
    name: 'summit',
    displayName: 'Morning Summit',
    emoji: '🏔️',
    description: 'Crisp mountain air energy',
    category: 'Light'
  },
  {
    name: 'nomad',
    displayName: 'Café Nomad',
    emoji: '☕',
    description: 'Warm productivity spaces',
    category: 'Light'
  },
  {
    name: 'nomad-forest',
    displayName: 'Café Nomad Forest',
    emoji: '🌲',
    description: 'Warm café vibes with forest green accents',
    category: 'Light'
  },
  {
    name: 'cyberlight',
    displayName: 'Cyberpunk Light',
    emoji: '🌅',
    description: 'Futuristic neon light mode',
    category: 'Light'
  },
  
  // Dark Themes
  {
    name: 'cyber',
    displayName: 'Cyberpunk',
    emoji: '🌃',
    description: 'Futuristic neon vibes',
    category: 'Dark'
  },
  {
    name: 'ocean',
    displayName: 'Ocean Depth',
    emoji: '🌊',
    description: 'Deep sea mysteries',
    category: 'Dark'
  },
  {
    name: 'mono',
    displayName: 'Midnight Mono',
    emoji: '⚫',
    description: 'Elegant monochrome',
    category: 'Dark'
  },
  {
    name: 'electric',
    displayName: 'Electric',
    emoji: '⚡',
    description: 'High voltage energy',
    category: 'Dark'
  },
  {
    name: 'cosmic',
    displayName: 'Cosmic River',
    emoji: '🌌',
    description: 'Galactic gradients and starfield vibes',
    category: 'Dark'
  },
  
  // Luxury Themes
  {
    name: 'tropical',
    displayName: 'Tropical Paradise',
    emoji: '🌴',
    description: 'Exotic island getaway',
    category: 'Luxury'
  },
  {
    name: 'riviera',
    displayName: 'French Riviera',
    emoji: '🏖️',
    description: 'Sophisticated coastal luxury',
    category: 'Luxury'
  },
  {
    name: 'tuscany',
    displayName: 'Tuscany Sunset',
    emoji: '🍷',
    description: 'Italian countryside charm',
    category: 'Luxury'
  },
  {
    name: 'alps',
    displayName: 'Swiss Alps',
    emoji: '🏔️',
    description: 'Crisp mountain air',
    category: 'Luxury'
  },
  {
    name: 'napa',
    displayName: 'Napa Valley',
    emoji: '🍾',
    description: 'Rich wine country',
    category: 'Luxury'
  },
  {
    name: 'penthouse',
    displayName: 'Manhattan Penthouse',
    emoji: '🏙️',
    description: 'Sophisticated urban luxury',
    category: 'Luxury'
  },
  {
    name: 'maldives',
    displayName: 'Maldives Escape',
    emoji: '🏖️',
    description: 'Crystal clear waters',
    category: 'Luxury'
  },
  {
    name: 'tokyonights',
    displayName: 'Tokyo Nights',
    emoji: '🌃',
    description: 'Neon-lit adventures',
    category: 'Luxury'
  },
  {
    name: 'champagne',
    displayName: 'Champagne Dreams',
    emoji: '🥂',
    description: 'Golden celebration',
    category: 'Luxury'
  },
  {
    name: 'firstclass',
    displayName: 'First Class Lounge',
    emoji: '✈️',
    description: 'Premium travel vibes',
    category: 'Luxury'
  },
  {
    name: 'yacht',
    displayName: 'Yacht Club',
    emoji: '⛵',
    description: 'Nautical elegance',
    category: 'Luxury'
  },
  {
    name: 'spa',
    displayName: 'Luxury Spa',
    emoji: '🧘',
    description: 'Zen relaxation',
    category: 'Luxury'
  },
  {
    name: 'neon',
    displayName: 'Neon District',
    emoji: '🌆',
    description: 'Cyberpunk meets Tokyo',
    category: 'Luxury'
  }
];

export const getTheme = (name: string): Theme => {
  return themes.find(theme => theme.name === name) || themes[0];
};

export const applyTheme = (themeId: string) => {
  const theme = themes.find(t => t.name === themeId);
  if (!theme) return;

  console.log('🎨 Applying theme:', themeId, theme.displayName);

  // Remove all existing theme classes
  const html = document.documentElement;
  const existingClasses = html.className.split(' ');
  const filteredClasses = existingClasses.filter(cls => !cls.startsWith('theme-'));
  
  // Add new theme class
  html.className = filteredClasses.join(' ') + ` theme-${themeId}`;
  
  // Save to localStorage
  localStorage.setItem('updrift-theme', themeId);
  
  console.log('✅ Theme applied successfully!', {
    themeId,
    themeName: theme.displayName,
    className: html.className,
    appliedClass: `theme-${themeId}`
  });
}; 