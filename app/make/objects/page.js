'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { MobileChrome } from '../../components/MobileChrome'
import { clearHomeLayout, getNavStackLength, popNavStack, pushNavStack } from '../../components/navState'
import { useMediaQuery } from '../../components/useMediaQuery'
import { objectsProjects } from './data'

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

const MobileMenuOverlay = ({
  categories,
  open,
  onClose,
  onNavigate,
  glowFilter,
  activeMenuCategory,
  setActiveMenuCategory
}) => {
  const lineWidth = '200px'
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [animatingIn, setAnimatingIn] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
      requestAnimationFrame(() => setAnimatingIn(true))
      return
    }
    if (visible) {
      setClosing(true)
      setAnimatingIn(false)
      const timer = setTimeout(() => setVisible(false), 220)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [open, visible])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Mobile navigation menu"
      onClick={() => onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        pointerEvents: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          marginRight: '24px',
          marginBottom: '70px',
          width: lineWidth,
          background: 'rgba(0,0,0,0.02)',
          borderRadius: '0px 0px 10px 10px',
          padding: '14px 18px 18px',
          boxShadow: '0 18px 45px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(2px)',
          transform: animatingIn && !closing ? 'translateY(0)' : 'translateY(40px)',
          opacity: animatingIn && !closing ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease'
        }}
      >
        <div style={{ position: 'absolute', top: '-28px', right: '0', left: '0', display: 'flex', justifyContent: 'flex-end', paddingRight: '6px' }}>
          <div style={{ borderLeft: '1px dashed #000', opacity: 0.4, height: '26px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-karla)', textTransform: 'lowercase' }}>
          {categories.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveMenuCategory(cat.name)
                  onNavigate(cat.name, cat.name)
                }}
                style={{
                  alignSelf: 'flex-end',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  color: activeMenuCategory === cat.name ? '#FDABD3' : '#000',
                  filter: activeMenuCategory === cat.name ? glowFilter : 'none',
                  textAlign: 'right'
                }}
              >
                {cat.name}
              </button>
              <div style={{ height: '2px', width: lineWidth, background: '#000', opacity: 0.7 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', justifyItems: 'end' }}>
                {cat.subcategories.map((sub) => (
                  <button
                    key={`${cat.name}-${sub}`}
                    type="button"
                    onClick={() => {
                      setActiveMenuCategory(cat.name)
                      onNavigate(sub, cat.name)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      color: '#000',
                      textAlign: 'right'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [swipeStart, setSwipeStart] = useState(null)
  const mobileMenuTimerRef = useRef(null)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    setCanGoBack(getNavStackLength() > 0)
  }, [])

  useEffect(() => {
    if (!isMobile || readingMode) return undefined
    const key = 'swipeHintMakeThingsShown'
    const already = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null
    if (!already) {
      window.sessionStorage.setItem(key, '1')
      const showTimer = setTimeout(() => setShowSwipeHint(true), 300)
      const hideTimer = setTimeout(() => setShowSwipeHint(false), 2300)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
    return undefined
  }, [isMobile, readingMode])

  useEffect(() => {
    if (!isMobile) return undefined
    if (mobileMenuTimerRef.current) {
      clearTimeout(mobileMenuTimerRef.current)
      mobileMenuTimerRef.current = null
    }
    if (mobileMenuOpen) {
      mobileMenuTimerRef.current = setTimeout(() => {
        setMobileMenuOpen(false)
      }, 4000)
    }
    return () => {
      if (mobileMenuTimerRef.current) {
        clearTimeout(mobileMenuTimerRef.current)
        mobileMenuTimerRef.current = null
      }
    }
  }, [mobileMenuOpen, isMobile])

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

  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    const target = path.startsWith('/') ? path : `/${path}`
    setMobileMenuOpen(false)
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
    }
    window.location.href = target
  }

  const handleSwipeTouchStart = (e) => {
    if (readingMode) return
    const touch = e.touches[0]
    if (!touch) return
    setSwipeStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleSwipeTouchEnd = (e) => {
    if (readingMode) return
    if (!swipeStart) return
    const touch = e.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - swipeStart.x
    const dy = touch.clientY - swipeStart.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    setSwipeStart(null)
    if (absX < 50 || absX < absY) return
    if (overlayProject && overlayGallery.length && navMode === 'gallery') {
      if (dx < -50) {
        setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
      } else if (dx > 50) {
        setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
      }
      return
    }
    if (dx < -50) {
      navigateWithFade('/view')
    } else if (dx > 50) {
      navigateWithFade('/', { preserveHomeLayout: false })
    }
  }

  const handleBack = () => {
    if (overlayProject) {
      handleCloseOverlay()
      return
    }
    navigateWithFade('/make')
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
    shuffle(objectsProjects).map((proj) => ({
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
      onTouchStart={handleSwipeTouchStart}
      onTouchEndCapture={handleSwipeTouchEnd}
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
      {readingMode && (
        <>
          <div
            style={{
              position: 'fixed',
              width: '500px',
              height: '500px',
              left: '30%',
              top: '58%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent)',
              opacity: 0.6,
              filter: 'blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'fixed',
              width: '300px',
              height: '300px',
              left: '26%',
              top: '52%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent)',
              opacity: 0.75,
              filter: 'blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'fixed',
              width: '160px',
              height: '160px',
              left: '20%',
              top: '36%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent)',
              opacity: 0.7,
              filter: 'blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </>
      )}
      {readingMode && (
        <>
          <div
            style={{
              position: 'fixed',
              width: '500px',
              height: '500px',
              left: '30%',
              top: '58%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent)',
              opacity: 0.6,
              filter: 'blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'fixed',
              width: '300px',
              height: '300px',
              left: '26%',
              top: '52%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent)',
              opacity: 0.75,
              filter: 'blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'fixed',
              width: '160px',
              height: '160px',
              left: '20%',
              top: '36%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent)',
              opacity: 0.7,
              filter: 'blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </>
      )}

      {!isMobile && (
        <>
          <TopBarTransform
            hoveredElement={hoveredElement}
            setHoveredElement={setHoveredElement}
            readingMode={readingMode}
            analyticsText="THINGS OVERVIEW"
            glowFilter={glowFilter}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            activePage="make"
            onNavigate={(category) => navigateWithFade(category)}
          />

          <LeftPanelTransform
            readingMode={readingMode}
            toggleReadingMode={toggleReadingMode}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            label="THINGS"
            labelTop={135}
            onBack={handleBack}
            backDisabled={!overlayProject && !canGoBack}
            onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
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
            activeSubcategory="things"
            categories={categories}
            onNavigate={(sub, category) => {
              if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
                navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
                navigateWithFade(`/view/${sub}`)
              } else {
                navigateWithFade(`/${category}`)
              }
            }}
          />
        </>
      )}

      {isMobile && (
        <MobileChrome
          title="things"
          subnav={[]}
          activeDot="make"
          activeSubnav={null}
          bottomLabel=""
          readingMode={readingMode}
          onPrimaryAction={toggleReadingMode}
          primaryActive={readingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={handleBack}
          backDisabled={!overlayProject && !canGoBack}
          onNavigate={(key, href) => navigateWithFade(href)}
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          menuExpanded={mobileMenuOpen}
          accentHueExpr="calc(var(--glow-rotation) + var(--glow-offset))"
        />
      )}

      {isMobile && (
        <MobileMenuOverlay
          categories={[
            { name: 'make', subcategories: ['spaces', 'things'] },
            { name: 'view', subcategories: ['speculations', 'images'] },
            { name: 'reflect', subcategories: ['research', 'teaching'] },
            { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
          ]}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={(sub, category) => {
            setActiveMenuCategory(category)
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              return
            }
            if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`/view/${sub}`)
              return
            }
            if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
              navigateWithFade(`/reflect/${sub}`)
              return
            }
            if (category === 'connect' && (sub === 'curriculum vitae' || sub === 'about me')) {
              const slug = sub === 'curriculum vitae' ? 'curriculum-vitae' : 'about-me'
              navigateWithFade(`/connect/${slug}`)
              return
            }
            navigateWithFade(`/${category}`)
          }}
          glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))"
          activeMenuCategory={activeMenuCategory}
          setActiveMenuCategory={setActiveMenuCategory}
        />
      )}

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

      <div style={{ padding: isMobile ? '180px 80px 140px' : '120px 140px 100px 120px', opacity: overlayProject ? 0 : 1, transition: 'opacity 240ms ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: readingMode && !isMobile ? 'minmax(300px, 360px) 1fr' : '1fr', columnGap: '80px', rowGap: '32px', alignItems: 'start' }}>
          {readingMode && (
            <div style={{
              fontFamily: 'var(--font-karla)',
              fontSize: '32px',
              fontWeight: 200,
              lineHeight: '32px',
              color: '#000',
              marginTop: isMobile ? '0px' : '300px',
              maxWidth: isMobile ? '500px' : '800px',
              width: isMobile ? '400px' : undefined,
              textAlign: 'right',
              marginLeft: isMobile ? 'auto' : 'auto',
              marginRight: isMobile ? '24px' : '0px',
              alignSelf: 'flex-end',
              justifySelf: 'end',
              position: isMobile ? 'fixed' : 'static',
              right: isMobile ? '20px' : undefined,
              bottom: isMobile ? '75px' : undefined
            }}>
              A collection of things — furniture, lighting, and product studies — prototypes, commissions, and limited runs exploring material tactility and fabrication.
            </div>
          )}

          {!readingMode && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(3, minmax(70px, 1fr))' : 'repeat(4, minmax(160px, 1fr))',
                gridAutoRows: isMobile ? '70px' : undefined,
                gridAutoFlow: isMobile ? 'row dense' : undefined,
                gap: isMobile ? '8px' : '74px 14px',
                alignItems: isMobile ? 'stretch' : 'start',
                maxWidth: isMobile ? '100%' : '860px',
                marginTop: isMobile ? '100px' : '60px',
                marginLeft: isMobile ? '0px' : '120px',
                transform: overlayProject ? 'scale(0.75) translate(120px, -40px)' : 'none',
                transition: 'transform 420ms cubic-bezier(0.25, 0.9, 0.35, 1)'
              }}
            >
              {(isMobile
                ? (projectGrid.length ? projectGrid : objectsProjects.map((proj) => ({ project: proj, size: 'small' })))
                : objectsProjects
              ).map((entry, idx) => {
                const project = isMobile ? entry.project : entry
                const projIdx = objectsProjects.findIndex((p) => p.slug === project.slug)
                const isActive = overlayProject?.slug === project.slug
                const span = isMobile && entry.size === 'large' ? 2 : 1
                const aspectRatio = isMobile ? null : (project.aspectRatio || (idx % 2 === 0 ? '4 / 3' : '3 / 4'))
                return (
                  <button
                    key={project.slug}
                    type="button"
                    ref={(node) => { cardRefs.current[project.slug] = node }}
                    onClick={() => handleOpenOverlay(project, projIdx, cardRefs.current[project.slug], 'gallery', 0)}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: '#000',
                      fontFamily: 'var(--font-karla)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      gridRow: isMobile ? `span ${span}` : undefined
                    }}
                    onMouseEnter={(e) => showTooltip(project.title, e)}
                    onMouseLeave={hideTooltip}
                  >
                    {!isMobile && (
                      <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.001em', marginBottom: '6px', textAlign: 'left' }}>
                        {idx + 1} / {project.title.toLowerCase()}
                      </div>
                    )}
                    <div
                      style={{
                        width: '100%',
                        height: isMobile ? '100%' : undefined,
                        aspectRatio: aspectRatio || undefined,
                        background: `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                        borderRadius: '6px',
                        border: isActive ? '2px solid #FDABD3' : '1px solid rgba(0,0,0,0.1)',
                        boxShadow: isActive ? '0 8px 20px rgba(253,171,211,0.25)' : 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isMobile && (
                        <span style={{ position: 'absolute', left: '6px', top: '6px', fontSize: '10px', fontWeight: 700 }}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {overlayProject && overlayStyle && (
        isMobile ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              padding: '60px 24px 72px',
              background: 'rgba(0,0,0,0.08)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={handleCloseOverlay}
            aria-label="Overlay backdrop, click to close"
          >
            <div
              style={{
                flex: '0 0 66%',
                position: 'relative',
                background: overlayGallery[activeImageIndex]
                ? `linear-gradient(135deg, ${paletteForIndex(activeImageIndex)} 0%, #fffdf3 100%)`
                : `linear-gradient(135deg, ${paletteForIndex(overlayProject.idx)} 0%, #fffdf3 100%)`,
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '10px 10px 0 0',
                overflow: 'hidden',
                paddingLeft: '26px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: 'absolute', top: '12px', left: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {overlayGallery.map((_, idx) => (
                  <span
                    key={`dot-${idx}`}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                    background: idx === activeImageIndex ? '#000' : 'rgba(0,0,0,0.25)'
                  }}
                />
              ))}
            </div>
            {overlayGallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
                  }}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    bottom: '12px',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                    <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '12px',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                  </svg>
                </button>
              </>
            )}
            </div>
            <div
              style={{
                flex: '1 1 34%',
                padding: '18px 18px 22px',
                background: '#FFFDF3',
                border: '1px solid rgba(0,0,0,0.08)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                fontFamily: 'var(--font-karla)',
                color: '#000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const titleSize = 10
                const valueSize = 20
                const letterSpacing = '-0.02em'
                return (
                  <>
                    <div>
                      <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-4px' }}>project</div>
                      <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing }}>{overlayProject.title}</div>
                    </div>
                    {!isMobile && (
                      <div>
                        <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-4px' }}>client</div>
                        <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing }}>{overlayProject.client}</div>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-4px' }}>type</div>
                        <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing }}>{overlayProject.type}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-4px' }}>status</div>
                        <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing }}>{overlayProject.status}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '2px' }}>notes</div>
                      <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing, lineHeight: '22px' }}>{overlayProject.notes}</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        ) : (
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
                    top: '500px',
                    left: 0,
                    display: 'grid',
                    gridAutoFlow: 'column',
                    gridAutoColumns: '30px',
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
                  const projIdx = objectsProjects.findIndex((p) => p.slug === proj.slug)
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
                      const prevIdx = (overlayProject.idx - 1 + objectsProjects.length) % objectsProjects.length
                      const prevProject = objectsProjects[prevIdx]
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
                      const nextIdx = (overlayProject.idx + 1) % objectsProjects.length
                      const nextProject = objectsProjects[nextIdx]
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
        )
      )}

      {isMobile && readingMode && (
        <div
          className="fixed left-1/2 bottom-4"
          style={{
            zIndex: 70,
            background: '#000',
            color: '#FFFDF3',
            padding: '6px 12px',
            borderRadius: '999px',
            fontFamily: 'var(--font-karla)',
            fontSize: '12px',
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            transform: 'translateX(-50%)'
          }}
        >
          reading mode
        </div>
      )}

      {isMobile && !readingMode && showSwipeHint && (
        <div
          className="fixed left-1/2 bottom-16"
          style={{
            zIndex: 70,
            width: '120px',
            height: '60px',
            pointerEvents: 'none',
            transform: 'translateX(-50%)'
          }}
        >
          <img src="/website_interaction/S_LR.png" alt="swipe hint" style={{ width: '120px', height: '60px', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}
