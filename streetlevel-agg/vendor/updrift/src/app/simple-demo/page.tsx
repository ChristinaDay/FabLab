'use client';

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ThemePills } from '@/components/simple/ThemePills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

function DemoContent() {
  const { currentTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎨 Simple Theme System</h1>
          <p className="text-xl text-muted-foreground">
            Clean, working themes using CSS custom properties
          </p>
        </div>

        {/* Hero Section Preview */}
        <Card className="border-2 border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              Home Page Hero Preview
              <Badge variant="secondary" className="ml-2">
                {currentTheme.emoji} {currentTheme.displayName}
              </Badge>
            </CardTitle>
            <CardDescription>
              See how your home page hero section looks in the current theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hero Section Recreation */}
            <div className="space-y-8 p-6 bg-background rounded-lg border">
              
              {/* Theme Indicator */}
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <span className="text-primary font-medium">Theme System Active</span>
                    <span className="text-sm text-muted-foreground">Try the theme buttons below!</span>
                    {/* Accent color showcase */}
                    <div className="hidden sm:flex items-center space-x-2 ml-4">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <Badge className="bg-accent text-accent-foreground">
                        Accent
                      </Badge>
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      <Badge variant="secondary">
                        Secondary
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-75"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>

              {/* Hero Title */}
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl">
                  <span className="block">Job Search</span>
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Beyond LinkedIn
                  </span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Discover your next career opportunity with our AI-powered job search platform. 
                  We aggregate opportunities from 50+ job boards and use intelligent matching to find your perfect role.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Main search row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="text"
                            placeholder="Job title, keywords, or company"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="text"
                            placeholder="Location or remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="lg" className="flex-1">
                            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                            Search Jobs
                          </Button>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex justify-center space-x-3">
                        <Button variant="secondary" size="sm">
                          🔍 Filters
                        </Button>
                        <Button variant="outline" size="sm">
                          ⭐ Save Search
                        </Button>
                        <Button variant="ghost" size="sm">
                          📊 Salary Insights
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mini Stats Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Job Listings', value: '2M+', description: 'Fresh opportunities daily' },
                  { label: 'Companies', value: '50K+', description: 'From startups to Fortune 500' },
                  { label: 'Success Rate', value: '85%', description: 'Users find jobs faster' },
                  { label: 'Platforms', value: '50+', description: 'All major job boards' }
                ].map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                      <div className="text-xs text-muted-foreground/80 mt-1">{stat.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview Window */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              Live Preview
              <Badge variant="secondary" className="ml-2">
                {currentTheme.emoji} {currentTheme.displayName}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time preview of how components look in the current theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Sample Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sample Card</CardTitle>
                  <CardDescription>
                    This is how cards look in the current theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    All colors, shadows, and spacing adapt automatically to match the theme's design philosophy.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Action</Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Form Elements</CardTitle>
                  <CardDescription>
                    Inputs and form components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preview-email">Email</Label>
                    <Input 
                      id="preview-email" 
                      placeholder="user@example.com" 
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-message">Message</Label>
                    <textarea 
                      id="preview-message"
                      placeholder="Your message here..."
                      className="w-full p-2 border border-input bg-background rounded-md resize-none"
                      rows={2}
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>

              {/* Color Swatches */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Color Palette</CardTitle>
                  <CardDescription>
                    Current theme's color system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Primary</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-secondary rounded-lg mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Secondary</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent rounded-lg mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Accent</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Muted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Button Variants */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Button Variants</CardTitle>
                  <CardDescription>
                    All button styles in the current theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Adventure Light Mode Showcase */}
        <Card className="border-2 border-accent/30 bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              New Adventure Light Modes
              <Badge className="bg-accent text-accent-foreground">New</Badge>
            </CardTitle>
            <CardDescription>
              Light themes that capture the energy of new adventures, flow states, and productive exploration.
              Each theme embodies that feeling when you're "solitary in your task, but never alone."
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Adventure Concept */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">The Concept</h3>
                <p className="text-sm text-muted-foreground">
                  These themes are inspired by the excitement of taking a vacation, 
                  the possibilities of upgrading to a new city for work, or working late 
                  on a special project because you're in the flow.
                </p>
                <p className="text-sm text-muted-foreground">
                  Where dark mode feels like "exciting nightlife in the city," 
                  these light modes capture that optimistic, adventure-filled energy 
                  of daytime exploration and productive flow states.
                </p>
              </div>

              {/* Quick Try Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Try Them Now</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTheme('goldenhour')}
                    className="text-left justify-start"
                  >
                    🌇 Golden Hour
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTheme('coastal')}
                    className="text-left justify-start"
                  >
                    🏖️ Coastal
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTheme('summit')}
                    className="text-left justify-start"
                  >
                    🏔️ Morning Summit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTheme('nomad')}
                    className="text-left justify-start"
                  >
                    ☕ Café Nomad
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to instantly preview each theme throughout the interface
                </p>
              </div>
            </div>

            {/* Theme Descriptions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-card/50 rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">🌇 Golden Hour Explorer</h4>
                <p className="text-sm text-muted-foreground">
                  Warm sunset glow perfect for flow states. That magical hour when everything looks golden 
                  and you feel unstoppable in your work.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">🏖️ Coastal Expedition</h4>
                <p className="text-sm text-muted-foreground">
                  Fresh ocean vibes for new adventures. Clean, energizing palette that captures 
                  the excitement of exploring a coastal city.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">🏔️ Morning Summit</h4>
                <p className="text-sm text-muted-foreground">
                  Crisp mountain air energy. Clear, focused colors for those early morning 
                  work sessions when your mind is sharp.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">☕ Café Nomad</h4>
                <p className="text-sm text-muted-foreground">
                  Warm productivity spaces. Perfect for that cozy-but-productive feeling 
                  of working from your favorite coffee shop.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Theme Selector</CardTitle>
            <CardDescription>
              Choose from 27 professionally designed themes - watch the preview update instantly!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemePills />
          </CardContent>
        </Card>

        {/* Component Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full">Sign In</Button>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              Current theme colors using CSS custom properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-medium">Secondary</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-medium">Accent</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-medium">Muted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Benefits</CardTitle>
            <CardDescription>
              Why this theme system works better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">✅ What Works</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Uses existing CSS custom properties</li>
                  <li>• Seamless theme switching</li>
                  <li>• Proper color relationships</li>
                  <li>• No fighting with CSS</li>
                  <li>• Works with all shadcn/ui components</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">❌ What Doesn't</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Custom Tailwind class overrides</li>
                  <li>• Hardcoded color values</li>
                  <li>• Complex CSS fighting</li>
                  <li>• Inconsistent theming</li>
                  <li>• Broken component variants</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SimpleDemoPage() {
  return (
    <ThemeProvider>
      <DemoContent />
    </ThemeProvider>
  );
} 