'use client'

import { useEffect, useMemo, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../../components/TransformChrome'
import { spacesProjects } from '../data'

const syncGlowOffset = () => {
  if (typeof window === 'undefined') return { delaySeconds: 0 }
  const key = 'glowStartMs'
  let start = Number(window.sessionStorage.getItem(key))
  if (!start) {
    start = Date.now()
    window.sessionStorage.setItem(key, `${start}`)
  }
  const elapsedMs = Date.now() - start
  const angle = ((elapsedMs / 60000) * 360) % 360
  const delaySeconds = (elapsedMs / 1000) % 60
  document.documentElement.style.setProperty('--glow-offset', `${angle}deg`)
  return { delaySeconds }
}

const fauxThumbPalette = ['#f2d5d5', '#d9e7f7', '#f7e1c8', '#d9f1e0', '#e6ddf7', '#f5d9ea']

export default function SpaceDetailPage() {
  const params = useParams()
  const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const activeIndexFromSlug = useMemo(
    () => (slugParam ? spacesProjects.findIndex((p) => p.slug === slugParam) : -1),
    [slugParam]
  )
  const project = activeIndexFromSlug >= 0 ? spacesProjects[activeIndexFromSlug] : null

  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [tooltip, setTooltip] = useState(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => (activeIndexFromSlug >= 0 ? activeIndexFromSlug : 0))

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    if (activeIndexFromSlug !== -1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(activeIndexFromSlug)
    }
  }, [activeIndexFromSlug])

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

  const toggleReadingMode = () => {
    setHoveredElement(null)
    setExpandedCategory(null)
    setReadingMode((prev) => !prev)
  }

  const categories = useMemo(() => ([
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] },
  ]), [])

  const goToIndex = (idx) => {
    const bounded = (idx + spacesProjects.length) % spacesProjects.length
    const next = spacesProjects[bounded]
    window.location.href = `/make/spaces/${next.slug}`
  }

  if (!hasMounted) return null
  if (!project) return notFound()

  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        animation: 'glowHue 60s linear infinite',
        animationDelay: `-${glowDelaySeconds}s`,
        opacity: pageOpacity,
        transition: 'opacity 0.6s ease'
      }}
      className="glow-hue-driver"
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
      `}</style>

      <TopBarTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        readingMode={readingMode}
        analyticsText={project.title}
        glowFilter={glowFilter}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        activePage="make"
      />

      <LeftPanelTransform
        readingMode={readingMode}
        toggleReadingMode={toggleReadingMode}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        label="spaces"
        labelTop={120}
      />

      <RightPanelTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        expandedCategory={expandedCategory}
        setExpandedCategory={setExpandedCategory}
        readingMode={readingMode}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        glowFilter={glowFilter}
        activePage="make"
        categories={categories}
        onNavigate={(sub, category) => {
          if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
            window.location.href = sub === 'things' ? '/make/things' : '/make/spaces'
          } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
            window.location.href = `/view/${sub}`
          } else {
            window.location.href = `/${category}`
          }
        }}
      />

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: tooltip.placement === 'right' ? 'translate(0, -50%)' : 'translate(-50%, -100%)',
            pointerEvents: 'none',
            backgroundColor: '#000',
            color: '#FFFDF3',
            border: '1px solid #000',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-karla)',
            zIndex: 120,
            whiteSpace: 'nowrap'
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div style={{ padding: '120px 140px 120px 180px', display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) minmax(520px, 820px) minmax(260px, 420px)', columnGap: '80px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontFamily: 'var(--font-karla)', marginTop:'200px', color: '#000' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px'}}>project</div>
            <div style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '-10px'}}>{project.title}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px'}}>client</div>
            <div style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '-10px' }}>{project.client}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px'}}>type</div>
            <div style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '-10px' }}>{project.type}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px'}}>status</div>
            <div style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '-10px' }}>{project.status}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '2px'}}>notes</div>
            <div style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: '24px', marginBottom: '-10px'}}>{project.notes}</div>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              aspectRatio: '4 / 5',
              background: `linear-gradient(135deg, ${fauxThumbPalette[activeIndex % fauxThumbPalette.length]} 0%, #fffdf3 100%)`,
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.15)'
            }}
          />

          <button
            onClick={() => goToIndex(activeIndex - 1)}
            aria-label="Previous project"
            style={{ position: 'absolute', left: 0, bottom: '-6px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            onClick={() => goToIndex(activeIndex + 1)}
            aria-label="Next project"
            style={{ position: 'absolute', right: 0, bottom: '-6px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>

          <div style={{ display: 'none', justifyContent: 'space-between', width: '100%', maxWidth: '540px', padding: '0 12px', fontSize: '22px', color: '#000', position: 'absolute', left: 0, right: 0, bottom: '-10px' }}>
            <button
              onClick={() => goToIndex(activeIndex - 1)}
              aria-label="Previous project"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#000', display: 'none' }}
            >
              {'<'}
            </button>
            <button
              onClick={() => goToIndex(activeIndex + 1)}
              aria-label="Next project"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#000', display: 'none' }}
            >
              {'>'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(72px, 1fr))', gap: '33px 6px', alignItems: 'start', maxWidth: '387px', marginTop: '27px', justifySelf: 'end' }}>
          {spacesProjects.map((p, idx) => {
            const aspectRatio = p.aspectRatio || (idx % 2 === 0 ? '4 / 3' : '3 / 4')
            return (
              <a
                key={p.slug}
                href={`/make/spaces/${p.slug}`}
                style={{ display: 'block', textDecoration: 'none', color: '#000', fontFamily: 'var(--font-karla)' }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '5px', textTransform: 'uppercase' }}>
                  {idx + 1}
                </div>
                <div
                  style={{
                    width: '100%',
                    aspectRatio,
                    background: `linear-gradient(135deg, ${fauxThumbPalette[idx % fauxThumbPalette.length]} 0%, #fffdf3 100%)`,
                    borderRadius: '6px',
                    border: idx === activeIndex ? '2px solid #FDABD3' : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: idx === activeIndex ? '0 8px 20px rgba(253,171,211,0.25)' : 'none',
                    transition: 'transform 0.2s ease, boxShadow 0.2s ease, border 0.2s ease',
                    transform: idx === activeIndex ? 'translateY(-2px)' : 'translateY(0)',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => showTooltip(p.title, e)}
                  onMouseLeave={hideTooltip}
                />
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
