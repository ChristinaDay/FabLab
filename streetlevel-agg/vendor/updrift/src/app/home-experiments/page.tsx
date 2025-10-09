'use client';

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, BoltIcon, UserGroupIcon, ChartBarIcon, BuildingOfficeIcon, RocketLaunchIcon, GlobeAltIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Starfield from '../page';
import DynamicWaves from '../page';
import RiverParticles from '../page';
import ThemeToggle from '@/components/ThemeToggle';

// Move RiverHeroLayout to top level, before HomeExperiments
const RiverHeroLayout = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Starfield Background - behind river and hero content */}
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Starfield />
    </div>
    {/* River of Smoke Animation - behind the hero content */}
    <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-0">
      <DynamicWaves />
    </div>
    {/* Foreground River Particles */}
    <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10">
      <RiverParticles />
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Hero Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              Smart Job Matching
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Happy with your
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                current position?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              UpDrift finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
            </p>
          </div>
          {/* Flowing Search Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur opacity-30 animate-pulse"></div>
            <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 shadow-xl">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                      <Input 
                        placeholder="Job title or keywords"
                        className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                      <Input 
                        placeholder="Location"
                        className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-lg">
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
          {/* Flowing Tags */}
          <div className="flex flex-wrap gap-3">
            {['Remote Work', 'Tech Companies', 'High Growth', 'Well Funded'].map((tag, index) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transform hover:scale-110 transition-all px-4 py-2 border-primary/30 hover:border-primary/50"
                style={{
                  animation: `float ${2 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        {/* Right: Flowing Job Cards */}
        <div className="relative">
          <div className="space-y-6">
            {[
              { company: 'Stripe', role: 'Senior Frontend Engineer', salary: '$160k - $220k', logo: '💳' },
              { company: 'Anthropic', role: 'Product Manager - AI', salary: '$180k - $250k', logo: '🤖' },
              { company: 'Docker', role: 'DevOps Engineer', salary: '$130k - $170k', logo: '🐳' },
              { company: 'Figma', role: 'UX Designer', salary: '$120k - $160k', logo: '🎨' }
            ].map((job, index) => (
              <div
                key={index}
                className={`hero-job-card-float-${index} transition-all duration-500 hover:scale-105`}
              >
                <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">
                        {job.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{job.role}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <p className="text-sm font-medium text-primary">{job.salary}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100"
                        asChild
                      >
                        <Link href={`/search?q=${encodeURIComponent(job.role)}&location=Remote`}>
                          View →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// CosmicRiverLayout will be defined inside HomeExperiments function to access theme context

function HomeExperiments() {
  const { currentTheme, setTheme } = useTheme();
  const [activeLayout, setActiveLayout] = useState('hero-cards');

  const layouts = [
    { id: 'hero-cards', name: 'Hero + Live Jobs', emoji: '🎯', description: 'Beautiful hero with live job cards' },
    { id: 'geometric-modern', name: 'Geometric Modern', emoji: '🔷', description: 'Sharp angles and floating elements' },
    { id: 'glass-morphism', name: 'Glass Morphism', emoji: '🔮', description: 'Frosted glass effects and blur' },
    { id: 'neon-cyber', name: 'Neon Cyber', emoji: '⚡', description: 'Glowing borders and cyber aesthetics' },
    { id: 'particle-flow', name: 'Particle Flow', emoji: '✨', description: 'Dynamic particle animations' },
    { id: 'gradient-waves', name: 'Gradient Waves', emoji: '🌊', description: 'Flowing gradient backgrounds' },
    { id: 'holographic', name: 'Holographic', emoji: '🌈', description: 'Iridescent and prismatic effects' },
    
    // Typography Variations
    { id: 'mono-tech', name: 'Mono Tech', emoji: '💻', description: 'Developer-focused monospace typography with code aesthetics' },
    { id: 'serif-editorial', name: 'Serif Editorial', emoji: '📰', description: 'Classic serif typography with magazine-style layouts' },
    { id: 'display-bold', name: 'Display Bold', emoji: '🔥', description: 'High-impact typography with dramatic font weights' },
    { id: 'script-human', name: 'Script Human', emoji: '✍️', description: 'Handwritten and script fonts for personal touch' },
    { id: 'condensed-modern', name: 'Condensed Modern', emoji: '📏', description: 'Space-efficient condensed fonts for modern layouts' },
    { id: 'wide-luxury', name: 'Wide Luxury', emoji: '💎', description: 'Expanded letterforms for premium, spacious feeling' },
    
    // Keep the original feature experiments
    { id: 'map-discovery', name: 'Map Discovery', emoji: '🗺️', description: 'Interactive location-based job finding' },
    { id: 'ai-conversation', name: 'AI Job Guide', emoji: '🤖', description: 'Conversational AI guides your search' },
    { id: 'skills-visual', name: 'Visual Skills Match', emoji: '🎨', description: 'Interactive skill-based matching' },
    { id: 'social-proof', name: 'Success Stories', emoji: '⭐', description: 'Testimonials and success-driven' },
    { id: 'company-first', name: 'Company Explorer', emoji: '🏢', description: 'Discover companies, then roles' },
    { id: 'cosmic-river', name: 'Cosmic River', emoji: '🌌', description: 'A cosmic, theme-driven hero with a river of light and a modern search experience.' },
  ];

  const HeroCardsLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Dynamic Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                  🚀 2.8M+ Jobs Updated Daily
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Your Dream Job is
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Waiting for You
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Skip the endless scrolling. Our AI finds opportunities that match your skills, 
                  salary expectations, and career goals from 50+ job boards.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Job title, skills, or company"
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Location or remote"
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <Button size="lg" className="h-12 px-8">
                    Find Jobs
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['Remote', 'Senior Level', '$100k+', 'Startup', 'Tech'].map(tag => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Live Job Cards Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent z-10 rounded-lg" />
              <div className="space-y-4 max-h-96 overflow-hidden">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    ✨ Live Jobs Updating Now
                  </Badge>
                </div>
                
                {[
                  { 
                    company: 'Stripe', 
                    role: 'Senior Frontend Engineer', 
                    salary: '$160k - $220k',
                    location: 'San Francisco, CA',
                    tags: ['React', 'TypeScript', 'Remote OK'],
                    posted: '2 hours ago',
                    logo: '💳'
                  },
                  { 
                    company: 'Figma', 
                    role: 'Product Designer', 
                    salary: '$140k - $180k',
                    location: 'New York, NY',
                    tags: ['Design Systems', 'Figma', 'User Research'],
                    posted: '4 hours ago',
                    logo: '🎨'
                  },
                  { 
                    company: 'Anthropic', 
                    role: 'AI Research Engineer', 
                    salary: '$180k - $250k',
                    location: 'Remote',
                    tags: ['Python', 'Machine Learning', 'Research'],
                    posted: '6 hours ago',
                    logo: '🤖'
                  }
                ].map((job, i) => (
                  <Card key={i} className="transform hover:scale-105 transition-all cursor-pointer bg-card/80 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                          {job.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-foreground truncate">{job.role}</h3>
                            <Badge variant="outline" className="text-xs">{job.posted}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{job.company} • {job.location}</p>
                          <p className="text-sm font-medium text-primary mb-2">{job.salary}</p>
                          <div className="flex flex-wrap gap-1">
                            {job.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Highlights */}
      <div className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <BoltIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our algorithms analyze your profile and find roles that actually fit your skills and career goals.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <StarIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Quality Over Quantity</h3>
              <p className="text-muted-foreground">
                We curate the best opportunities from top companies, so you spend time applying, not searching.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <UserGroupIcon className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Direct Connections</h3>
              <p className="text-muted-foreground">
                Connect directly with hiring managers and skip the black hole of traditional applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const GeometricModernLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent transform rotate-12 scale-150"></div>
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-accent/10 transform rotate-45 rounded-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 transform -rotate-12 rounded-2xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-primary/20 transform rotate-30 rounded-xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-accent/20 text-accent-foreground border-accent/30 transform hover:scale-105 transition-transform">
                    🚀 Next-Gen Job Discovery
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                    Find Your
                    <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                      Perfect Role
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Cut through the noise with AI-powered job matching that connects you 
                    with opportunities that actually match your skills and ambitions.
                  </p>
                </div>
                
                {/* Geometric Search Form */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative transform hover:scale-105 transition-transform">
                          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Job title or keywords"
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl"
                          />
                        </div>
                        <div className="relative transform hover:scale-105 transition-transform">
                          <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Location or remote"
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl"
                          />
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all">
                        Start Your Search
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-3">
                  {['Remote', 'Senior', '$150k+', 'Startup', 'AI/ML'].map((tag, i) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent/20 transform hover:scale-110 transition-all px-4 py-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Floating Job Cards */}
              <div className="relative">
                <div className="space-y-6">
                  {[
                    { company: 'Meta', role: 'Senior Engineer', salary: '$200k+', logo: '🏢' },
                    { company: 'OpenAI', role: 'ML Engineer', salary: '$250k+', logo: '🤖' },
                    { company: 'Stripe', role: 'Frontend Lead', salary: '$180k+', logo: '💳' }
                  ].map((job, i) => (
                    <div
                      key={i}
                      className="transform hover:scale-105 transition-all duration-300"
                      style={{
                        transform: `translateX(${i % 2 === 0 ? '20px' : '-20px'}) translateY(${i * 10}px) rotate(${i % 2 === 0 ? '2deg' : '-2deg'})`
                      }}
                    >
                      <Card className="bg-card/70 backdrop-blur-xl border-primary/20 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-xl">
                              {job.logo}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{job.role}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <p className="text-sm font-medium text-primary">{job.salary}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-card/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose UpDrift?</h2>
              <p className="text-xl text-muted-foreground">Experience the future of job searching</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'AI-Powered', desc: 'Smart matching algorithms' },
                { icon: StarIcon, title: 'Premium Jobs', desc: 'Curated opportunities' },
                { icon: UserGroupIcon, title: 'Direct Connect', desc: 'Skip the middleman' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl transform group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="relative w-full h-full bg-card/80 backdrop-blur-xl rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const GlassMorphismLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 relative overflow-hidden">
      {/* Background Blur Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-2xl"></div>
      </div>

      {/* Glass Container */}
      <div className="relative z-10 min-h-screen backdrop-blur-3xl">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-white/20 text-foreground border-white/30 backdrop-blur-xl">
                    ✨ Premium Job Platform
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                    Discover
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      Amazing Careers
                    </span>
                  </h1>
                  <p className="text-xl text-foreground/80 max-w-lg leading-relaxed">
                    Experience crystal-clear job matching with our advanced AI platform. 
                    Find opportunities that perfectly align with your career vision.
                  </p>
                </div>
                
                {/* Glass Search Form */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-foreground/60" />
                          <Input 
                            placeholder="Search jobs..."
                            className="pl-12 h-14 text-lg bg-white/10 border-white/20 rounded-2xl backdrop-blur-xl placeholder:text-foreground/50"
                          />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-foreground/60" />
                          <Input 
                            placeholder="Location..."
                            className="pl-12 h-14 text-lg bg-white/10 border-white/20 rounded-2xl backdrop-blur-xl placeholder:text-foreground/50"
                          />
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 backdrop-blur-xl">
                        Search Jobs
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Glass Tags */}
                <div className="flex flex-wrap gap-3">
                  {['Remote Work', 'High Salary', 'Top Companies', 'Growth'].map(tag => (
                    <Badge 
                      key={tag} 
                      className="bg-white/10 text-foreground border-white/20 backdrop-blur-xl hover:bg-white/20 transition-all cursor-pointer px-4 py-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Glass Job Cards */}
              <div className="relative">
                <div className="space-y-6">
                  {[
                    { company: 'Apple', role: 'iOS Engineer', salary: '$185k', logo: '🍎' },
                    { company: 'Google', role: 'Staff SWE', salary: '$220k', logo: '🔍' },
                    { company: 'Tesla', role: 'Autonomy Engineer', salary: '$195k', logo: '🚗' }
                  ].map((job, i) => (
                    <Card key={i} className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 hover:rotate-1">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-xl">
                            {job.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{job.role}</h3>
                            <p className="text-sm text-foreground/70">{job.company}</p>
                            <p className="text-sm font-medium text-accent">{job.salary}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glass Features */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Crystal Clear Results</h2>
              <p className="text-xl text-foreground/80">Transparent job matching process</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'Smart Matching', desc: 'AI-powered precision' },
                { icon: StarIcon, title: 'Premium Access', desc: 'Exclusive opportunities' },
                { icon: UserGroupIcon, title: 'Direct Pipeline', desc: 'Connect with hiring teams' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-xl transform group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-white/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NeonCyberLayout = () => (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Neon Glow Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-primary/20 text-primary border-primary/50 shadow-lg shadow-primary/20">
                    ⚡ Cyber Job Search
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                    Hack Your
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse">
                      Career Path
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                    Enter the matrix of opportunities. Our neural network connects you 
                    with high-tech roles at cutting-edge companies.
                  </p>
                </div>
                
                {/* Neon Search Form */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-50 animate-pulse"></div>
                  <div className="relative bg-black/80 backdrop-blur-xl rounded-lg p-6 border border-primary/50 shadow-2xl shadow-primary/20">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                          <Input 
                            placeholder="Search.exe"
                            className="pl-12 h-14 text-lg bg-black/50 border-primary/30 rounded-lg text-white placeholder:text-gray-400 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                          />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                          <Input 
                            placeholder="Location.db"
                            className="pl-12 h-14 text-lg bg-black/50 border-accent/30 rounded-lg text-white placeholder:text-gray-400 focus:border-accent focus:shadow-lg focus:shadow-accent/20"
                          />
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-14 text-lg rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                        Execute Search
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Cyber Tags */}
                <div className="flex flex-wrap gap-3">
                  {['Remote.exe', 'AI/ML.py', 'Crypto.sol', 'Web3.js'].map(tag => (
                    <Badge 
                      key={tag} 
                      className="bg-black/80 text-primary border-primary/50 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer px-4 py-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Neon Job Terminal */}
              <div className="relative">
                <div className="bg-black/90 rounded-lg border border-primary/50 shadow-2xl shadow-primary/20 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm ml-2">job_finder.exe</span>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="text-green-400">$ searching for opportunities...</div>
                    <div className="text-white">
                      <span className="text-accent">{'>'}</span> Found: Meta - Senior Engineer
                    </div>
                    <div className="text-gray-300 ml-4">Salary: $220k | Remote: true</div>
                    <div className="text-white">
                      <span className="text-accent">{'>'}</span> Found: OpenAI - ML Engineer
                    </div>
                    <div className="text-gray-300 ml-4">Salary: $280k | Remote: true</div>
                    <div className="text-white">
                      <span className="text-accent">{'>'}</span> Found: Stripe - Backend Lead
                    </div>
                    <div className="text-gray-300 ml-4">Salary: $240k | Remote: true</div>
                    <div className="text-green-400 mt-4">$ 847 matches found</div>
                    <div className="text-primary animate-pulse">_</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cyber Features */}
        <div className="py-24 bg-gradient-to-b from-transparent to-primary/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">System Features</h2>
              <p className="text-xl text-gray-300">Advanced job hunting protocols</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'Neural Network', desc: 'AI-powered matching' },
                { icon: StarIcon, title: 'Premium Access', desc: 'Exclusive job database' },
                { icon: UserGroupIcon, title: 'Direct Link', desc: 'Connect with recruiters' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg transform group-hover:rotate-12 transition-transform duration-300 border border-primary/50"></div>
                    <div className="relative w-full h-full bg-black/80 backdrop-blur-xl rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-primary/30">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ParticleFlowLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Depth of Field Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Far Distance Layer - Smallest, most blurred particles */}
        <div className="absolute inset-0 opacity-30" style={{ filter: 'blur(1px)' }}>
          {[...Array(35)].map((_, i) => (
            <div
              key={`far-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${0.5 + Math.random() * 1}px`,
                height: `${0.5 + Math.random() * 1}px`,
                backgroundColor: Math.random() > 0.5 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                opacity: 0.2 + Math.random() * 0.3,
                animation: `particleDepthFar ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Mid Distance Layer - Medium particles with moderate blur */}
        <div className="absolute inset-0 opacity-50" style={{ filter: 'blur(0.5px)' }}>
          {[...Array(25)].map((_, i) => (
            <div
              key={`mid-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 1.5}px`,
                height: `${1 + Math.random() * 1.5}px`,
                backgroundColor: Math.random() > 0.3 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                opacity: 0.4 + Math.random() * 0.4,
                animation: `particleDepthMid ${10 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Near Distance Layer - Larger, crisp particles */}
        <div className="absolute inset-0 opacity-70">
          {[...Array(15)].map((_, i) => (
            <div
              key={`near-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 2}px`,
                height: `${2 + Math.random() * 2}px`,
                backgroundColor: Math.random() > 0.4 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                opacity: 0.6 + Math.random() * 0.3,
                animation: `particleDepthNear ${6 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Closest Layer - Most prominent particles */}
        <div className="absolute inset-0 opacity-85">
          {[...Array(8)].map((_, i) => (
            <div
              key={`close-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 3}px`,
                height: `${3 + Math.random() * 3}px`,
                background: Math.random() > 0.5 ? 
                  `radial-gradient(circle, hsl(var(--primary)), hsl(var(--primary)/0.6))` :
                  `radial-gradient(circle, hsl(var(--accent)), hsl(var(--accent)/0.6))`,
                opacity: 0.7 + Math.random() * 0.3,
                animation: `particleDepthClose ${4 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: `0 0 ${4 + Math.random() * 4}px hsl(var(--primary)/0.3)`
              }}
            />
          ))}
        </div>
        
        {/* Enhanced connecting lines with depth */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="lineGradientFaint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Foreground connection lines */}
            {[...Array(8)].map((_, i) => (
              <line
                key={`line-close-${i}`}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#lineGradient)"
                strokeWidth={`${0.8 + Math.random() * 0.4}`}
                opacity="0.4"
                style={{
                  animation: `lineFlow ${8 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
            
            {/* Background connection lines */}
            {[...Array(12)].map((_, i) => (
              <line
                key={`line-far-${i}`}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#lineGradientFaint)"
                strokeWidth="0.3"
                opacity="0.2"
                style={{
                  animation: `lineFlow ${12 + Math.random() * 6}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`
                }}
              />
            ))}
          </svg>
        </div>
        
        {/* Atmospheric depth gradient overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, hsl(var(--primary)/0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, hsl(var(--accent)/0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 70%, hsl(var(--secondary)/0.05) 0%, transparent 70%)
              `,
              animation: 'atmosphericFlow 20s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                    ✨ Dynamic Job Discovery
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                    Flow Into Your
                    <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                      Dream Career
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Let our intelligent matching system guide you through the perfect career path. 
                    Experience dynamic job discovery that adapts to your unique journey.
                  </p>
                </div>
                
                {/* Flowing Search Form */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur opacity-30 animate-pulse"></div>
                  <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 shadow-xl">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                            <Input 
                              placeholder="What role calls to you?"
                              className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <div className="relative">
                            <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                            <Input 
                              placeholder="Where do you thrive?"
                              className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-accent/50"
                            />
                          </div>
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-lg">
                        Begin Your Journey
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Flowing Tags */}
                <div className="flex flex-wrap gap-3">
                  {['Remote Freedom', 'Creative Teams', 'Growth Mindset', 'Innovation First'].map((tag, i) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 transform hover:scale-110 transition-all px-4 py-2 border-primary/30 hover:border-primary/50"
                      style={{
                        animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Flowing Job Cards */}
              <div className="relative">
                <div className="space-y-6">
                  {[
                    { company: 'Notion', role: 'Product Designer', salary: '$160k+', logo: '📝' },
                    { company: 'Figma', role: 'Senior Engineer', salary: '$190k+', logo: '🎨' },
                    { company: 'Linear', role: 'Frontend Lead', salary: '$175k+', logo: '📊' }
                  ].map((job, i) => (
                    <div
                      key={i}
                      className="transform hover:scale-105 transition-all duration-500"
                      style={{
                        animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.7}s`
                      }}
                    >
                      <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">
                              {job.logo}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{job.role}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <p className="text-sm font-medium text-primary">{job.salary}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flowing Features */}
        <div className="py-24 bg-gradient-to-b from-primary/5 to-accent/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Experience the Flow</h2>
              <p className="text-xl text-muted-foreground">Seamless job discovery that feels natural</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'Dynamic Matching', desc: 'AI that learns your preferences' },
                { icon: StarIcon, title: 'Curated Flow', desc: 'Handpicked opportunities' },
                { icon: UserGroupIcon, title: 'Human Connection', desc: 'Real relationships, not algorithms' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div 
                    className="relative mx-auto w-20 h-20"
                    style={{
                      animation: `float ${2.5 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="relative w-full h-full bg-card/80 backdrop-blur-xl rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for depth of field particle animations */}
      <style jsx>{`
        @keyframes particleDepthFar {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.2;
          }
          25% { 
            transform: translateY(-2px) translateX(1px) scale(1.1);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-3px) translateX(-1px) scale(0.9);
            opacity: 0.3;
          }
          75% { 
            transform: translateY(-1px) translateX(2px) scale(1.05);
            opacity: 0.5;
          }
        }
        
        @keyframes particleDepthMid {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.4;
          }
          33% { 
            transform: translateY(-5px) translateX(2px) scale(1.2);
            opacity: 0.7;
          }
          66% { 
            transform: translateY(-8px) translateX(-3px) scale(0.8);
            opacity: 0.5;
          }
        }
        
        @keyframes particleDepthNear {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          40% { 
            transform: translateY(-12px) translateX(4px) scale(1.3);
            opacity: 0.9;
          }
          60% { 
            transform: translateY(-15px) translateX(-2px) scale(0.7);
            opacity: 0.7;
          }
        }
        
        @keyframes particleDepthClose {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
            opacity: 0.7;
          }
          30% { 
            transform: translateY(-20px) translateX(6px) scale(1.4) rotate(5deg);
            opacity: 1;
          }
          70% { 
            transform: translateY(-25px) translateX(-4px) scale(0.6) rotate(-3deg);
            opacity: 0.8;
          }
        }
        
        @keyframes lineFlow {
          0%, 100% { 
            opacity: 0.2;
            stroke-dasharray: 0 100;
          }
          50% { 
            opacity: 0.6;
            stroke-dasharray: 50 50;
          }
        }
        
        @keyframes atmosphericFlow {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.05) rotate(2deg);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );

  const GradientWavesLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Wave layers */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, hsl(var(--primary)) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, hsl(var(--secondary)) 0%, transparent 50%)
              `,
              animation: 'wave 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(circle at 60% 70%, hsl(var(--accent)) 0%, transparent 50%),
                radial-gradient(circle at 30% 30%, hsl(var(--primary)) 0%, transparent 50%)
              `,
              animation: 'wave 12s ease-in-out infinite reverse'
            }}
          />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `
                radial-gradient(circle at 90% 10%, hsl(var(--secondary)) 0%, transparent 50%),
                radial-gradient(circle at 10% 90%, hsl(var(--accent)) 0%, transparent 50%)
              `,
              animation: 'wave 15s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Flowing gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border-0 backdrop-blur-sm">
                    🌊 Flowing Opportunities
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-pulse">
                      Ride the Wave
                    </span>
                    <span className="block text-foreground">
                      To Success
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Let opportunities flow to you naturally. Our platform creates a seamless 
                    current of career possibilities that match your unique talents and aspirations.
                  </p>
                </div>
                
                {/* Gradient Wave Search Form */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 shadow-2xl">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20"></div>
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                            <Input 
                              placeholder="What flows through your mind?"
                              className="pl-12 h-14 text-lg bg-gradient-to-r from-background/80 to-background/60 border-0 rounded-2xl focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-secondary rounded-2xl blur opacity-20"></div>
                          <div className="relative">
                            <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                            <Input 
                              placeholder="Where do currents take you?"
                              className="pl-12 h-14 text-lg bg-gradient-to-r from-background/80 to-background/60 border-0 rounded-2xl focus:ring-2 focus:ring-accent/50"
                            />
                          </div>
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-xl">
                        Flow Into Opportunities
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Wave Tags */}
                <div className="flex flex-wrap gap-3">
                  {['Remote Waves', 'Creative Currents', 'Growth Tides', 'Innovation Flows'].map((tag, i) => (
                    <Badge 
                      key={tag} 
                      className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border-0 hover:from-primary/30 hover:to-accent/30 transition-all cursor-pointer px-4 py-2"
                      style={{
                        animation: `wave ${3 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Flowing Job Cards */}
              <div className="relative">
                <div className="space-y-6">
                  {[
                    { company: 'Ripple', role: 'Flow Engineer', salary: '$170k+', logo: '🌊' },
                    { company: 'Stream', role: 'Data Architect', salary: '$185k+', logo: '💫' },
                    { company: 'Current', role: 'Platform Lead', salary: '$200k+', logo: '⚡' }
                  ].map((job, i) => (
                    <div
                      key={i}
                      className="transform hover:scale-105 transition-all duration-500"
                      style={{
                        animation: `wave ${4 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    >
                      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">
                              {job.logo}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{job.role}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <p className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {job.salary}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Features */}
        <div className="py-24 bg-gradient-to-b from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Ride the Current
              </h2>
              <p className="text-xl text-muted-foreground">Let opportunities flow naturally to you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'Natural Flow', desc: 'Organic job discovery' },
                { icon: StarIcon, title: 'Current Awareness', desc: 'Real-time market insights' },
                { icon: UserGroupIcon, title: 'Fluid Connections', desc: 'Seamless networking' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div 
                    className="relative mx-auto w-20 h-20"
                    style={{
                      animation: `wave ${3 + i * 0.2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for wave animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );

  const HolographicLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Holographic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle prismatic gradients - no rotating rectangles */}
        <div className="absolute inset-0 opacity-8">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, hsl(var(--primary)/0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, hsl(var(--accent)/0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 40% 80%, hsl(var(--secondary)/0.1) 0%, transparent 50%)
              `
            }}
          />
        </div>
        
        {/* Gentle iridescent streams */}
        <div className="absolute inset-0 opacity-6">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(45deg, 
                  transparent 0%, 
                  hsl(var(--primary)/0.05) 25%, 
                  transparent 50%, 
                  hsl(var(--accent)/0.05) 75%, 
                  transparent 100%)
              `,
              backgroundSize: '600% 600%',
              animation: 'shimmer 12s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Floating prismatic orbs instead of rotating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${15 + (i % 4) * 20 + Math.random() * 10}%`,
              top: `${20 + Math.floor(i / 4) * 40 + Math.random() * 20}%`,
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              background: `radial-gradient(circle, hsl(var(--primary)/0.4), hsl(var(--accent)/0.3), hsl(var(--secondary)/0.2))`,
              animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Subtle prismatic light rays */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute opacity-4"
            style={{
              left: `${30 + i * 20}%`,
              top: '-10%',
              width: '2px',
              height: '120%',
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                hsl(var(--primary)/0.1) 30%, 
                hsl(var(--accent)/0.1) 50%, 
                hsl(var(--secondary)/0.1) 70%, 
                transparent 100%)`,
              transform: `rotate(${-15 + i * 15}deg)`,
              animation: `shimmer ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-gradient-to-r from-primary via-accent to-secondary text-background border-0 backdrop-blur-sm">
                    🌈 Holographic Careers
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                    <span 
                      className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                      style={{
                        backgroundSize: '200% 200%',
                        animation: 'shimmer 3s ease-in-out infinite'
                      }}
                    >
                      Prismatic
                    </span>
                    <span className="block text-foreground">
                      Possibilities
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Experience career discovery through a new lens. Our holographic approach 
                    reveals multiple dimensions of opportunity, showing you paths you never imagined.
                  </p>
                </div>
                
                {/* Holographic Search Form */}
                <div className="relative">
                  <div 
                    className="absolute -inset-2 rounded-3xl blur-lg opacity-40"
                    style={{
                      background: `radial-gradient(ellipse, hsl(var(--primary)/0.6), hsl(var(--accent)/0.4), hsl(var(--secondary)/0.3))`,
                      backgroundSize: '200% 200%',
                      animation: 'shimmer 8s ease-in-out infinite'
                    }}
                  />
                  <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 shadow-2xl">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <div 
                            className="absolute -inset-1 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{
                              background: `linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)))`,
                              animation: 'shimmer 4s ease-in-out infinite'
                            }}
                          />
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                            <Input 
                              placeholder="What spectrum calls to you?"
                              className="pl-12 h-14 text-lg bg-background/80 border-0 rounded-2xl focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <div 
                            className="absolute -inset-1 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{
                              background: `linear-gradient(45deg, hsl(var(--accent)), hsl(var(--secondary)))`,
                              animation: 'shimmer 4s ease-in-out infinite reverse'
                            }}
                          />
                          <div className="relative">
                            <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                            <Input 
                              placeholder="Where do you refract?"
                              className="pl-12 h-14 text-lg bg-background/80 border-0 rounded-2xl focus:ring-2 focus:ring-accent/50"
                            />
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="lg" 
                        className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-xl text-background"
                        style={{
                          backgroundSize: '200% 200%',
                          animation: 'shimmer 4s ease-in-out infinite'
                        }}
                      >
                        Discover Your Spectrum
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Holographic Tags */}
                <div className="flex flex-wrap gap-3">
                  {['Prismatic Roles', 'Spectrum Salaries', 'Refracted Benefits', 'Holographic Teams'].map((tag, i) => (
                    <Badge 
                      key={tag} 
                      className="cursor-pointer transform hover:scale-110 transition-all px-4 py-2 border-0 text-background"
                      style={{
                        background: `linear-gradient(${45 + i * 30}deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)))`,
                        backgroundSize: '200% 200%',
                        animation: `shimmer ${3 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Holographic Job Cards */}
              <div className="relative">
                <div className="space-y-6">
                  {[
                    { company: 'Prism', role: 'Spectrum Analyst', salary: '$180k+', logo: '🔮' },
                    { company: 'Refract', role: 'Light Engineer', salary: '$195k+', logo: '✨' },
                    { company: 'Hologram', role: 'Vision Architect', salary: '$210k+', logo: '🌟' }
                  ].map((job, i) => (
                    <div
                      key={i}
                      className="transform hover:scale-105 transition-all duration-500"
                      style={{
                        animation: `float ${3 + i * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.4}s`
                      }}
                    >
                      <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={{
                            background: `linear-gradient(${45 + i * 30}deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)))`,
                            backgroundSize: '200% 200%',
                            animation: 'shimmer 6s ease-in-out infinite'
                          }}
                        />
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl"
                              style={{
                                background: `conic-gradient(from ${i * 60}deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))`
                              }}
                            >
                              {job.logo}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{job.role}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <p 
                                className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                                style={{
                                  backgroundSize: '200% 200%',
                                  animation: 'shimmer 4s ease-in-out infinite'
                                }}
                              >
                                {job.salary}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holographic Features */}
        <div className="py-24 bg-gradient-to-b from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 
                className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 5s ease-in-out infinite'
                }}
              >
                Multi-Dimensional Discovery
              </h2>
              <p className="text-xl text-muted-foreground">See opportunities from every angle</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BoltIcon, title: 'Spectrum Analysis', desc: 'Multi-layered job matching' },
                { icon: StarIcon, title: 'Prismatic Insights', desc: 'Holographic market data' },
                { icon: UserGroupIcon, title: 'Refracted Networks', desc: 'Dimensional connections' }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div 
                    className="relative mx-auto w-20 h-20"
                    style={{
                      animation: `float ${2.5 + i * 0.2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl transform group-hover:rotate-12 transition-transform duration-300"
                      style={{
                        background: `radial-gradient(circle, hsl(var(--primary)/0.3), hsl(var(--accent)/0.2), hsl(var(--secondary)/0.1))`,
                        opacity: 0.3,
                        backgroundSize: '150% 150%',
                        animation: 'shimmer 6s ease-in-out infinite'
                      }}
                    />
                    <div className="relative w-full h-full bg-card/80 backdrop-blur-xl rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for prismatic animations */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );

  const MonoTechLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
      {/* Code-style background */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 text-primary/20 text-xs leading-3 font-mono whitespace-pre">
          {Array.from({ length: 50 }, (_, i) => 
            `const findJob${i.toString().padStart(2, '0')} = async () => {\n  return await fetch('/api/jobs');\n};\n\n`
          ).join('')}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs tracking-wider">
                    {'>'} STATUS: ACTIVELY_HIRING
                  </Badge>
                  <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight font-mono tracking-tighter">
                    {'{'}<span className="text-primary">JOB</span>{'}'}<br/>
                    <span className="text-accent">.</span>find()<br/>
                    <span className="text-secondary">;</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-mono">
                    // Execute your career search with precision<br/>
                    // Our algorithms match developers with roles<br/>
                    // Based on actual skills, not buzzwords
                  </p>
                </div>
                
                {/* Code-style Search Form */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-20"></div>
                  <div className="relative bg-card/90 backdrop-blur-xl rounded-lg p-6 border border-primary/20 shadow-xl font-mono">
                    <div className="text-xs text-muted-foreground mb-4">// Search parameters</div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="text-xs text-primary mb-1">role:</div>
                          <Input 
                            placeholder="&quot;Senior Engineer&quot;"
                            className="h-12 text-lg bg-background/50 border-primary/30 rounded font-mono"
                          />
                        </div>
                        <div className="relative">
                          <div className="text-xs text-accent mb-1">location:</div>
                          <Input 
                            placeholder="&quot;remote&quot; || &quot;SF&quot;"
                            className="h-12 text-lg bg-background/50 border-accent/30 rounded font-mono"
                          />
                        </div>
                      </div>
                      <Button size="lg" className="w-full h-12 text-lg rounded bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-mono">
                        execute_search();
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Code Tags */}
                <div className="flex flex-wrap gap-3">
                  {['remote: true', 'salary: $150k+', 'equity: yes', 'stack: modern'].map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 transition-all px-3 py-1 border-primary/30 hover:border-primary/50 font-mono text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Terminal Job Display */}
              <div className="relative">
                <div className="bg-black rounded-lg p-6 font-mono text-sm border border-primary/30 shadow-2xl">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 ml-2">job-search.terminal</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-green-400">$ npm run find-job</div>
                    <div className="text-gray-300">Searching repositories...</div>
                    <div className="text-white">
                      <span className="text-accent">✓</span> Found: Stripe - Staff Engineer
                    </div>
                    <div className="text-gray-400 ml-4 text-xs">
                      salary: $220k, remote: true, stack: ['React', 'TypeScript']
                    </div>
                    <div className="text-white">
                      <span className="text-accent">✓</span> Found: Vercel - Senior Frontend
                    </div>
                    <div className="text-gray-400 ml-4 text-xs">
                      salary: $190k, remote: true, stack: ['Next.js', 'GraphQL']
                    </div>
                    <div className="text-white">
                      <span className="text-accent">✓</span> Found: Linear - Full Stack
                    </div>
                    <div className="text-gray-400 ml-4 text-xs">
                      salary: $180k, remote: true, stack: ['TypeScript', 'PostgreSQL']
                    </div>
                    <div className="text-green-400 mt-3">✨ 847 opportunities matched</div>
                    <div className="text-primary animate-pulse">_</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features in code style */}
        <div className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4 font-mono">// Core.features()</h2>
              <p className="text-xl text-muted-foreground font-mono">Built for developers, by developers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: BoltIcon, 
                  title: 'algorithm.match()', 
                  desc: 'Smart filtering based on your actual code contributions',
                  code: 'const match = skills.filter(s => job.requirements.includes(s));'
                },
                { 
                  icon: StarIcon, 
                  title: 'jobs.filter(premium)', 
                  desc: 'Curated opportunities from companies that value engineers',
                  code: 'return companies.filter(c => c.engineeringCulture === true);'
                },
                { 
                  icon: UserGroupIcon, 
                  title: 'connect.direct()', 
                  desc: 'Skip recruiters, talk directly to engineering teams',
                  code: 'await sendMessage(candidate, engineeringManager);'
                }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg transform group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="relative w-full h-full bg-card/80 backdrop-blur-xl rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground font-mono">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                  <div className="bg-black/90 rounded p-3 text-left">
                    <code className="text-xs text-green-400 font-mono">{feature.code}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SerifEditorialLayout = () => (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Times, "Times New Roman", Georgia, serif' }}>
      {/* Elegant Editorial Hero */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-0.5 bg-primary"></div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
                    CAREER OPPORTUNITIES
                  </Badge>
                </div>
                <h1 className="text-6xl lg:text-7xl font-light text-foreground leading-[1.1] tracking-tight">
                  <em className="text-primary font-normal">Discover</em><br/>
                  Extraordinary<br/>
                  <span className="font-bold">Careers</span>
                </h1>
                <div className="max-w-lg">
                  <p className="text-xl text-muted-foreground leading-relaxed font-light italic border-l-2 border-primary/30 pl-6">
                    "Every great career begins with a single, perfectly aligned opportunity. 
                    Our curated approach connects discerning professionals with roles 
                    that define their legacy."
                  </p>
                  <div className="text-sm text-muted-foreground mt-4 ml-6">
                    — The Editorial Team
                  </div>
                </div>
              </div>
              
              {/* Elegant Search Form */}
              <div className="relative">
                <div className="bg-card/80 backdrop-blur-xl rounded-none border-t-2 border-b-2 border-primary/20 p-8 shadow-xl">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-light text-foreground mb-6 tracking-wide">Begin Your Search</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="text-sm font-medium text-primary uppercase tracking-wider mb-2 block">Position</label>
                        <Input 
                          placeholder="Senior Software Engineer..."
                          className="h-14 text-lg bg-background/50 border-0 border-b-2 border-muted rounded-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-sm font-medium text-accent uppercase tracking-wider mb-2 block">Location</label>
                        <Input 
                          placeholder="New York, Remote..."
                          className="h-14 text-lg bg-background/50 border-0 border-b-2 border-muted rounded-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                    <Button size="lg" className="w-full h-14 text-lg rounded-none bg-foreground text-background hover:bg-foreground/90 font-light tracking-wider uppercase">
                      Explore Opportunities
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Editorial Tags */}
              <div className="flex flex-wrap gap-3">
                {['Executive Roles', 'Venture-Backed', 'Global Remote', 'Six-Figure'].map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 transition-all px-4 py-2 border-primary/30 hover:border-primary/50 rounded-none font-light tracking-wide"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Editorial Job Cards */}
            <div className="relative">
              <div className="space-y-8">
                {[
                  { 
                    company: 'The New York Times', 
                    role: 'Senior Engineering Manager', 
                    salary: '$180k - $220k',
                    location: 'New York, NY',
                    description: 'Lead a team of exceptional engineers building the future of digital journalism.',
                    logo: '📰' 
                  },
                  { 
                    company: 'LVMH', 
                    role: 'Head of Digital Innovation', 
                    salary: '$200k - $280k',
                    location: 'Paris, France',
                    description: 'Shape the digital transformation of luxury retail on a global scale.',
                    logo: '💎' 
                  },
                  { 
                    company: 'Sotheby\'s', 
                    role: 'VP of Technology', 
                    salary: '$250k - $350k',
                    location: 'London, UK',
                    description: 'Modernize the auction house experience for the digital age.',
                    logo: '🎨' 
                  }
                ].map((job, i) => (
                  <Card key={i} className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow rounded-none">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                          {job.logo}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-medium text-foreground">{job.role}</h3>
                            <p className="text-lg text-primary font-light italic">{job.company}</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">{job.location}</p>
                          </div>
                          <p className="text-muted-foreground font-light leading-relaxed">{job.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            <p className="text-sm font-medium text-accent">{job.salary}</p>
                            <Button variant="outline" size="sm" className="rounded-none border-primary/30 hover:bg-primary/10">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Features */}
      <div className="py-24 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-light text-foreground tracking-wide">Our Distinguished Approach</h2>
            <div className="w-24 h-0.5 bg-primary mx-auto"></div>
            <p className="text-xl text-muted-foreground font-light italic max-w-2xl mx-auto">
              "We believe exceptional careers deserve exceptional curation."
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Curated Excellence', 
                desc: 'Each opportunity is personally vetted by our editorial team for quality, culture, and career advancement potential.',
                number: 'I'
              },
              { 
                title: 'Executive Access', 
                desc: 'Direct introductions to decision-makers and leadership teams who value exceptional talent.',
                number: 'II'
              },
              { 
                title: 'Legacy Building', 
                desc: 'We focus on roles that build careers, not just fill positions. Every placement is a step toward your professional legacy.',
                number: 'III'
              }
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-primary/30 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-light text-primary">{feature.number}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed max-w-sm mx-auto">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DisplayBoldLayout = () => (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Impact, "Arial Black", "Helvetica Neue", sans-serif' }}>
      {/* Bold Impact Hero */}
      <div className="pt-24 pb-16 relative overflow-hidden">
        {/* Dynamic background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-primary text-background px-6 py-3 text-lg font-black uppercase tracking-widest">
                  🔥 DISRUPTING CAREERS
                </Badge>
                <h1 className="text-7xl lg:text-8xl font-black text-foreground leading-[0.85] tracking-tighter uppercase">
                  SMASH<br/>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    YOUR
                  </span><br/>
                  <span className="text-secondary">LIMITS</span>
                </h1>
                <p className="text-2xl text-foreground font-bold leading-tight max-w-lg">
                  DON'T JUST FIND A JOB.{' '}
                  <span className="text-primary">UNLEASH YOUR POTENTIAL.</span>{' '}
                  JOIN THE CAREER REVOLUTION.
                </p>
              </div>
              
              {/* Bold Search Form */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent blur-lg opacity-40"></div>
                <div className="relative bg-foreground text-background p-8 shadow-2xl transform -skew-y-1">
                  <div className="space-y-6 transform skew-y-1">
                    <h3 className="text-3xl font-black uppercase tracking-wider">SEARCH NOW</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="text-lg font-black uppercase tracking-widest mb-3 block text-primary">ROLE</label>
                        <Input 
                          placeholder="SENIOR DEVELOPER"
                          className="h-16 text-xl font-bold bg-background text-foreground border-4 border-primary focus:border-accent transition-colors uppercase placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-lg font-black uppercase tracking-widest mb-3 block text-accent">LOCATION</label>
                        <Input 
                          placeholder="ANYWHERE"
                          className="h-16 text-xl font-bold bg-background text-foreground border-4 border-accent focus:border-primary transition-colors uppercase placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <Button size="lg" className="w-full h-16 text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background transform hover:scale-105 transition-all shadow-lg">
                      DOMINATE YOUR SEARCH
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Bold Tags */}
              <div className="flex flex-wrap gap-4">
                {['REMOTE WARRIOR', '6-FIGURE SALARY', 'EQUITY BEAST', 'STARTUP CRUSHER'].map(tag => (
                  <Badge 
                    key={tag} 
                    className="cursor-pointer bg-primary text-background hover:bg-accent transition-all px-4 py-2 text-sm font-black uppercase tracking-wide transform hover:scale-110"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Bold Job Cards */}
            <div className="relative">
              <div className="space-y-6">
                {[
                  { 
                    company: 'TESLA', 
                    role: 'AUTONOMY ENGINEER', 
                    salary: '$200K+',
                    impact: 'CHANGE THE WORLD',
                    logo: '⚡' 
                  },
                  { 
                    company: 'SPACEX', 
                    role: 'MISSION CRITICAL DEV', 
                    salary: '$250K+',
                    impact: 'REACH THE STARS',
                    logo: '🚀' 
                  },
                  { 
                    company: 'NVIDIA', 
                    role: 'AI ARCHITECT', 
                    salary: '$300K+',
                    impact: 'BUILD THE FUTURE',
                    logo: '🤖' 
                  }
                ].map((job, i) => (
                  <Card key={i} className="bg-gradient-to-r from-primary/20 to-accent/20 border-4 border-primary hover:border-accent transition-all transform hover:scale-105 hover:-rotate-1">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-3xl font-black transform rotate-3">
                          {job.logo}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{job.role}</h3>
                          <p className="text-xl font-bold text-primary uppercase">{job.company}</p>
                          <p className="text-lg font-bold text-accent">{job.impact}</p>
                          <div className="flex items-center justify-between pt-2">
                            <p className="text-xl font-black text-secondary">{job.salary}</p>
                            <Button className="bg-primary text-background hover:bg-accent font-black uppercase text-sm px-6">
                              APPLY NOW
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bold Features */}
      <div className="py-24 bg-gradient-to-b from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-foreground mb-6 uppercase tracking-tight">UNLEASH YOUR POWER</h2>
            <p className="text-2xl font-bold text-muted-foreground uppercase">NO LIMITS. NO EXCUSES. PURE RESULTS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'INSTANT MATCHING', 
                desc: 'OUR AI FINDS YOUR PERFECT ROLE IN SECONDS, NOT WEEKS',
                icon: BoltIcon,
                number: '01'
              },
              { 
                title: 'PREMIUM ACCESS', 
                desc: 'EXCLUSIVE OPPORTUNITIES FROM TOP-TIER COMPANIES ONLY',
                icon: StarIcon,
                number: '02'
              },
              { 
                title: 'DIRECT IMPACT', 
                desc: 'SKIP THE NOISE. CONNECT STRAIGHT TO DECISION MAKERS',
                icon: UserGroupIcon,
                number: '03'
              }
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-6 group">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-lg mx-auto transform group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center relative">
                    <feature.icon className="h-12 w-12 text-background relative z-10" />
                    <div className="absolute top-2 right-2 text-background/80 font-black text-sm">{feature.number}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-bold leading-tight max-w-sm mx-auto">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ScriptHumanLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ fontFamily: '"Kalam", "Caveat", "Patrick Hand", cursive' }}>
      {/* Handwritten notebook background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="notebook" x="0" y="0" width="100" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2" x2="100" y2="2" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#notebook)" />
        </svg>
      </div>
      
      {/* Handwritten Hero */}
      <div className="pt-20 pb-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              {/* Handwritten Header */}
              <div className="space-y-6">
                <div className="transform -rotate-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full" style={{ fontFamily: 'sans-serif' }}>
                    📝 Written by Real People
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h1 className="text-6xl lg:text-7xl font-normal text-foreground leading-[1.2] transform rotate-1">
                    Hey there! 👋<br/>
                    <span className="text-primary">Let's find you</span><br/>
                    <span className="text-accent">amazing work</span>
                  </h1>
                  <div className="transform -rotate-1 bg-primary/5 p-4 rounded-lg border-l-4 border-primary max-w-xl">
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Job searching doesn't have to feel like torture. 
                      We're here to help you find work that actually makes you happy.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Handwritten Search Form */}
              <div className="relative">
                <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 border border-primary/20 shadow-xl transform rotate-1">
                  <div className="space-y-6 transform -rotate-1">
                    <h3 className="text-2xl text-foreground mb-6">What's your story?</h3>
                    <div className="space-y-6">
                      <div className="relative">
                        <label className="text-lg text-primary mb-3 block">What gets you excited about work?</label>
                        <Input 
                          placeholder="I love solving complex problems..."
                          className="h-16 text-lg bg-background/50 border-2 border-primary/30 rounded-xl focus:border-primary transition-colors"
                          style={{ fontFamily: 'inherit' }}
                        />
                        <div className="absolute -bottom-2 -right-2 text-primary/60 text-sm transform rotate-12">
                          ✏️
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-lg text-accent mb-3 block">Where do you want to work?</label>
                        <Input 
                          placeholder="Anywhere with good coffee..."
                          className="h-16 text-lg bg-background/50 border-2 border-accent/30 rounded-xl focus:border-accent transition-colors"
                          style={{ fontFamily: 'inherit' }}
                        />
                        <div className="absolute -bottom-2 -right-2 text-accent/60 text-sm transform -rotate-12">
                          ☕
                        </div>
                      </div>
                    </div>
                    <Button size="lg" className="w-full h-16 text-xl rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all relative overflow-hidden">
                      <span className="relative z-10">Let's start your journey!</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 transform rotate-1"></div>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Handwritten Notes */}
              <div className="space-y-4">
                <div className="transform rotate-1 bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                  <p className="text-lg text-foreground italic">
                    "This isn't just another job board - it's like having a friend who knows everyone in town!" 
                  </p>
                  <div className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'sans-serif' }}>
                    — Lisa, Software Engineer
                  </div>
                </div>
                <div className="transform -rotate-1 bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-lg text-foreground italic">
                    "They actually cared about what I wanted, not just what was on my resume."
                  </p>
                  <div className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'sans-serif' }}>
                    — Marcus, Product Manager
                  </div>
                </div>
              </div>
            </div>
            
            {/* Handwritten Job Cards */}
            <div className="relative">
              <div className="space-y-8">
                <div className="transform rotate-2 bg-card/90 backdrop-blur-xl rounded-2xl p-8 border border-primary/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-2xl">
                        🚀
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground">Senior Developer</h3>
                        <p className="text-sm text-primary" style={{ fontFamily: 'sans-serif' }}>Remote-First Startup</p>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        "We're looking for someone who gets excited about building things that help people. 
                        Work from anywhere, flexible hours, and we actually mean it when we say work-life balance."
                      </p>
                      <div className="absolute -bottom-1 -right-1 text-primary/40 text-sm transform rotate-45">
                        ✨
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-lg font-medium text-accent">$120k - $160k</span>
                      <Button variant="outline" size="sm" className="rounded-full border-primary/30 hover:bg-primary/10 transform hover:rotate-3 transition-all">
                        Tell me more!
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="transform -rotate-1 bg-card/90 backdrop-blur-xl rounded-2xl p-8 border border-accent/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center text-2xl">
                        🎨
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground">UX Designer</h3>
                        <p className="text-sm text-accent" style={{ fontFamily: 'sans-serif' }}>Creative Agency</p>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        "Join our small but mighty team where every voice matters. 
                        We value creativity over deadlines and believe the best work happens when people feel inspired."
                      </p>
                      <div className="absolute -bottom-1 -right-1 text-accent/40 text-sm transform -rotate-45">
                        🌟
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-lg font-medium text-primary">$85k - $110k</span>
                      <Button variant="outline" size="sm" className="rounded-full border-accent/30 hover:bg-accent/10 transform hover:-rotate-3 transition-all">
                        Sounds perfect!
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="transform rotate-1 bg-card/90 backdrop-blur-xl rounded-2xl p-8 border border-secondary/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full flex items-center justify-center text-2xl">
                        💚
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground">Product Manager</h3>
                        <p className="text-sm text-secondary" style={{ fontFamily: 'sans-serif' }}>Social Impact Org</p>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        "Help us build technology that actually makes the world better. 
                        If you want your work to have real impact, this is the place."
                      </p>
                      <div className="absolute -bottom-1 -right-1 text-secondary/40 text-sm transform rotate-12">
                        🌍
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-lg font-medium text-accent">$95k - $130k</span>
                      <Button variant="outline" size="sm" className="rounded-full border-secondary/30 hover:bg-secondary/10 transform hover:rotate-6 transition-all">
                        I'm interested!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handwritten Features */}
      <div className="py-24 bg-gradient-to-b from-primary/5 to-accent/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-5xl text-foreground mb-4 transform -rotate-1">Why people love us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed transform rotate-1">
              We're not just another platform - we're the people who actually care about your career journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'We actually listen 👂', 
                desc: 'No automated matching here. Real humans who take time to understand what you\'re looking for.',
                icon: '💭',
                note: 'Personal touch in everything',
                transform: 'rotate-2'
              },
              { 
                title: 'Companies we trust ✨', 
                desc: 'We only work with companies that treat their people well. Life\'s too short for toxic workplaces.',
                icon: '🏠',
                note: 'Quality over quantity',
                transform: '-rotate-1'
              },
              { 
                title: 'Your pace, your way 🚶', 
                desc: 'No pressure, no pushy sales tactics. We move at the speed that feels right for you.',
                icon: '🎯',
                note: 'Stress-free process',
                transform: 'rotate-1'
              }
            ].map((feature, i) => (
              <div key={i} className={`text-center space-y-6 transform ${feature.transform}`}>
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-3xl transform hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">{feature.desc}</p>
                  <p className="text-sm text-primary italic transform rotate-1" style={{ fontFamily: 'sans-serif' }}>
                    {feature.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const CondensedModernLayout = () => (
    <div className="min-h-screen bg-background" style={{ fontFamily: '"Roboto Condensed", "Arial Narrow", sans-serif' }}>
      {/* Ultra-compact modern hero */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs font-medium uppercase tracking-widest">
                  EFFICIENCY FIRST
                </Badge>
                <h1 className="text-6xl lg:text-7xl font-light text-foreground leading-[0.85] tracking-tighter uppercase">
                  MAXIMUM<br/>
                  <span className="font-bold text-primary">IMPACT</span><br/>
                  <span className="font-light text-accent">MINIMAL EFFORT</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-tight max-w-md font-light">
                  STREAMLINED JOB SEARCH FOR MODERN PROFESSIONALS. 
                  PRECISION MATCHING. ZERO WASTE. PURE EFFICIENCY.
                </p>
              </div>
              
              {/* Compact Search Interface */}
              <div className="bg-card border border-border p-4 space-y-3">
                <div className="text-xs font-medium text-primary uppercase tracking-widest mb-2">SEARCH PARAMETERS</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input 
                      placeholder="ROLE/TITLE"
                      className="h-10 text-sm bg-background border-primary/30 font-medium uppercase"
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="LOCATION/REMOTE"
                      className="h-10 text-sm bg-background border-accent/30 font-medium uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="MIN SALARY" className="h-8 text-xs font-medium" />
                  <Input placeholder="EXPERIENCE" className="h-8 text-xs font-medium" />
                  <Input placeholder="COMPANY SIZE" className="h-8 text-xs font-medium" />
                </div>
                <Button className="w-full h-10 text-sm font-medium uppercase tracking-wider bg-primary hover:bg-primary/90">
                  EXECUTE SEARCH
                </Button>
              </div>
              
              {/* Efficiency Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2.3s</div>
                  <div className="text-xs text-muted-foreground uppercase">AVG SEARCH TIME</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">94%</div>
                  <div className="text-xs text-muted-foreground uppercase">MATCH ACCURACY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">3.2x</div>
                  <div className="text-xs text-muted-foreground uppercase">FASTER HIRING</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">847k</div>
                  <div className="text-xs text-muted-foreground uppercase">ACTIVE JOBS</div>
                </div>
              </div>
            </div>
            
            {/* Condensed Job Feed */}
            <div className="lg:col-span-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">LIVE OPPORTUNITIES</div>
                {[
                  { company: 'STRIPE', role: 'SR ENGINEER', salary: '220K', type: 'REMOTE', urgency: 'HIGH' },
                  { company: 'VERCEL', role: 'FRONTEND LEAD', salary: '190K', type: 'HYBRID', urgency: 'MED' },
                  { company: 'LINEAR', role: 'FULL STACK', salary: '180K', type: 'REMOTE', urgency: 'HIGH' },
                  { company: 'NOTION', role: 'PRODUCT ENG', salary: '200K', type: 'SF', urgency: 'LOW' },
                  { company: 'FIGMA', role: 'PLATFORM', salary: '210K', type: 'NYC', urgency: 'HIGH' },
                  { company: 'ANTHROPIC', role: 'AI/ML', salary: '250K', type: 'REMOTE', urgency: 'MED' }
                ].map((job, i) => (
                  <div key={i} className="bg-card border border-border p-3 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-foreground uppercase truncate">{job.role}</div>
                          <Badge className={`text-xs px-1 py-0 ${
                            job.urgency === 'HIGH' ? 'bg-primary/20 text-primary' :
                            job.urgency === 'MED' ? 'bg-accent/20 text-accent' :
                            'bg-muted/20 text-muted-foreground'
                          }`}>
                            {job.urgency}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">{job.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{job.salary}</div>
                        <div className="text-xs text-muted-foreground">{job.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium uppercase mt-3">
                  VIEW ALL 847K JOBS
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Features Grid */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-light text-foreground mb-2 uppercase tracking-tight">SYSTEM CAPABILITIES</h2>
              <p className="text-sm text-muted-foreground font-light">
                ENGINEERED FOR MAXIMUM THROUGHPUT AND PRECISION MATCHING
              </p>
            </div>
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              {[
                { title: 'AI MATCHING', desc: 'NEURAL NETWORK OPTIMIZATION', icon: BoltIcon },
                { title: 'INSTANT RESULTS', desc: 'SUB-SECOND RESPONSE TIME', icon: StarIcon },
                { title: 'DIRECT PIPELINE', desc: 'ZERO-FRICTION CONNECTIONS', icon: UserGroupIcon },
                { title: 'LIVE UPDATES', desc: 'REAL-TIME JOB STREAMING', icon: ChartBarIcon }
              ].map((feature, i) => (
                <div key={i} className="bg-card border border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-foreground uppercase">{feature.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground font-light">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WideLuxuryLayout = () => (
    <div className="min-h-screen bg-background" style={{ fontFamily: '"Optima", "Futura", "Avenir Next", sans-serif' }}>
      {/* Luxurious spacious hero */}
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-px bg-primary"></div>
                  <Badge className="bg-primary/5 text-primary border-0 px-8 py-3 rounded-full text-sm tracking-[0.2em] font-light">
                    E X C L U S I V E   O P P O R T U N I T I E S
                  </Badge>
                </div>
                <h1 className="text-7xl lg:text-8xl font-extralight text-foreground leading-[1.0] tracking-[0.05em] uppercase">
                  E L E V A T E<br/>
                  <span className="font-light text-primary tracking-[0.1em]">Y O U R</span><br/>
                  <span className="font-normal text-accent tracking-[0.15em]">C A R E E R</span>
                </h1>
                <div className="max-w-xl space-y-6">
                  <p className="text-xl text-muted-foreground leading-relaxed font-light tracking-wide">
                    A  C U R A T E D  S E L E C T I O N  O F  P R E M I U M  C A R E E R  O P P O R T U N I T I E S  
                    F O R  D I S C E R N I N G  P R O F E S S I O N A L S  W H O  V A L U E  E X C E L L E N C E .
                  </p>
                  <div className="w-24 h-px bg-accent"></div>
                </div>
              </div>
              
              {/* Luxurious Search Experience */}
              <div className="relative">
                <div className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-2xl border border-primary/10 p-12 shadow-2xl">
                  <div className="space-y-8">
                    <h3 className="text-2xl font-light text-foreground tracking-[0.1em] uppercase">D I S C O V E R   Y O U R   M A T C H</h3>
                    <div className="space-y-8">
                      <div className="relative">
                        <label className="text-sm font-light text-primary uppercase tracking-[0.2em] mb-4 block">
                          P R E F E R R E D   R O L E
                        </label>
                        <Input 
                          placeholder="Chief Technology Officer..."
                          className="h-16 text-xl font-light bg-background/30 border-0 border-b border-primary/30 rounded-none focus:border-primary transition-colors tracking-wide placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-sm font-light text-accent uppercase tracking-[0.2em] mb-4 block">
                          P R E F E R R E D   L O C A T I O N
                        </label>
                        <Input 
                          placeholder="Global, New York, London..."
                          className="h-16 text-xl font-light bg-background/30 border-0 border-b border-accent/30 rounded-none focus:border-accent transition-colors tracking-wide placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                    <Button size="lg" className="w-full h-16 text-lg font-light uppercase tracking-[0.2em] bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent transition-all border-0 rounded-none shadow-xl">
                      I N I T I A T E   S E A R C H
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Luxury Categories */}
              <div className="flex flex-wrap gap-6">
                {[
                  'E X E C U T I V E   L E A D E R S H I P',
                  'V E N T U R E   P A R T N E R S',
                  'G L O B A L   R E M O T E',
                  'E Q U I T Y   P A C K A G E S'
                ].map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/5 transition-all px-6 py-3 border-primary/20 hover:border-primary/40 rounded-none font-light text-xs tracking-[0.15em]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Premium Opportunities Showcase */}
            <div className="relative">
              <div className="space-y-8">
                {[
                  { 
                    company: 'Goldman Sachs', 
                    role: 'Managing Director, Technology', 
                    compensation: '$500k - $800k + Equity',
                    location: 'New York, London',
                    description: 'Lead digital transformation initiatives across global markets division.',
                    tier: 'TIER I'
                  },
                  { 
                    company: 'Stripe', 
                    role: 'VP of Engineering', 
                    compensation: '$400k - $600k + Equity',
                    location: 'San Francisco, Remote',
                    description: 'Scale engineering excellence across our global payments infrastructure.',
                    tier: 'TIER I'
                  },
                  { 
                    company: 'Sequoia Capital', 
                    role: 'Partner, Technology', 
                    compensation: '$300k + Carry',
                    location: 'Menlo Park',
                    description: 'Join our investment team focusing on enterprise software and AI.',
                    tier: 'EXCLUSIVE'
                  }
                ].map((opportunity, i) => (
                  <Card key={i} className="bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl border border-primary/10 shadow-2xl hover:shadow-3xl transition-all hover:border-primary/20">
                    <CardContent className="p-10">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <h3 className="text-xl font-light text-foreground tracking-wide">{opportunity.role}</h3>
                              <Badge className="bg-primary/10 text-primary border-0 px-3 py-1 text-xs tracking-[0.15em] font-light">
                                {opportunity.tier}
                              </Badge>
                            </div>
                            <p className="text-lg text-primary font-light tracking-wide">{opportunity.company}</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-[0.1em] font-light">{opportunity.location}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground font-light leading-relaxed tracking-wide">{opportunity.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                          <p className="text-lg font-light text-accent tracking-wide">{opportunity.compensation}</p>
                          <Button variant="outline" className="border-primary/30 hover:bg-primary/5 rounded-none px-8 py-2 text-xs uppercase tracking-[0.2em] font-light">
                            V I E W   D E T A I L S
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Services */}
      <div className="py-32 bg-gradient-to-b from-primary/3 to-accent/3">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 space-y-8">
            <h2 className="text-5xl font-extralight text-foreground tracking-[0.1em] uppercase">
              E X C L U S I V E   S E R V I C E S
            </h2>
            <div className="w-32 h-px bg-primary mx-auto"></div>
            <p className="text-xl text-muted-foreground font-light tracking-wide max-w-3xl mx-auto">
              O U R  B E S P O K E  A P P R O A C H  E N S U R E S  E V E R Y  C A R E E R  T R A N S I T I O N  
              I S  S E A M L E S S  A N D  S T R A T E G I C A L L Y  A L I G N E D .
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { 
                title: 'P E R S O N A L   C U R A T I O N', 
                desc: 'Our dedicated advisors personally curate opportunities that align with your executive trajectory and lifestyle preferences.',
                icon: StarIcon,
                number: '0 1'
              },
              { 
                title: 'C O N F I D E N T I A L   N E T W O R K', 
                desc: 'Access our exclusive network of C-suite executives, board members, and venture partners through discrete introductions.',
                icon: UserGroupIcon,
                number: '0 2'
              },
              { 
                title: 'S T R A T E G I C   P L A C E M E N T', 
                desc: 'Every placement is approached as a strategic partnership, ensuring mutual success and long-term satisfaction.',
                icon: BoltIcon,
                number: '0 3'
              }
            ].map((service, i) => (
              <div key={i} className="text-center space-y-8 group">
                <div className="relative mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center relative group-hover:border-primary/40 transition-colors">
                    <service.icon className="h-8 w-8 text-primary" />
                    <div className="absolute -top-3 -right-3 bg-background border border-primary/20 w-8 h-8 flex items-center justify-center">
                      <span className="text-xs text-primary font-light tracking-[0.1em]">{service.number}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-light text-foreground tracking-[0.1em] uppercase">{service.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed tracking-wide max-w-sm mx-auto">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MapDiscoveryLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-primary/20 text-primary mb-4">
              🗺️ Explore by Location
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
              Discover Your Next
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Career Adventure
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Where do you want to work? Explore opportunities across the globe, 
              from bustling tech hubs to remote-friendly companies worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Interactive Map Section */}
        <Card className="shadow-2xl mb-12">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map Visualization */}
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.1)_0%,_transparent_70%)]" />
                  
                  {/* City Markers */}
                  <div className="absolute top-[30%] left-[20%] group cursor-pointer">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-card border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                        <div className="font-semibold text-foreground">San Francisco</div>
                        <div className="text-muted-foreground">2,847 jobs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-[35%] left-[85%] group cursor-pointer">
                    <div className="w-4 h-4 bg-accent rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-card border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                        <div className="font-semibold text-foreground">New York</div>
                        <div className="text-muted-foreground">3,245 jobs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-[25%] left-[50%] group cursor-pointer">
                    <div className="w-4 h-4 bg-secondary rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-card border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                        <div className="font-semibold text-foreground">London</div>
                        <div className="text-muted-foreground">1,934 jobs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-[60%] left-[30%] group cursor-pointer">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-card border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                        <div className="font-semibold text-foreground">Austin</div>
                        <div className="text-muted-foreground">1,567 jobs</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Remote Work Indicator */}
                  <div className="absolute top-4 right-4 bg-card/80 backdrop-blur rounded-lg p-3 border border-border/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">Remote: 12,847 jobs</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">🌍</div>
                      <p className="text-sm">Interactive job map</p>
                      <p className="text-xs">Hover over cities to see opportunities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Search & Filters */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Where do you want to work?
                  </h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Search by city, state, or country"
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Remote Only', count: '12.8k' },
                        { name: 'San Francisco', count: '2.8k' },
                        { name: 'New York', count: '3.2k' },
                        { name: 'London', count: '1.9k' },
                        { name: 'Austin', count: '1.5k' },
                        { name: 'Berlin', count: '1.2k' }
                      ].map(location => (
                        <Button 
                          key={location.name} 
                          variant="outline" 
                          size="sm"
                          className="h-auto py-2 px-3"
                        >
                          {location.name}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {location.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    What type of role?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Job title" />
                    <Input placeholder="Company" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Work arrangement
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['Remote', 'Hybrid', 'On-site'].map(type => (
                      <Button key={type} variant="outline" size="sm">
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button size="lg" className="w-full h-12">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Explore Opportunities
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                city: 'San Francisco', 
                country: 'USA', 
                jobs: '2,847', 
                avgSalary: '$165k', 
                topSkills: ['React', 'Python', 'AWS'],
                image: '🌉'
              },
              { 
                city: 'London', 
                country: 'UK', 
                jobs: '1,934', 
                avgSalary: '£85k', 
                topSkills: ['JavaScript', 'Node.js', 'Docker'],
                image: '🏰'
              },
              { 
                city: 'Amsterdam', 
                country: 'Netherlands', 
                jobs: '1,245', 
                avgSalary: '€75k', 
                topSkills: ['TypeScript', 'React', 'GraphQL'],
                image: '🌷'
              },
              { 
                city: 'Remote', 
                country: 'Worldwide', 
                jobs: '12,847', 
                avgSalary: '$125k', 
                topSkills: ['Remote', 'Async', 'Global'],
                image: '🌍'
              },
              { 
                city: 'Austin', 
                country: 'USA', 
                jobs: '1,567', 
                avgSalary: '$140k', 
                topSkills: ['Ruby', 'Rails', 'PostgreSQL'],
                image: '🎸'
              },
              { 
                city: 'Berlin', 
                country: 'Germany', 
                jobs: '1,234', 
                avgSalary: '€70k', 
                topSkills: ['Vue.js', 'Kubernetes', 'Go'],
                image: '🍺'
              }
            ].map((destination, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{destination.image}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {destination.city}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{destination.country}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jobs:</span>
                          <span className="font-medium text-foreground">{destination.jobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Salary:</span>
                          <span className="font-medium text-primary">{destination.avgSalary}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {destination.topSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AIConversationLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="bg-accent/20 text-accent-foreground mb-4">
            🤖 AI-Powered Career Guide
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Let's Find Your
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect Role Together
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tell me about yourself and I'll guide you to opportunities that match 
            your skills, interests, and career goals.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* Chat Interface */}
        <Card className="shadow-2xl mb-8">
          <CardContent className="p-0">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {/* AI Message */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="bg-primary/10 rounded-lg p-4 max-w-md">
                    <p className="text-foreground">
                      Hi! I'm your AI career assistant. I'd love to help you find your dream job. 
                      Let's start with the basics - what kind of work are you passionate about?
                    </p>
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex space-x-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-accent/20 rounded-lg p-4 max-w-md">
                    <p className="text-foreground">
                      I'm a frontend developer with 5 years of experience. I love working with React 
                      and I'm interested in moving into a more senior role.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="bg-primary/10 rounded-lg p-4 max-w-md">
                    <p className="text-foreground mb-3">
                      Perfect! Senior React roles are in high demand. I found 847 senior frontend positions 
                      that might interest you. A few quick questions:
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        Remote work preferred
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        $120k+ salary range
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        Startup environment
                      </Button>
                      <Button variant="outline" size="sm" className="mr-2 mb-2">
                        Large tech company
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="bg-primary/10 rounded-lg p-4 max-w-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6">
              <div className="flex space-x-3">
                <Input 
                  placeholder="Tell me more about your preferences..."
                  className="flex-1 h-12"
                />
                <Button size="lg" className="h-12 px-6">
                  Send
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  💼 I want leadership responsibilities
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  🌍 Open to international opportunities
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  📚 Looking for learning opportunities
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">🎯 AI-Matched Jobs</CardTitle>
                <Badge className="bg-primary/20 text-primary">Live</Badge>
              </div>
              <CardDescription>
                Based on our conversation, here are your top matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  company: 'Stripe', 
                  role: 'Senior Frontend Engineer', 
                  match: '98%',
                  salary: '$160k - $220k',
                  highlights: ['React expertise valued', 'Remote-friendly', 'Growth opportunities']
                },
                { 
                  company: 'Figma', 
                  role: 'Lead React Developer', 
                  match: '94%',
                  salary: '$150k - $200k',
                  highlights: ['Technical leadership', 'Design collaboration', 'SF or Remote']
                },
                { 
                  company: 'Notion', 
                  role: 'Senior Full Stack Engineer', 
                  match: '87%',
                  salary: '$140k - $180k',
                  highlights: ['React + Node.js', 'Product focus', 'Fast-growing team']
                }
              ].map((job, i) => (
                <div key={i} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{job.role}</h4>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {job.match} match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                  <p className="text-sm font-medium text-primary mb-3">{job.salary}</p>
                  <div className="space-y-1">
                    {job.highlights.map((highlight, j) => (
                      <div key={j} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-accent rounded-full mr-2"></div>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Career Insights</CardTitle>
              <CardDescription>
                Personalized advice based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <StarIcon className="h-4 w-4 text-primary mr-2" />
                  Skills Assessment
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your React expertise is highly valued. Consider adding these trending skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {['TypeScript', 'Next.js', 'GraphQL'].map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <ChartBarIcon className="h-4 w-4 text-accent mr-2" />
                  Market Trends
                </h4>
                <p className="text-sm text-muted-foreground">
                  Senior React positions have grown 34% this year. Average salary increased 
                  by $18k in your experience range.
                </p>
              </div>

              <div className="bg-secondary/5 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <BoltIcon className="h-4 w-4 text-secondary-foreground mr-2" />
                  Next Steps
                </h4>
                <p className="text-sm text-muted-foreground">
                  Based on your preferences, I recommend focusing on companies with 
                  strong engineering culture and remote flexibility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      );

  const VisualSkillsLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge className="bg-primary/20 text-primary mb-4">
            🎨 Visual Skill Matching
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Show Your Skills,
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Find Your Match
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive skill visualization that connects your expertise with perfect opportunities. 
            Build your profile visually and watch jobs adapt in real-time.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Interactive Skills Builder */}
        <Card className="shadow-2xl mb-12">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Skills Visualization */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Your Skill Profile</h3>
                
                {/* Skill Categories */}
                <div className="space-y-6">
                  {[
                    {
                      category: 'Frontend',
                      color: 'primary',
                      skills: [
                        { name: 'React', level: 90, demand: 'high' },
                        { name: 'TypeScript', level: 75, demand: 'very-high' },
                        { name: 'Vue.js', level: 60, demand: 'medium' },
                        { name: 'CSS/SCSS', level: 85, demand: 'high' }
                      ]
                    },
                    {
                      category: 'Backend',
                      color: 'accent',
                      skills: [
                        { name: 'Node.js', level: 70, demand: 'high' },
                        { name: 'Python', level: 55, demand: 'very-high' },
                        { name: 'PostgreSQL', level: 65, demand: 'medium' },
                        { name: 'GraphQL', level: 40, demand: 'high' }
                      ]
                    },
                    {
                      category: 'Tools & Cloud',
                      color: 'secondary',
                      skills: [
                        { name: 'AWS', level: 50, demand: 'very-high' },
                        { name: 'Docker', level: 60, demand: 'high' },
                        { name: 'Git', level: 95, demand: 'high' },
                        { name: 'Figma', level: 70, demand: 'medium' }
                      ]
                    }
                  ].map((category, i) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center">
                        <div className={`w-3 h-3 bg-${category.color} rounded-full mr-3`}></div>
                        {category.category}
                      </h4>
                      <div className="space-y-2">
                        {category.skills.map((skill, j) => (
                          <div key={j} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={skill.demand === 'very-high' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {skill.demand === 'very-high' ? '🔥 Hot' : 
                                   skill.demand === 'high' ? '📈 High' : '📊 Med'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{skill.level}%</span>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-${category.color} rounded-full transition-all duration-1000 group-hover:opacity-80`}
                                  style={{ width: `${skill.level}%` }}
                                />
                              </div>
                              {skill.demand === 'very-high' && (
                                <div className="absolute -top-1 right-0 w-2 h-4 bg-orange-500 rounded-full animate-pulse opacity-60" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Skills */}
                <div className="mt-8 p-4 bg-card/50 rounded-lg border border-dashed border-border">
                  <div className="flex items-center space-x-3">
                    <Input placeholder="Add a skill (e.g., Next.js, Machine Learning)" className="flex-1" />
                    <Button size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Next.js', 'Machine Learning', 'Kubernetes', 'Rust', 'Blockchain'].map(skill => (
                      <Button key={skill} variant="ghost" size="sm" className="text-xs">
                        + {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Job Matches */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground">Perfect Matches</h3>
                  <Badge className="bg-accent/20 text-accent-foreground">
                    🎯 847 jobs found
                  </Badge>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      company: 'Stripe',
                      role: 'Senior Frontend Engineer',
                      match: 94,
                      salary: '$160k - $220k',
                      matchedSkills: ['React', 'TypeScript', 'CSS/SCSS'],
                      growthSkills: ['Node.js', 'AWS'],
                      logo: '💳'
                    },
                    {
                      company: 'Vercel',
                      role: 'Full Stack Developer',
                      match: 89,
                      salary: '$140k - $180k',
                      matchedSkills: ['React', 'Node.js', 'TypeScript'],
                      growthSkills: ['Next.js', 'GraphQL'],
                      logo: '▲'
                    },
                    {
                      company: 'Linear',
                      role: 'Product Engineer',
                      match: 86,
                      salary: '$130k - $170k',
                      matchedSkills: ['React', 'TypeScript', 'Figma'],
                      growthSkills: ['Python', 'PostgreSQL'],
                      logo: '📐'
                    }
                  ].map((job, i) => (
                    <Card key={i} className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{job.logo}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {job.role}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-primary">{job.match}% match</div>
                                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-1000"
                                      style={{ width: `${job.match}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                            <p className="text-sm font-medium text-primary mb-4">{job.salary}</p>
                            
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-foreground mb-1">✅ Your matching skills:</p>
                                <div className="flex flex-wrap gap-1">
                                  {job.matchedSkills.map(skill => (
                                    <Badge key={skill} className="text-xs bg-primary/20 text-primary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-xs font-medium text-foreground mb-1">📈 Skills you could grow:</p>
                                <div className="flex flex-wrap gap-1">
                                  {job.growthSkills.map(skill => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button size="lg" className="w-full">
                    View All 847 Matches
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ChartBarIcon className="h-5 w-5 text-primary mr-2" />
                Market Demand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { skill: 'TypeScript', demand: 95, trend: '+23%' },
                  { skill: 'React', demand: 88, trend: '+15%' },
                  { skill: 'AWS', demand: 92, trend: '+31%' },
                  { skill: 'Python', demand: 90, trend: '+18%' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.demand}%` }}
                        />
                      </div>
                      <span className="text-xs text-accent font-medium">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BoltIcon className="h-5 w-5 text-accent mr-2" />
                Skill Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your target roles, consider learning:
              </p>
              <div className="space-y-2">
                {['Next.js', 'GraphQL', 'Kubernetes', 'Machine Learning'].map(skill => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-accent/5 rounded-lg">
                    <span className="text-sm font-medium text-foreground">{skill}</span>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Learn
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <StarIcon className="h-5 w-5 text-secondary-foreground mr-2" />
                Salary Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">$165k</div>
                  <div className="text-sm text-muted-foreground">Your market value</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+ AWS certification</span>
                    <span className="text-primary font-medium">+$18k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+ ML experience</span>
                    <span className="text-primary font-medium">+$25k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+ Leadership role</span>
                    <span className="text-primary font-medium">+$35k</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      );

  const SocialProofLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Success Stats */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-accent/20 text-accent-foreground mb-4">
              ⭐ Join 50,000+ Success Stories
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
              Real People,
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Real Success
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              See how professionals like you found their dream jobs. From career changers 
              to senior developers, everyone has a story worth celebrating.
            </p>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { metric: '50,247', label: 'Jobs Found', icon: '🎯' },
              { metric: '4.9★', label: 'User Rating', icon: '⭐' },
              { metric: '73%', label: 'Salary Increase', icon: '📈' },
              { metric: '18 days', label: 'Avg Time to Hire', icon: '⚡' }
            ].map((stat, i) => (
              <div key={i} className="text-center bg-card/50 backdrop-blur rounded-lg p-4 border border-border/50">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground">{stat.metric}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Featured Success Stories */}
        <Card className="shadow-2xl mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              🌟 This Week's Success Stories
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  name: 'Sarah Chen',
                  role: 'Senior React Developer',
                  company: 'Stripe',
                  salary: '$180k',
                  increase: '+$45k',
                  story: "I was stuck in a junior role for 3 years. UpDrift's AI matching showed me I was ready for senior positions. Within 2 weeks, I had 5 interviews and landed my dream job at Stripe!",
                  avatar: '👩‍💻',
                  skills: ['React', 'TypeScript', 'Node.js'],
                  timeToHire: '12 days'
                },
                {
                  name: 'Marcus Rodriguez',
                  role: 'Product Manager',
                  company: 'Notion',
                  salary: '$165k',
                  increase: '+$35k',
                  story: "Switching from engineering to PM seemed impossible. The platform connected me with companies looking for technical PMs. Notion was perfect - they valued my engineering background!",
                  avatar: '👨‍💼',
                  skills: ['Product Strategy', 'SQL', 'Figma'],
                  timeToHire: '16 days'
                },
                {
                  name: 'Priya Patel',
                  role: 'Machine Learning Engineer',
                  company: 'OpenAI',
                  salary: '$220k',
                  increase: '+$60k',
                  story: "I was a data analyst wanting to move into ML. The skill-based matching highlighted my Python and stats background. OpenAI saw my potential and offered amazing growth opportunities!",
                  avatar: '👩‍🔬',
                  skills: ['Python', 'TensorFlow', 'Statistics'],
                  timeToHire: '21 days'
                },
                {
                  name: 'David Kim',
                  role: 'Senior Full Stack',
                  company: 'Vercel',
                  salary: '$170k',
                  increase: '+$40k',
                  story: "Remote work was non-negotiable for me. The location filters helped me find truly remote-first companies. Vercel's culture is amazing and I'm 100% remote with global teammates!",
                  avatar: '👨‍💻',
                  skills: ['Next.js', 'PostgreSQL', 'AWS'],
                  timeToHire: '9 days'
                }
              ].map((story, i) => (
                <Card key={i} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="text-4xl">{story.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{story.name}</h3>
                        <p className="text-sm text-muted-foreground">{story.role} at {story.company}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-primary/20 text-primary text-xs">
                            {story.salary}
                          </Badge>
                          <Badge className="bg-accent/20 text-accent text-xs">
                            {story.increase}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{story.timeToHire}</div>
                        <div className="text-xs text-muted-foreground">to hire</div>
                      </div>
                    </div>
                    
                    <blockquote className="text-sm text-foreground italic mb-4 border-l-2 border-primary pl-4">
                      "{story.story}"
                    </blockquote>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {story.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Section Inspired by Success */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Your Success Story Starts Here
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who found better opportunities, higher salaries, 
                and fulfilling careers through our platform.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="What's your dream role?"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Preferred location"
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>
              
              <Button size="lg" className="w-full h-12 mb-4">
                Find My Success Story
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                ✨ Free to join • 🚀 Start in 30 seconds • 💼 No spam, just opportunities
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserGroupIcon className="h-5 w-5 text-primary mr-2" />
                Success by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: 'Software Engineer', count: '12,847', rate: '94%' },
                  { role: 'Product Manager', count: '4,293', rate: '91%' },
                  { role: 'Designer', count: '3,184', rate: '89%' },
                  { role: 'Data Scientist', count: '2,847', rate: '92%' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.role}</div>
                      <div className="text-xs text-muted-foreground">{item.count} placements</div>
                    </div>
                    <Badge className="bg-primary/20 text-primary">
                      {item.rate} success
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ChartBarIcon className="h-5 w-5 text-accent mr-2" />
                Average Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">+43%</div>
                  <div className="text-sm text-muted-foreground">Salary increase</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">16 days</div>
                  <div className="text-sm text-muted-foreground">Average time to offer</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-foreground">4.2</div>
                  <div className="text-sm text-muted-foreground">Interviews per placement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BoltIcon className="h-5 w-5 text-secondary-foreground mr-2" />
                Why It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { feature: 'AI-powered matching', impact: 'Better fit rates' },
                  { feature: 'Direct company connections', impact: 'Skip the black hole' },
                  { feature: 'Salary transparency', impact: 'Negotiate with confidence' },
                  { feature: 'Success coaching', impact: 'Interview preparation' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-sm font-medium text-foreground">✅ {item.feature}</div>
                    <div className="text-xs text-muted-foreground ml-4">{item.impact}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      );

  const CompanyExplorerLayout = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge className="bg-primary/20 text-primary mb-4">
            🏢 Discover Great Companies
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Find Your Ideal
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Company Culture
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore companies first, then discover roles. Learn about culture, values, 
            and growth opportunities before you even apply.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Company Search & Filters */}
        <Card className="shadow-2xl mb-12">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Search Section */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  What kind of company culture do you want?
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Search companies by name, industry, or values..."
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Industry (e.g., FinTech, SaaS)"
                        className="pl-10 h-12"
                      />
                    </div>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Location or Remote"
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Culture Filters */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">What matters most to you?</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { label: 'Remote-first', icon: '🌍' },
                      { label: 'Work-life balance', icon: '⚖️' },
                      { label: 'Fast growth', icon: '🚀' },
                      { label: 'Learning culture', icon: '📚' },
                      { label: 'Diverse team', icon: '🤝' },
                      { label: 'Social impact', icon: '💚' },
                      { label: 'Innovative tech', icon: '⚡' },
                      { label: 'Flexible hours', icon: '🕒' },
                      { label: 'Startup energy', icon: '💡' }
                    ].map(filter => (
                      <Button key={filter.label} variant="outline" size="sm" className="justify-start">
                        <span className="mr-2">{filter.icon}</span>
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Company Insights</h4>
                <div className="space-y-3">
                  {[
                    { metric: '2,847', label: 'Tech companies', trend: '+12%' },
                    { metric: '89%', label: 'Remote-friendly', trend: '+23%' },
                    { metric: '4.2★', label: 'Avg culture rating', trend: '+0.3' },
                    { metric: '$165k', label: 'Median salary', trend: '+15%' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div>
                        <div className="font-bold text-foreground">{stat.metric}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                      <Badge className="bg-accent/20 text-accent text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Companies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">🌟 Featured Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Stripe',
                industry: 'FinTech',
                size: '4,000+',
                rating: 4.6,
                logo: '💳',
                culture: ['Remote-first', 'Learning culture', 'Diverse team'],
                description: 'Building economic infrastructure for the internet with a focus on developer experience.',
                openRoles: 47,
                avgSalary: '$185k',
                benefits: ['$20k learning budget', 'Unlimited PTO', 'Equity for all']
              },
              {
                name: 'Notion',
                industry: 'Productivity',
                size: '500+',
                rating: 4.8,
                logo: '📝',
                culture: ['Work-life balance', 'Innovative tech', 'Flexible hours'],
                description: 'Reimagining productivity tools with a passionate, design-focused team.',
                openRoles: 23,
                avgSalary: '$170k',
                benefits: ['4-day work week', 'Home office stipend', 'Wellness budget']
              },
              {
                name: 'Vercel',
                industry: 'Developer Tools',
                size: '300+',
                rating: 4.7,
                logo: '▲',
                culture: ['Remote-first', 'Fast growth', 'Startup energy'],
                description: 'Enabling developers to build better web experiences with cutting-edge technology.',
                openRoles: 31,
                avgSalary: '$165k',
                benefits: ['Stock options', 'Conference budget', 'Latest hardware']
              },
              {
                name: 'Linear',
                industry: 'Project Management',
                size: '50+',
                rating: 4.9,
                logo: '📐',
                culture: ['Design-focused', 'Small team', 'Quality over quantity'],
                description: 'Building the best issue tracking tool with obsessive attention to detail.',
                openRoles: 8,
                avgSalary: '$155k',
                benefits: ['Equity upside', 'Flexible schedule', 'Health & dental']
              },
              {
                name: 'Supabase',
                industry: 'Database/Backend',
                size: '100+',
                rating: 4.5,
                logo: '🔋',
                culture: ['Open source', 'Remote-first', 'Community driven'],
                description: 'Open source Firebase alternative with a strong developer community.',
                openRoles: 19,
                avgSalary: '$160k',
                benefits: ['Open source time', 'Global team', 'Growth equity']
              },
              {
                name: 'Replicate',
                industry: 'AI/ML',
                size: '30+',
                rating: 4.8,
                logo: '🤖',
                culture: ['AI-first', 'Research focus', 'Cutting edge'],
                description: 'Making machine learning accessible to every developer.',
                openRoles: 12,
                avgSalary: '$190k',
                benefits: ['GPU credits', 'Research time', 'AI conferences']
              }
            ].map((company, i) => (
              <Card key={i} className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{company.logo}</div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{company.industry} • {company.size}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-accent fill-current" />
                        <span className="text-sm font-medium text-foreground">{company.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{company.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Culture highlights:</p>
                      <div className="flex flex-wrap gap-1">
                        {company.culture.map(trait => (
                          <Badge key={trait} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Open roles:</span>
                      <span className="font-medium text-primary">{company.openRoles}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Avg salary:</span>
                      <span className="font-medium text-accent">{company.avgSalary}</span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Benefits:</p>
                      <div className="text-xs text-muted-foreground">
                        {company.benefits.join(' • ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Company
                    </Button>
                    <Button size="sm" className="flex-1">
                      See Jobs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <RocketLaunchIcon className="h-5 w-5 text-primary mr-2" />
                High-Growth Startups
              </CardTitle>
              <CardDescription>
                Join the next unicorn and grow with the company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'AI/ML Platform', stage: 'Series B', growth: '+340%' },
                  { name: 'Developer Tools', stage: 'Series A', growth: '+280%' },
                  { name: 'FinTech Startup', stage: 'Seed', growth: '+450%' }
                ].map((startup, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">{startup.name}</div>
                      <div className="text-xs text-muted-foreground">{startup.stage}</div>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-xs">
                      {startup.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-accent mr-2" />
                Enterprise Leaders
              </CardTitle>
              <CardDescription>
                Stable, established companies with great benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Google', benefits: 'Top-tier comp', rating: '4.4★' },
                  { name: 'Microsoft', benefits: 'Work-life balance', rating: '4.5★' },
                  { name: 'Apple', benefits: 'Product impact', rating: '4.3★' }
                ].map((company, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-accent/5 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.benefits}</div>
                    </div>
                    <div className="text-xs text-accent">{company.rating}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GlobeAltIcon className="h-5 w-5 text-secondary-foreground mr-2" />
                Remote-First Companies
              </CardTitle>
              <CardDescription>
                Companies built for distributed teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'GitLab', model: '100% remote', since: '2011' },
                  { name: 'Automattic', model: 'Distributed', since: '2005' },
                  { name: 'Buffer', model: 'Remote-first', since: '2010' }
                ].map((company, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.model}</div>
                    </div>
                    <div className="text-xs text-secondary-foreground">Since {company.since}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const CosmicRiverLayout = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Starfield Background - behind river and hero content */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Starfield />
      </div>
      
      {/* Hero Section */}
      <section className="hero-section relative pt-24 pb-20 overflow-hidden z-10">
        {/* River of Smoke Animation - behind the hero content */}
        <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-0">
          <DynamicWaves />
        </div>
        {/* Foreground River Particles */}
        <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10">
          <RiverParticles />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                  Smart Job Matching
                </Badge>
                <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Happy with your
                  <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    current position?
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  UpDrift finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
                </p>
              </div>
              
              {/* Flowing Search Form */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                          <Input 
                            placeholder="Job title or keywords"
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/50"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                          <Input 
                            placeholder="City, state, or remote"
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-accent/50"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-lg"
                      disabled
                    >
                      Search Jobs
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Flowing Tags */}
              <div className="flex flex-wrap gap-3">
                {['Remote Work', 'Tech Companies', 'High Growth', 'Well Funded'].map((tag, index) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 transform hover:scale-110 transition-all px-4 py-2 border-primary/30 hover:border-primary/50"
                    style={{
                      animation: `float ${2 + index * 0.5}s ease-in-out infinite`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Right: Flowing Job Cards */}
            <div className="relative">
              <div className="space-y-6">
                {[
                  { company: 'Stripe', role: 'Senior Frontend Engineer', salary: '$160k - $220k', logo: '💳' },
                  { company: 'Anthropic', role: 'Product Manager - AI', salary: '$180k - $250k', logo: '🤖' },
                  { company: 'Docker', role: 'DevOps Engineer', salary: '$130k - $170k', logo: '🐳' },
                  { company: 'Figma', role: 'UX Designer', salary: '$120k - $160k', logo: '🎨' }
                ].map((job, index) => (
                  <div
                    key={index}
                    className={`hero-job-card-float-${index} transition-all duration-500 hover:scale-105`}
                  >
                    <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">
                            {job.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{job.role}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <p className="text-sm font-medium text-primary">{job.salary}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100"
                            disabled
                          >
                            View →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderCurrentLayout = () => {
    switch (activeLayout) {
      case 'hero-cards': return <HeroCardsLayout />;
      case 'geometric-modern': return <GeometricModernLayout />;
      case 'glass-morphism': return <GlassMorphismLayout />;
      case 'neon-cyber': return <NeonCyberLayout />;
      case 'particle-flow': return <ParticleFlowLayout />;
      case 'gradient-waves': return <GradientWavesLayout />;
      case 'holographic': return <HolographicLayout />;
      case 'mono-tech': return <MonoTechLayout />;
      case 'serif-editorial': return <SerifEditorialLayout />;
      case 'display-bold': return <DisplayBoldLayout />;
      case 'script-human': return <ScriptHumanLayout />;
      case 'condensed-modern': return <CondensedModernLayout />;
      case 'wide-luxury': return <WideLuxuryLayout />;
      case 'map-discovery': return <MapDiscoveryLayout />;
      case 'ai-conversation': return <AIConversationLayout />;
      case 'skills-visual': return <VisualSkillsLayout />;
      case 'social-proof': return <SocialProofLayout />;
      case 'company-first': return <CompanyExplorerLayout />;
      case 'cosmic-river': return <CosmicRiverLayout />;
      default: return <HeroCardsLayout />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Control Panel */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">🎨 Home Page Experiments</h1>
              <p className="text-muted-foreground">
                Explore dramatically different approaches to the home page
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {currentTheme.emoji} {currentTheme.displayName}
              </Badge>
              <select 
                value={currentTheme.name}
                onChange={(e) => setTheme(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="cyber">🌃 Cyberpunk</option>
                <option value="goldenhour">🌇 Golden Hour</option>
                <option value="goldenhour-twilight">🌆 Golden Hour Twilight</option>
                <option value="coastal">🏖️ Coastal</option>
                <option value="coastal-deep">🌊 Coastal Deep</option>
                <option value="summit">🏔️ Summit</option>
                <option value="nomad">☕ Nomad</option>
                <option value="nomad-forest">🌲 Nomad Forest</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {layouts.map(layout => (
              <Button
                key={layout.id}
                variant={activeLayout === layout.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLayout(layout.id)}
                className="text-sm"
              >
                {layout.emoji} {layout.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Preview */}
      <Card className="overflow-hidden border-2 border-dashed border-border my-8">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 bg-muted/20">
            <h3 className="text-lg font-semibold text-foreground">Home Page Preview</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">Experimental</Badge>
              <Badge variant="secondary" className="text-xs">Preview</Badge>
            </div>
          </div>
          <div className="relative bg-background h-[32rem] overflow-y-auto overflow-x-hidden">
            <div className="transform scale-75 origin-top-left w-[133.33%]">
              {renderCurrentLayout()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Description */}
      <div className="border-t border-border bg-card/50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {layouts.find(l => l.id === activeLayout)?.name}
          </h3>
          <p className="text-muted-foreground mb-4">
            {layouts.find(l => l.id === activeLayout)?.description}
          </p>
          <p className="text-sm text-muted-foreground">
            Try switching themes above to see how each layout adapts to different color schemes and moods.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomeExperimentsPage() {
  return (
    <ThemeProvider>
      <HomeExperiments />
    </ThemeProvider>
  );
}