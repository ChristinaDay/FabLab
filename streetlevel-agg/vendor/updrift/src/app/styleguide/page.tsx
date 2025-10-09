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

// Dynamic Wave Component
function DynamicWaves() {
  const [time, setTime] = useState(0)
  
  useEffect(() => {
    let animationId: number
    const animate = () => {
      setTime(prev => prev + 0.02)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => { if (animationId) cancelAnimationFrame(animationId) }
  }, [])

  // Generate a wave path for a given y offset (top or bottom)
  const generateWavePoints = (
    amplitude: number,
    frequency: number,
    offset: number,
    phase: number,
    yBase: number,
    invert: boolean = false
  ) => {
    const points = []
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    for (let x = 0; x <= width; x += width / 200) {
      const normalizedX = x / width
      const y = yBase + amplitude * Math.sin(frequency * normalizedX * Math.PI * 2 + time * phase + offset)
      points.push([x, invert ? yBase * 2 - y : y])
    }
    return points
  }

  // Main wave parameters (less tall)
  const topAmplitude = 10
  const topFrequency = 1.2
  const topOffset = 0
  const topPhase = 1
  const topY = 62

  const bottomAmplitude = 7
  const bottomFrequency = 1.7
  const bottomOffset = 1.5
  const bottomPhase = 1.3
  const bottomY = 138

  // Generate points for top and bottom waves
  const topPoints = generateWavePoints(topAmplitude, topFrequency, topOffset, topPhase, topY)
  const bottomPoints = generateWavePoints(bottomAmplitude, bottomFrequency, bottomOffset, bottomPhase, bottomY)

  // Build the path: top wave → right edge → bottom wave (reversed) → left edge
  const path = [
    `M ${topPoints[0][0]},${topPoints[0][1]}`,
    ...topPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bottomPoints[bottomPoints.length - 1][0]},${bottomPoints[bottomPoints.length - 1][1]}`,
    ...bottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  // Background wave parameters (more compact)
  const bgTopAmplitude = 18
  const bgTopFrequency = 0.9
  const bgTopOffset = 0.7
  const bgTopPhase = 0.7
  const bgTopY = 92

  const bgBottomAmplitude = 12
  const bgBottomFrequency = 1.1
  const bgBottomOffset = 2.2
  const bgBottomPhase = 1.1
  const bgBottomY = 148

  const bgTopPoints = generateWavePoints(bgTopAmplitude, bgTopFrequency, bgTopOffset, bgTopPhase, bgTopY)
  const bgBottomPoints = generateWavePoints(bgBottomAmplitude, bgBottomFrequency, bgBottomOffset, bgBottomPhase, bgBottomY)

  const bgPath = [
    `M ${bgTopPoints[0][0]},${bgTopPoints[0][1]}`,
    ...bgTopPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bgBottomPoints[bgBottomPoints.length - 1][0]},${bgBottomPoints[bgBottomPoints.length - 1][1]}`,
    ...bgBottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  // Third, most transparent background wave parameters
  const bg2TopAmplitude = 22
  const bg2TopFrequency = 0.7
  const bg2TopOffset = 1.2
  const bg2TopPhase = 0.5
  const bg2TopY = 102

  const bg2BottomAmplitude = 14
  const bg2BottomFrequency = 0.8
  const bg2BottomOffset = 2.8
  const bg2BottomPhase = 0.8
  const bg2BottomY = 130

  const bg2TopPoints = generateWavePoints(bg2TopAmplitude, bg2TopFrequency, bg2TopOffset, bg2TopPhase, bg2TopY)
  const bg2BottomPoints = generateWavePoints(bg2BottomAmplitude, bg2BottomFrequency, bg2BottomOffset, bg2BottomPhase, bg2BottomY)

  const bgPath2 = [
    `M ${bg2TopPoints[0][0]},${bg2TopPoints[0][1]}`,
    ...bg2TopPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bg2BottomPoints[bg2BottomPoints.length - 1][0]},${bg2BottomPoints[bg2BottomPoints.length - 1][1]}`,
    ...bg2BottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  return (
    <svg
      className="w-full h-[180px]"
      width="100%"
      height="180"
      viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1200} 180`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="liquid-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8e1ff" stopOpacity={0.21} />
          <stop offset="25%" stopColor="#7c3aed" stopOpacity={0.24} />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.26} />
          <stop offset="75%" stopColor="#06b6d4" stopOpacity={0.23} />
          <stop offset="100%" stopColor="#818cf8" stopOpacity={0.31} />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.12} />
          <stop offset="33%" stopColor="#22d3ee" stopOpacity={0.14} />
          <stop offset="66%" stopColor="#f472b6" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.20} />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0abfc" stopOpacity={0.056} />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.077} />
          <stop offset="100%" stopColor="#f9a8d4" stopOpacity={0.098} />
        </linearGradient>
      </defs>
      {/* Third, most transparent background wave for extra depth */}
      <path d={bgPath2} fill="url(#liquid-gradient-bg2)" />
      {/* Background wave for depth */}
      <path d={bgPath} fill="url(#liquid-gradient-bg)" />
      {/* Main dynamic wave */}
      <path d={path} fill="url(#liquid-gradient)" />
    </svg>
  )
}

