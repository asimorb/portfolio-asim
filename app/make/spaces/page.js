'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { spacesProjects } from './data'

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

export default function SpacesOverviewPage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [tooltip, setTooltip] = useState(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [overlayProject, setOverlayProject] = useState(null)
  const [overlayStyle, setOverlayStyle] = useState(null)
  const [overlayMetaVisible, setOverlayMetaVisible] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [overlayGallery, setOverlayGallery] = useState([])
  const [navMode, setNavMode] = useState('gallery') // 'gallery' | 'project'
  const [projectGrid, setProjectGrid] = useState([])
  const cardRefs = useRef({})

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'

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

  const paletteForIndex = (idx) => fauxThumbPalette[idx % fauxThumbPalette.length]

  const buildGallery = (project) => {
    if (project?.gallery?.length) return project.gallery
    const count = 4
    return Array.from({ length: count }).map((_, i) => ({
      label: `${project.title} ${i + 1}`,
      aspectRatio: i % 2 === 0 ? '4 / 3' : '3 / 4'
    }))
  }

  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const buildProjectGrid = () =>
    shuffle(spacesProjects).map((proj) => ({
      project: proj,
      size: Math.random() < 0.38 ? 'large' : 'small'
    }))

  useEffect(() => {
    if (!projectGrid.length) {
      setProjectGrid(buildProjectGrid())
    }
  }, [projectGrid.length])

  useEffect(() => {
    if (!overlayProject || navMode !== 'project') return
    setProjectGrid(buildProjectGrid())
  }, [overlayProject?.slug, navMode])

  const handleOpenOverlay = (project, idx, el, mode = 'gallery', imageIndex = 0) => {
    const rect = el?.getBoundingClientRect()
    const start = rect
      ? {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          borderRadius: 8
        }
      : overlayStyle || {
          width: Math.min(540, window.innerWidth * 0.55),
          height: Math.min(540, window.innerWidth * 0.55) * 1.25,
          top: window.innerHeight * 0.2,
          left: window.innerWidth * 0.25,
          borderRadius: 8
        }
    setOverlayProject({ ...project, idx })
    setOverlayGallery(shuffle(buildGallery(project)))
    setActiveImageIndex(imageIndex)
    setNavMode(mode)
    setOverlayStyle(start)
    setOverlayMetaVisible(false)

    requestAnimationFrame(() => {
      const targetWidth = Math.min(540, window.innerWidth * 0.55)
      const targetHeight = targetWidth * 1.25
      const targetLeft = (window.innerWidth - targetWidth) / 2 - 50
      const targetTop = (window.innerHeight - targetHeight) / 2 + 40
      setOverlayStyle({
        width: targetWidth,
        height: targetHeight,
        top: targetTop,
        left: targetLeft,
        borderRadius: 8,
        transition: 'all 420ms cubic-bezier(0.25, 0.9, 0.35, 1)',
        boxShadow: 'none'
      })
      setTimeout(() => setOverlayMetaVisible(true), 280)
    })
  }

  const handleCloseOverlay = () => {
    setOverlayMetaVisible(false)
    setOverlayProject(null)
    setOverlayStyle(null)
    setOverlayGallery([])
    setActiveImageIndex(0)
    setNavMode('gallery')
  }

  if (!hasMounted) return null

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
        analyticsText="SPACES OVERVIEW"
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
        label="SPACES"
        labelTop={135}
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
        activeSubcategory="spaces"
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

      {notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
      )}

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

      <div style={{ padding: '120px 140px 100px 120px', opacity: overlayProject ? 0 : 1, transition: 'opacity 240ms ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', columnGap: '80px', rowGap: '32px', alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-karla)', fontSize: '32px', fontWeight: 200, lineHeight: '32px', color: '#000', marginTop: '300px', maxWidth: '800px' }}>
            This selection includes works from various stages of my career. My architectural practice has been a blend of freelance commissions and collaborative studio projects, spanning from two thousand and eight to the present. 

          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
            gap: '74px 14px',
            alignItems: 'start',
            maxWidth: '860px',
            marginTop: '60px',
            marginLeft: '120px',
            transform: overlayProject ? 'scale(0.75) translate(120px, -40px)' : 'none',
            transition: 'transform 420ms cubic-bezier(0.25, 0.9, 0.35, 1)'
          }}>
            {spacesProjects.map((project, idx) => {
              const aspectRatio = project.aspectRatio || (idx % 2 === 0 ? '4 / 3' : '3 / 4')
              return (
                <button
                  key={project.slug}
                  type="button"
                  ref={(node) => { cardRefs.current[project.slug] = node }}
                  onClick={() => handleOpenOverlay(project, idx, cardRefs.current[project.slug], 'gallery', 0)}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: '#000',
                    fontFamily: 'var(--font-karla)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => showTooltip(project.title, e)}
                  onMouseLeave={hideTooltip}
                >
                  <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.001em', marginBottom: '8px' }}>
                    {idx + 1} / {project.title.toLowerCase()}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      aspectRatio,
                      background: `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                      borderRadius: '6px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {overlayProject && overlayStyle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'transparent',
            zIndex: 200,
            opacity: 1,
            transition: 'opacity 240ms ease'
          }}
          onClick={handleCloseOverlay}
          aria-label="Overlay backdrop, click to close"
        >
          <div
            style={{
              position: 'fixed',
              top: overlayStyle.top,
              left: overlayStyle.left,
              width: overlayStyle.width,
              height: overlayStyle.height,
              borderRadius: overlayStyle.borderRadius,
              background: overlayGallery[activeImageIndex]
                ? `linear-gradient(135deg, ${paletteForIndex(activeImageIndex)} 0%, #fffdf3 100%)`
                : `linear-gradient(135deg, ${paletteForIndex(overlayProject.idx)} 0%, #fffdf3 100%)`,
              border: '1px solid rgba(0,0,0,0.15)',
              boxShadow: overlayStyle.boxShadow || 'none',
              transition: overlayStyle.transition,
              overflow: 'hidden',
              pointerEvents: 'auto'
            }}
            aria-live="polite"
            aria-label={`Image ${activeImageIndex + 1} of ${overlayGallery.length || 1} for ${overlayProject.title}`}
            onClick={(e) => e.stopPropagation()}
          />

          <div
            style={{
              position: 'fixed',
              left: '120px',
              top: '280px',
              position: 'relative',
              opacity: overlayMetaVisible ? 1 : 0,
              transition: 'opacity 240ms ease 180ms',
              fontFamily: 'var(--font-karla)',
              color: '#000',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px' }}>project</div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px'}}>{overlayProject.title}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px' }}>client</div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{overlayProject.client}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px' }}>type</div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{overlayProject.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '-5px' }}>status</div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{overlayProject.status}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', opacity: 1, marginBottom: '2px' }}>notes</div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: '24px', maxWidth: '400px', marginBottom: '-10px' }}>{overlayProject.notes}</div>
            </div>
            {overlayGallery.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '500px',    // pick a fixed anchor relative to the meta box
                  left: 0,
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridAutoColumns: '30px', // set your fixed size here
                  gap: '4px',
                  maxWidth: '40%'
                }}
              >
                {overlayGallery.map((img, idx) => (
                  <button
                    key={`meta-thumb-${idx}`}
                    type="button"
                    onClick={() => { setActiveImageIndex(idx); setNavMode('gallery') }}
                    onMouseEnter={(e) => showTooltip(img.label || `Image ${idx + 1}`, e)}
                    onMouseLeave={hideTooltip}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                      borderRadius: '6px',
                      border: idx === activeImageIndex ? '2px solid #FDABD3' : '1px solid rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span style={{ position: 'absolute', left: '2px', top: '2px', fontSize: '8px', fontWeight: 700 }}>{img.label || idx + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {projectGrid.length > 0 && (
            <div
              style={{
                position: 'fixed',
                top: '180px',
                right: '280px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))',
                gridAutoRows: '88px',
                gridAutoFlow: 'row dense',
                gap: '12px',
                width: '240px',
                zIndex: 212
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {projectGrid.map(({ project: proj, size }, idx) => {
                const isActive = overlayProject?.slug === proj.slug
                const projIdx = spacesProjects.findIndex((p) => p.slug === proj.slug)
                const span = size === 'large' ? 2 : 1
                return (
                <button
                  key={proj.slug}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenOverlay(proj, projIdx, null, 'project', 0)
                  }}
                  onMouseEnter={(e) => showTooltip(proj.title, e)}
                  onMouseLeave={hideTooltip}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1 / 1',
                    gridRow: `span ${span}`,
                    background: `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                    borderRadius: '6px',
                    border: isActive ? '2px solid #FDABD3' : '1px solid rgba(0,0,0,0.12)',
                    boxShadow: isActive ? '0 8px 20px rgba(253,171,211,0.25)' : 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span style={{ position: 'absolute', left: '6px', top: '6px', fontSize: '10px', fontWeight: 700 }}>{idx + 1}</span>
                </button>
              )})}
            </div>
          )}
          {overlayStyle && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (navMode === 'gallery' && overlayGallery.length) {
                    setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
                  } else {
                    const prevIdx = (overlayProject.idx - 1 + spacesProjects.length) % spacesProjects.length
                    const prevProject = spacesProjects[prevIdx]
                    handleOpenOverlay(prevProject, prevIdx, cardRefs.current[prevProject.slug], 'project', 0)
                  }
                }}
                aria-label="Previous"
                onMouseEnter={(e) => showTooltip(navMode === 'gallery' ? 'Previous image' : 'Previous project', e)}
                onMouseLeave={hideTooltip}
                style={{
                  position: 'fixed',
                  left: overlayStyle.left - 64,
                  top: overlayStyle.top + overlayStyle.height - 30,
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 215
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (navMode === 'gallery' && overlayGallery.length) {
                    setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
                  } else {
                    const nextIdx = (overlayProject.idx + 1) % spacesProjects.length
                    const nextProject = spacesProjects[nextIdx]
                    handleOpenOverlay(nextProject, nextIdx, cardRefs.current[nextProject.slug], 'project', 0)
                  }
                }}
                aria-label="Next"
                onMouseEnter={(e) => showTooltip(navMode === 'gallery' ? 'Next image' : 'Next project', e)}
                onMouseLeave={hideTooltip}
                style={{
                  position: 'fixed',
                  left: overlayStyle.left + overlayStyle.width + 28,
                  top: overlayStyle.top + overlayStyle.height - 30,
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 215
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
