'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ThemeSelector from '@/components/ThemeSelector'
import { ArrowLeftIcon, MagnifyingGlassIcon, MapPinIcon, HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline'

// Sample job card for preview
const SampleJobCard = () => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-lg font-bold">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Senior Frontend Developer
            </h3>
            <p className="text-muted-foreground font-medium mb-2">
              TechCorp Inc.
            </p>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                Remote
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            92% match
          </Badge>
          <Button variant="ghost" size="sm">
            <BookmarkIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4">
        Join our team building the next generation of web applications. We're looking for a passionate developer...
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">React</Badge>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">TypeScript</Badge>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">Next.js</Badge>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-xs text-muted-foreground">Posted 2 days ago</span>
        <Button className="flex items-center">
          Apply Now
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default function ThemesPage() {
  const [searchQuery, setSearchQuery] = useState('design')
  const [location, setLocation] = useState('san francisco')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold gradient-text">Theme Gallery</h1>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🎨 Choose Your Perfect Theme
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Instantly transform your UpDrift experience. Click any theme below to see the magic happen!
          </p>
          
          {/* Interactive Theme Selector */}
          <ThemeSelector showPreview={true} />
        </div>

        {/* Live Preview Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Live Preview
            </h2>
            <p className="text-muted-foreground">
              See how your theme looks with real components
            </p>
          </div>

          <div className="space-y-8">
            {/* Search Bar Preview */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">Search Interface</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                  <Button size="lg" className="w-full">
                    Search Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Cards Preview */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Job Cards
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SampleJobCard />
                <SampleJobCard />
              </div>
            </div>

            {/* Buttons Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Button Variants</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Badges & Labels</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge className="bg-green-50 text-green-700">Remote</Badge>
                  <Badge className="bg-blue-50 text-blue-700">Full-time</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                How It Works
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  🎨 <strong>Instant Changes:</strong> Click any theme above to see immediate changes
                </p>
                <p>
                  💾 <strong>Auto-Save:</strong> Your theme choice is saved to your browser
                </p>
                <p>
                  🔄 <strong>Always Available:</strong> Access the theme switcher from any page header
                </p>
                <p>
                  🎯 <strong>Perfect Match:</strong> Choose based on your industry or personal preference
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 