// Starfield Component
function Starfield({ width = 1920, height = 400, numLayers = 3, starsPerLayer = [40, 30, 20] }) {
  const layers = Array.from({ length: numLayers })
  const colors = [
    'rgba(255,255,255,0.7)',
    'rgba(180,200,255,0.5)',
    'rgba(140,160,255,0.3)'
  ]
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {layers.map((_, layerIdx) => (
        <svg
          key={layerIdx}
          className={`absolute inset-0 w-full h-full animate-starfield-parallax parallax-layer-${layerIdx}`}
          width={width}
          height={height}
          style={{
            zIndex: layerIdx,
            opacity: 0.7 - layerIdx * 0.2,
            filter: 'blur(' + layerIdx * 0.5 + 'px)'
          }}
        >
          {Array.from({ length: starsPerLayer[layerIdx] }).map((_, i) => {
            const x = Math.random() * width
            const y = Math.random() * height
            const r = 0.7 + Math.random() * (1.2 - 0.7)
            const twinkleDur = 2.5 + Math.random() * 2.5
            const twinkleDelay = Math.random() * 3
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill={colors[layerIdx % colors.length]}
                style={{
                  opacity: 0.7,
                  transformOrigin: `${x}px ${y}px`,
                  animation: `starTwinkle ${twinkleDur}s ease-in-out ${twinkleDelay}s infinite`
                }}
              />
            )
          })}
        </svg>
      ))}
      <style jsx>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          25% { opacity: 0.7; transform: scale(1.1); }
          50% { opacity: 1; transform: scale(1.2); }
          75% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-starfield-parallax.parallax-layer-0 { animation: parallax0 60s linear infinite; }
        .animate-starfield-parallax.parallax-layer-1 { animation: parallax1 90s linear infinite; }
        .animate-starfield-parallax.parallax-layer-2 { animation: parallax2 120s linear infinite; }
        @keyframes parallax0 { 0% { transform: translateX(0); } 100% { transform: translateX(-100px); } }
        @keyframes parallax1 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        @keyframes parallax2 { 0% { transform: translateX(0); } 100% { transform: translateX(-300px); } }
      `}</style>
    </div>
  )
}

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// RiverParticles Component
function RiverParticles({ width = 1920, height = 180, numParticles = 35, numStreams = 4 }) {
  // All particles: sharp, twinkling stars (within river)
  const starParticles = Array.from({ length: numParticles }).map((_, i) => {
    const progress = Math.random();
    const baseSpeed = rand(6, 10) * 0.6; // 40% faster
    const speed = baseSpeed * rand(1.3, 1.5);
    const riverDepth = Math.random() * 0.1;
    const size = rand(1.2, 2.6);
    const color = [
      'white',
      '#a5b4fc',
      '#7c3aed',
      '#6366f1',
      '#bae6fd',
      '#f0abfc'
    ][Math.floor(Math.random() * 6)];
    return {
      id: `river-star-${i}`,
      x: -0.15 + progress * 1.3,
      y: 0.45 + riverDepth,
      size,
      color,
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  // Streaming lines within the river area
  const streams = Array.from({ length: numStreams }).map((_, i) => {
    // Fully random positions and delays for organic, sparse effect
    const y = 0.495 + Math.random() * 0.01; // extremely tight vertical spread
    const baseSpeed = rand(2, 4) * 0.6; // 40% faster
    const speed = baseSpeed * rand(1.3, 1.5);
    const width = rand(12, 32); // much longer, still thin
    const blur = rand(0.05, 0.2); // even less blur, max 0.2px
    const progress = Math.random();
    // Reduce opacity by 20%
    const baseOpacity = rand(0.09, 0.16);
    const opacity = baseOpacity * 0.8;
    return {
      id: `stream-line-${i}`,
      x: -0.15, // spawn much further left
      y,
      width,
      color: 'linear-gradient(90deg, white 0%, #f0abfc 18%, #a5b4fc 36%, #7c3aed 54%, #06b6d4 72%, #22d3ee 90%, transparent 100%)',
      opacity, // 20% more transparent
      blur,
      speed,
      delay: -progress * speed
    }
  });
  // Above river moving particles (20% slower, much higher)
  const aboveParticles = Array.from({ length: 10 }).map((_, i) => {
    const baseSpeed = rand(6, 10) * 0.6 * 1.2; // 20% slower
    const speed = baseSpeed * rand(1.3, 1.5);
    // Place 40-45px above the river band (river band is at 45-55% of 180px = 81-99px)
    // So above: 40-45px above 81px = 36-41px (20-23% of 180px)
    // We'll use 18-25% for a nice spread
    const y = 0.18 + Math.random() * 0.07; // 18-25%
    const progress = Math.random();
    return {
      id: `river-star-above-${i}`,
      x: -0.15 + progress * 1.3,
      y,
      size: 0.8 + Math.random() * 2.2,
      color: 'white',
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  // Below river moving particles (20% slower, much lower)
  const belowParticles = Array.from({ length: 10 }).map((_, i) => {
    const baseSpeed = rand(6, 10) * 0.6 * 1.2; // 20% slower
    const speed = baseSpeed * rand(1.3, 1.5);
    // Place 40-45px below the river band (river band is at 45-55% of 180px = 81-99px)
    // So below: 40-45px below 99px = 139-144px (77-80% of 180px)
    // We'll use 75-82% for a nice spread
    const y = 0.75 + Math.random() * 0.07; // 75-82%
    const progress = Math.random();
    return {
      id: `river-star-below-${i}`,
      x: -0.15 + progress * 1.3,
      y,
      size: 0.8 + Math.random() * 2.2,
      color: 'white',
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  return (
    <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10">
      {/* Twinkling star particles (river) */}
      {starParticles.map(p => (
        <svg
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: p.size,
            height: p.size,
            pointerEvents: 'none',
            zIndex: 2,
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
          }}
        >
          <circle
            cx={p.size / 2}
            cy={p.size / 2}
            r={p.size / 2}
            fill={p.color}
            style={{
              opacity: 0.85,
              filter: 'drop-shadow(0 0 2px white)',
              animation: `starTwinkle ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
            }}
          />
        </svg>
      ))}
      {/* Above river moving particles */}
      {aboveParticles.map(p => (
        <svg
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: p.size,
            height: p.size,
            pointerEvents: 'none',
            zIndex: 2,
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
          }}
        >
          <circle
            cx={p.size / 2}
            cy={p.size / 2}
            r={p.size / 2}
            fill={p.color}
            style={{
              opacity: 0.85,
              filter: 'drop-shadow(0 0 2px white)',
              animation: `starTwinkle ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
            }}
          />
        </svg>
      ))}
      {/* Below river moving particles */}
      {belowParticles.map(p => (
        <svg
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: p.size,
            height: p.size,
            pointerEvents: 'none',
            zIndex: 2,
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
          }}
        >
          <circle
            cx={p.size / 2}
            cy={p.size / 2}
            r={p.size / 2}
            fill={p.color}
            style={{
              opacity: 0.85,
              filter: 'drop-shadow(0 0 2px white)',
              animation: `starTwinkle ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
            }}
          />
        </svg>
      ))}
      {/* Streaming lines */}
      {streams.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            width: s.width,
            height: 1,
            background: s.color,
            borderRadius: 1,
            opacity: s.opacity,
            filter: `blur(${s.blur}px)`,
            animation: `streamFlow ${s.speed}s linear ${s.delay}s infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes riverFlow {
          0% { transform: translateX(-20px); opacity: 0; }
          8% { opacity: 0.9; }
          15% { transform: translateX(15vw); }
          35% { transform: translateX(35vw); }
          55% { transform: translateX(55vw); }
          75% { transform: translateX(75vw); }
          92% { opacity: 0.9; }
          100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
        }
        @keyframes streamFlow {
          0% { transform: translateX(-30px) scaleX(0.3); opacity: 0; }
          12% { opacity: 0.7; transform: translateX(5vw) scaleX(1); }
          25% { transform: translateX(25vw) scaleX(1.1); }
          50% { transform: translateX(50vw) scaleX(1); }
          75% { transform: translateX(75vw) scaleX(1.1); }
          88% { opacity: 0.7; transform: translateX(95vw) scaleX(1); }
          100% { transform: translateX(calc(100vw + 30px)) scaleX(0.3); opacity: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          25% { opacity: 1; transform: scale(1.2); }
          50% { opacity: 0.5; transform: scale(0.9); }
          75% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// Cosmic River Layout Component
function CosmicRiverLayout() {
  return (
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
                  UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
}

// --- START: Experimental Home Layouts Section (fully self-contained) ---

// RiverHeroLayout
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// GeometricModernLayout
const GeometricModernLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// GlassMorphismLayout
const GlassMorphismLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// NeonCyberLayout
const NeonCyberLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// ParticleFlowLayout
const ParticleFlowLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// GradientWavesLayout
const GradientWavesLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// HolographicLayout
const HolographicLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// MonoTechLayout
const MonoTechLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// SerifEditorialLayout
const SerifEditorialLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// DisplayBoldLayout
const DisplayBoldLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// ScriptHumanLayout
const ScriptHumanLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// CondensedModernLayout
const CondensedModernLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// WideLuxuryLayout
const WideLuxuryLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// MapDiscoveryLayout
const MapDiscoveryLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// AIConversationLayout
const AIConversationLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// VisualSkillsLayout
const VisualSkillsLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// SocialProofLayout
const SocialProofLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// CompanyExplorerLayout
const CompanyExplorerLayout = () => (
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
              UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
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
  </div>
);

// HomeExperiments function
function HomeExperiments() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
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
      <div className="relative">
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
            UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
          </p>
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
    </div>
  );
}

// --- END: Experimental Home Layouts Section ---

export default function StyleGuidePage() {
  const [showThemePreview, setShowThemePreview] = useState(true)
  const [showLivePreview, setShowLivePreview] = useState(true)
  const [currentTheme, setCurrentTheme] = useState<string>('dawn')

  // Track current theme from localStorage and HTML class changes
  useEffect(() => {
    const getCurrentTheme = () => {
      const savedTheme = localStorage.getItem('updrift-theme') || 'dawn'
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
            UpDrift Design System
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            A comprehensive collection of themes, components, and design tokens for the UpDrift platform.
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
                               <h1 className="text-2xl font-bold gradient-text">UpDrift</h1>
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
                               Why UpDrift Beats LinkedIn
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
              <h1 className="text-4xl font-bold">Typography Example</h1>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}