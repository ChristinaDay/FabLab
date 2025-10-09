'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
  EyeIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  SparklesIcon,
  ChartBarIcon,
  BriefcaseIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import ThemeSelector from '@/components/ThemeSelector'
import ThemeToggle from '@/components/ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import HomeExperiments from '../home-experiments/page'

export default function StyleGuidePage() {
  const [showThemePreview, setShowThemePreview] = useState(true)
  const [showLivePreview, setShowLivePreview] = useState(true)
  const [currentTheme, setCurrentTheme] = useState<string>('dawn')

  // Track current theme from localStorage and HTML class changes
  useEffect(() => {
    const getCurrentTheme = () => {
      const savedTheme = localStorage.getItem('upfetch-theme') || 'dawn'
      const htmlClasses = document.documentElement.className
      const themeMatch = htmlClasses.match(/theme-(\w+)/)
      const activeTheme = themeMatch ? themeMatch[1] : savedTheme
      
      console.log('🔍 Style Guide Theme Detection:', {
        savedTheme,
        htmlClasses,
        activeTheme,
        timestamp: new Date().toISOString()
      })
      
      return activeTheme
    }

    // Initial theme detection
    setCurrentTheme(getCurrentTheme())

    // Listen for theme changes by observing HTML class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newTheme = getCurrentTheme()
          if (newTheme !== currentTheme) {
            console.log('🎨 Theme changed in style guide:', newTheme)
            setCurrentTheme(newTheme)
          }
        }
      })
    })

    // Observe changes to the html element's class attribute
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [currentTheme])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to App</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-xl font-bold text-foreground">🎨 Style Guide</h1>
            </div>
            
            <Badge variant="secondary" className="hidden sm:flex">
              Internal Design System
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            UpFetch Design System
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            A comprehensive collection of themes, components, and design tokens for the UpFetch platform.
            This page is for internal design and development reference.
          </p>
          
          <Alert className="mb-6">
            <InformationCircleIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Internal Tool:</strong> This style guide is for design and development purposes. 
              It showcases our sophisticated theme system and component variations.
            </AlertDescription>
          </Alert>
        </div>

        {/* Live Preview Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <EyeIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Live Preview</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="flex items-center space-x-2"
            >
              <EyeIcon className="h-4 w-4" />
              <span>{showLivePreview ? 'Hide' : 'Show'} Preview</span>
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-6">
            See how our design system looks in practice with this miniature preview of the home page hero area.
            This demonstrates the real-world application of our themes and components.
          </p>

                                {showLivePreview && (
             <Card className="overflow-hidden border-2 border-dashed border-border">
               <CardContent className="p-0">
                 <div className="flex items-center justify-between p-4 bg-muted/20">
                   <h3 className="text-lg font-semibold text-foreground">Home Page Preview</h3>
                   <div className="flex items-center space-x-2">
                     <Badge variant="outline" className="text-xs">
                       Theme: {currentTheme}
                     </Badge>
                     <Badge variant="secondary" className="text-xs">Live</Badge>
                   </div>
                 </div>
                 
                 {/* Scaled Home Page Preview */}
                 <div className={`relative bg-background h-[32rem] overflow-y-auto overflow-x-hidden theme-${currentTheme}`}>
                   <div className="transform scale-75 origin-top-left w-[133.33%]">
                     <div className="bg-background" data-theme={currentTheme}>
                       {/* Header */}
                       <header className="bg-background/80 backdrop-blur-md border-b border-border">
                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                           <div className="flex justify-between items-center h-16">
                             <div className="flex items-center">
                               <h1 className="text-2xl font-bold gradient-text">UpFetch</h1>
                             </div>
                             <div className="flex items-center space-x-4">
                               <ThemeToggle />
                               <div className="flex items-center space-x-2">
                                 <UserIcon className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm text-muted-foreground">Demo User</span>
                               </div>
                               <Button variant="ghost" size="sm">Dashboard</Button>
                             </div>
                           </div>
                         </div>
                       </header>

                       {/* Hero Section */}
                       <section className="relative py-20 overflow-hidden">
                         {/* Theme Indicator */}
                         <div className="bg-primary/10 border-l-4 border-primary mb-8">
                           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-3">
                                 <div className="w-4 h-4 bg-primary rounded-full"></div>
                                 <span className="text-primary font-medium">Theme System Active</span>
                                 <span className="text-sm text-muted-foreground">Try the theme buttons above!</span>
                                 <div className="hidden sm:flex items-center space-x-2 ml-4">
                                   <div className="w-3 h-3 bg-accent rounded-full"></div>
                                   <Badge className="bg-accent text-accent-foreground">Accent</Badge>
                                   <div className="w-3 h-3 bg-secondary rounded-full"></div>
                                   <Badge variant="secondary">Secondary</Badge>
                                 </div>
                               </div>
                               <div className="flex space-x-2">
                                 <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                                 <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-75"></div>
                                 <div className="w-3 h-3 bg-secondary rounded-full animate-pulse delay-150"></div>
                               </div>
                             </div>
                           </div>
                         </div>
                         
                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                           <div className="text-center">
                             <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                               <span className="block">Job Search</span>
                               <span className="block gradient-text">Beyond LinkedIn</span>
                             </h1>
                             <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                               Discover your next career opportunity with our AI-powered job search platform. 
                               We aggregate opportunities from 50+ job boards and use intelligent matching to find your perfect role.
                             </p>
                           </div>

                           {/* Search Bar */}
                           <div className="mt-10 max-w-4xl mx-auto">
                             <Card className="shadow-lg">
                               <CardContent className="p-6">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <div className="relative">
                                     <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                                     <Input
                                       type="text"
                                       placeholder="Job title, keywords, or company"
                                       className="pl-10"
                                     />
                                   </div>
                                   <div className="relative">
                                     <MapPinIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-3" />
                                     <Input
                                       type="text"
                                       placeholder="Location or remote"
                                       className="pl-10"
                                     />
                                   </div>
                                   <div className="flex items-center space-x-4">
                                     <Button size="lg">
                                       <MagnifyingGlassIcon className="h-5 w-5" />
                                       <span>Search Jobs</span>
                                     </Button>
                                     <Button variant="secondary">🔍 Filters</Button>
                                   </div>
                                 </div>
                               </CardContent>
                             </Card>
                           </div>
                         </div>
                       </section>

                       {/* Stats Section */}
                       <section className="py-16 bg-background">
                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                             {[
                               { label: 'Job Listings', value: '2M+', description: 'Fresh opportunities daily' },
                               { label: 'Companies', value: '50K+', description: 'From startups to Fortune 500' },
                               { label: 'Success Rate', value: '85%', description: 'Users find jobs faster' },
                               { label: 'Platforms', value: '50+', description: 'All major job boards' }
                             ].map((stat, index) => (
                               <Card key={index} className="text-center">
                                 <CardContent className="p-6">
                                   <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                   <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                                   <div className="text-xs text-muted-foreground/80 mt-1">{stat.description}</div>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </div>
                       </section>

                       {/* Features Section */}
                       <section className="py-20 bg-muted/50">
                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                           <div className="text-center mb-16">
                             <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                               Why UpFetch Beats LinkedIn
                             </h2>
                             <p className="mt-4 text-xl text-muted-foreground">
                               Experience the future of job searching with features that actually work for you
                             </p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                             {[
                               { icon: <SparklesIcon className="h-8 w-8 text-blue-600" />, title: 'AI-Powered Matching', description: 'Advanced algorithms analyze your skills and experience to find perfect job matches' },
                               { icon: <ChartBarIcon className="h-8 w-8 text-green-600" />, title: 'Multi-Platform Aggregation', description: 'Search across LinkedIn, Indeed, Glassdoor, and 50+ job boards simultaneously' },
                               { icon: <BriefcaseIcon className="h-8 w-8 text-purple-600" />, title: 'Application Tracking', description: 'Never lose track of your applications with our intelligent tracking system' },
                               { icon: <RocketLaunchIcon className="h-8 w-8 text-orange-600" />, title: 'Smart Notifications', description: 'Get notified about new opportunities that match your criteria instantly' }
                             ].map((feature, index) => (
                               <Card key={index} className="hover:shadow-lg transition-shadow duration-300 group">
                                 <CardContent className="p-6">
                                   <div className="flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg mb-4">
                                     <div className="text-primary">
                                       {feature.icon}
                                     </div>
                                   </div>
                                   <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                   <p className="text-muted-foreground">{feature.description}</p>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </div>
                       </section>

                       {/* CTA Section */}
                       <section className="py-20 bg-primary text-primary-foreground relative grid-texture-bg overflow-hidden">
                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                           <h2 className="text-3xl font-extrabold sm:text-4xl">
                             Ready to Find Your Dream Job?
                           </h2>
                           <p className="mt-4 text-xl opacity-90">
                             Join thousands of professionals who've upgraded their job search experience
                           </p>
                           <div className="mt-8">
                             <Button variant="secondary" size="lg">
                               Start Searching Now
                             </Button>
                           </div>
                         </div>
                       </section>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
        </section>

        {/* Theme System Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SwatchIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Theme System</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowThemePreview(!showThemePreview)}
              className="flex items-center space-x-2"
            >
              <EyeIcon className="h-4 w-4" />
              <span>{showThemePreview ? 'Hide' : 'Show'} Themes</span>
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Our sophisticated theme system uses shadcn/ui's complete CSS variable architecture.
            Each theme defines comprehensive color palettes that work seamlessly across all components.
          </p>

          {showThemePreview && (
            <ThemeSelector showPreview={true} />
          )}
        </section>

        {/* Component Showcase */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <CodeBracketIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Component Showcase</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buttons */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inputs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
                <div className="space-y-4">
                  <Input placeholder="Default input" />
                  <Input placeholder="With focus state" className="ring-2 ring-ring" />
                  <Input placeholder="Disabled state" disabled />
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Badge Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Alert Variants</h3>
                <div className="space-y-4">
                  <Alert>
                    <InformationCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                      This is a default alert message.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      This is a destructive alert message.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Color System</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Primary', css: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', css: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Accent', css: 'bg-accent', text: 'text-accent-foreground' },
              { name: 'Muted', css: 'bg-muted', text: 'text-muted-foreground' },
              { name: 'Card', css: 'bg-card', text: 'text-card-foreground' },
              { name: 'Border', css: 'bg-border', text: 'text-foreground' },
            ].map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div className={`h-16 ${color.css} flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${color.text}`}>
                    {color.name}
                  </span>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{color.css}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Typography</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
                <h2 className="text-3xl font-bold text-foreground">Heading 2</h2>
                <h3 className="text-2xl font-bold text-foreground">Heading 3</h3>
                <h4 className="text-xl font-semibold text-foreground">Heading 4</h4>
                <p className="text-base text-foreground">
                  Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-sm text-muted-foreground">
                  Small text - Ut enim ad minim veniam, quis nostrud exercitation 
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Home Experiments Section */}
        <section className="mt-24 border-t border-border pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">Experimental Home Layouts</h2>
            {/* You can add explanatory text here if desired */}
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <ThemeProvider>
              <HomeExperiments />
            </ThemeProvider>
          </div>
        </section>
      </main>
    </div>
  )
} 