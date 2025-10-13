import { useEffect, useRef, useState } from 'react'

type Props = {
  embedHtml?: string | null
  thumbnail?: string | null
  title: string
  className?: string
  lazy?: boolean
  maxHeight?: number
  collapsible?: boolean
  wrapperClassName?: string
}

export default function EmbedOrImage({ embedHtml, thumbnail, title, className = '', lazy = true, maxHeight, collapsible, wrapperClassName = '' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(!lazy)
  const [expanded, setExpanded] = useState(false)

  // Lazy render when in viewport
  useEffect(() => {
    if (!lazy) return
    const el = rootRef.current
    if (!el || isInView) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
          break
        }
      }
    }, { rootMargin: '200px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [lazy, isInView])

  useEffect(() => {
    if (embedHtml && isInView && containerRef.current) {
      // Load Instagram embed script if needed
      if (embedHtml.includes('instagram-media') && !(window as any).instgrm) {
        const script = document.createElement('script')
        script.src = '//www.instagram.com/embed.js'
        script.async = true
        document.body.appendChild(script)
      }
      // Load Facebook embed script if needed
      if (embedHtml.includes('fb-post') && !(window as any).FB) {
        const script = document.createElement('script')
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v12.0'
        script.async = true
        document.body.appendChild(script)
      }

      // Trigger Instagram embed processing
      setTimeout(() => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process()
        }
      }, 100)
    }
  }, [embedHtml, isInView])

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const constrained = maxHeight && !expanded
    return (
      <div ref={rootRef} className={wrapperClassName} style={{ position: 'relative' }}>
        <div style={constrained ? { maxHeight, overflow: 'hidden' } : undefined}>
          {children}
        </div>
        {constrained && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, rgba(255,255,255,0), var(--background))' }} />
        )}
        {collapsible && maxHeight && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-sm underline mt-2">
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    )
  }

  // If we have embed HTML, use it
  if (embedHtml && isInView) {
    return (
      <Wrapper>
        <div
          ref={containerRef}
          className={`embed-container ${className}`}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      </Wrapper>
    )
  }

  // Otherwise fall back to thumbnail image
  if (thumbnail) {
    return (
      <Wrapper>
        <img src={thumbnail} alt={title} loading={lazy ? 'lazy' : undefined} className={className} style={{ display: 'block', width: '100%' }} />
      </Wrapper>
    )
  }

  return null
}
