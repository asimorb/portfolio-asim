'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { MobileChrome } from '../../components/MobileChrome'
import { clearHomeLayout } from '../../components/navState'
import { useMediaQuery } from '../../components/useMediaQuery'
import { thingsProjects } from './data'

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

// Process gallery items into display blocks (singles and collages)
const processGalleryItems = (gallery) => {
  const blocks = []
  const groupedItems = {}
  const processedGroups = new Set()

  // First pass: collect grouped items
  gallery.forEach((item, index) => {
    if (item.group) {
      if (!groupedItems[item.group]) {
        groupedItems[item.group] = []
      }
      groupedItems[item.group].push({ ...item, originalIndex: index })
    }
  })

  // Second pass: build display blocks in order
  gallery.forEach((item, index) => {
    if (item.group) {
      // If we haven't processed this group yet, add it as a collage block
      if (!processedGroups.has(item.group)) {
        processedGroups.add(item.group)
        blocks.push({
          type: 'collage',
          items: groupedItems[item.group],
          group: item.group
        })
      }
    } else {
      // Single image
      blocks.push({
        type: 'single',
        item: { ...item, originalIndex: index }
      })
    }
  })

  return blocks
}

// Collage component - renders 2-4 images in a stacked layout
const CollageBlock = ({ items, onImageClick, containerHeight }) => {
  const count = items.length
  const gap = 8

  if (count === 2) {
    // 2 images: stacked vertically
    const itemHeight = (containerHeight - gap) / 2
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap, height: containerHeight }}>
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onImageClick(item.src)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              height: itemHeight,
              flexShrink: 0
            }}
          >
            <img
              src={item.src}
              alt=""
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 4
              }}
            />
          </button>
        ))}
      </div>
    )
  }

  if (count === 3) {
    // 3 images: one tall on left, two stacked on right
    const rightItemHeight = (containerHeight - gap) / 2
    return (
      <div style={{ display: 'flex', gap, height: containerHeight }}>
        <button
          type="button"
          onClick={() => onImageClick(items[0].src)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            height: containerHeight,
            flexShrink: 0
          }}
        >
          <img
            src={items[0].src}
            alt=""
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'cover',
              display: 'block',
              borderRadius: 4
            }}
          />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          {items.slice(1).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onImageClick(item.src)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                height: rightItemHeight,
                flexShrink: 0
              }}
            >
              <img
                src={item.src}
                alt=""
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 4
                }}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (count >= 4) {
    // 4+ images: 2x2 grid (show all images)
    const itemHeight = (containerHeight - gap) / 2
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gridTemplateRows: '1fr 1fr', gap, height: containerHeight }}>
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onImageClick(item.src)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              height: itemHeight,
              flexShrink: 0
            }}
          >
            <img
              src={item.src}
              alt=""
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 4
              }}
            />
          </button>
        ))}
      </div>
    )
  }

  // Fallback for single item in a group (shouldn't normally happen)
  if (count === 1) {
    return (
      <button
        type="button"
        onClick={() => onImageClick(items[0].src)}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          height: containerHeight,
          flexShrink: 0
        }}
      >
        <img
          src={items[0].src}
          alt=""
          style={{
            height: '100%',
            width: 'auto',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 4
          }}
        />
      </button>
    )
  }

  return null
}

const MobileMenuOverlay = ({
  categories,
  open,
  onClose,
  onNavigate,
  glowFilter,
  activeMenuCategory,
  setActiveMenuCategory,
  isNarrowDesktop
}) => {
  const lineWidth = isNarrowDesktop ? '240px' : '200px'
  const panelPaddingX = 18
  const panelRef = useRef(null)
  const [panelOffset, setPanelOffset] = useState({ left: 0, top: 0 })
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

  useEffect(() => {
    if (!visible) return undefined
    const updateOffset = () => {
      if (!panelRef.current) return
      const rect = panelRef.current.getBoundingClientRect()
      setPanelOffset({ left: rect.left, top: rect.top })
    }
    updateOffset()
    window.addEventListener('resize', updateOffset)
    return () => window.removeEventListener('resize', updateOffset)
  }, [visible])

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
        ref={panelRef}
        style={{
          position: 'relative',
          marginRight: '20px',
          marginBottom: '70px',
          width: lineWidth,
          background: 'transparent',
          borderRadius: '10px',
          padding: `14px ${panelPaddingX}px 18px`,
          boxShadow: 'none',
          backdropFilter: 'none',
          transform: animatingIn && !closing ? 'translateY(0)' : 'translateY(40px)',
          opacity: animatingIn && !closing ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'rgba(255, 253, 243, 0.9)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              left: `calc(30vw - ${panelOffset.left}px)`,
              top: `calc(58vh - ${panelOffset.top}px)`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent)',
              opacity: 0.9,
              filter: 'blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg))',
              pointerEvents: 'none'
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: 'var(--font-karla)',
            textTransform: 'lowercase',
            position: 'relative',
            zIndex: 2
          }}
        >
          {categories.map((category) => (
            <div key={category.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveMenuCategory(category.name)
                  onNavigate(category.name, category.name)
                }}
                style={{
                  alignSelf: 'flex-end',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  color: activeMenuCategory === category.name ? '#FDABD3' : '#000',
                  filter: activeMenuCategory === category.name ? glowFilter : 'none',
                  textAlign: 'right',
                  transform: 'translateY(7px)'
                }}
              >
                {category.name}
              </button>
              <div style={{ height: '2px', width: '100%', background: '#000', opacity: 0.7 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', justifyItems: 'end' }}>
                {category.subcategories.map((sub) => (
                  <button
                    key={`${category.name}-${sub}`}
                    type="button"
                    onClick={() => {
                      setActiveMenuCategory(category.name)
                      onNavigate(sub, category.name)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      color: '#000',
                      textAlign: ['speculations', 'spaces', 'research', 'cv'].includes(sub) ? 'left' : 'right',
                      justifySelf: ['speculations', 'spaces', 'research', 'cv'].includes(sub) ? 'start' : 'end'
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

export default function ThingsPage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isNarrowDesktop = useMediaQuery('(max-width: 1400px)')
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [activeCategoryId, setActiveCategoryId] = useState(() => thingsProjects?.[0]?.slug || 'arb')
  const [lightboxImage, setLightboxImage] = useState(null)
  const scrollContainerRef = useRef(null)
  const mobileMenuTimerRef = useRef(null)
  const [mobileHintVisible, setMobileHintVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [bottomBandPage, setBottomBandPage] = useState(0)
  const bottomBandScrollRef = useRef(null)

  const handleBack = () => {
    navigateWithFade('/make')
  }

  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    const target = path.startsWith('/') ? path : `/${path}`
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
    }
    window.location.href = target
  }

  useEffect(() => {
    setMounted(true)
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    const { delaySeconds } = syncGlowOffset()
    setGlowDelaySeconds(delaySeconds)
  }, [])

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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (!isMobile) {
      setMobileHintVisible(false)
      return undefined
    }
    const key = 'thingsSwipeHintSeen'
    const seen = window.sessionStorage.getItem(key)
    if (seen) {
      setMobileHintVisible(false)
      return undefined
    }
    setMobileHintVisible(true)
    const t = setTimeout(() => {
      setMobileHintVisible(false)
      window.sessionStorage.setItem(key, '1')
    }, 2600)
    return () => {
      clearTimeout(t)
      setMobileHintVisible(false)
    }
  }, [isMobile])

  // Reset scroll position when category changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
      setScrollProgress(0)
      setCanScrollRight(true)
    }
  }, [activeCategoryId])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'

  // Get current project data
  const currentProject = useMemo(() => {
    return thingsProjects.find(p => p.slug === activeCategoryId) || thingsProjects[0]
  }, [activeCategoryId])

  // Process gallery into display blocks
  const displayBlocks = useMemo(() => {
    return processGalleryItems(currentProject?.gallery || [])
  }, [currentProject])

  // Track scroll position for indicators
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return undefined

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScroll = scrollWidth - clientWidth
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll)
        setCanScrollRight(scrollLeft < maxScroll - 10)
      } else {
        setScrollProgress(0)
        setCanScrollRight(false)
      }
    }

    handleScroll() // Initial check
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [displayBlocks])

  // Category list for sidebar
  const categories = useMemo(() => (
    thingsProjects.map((proj) => ({
      id: proj.slug,
      label: proj.title
    }))
  ), [])

  const toggleReadingMode = () => {
    setHoveredElement(null)
    setExpandedCategory(null)
    setReadingMode((prev) => {
      const next = !prev
      setNotice(next ? 'READING MODE ON' : 'READING MODE OFF')
      return next
    })
    setTimeout(() => setNotice(null), 2000)
  }

  const navCategories = useMemo(() => ([
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['cv', 'about me'] }
  ]), [])

  const showTooltip = (text, event, placement = 'top') => {
    if (isMobile) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

  // Prevent SSR to avoid hydration mismatches
  if (!mounted) {
    return null
  }

  const chromeMargin = 32
  const containerHeight = isMobile ? 300 : (isNarrowDesktop ? 400 : 500)
  const sideRailLeft = isMobile ? 0 : (isNarrowDesktop ? 96 : 140)
  const sideRailTop = isMobile ? 0 : (isNarrowDesktop ? 180 : 220)
  const sideRailWidth = isMobile ? 0 : (isNarrowDesktop ? 260 : 220)
  const metadataWidth = isMobile ? 0 : (isNarrowDesktop ? 300 : 220)
  const notesMaxWidth = isNarrowDesktop ? 840 : 980
  const heroTopWide = `calc(45% + ${chromeMargin}px)`
  const heroTopNarrow = `calc(46% + ${chromeMargin}px)`
  const heroTop = isMobile ? 'auto' : (isNarrowDesktop ? heroTopNarrow : heroTopWide)
  const heroWidthClamp = isMobile
    ? '100%'
    : (isNarrowDesktop
      ? `min(600px, calc(100vw - ${2 * (sideRailLeft + sideRailWidth + chromeMargin)}px))`
      : `min(clamp(820px, 72vw, 1200px), calc(100vw - ${2 * (sideRailLeft + sideRailWidth + chromeMargin)}px))`)





  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
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
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Desktop Chrome */}
      {!isMobile && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '90px',
              background: '#FFFDF3',
              zIndex: 4,
              pointerEvents: 'none'
            }}
          />

          <TopBarTransform
            hoveredElement={hoveredElement}
            setHoveredElement={setHoveredElement}
            readingMode={readingMode}
            analyticsText=""
            glowFilter={glowFilter}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            activePage="make"
            onNavigate={(category) => navigateWithFade(`/${category}`)}
          />

          <div
            style={{
              position: 'fixed',
              top: 40,
              left: 100,
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-karla)',
              fontSize: '14px'
            }}
          >
            <div style={{ display: 'flex', gap: '14px' }}>
              {thingsProjects.map((project, idx) => {
                const isActive = project.slug === activeCategoryId
                return (
                  <button
                    key={`things-tally-${project.slug}`}
                    type="button"
                    onClick={() => setActiveCategoryId(project.slug)}
                    style={{
                      border: isActive ? '1px solid #000' : '1px solid transparent',
                      background: isActive ? '#000' : 'none',
                      padding: '4px 6px',
                      cursor: isActive ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 600,
                      color: isActive ? '#fff' : '#000',
                      borderRadius: '999px',
                      lineHeight: 1,
                      minWidth: '24px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {isNarrowDesktop && (
              <div
                key={`things-label-${activeCategoryId}`}
                style={{
                  fontFamily: 'var(--font-karla)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  textTransform: 'lowercase',
                  animation: 'fadeIn 220ms ease'
                }}
              >
                {currentProject?.title}
              </div>
            )}
          </div>

          <LeftPanelTransform
            readingMode={readingMode}
            toggleReadingMode={toggleReadingMode}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            label="THINGS"
            labelTop={135}
            onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
            onBack={handleBack}
            readingModeDisabled={true}
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
            categories={navCategories}
            onNavigate={(sub, category) => {
              if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
                navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
                navigateWithFade(`/view/${sub}`)
              } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
                navigateWithFade(`/reflect/${sub}`)
              } else {
                navigateWithFade(`/${category}`)
              }
            }}
          />
        </>
      )}

      {/* Mobile Chrome */}
      {isMobile && (
        <>
          <MobileChrome
            title="things"
            activeDot="make"
            bottomLabel=""
            readingMode={readingMode}
            onPrimaryAction={toggleReadingMode}
            primaryActive={readingMode}
            primaryDisabled={true}
            onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
            secondaryIcon="shuffle"
            onBack={() => navigateWithFade('/make')}
            onNavigate={(key, href) => { navigateWithFade(href) }}
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
            menuExpanded={mobileMenuOpen}
          />

          <MobileMenuOverlay
            categories={navCategories}
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
            glowFilter="hue-rotate(var(--glow-rotation))"
            activeMenuCategory={activeMenuCategory}
            setActiveMenuCategory={setActiveMenuCategory}
            isNarrowDesktop={isNarrowDesktop}
          />
        </>
      )}

      {/* Main Content */}
      {isMobile ? (
        // Mobile Layout: three-part card
        <>
          <div
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
              left: 16,
              right: 16,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
              height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 160px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#F2F2F2'
            }}
          >
            {/* Top strip: numbered category buttons */}
            <div
              style={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0px 12px 0px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                background: '#F2F2F2'
              }}
            >
              {categories.map((cat, idx) => {
                const isActive = cat.id === activeCategoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    aria-label={`Show ${cat.label}`}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '8px 10px',
                      fontFamily: 'var(--font-karla)',
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '-0.02em',
                      color: isActive ? '#000' : 'rgba(0,0,0,0.55)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minWidth: 32,
                      textAlign: 'center'
                    }}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {/* Middle: Black container with images */}
            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                padding: '0 8px',
                background: '#F2F2F2',
                display: 'flex'
              }}
            >
              <div
                style={{
                  background: '#000',
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                {displayBlocks.map((block, idx) => {
                  if (block.type === 'single') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxImage(block.item.src)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <img
                          src={block.item.src}
                          alt=""
                          style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                            display: 'block',
                            borderRadius: 4
                          }}
                        />
                      </button>
                    )
                  } else {
                    // Collage on mobile - simple vertical stack
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {block.items.map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxImage(item.src)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            <img
                              src={item.src}
                              alt=""
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                                display: 'block',
                                borderRadius: 4
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )
                  }
                })}
              </div>
            </div>

            {/* Bottom: Swipeable pages (project + location, notes) */}
            <div
              style={{
                flex: '0 0 150px',
                padding: '16px',
                background: '#F2F2F2',
                fontFamily: 'var(--font-karla)',
                color: '#000',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                position: 'relative'
              }}
            >
              {mobileHintVisible && (
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 10,
                    background: 'rgba(0, 0, 0, 0.82)',
                    color: '#F2F2F2',
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    pointerEvents: 'none',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.14)'
                  }}
                >
                  swipe for notes -&gt;
                </div>
              )}
              <div
                ref={bottomBandScrollRef}
                onScroll={(e) => {
                  const container = e.target
                  const scrollLeft = container.scrollLeft
                  const itemWidth = container.scrollWidth / 2
                  const page = Math.round(scrollLeft / itemWidth)
                  setBottomBandPage(page)
                }}
                style={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridAutoColumns: '100%',
                  gap: 16,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  touchAction: 'pan-x',
                  flex: '1 1 auto',
                  minHeight: 0,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Page 1: Project + Location */}
                <div
                  style={{
                    scrollSnapAlign: 'start',
                    display: 'grid',
                    gridTemplateColumns: '1.25fr 2fr',
                    columnGap: 12,
                    rowGap: 6,
                    alignItems: 'start'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                      project
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', textTransform: 'lowercase' }}>
                      {currentProject?.title || '--'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                      location
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 0.6, whiteSpace: 'pre-line' }}>
                      {currentProject?.location || '--'}
                    </div>
                  </div>
                </div>

                {/* Page 2: Notes */}
                <div
                  style={{
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    height: '100%',
                    overflowY: 'auto',
                    paddingRight: 6
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                    notes
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'pre-line' }}>
                    {currentProject?.notes || '--'}
                  </div>
                </div>
              </div>

              {/* Scroll indicator dots */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 6,
                  paddingTop: 8
                }}
              >
                {[0, 1].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      if (bottomBandScrollRef.current) {
                        const container = bottomBandScrollRef.current
                        const targetScroll = page * container.scrollWidth / 2
                        container.scrollTo({ left: targetScroll, behavior: 'smooth' })
                      }
                    }}
                    aria-label={`Go to page ${page + 1}`}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: bottomBandPage === page ? '#000' : '#ccc',
                      transition: 'background 0.2s ease',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Desktop Layout
        <>
          {/* Left sidebar: categories only (wide desktop) */}
          {!isNarrowDesktop && (
            <div
              style={{
                position: 'fixed',
                left: sideRailLeft,
                top: sideRailTop,
                width: sideRailWidth,
                zIndex: 40,
                fontFamily: 'var(--font-karla)',
                color: '#000'
              }}
            >
              {/* Category list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 24 }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: cat.id === activeCategoryId ? 500 : 200,
                      color: '#000',
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                      textAlign: 'left'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Narrow desktop: category title below hero (left-aligned) */}
          {!isMobile && isNarrowDesktop && (
            <div
              style={{
                position: 'fixed',
                left: 'calc(50% + 80px)',
                transform: 'translateX(-50%)',
                top: `calc(${heroTop} + ${containerHeight / 2}px + 24px)`,
                fontFamily: 'var(--font-karla)',
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'lowercase',
                color: '#000',
                zIndex: 41,
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {currentProject?.title || ''}
            </div>
          )}

          {/* Black container with horizontal scroll */}
          <div
            style={{
              position: 'fixed',
              left: isNarrowDesktop ? 'calc(50% + 120px)' : 'calc(50% + 50px)',
              transform: 'translate(-50%, -50%)',
              top: isNarrowDesktop ? `calc(${heroTop} + 50px)` : heroTop,
              height: containerHeight,
              width: heroWidthClamp,
              background: '#000',
              borderRadius: 16,
              zIndex: 30,
              transition: 'width 0.3s ease, height 0.3s ease'
            }}
            onWheel={(e) => {
              if (!scrollContainerRef.current) return
              if (e.deltaY === 0) return
              e.preventDefault()
              scrollContainerRef.current.scrollLeft += e.deltaY
            }}
          >
            <div
              ref={scrollContainerRef}
              style={{
                height: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                overscrollBehaviorX: 'contain',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 24px',
                scrollBehavior: 'smooth'
              }}
            >
              {displayBlocks.map((block, idx) => {
                if (block.type === 'single') {
                  const scale = block.item.scale || 1
                  const imgHeight = (containerHeight - 48) * scale
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxImage(block.item.src)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        height: imgHeight,
                        flexShrink: 0,
                        alignSelf: 'center'
                      }}
                    >
                      <img
                        src={block.item.src}
                        alt=""
                        style={{
                          height: '100%',
                          width: 'auto',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: 8
                        }}
                      />
                    </button>
                  )
                } else {
                  return (
                    <CollageBlock
                      key={idx}
                      items={block.items}
                      onImageClick={setLightboxImage}
                      containerHeight={containerHeight - 48}
                    />
                  )
                }
              })}
            </div>

            {/* Left edge fade gradient - appears when scrolled */}
            {scrollProgress > 0.02 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 60,
                  background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.95))',
                  pointerEvents: 'none',
                  borderRadius: '16px 0 0 16px'
                }}
              />
            )}

            {/* Right edge fade gradient - scroll affordance */}
            {canScrollRight && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 80,
                  background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.95))',
                  pointerEvents: 'none',
                  borderRadius: '0 16px 16px 0'
                }}
              />
            )}
          </div>

          {/* Scroll indicator dots */}
          <div
            style={{
              position: 'fixed',
              left: 'calc(50% + 70px)',
              transform: 'translateX(-50%)',
              width: heroWidthClamp,
              top: `calc(${heroTop} + ${containerHeight / 2}px + 12px)`,
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              zIndex: 31
            }}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((threshold, idx) => (
              <div
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: scrollProgress >= threshold - 0.12 && scrollProgress <= threshold + 0.12
                    ? '#000'
                    : '#ccc',
                  transition: 'background 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Location + Notes - under the black container */}
                    {/* Metadata placement */}
          {!isMobile && isNarrowDesktop ? (
            <div
              style={{
                position: 'fixed',
                left: sideRailLeft,
                top: '220px',
                transform: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                fontFamily: 'var(--font-karla)',
                color: '#000',
                zIndex: 40,
                width: metadataWidth
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                  location
                </div>
                <div style={{ fontSize: 18, fontWeight: 200, letterSpacing: '-0.02em', marginTop: 12, lineHeight: 0.6, whiteSpace: 'pre-line', maxWidth: notesMaxWidth }}>
                  {currentProject?.location || '--'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                  notes
                </div>
                <div style={{ fontSize: 18, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4, maxWidth: notesMaxWidth }}>
                  {currentProject?.notes || '--'}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                position: 'fixed',
                left: 'calc(50% + 70px)',
                transform: 'translateX(-50%)',
                width: heroWidthClamp,
                top: `calc(${heroTop} + ${containerHeight / 2}px + 30px)`,
                display: 'flex',
                gap: 48,
                fontFamily: 'var(--font-karla)',
                color: '#000',
                zIndex: 40
              }}
            >
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                  location
                </div>
                <div style={{ fontSize: 20, fontWeight: 200, letterSpacing: '-0.02em', marginTop: 12, lineHeight: 0.6, whiteSpace: 'pre-line' }}>
                  {currentProject?.location || '--'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                  notes
                </div>
                <div style={{ fontSize: 20, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4, maxWidth: notesMaxWidth }}>
                  {currentProject?.notes || '--'}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close image"
          onClick={() => setLightboxImage(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setLightboxImage(null)
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={lightboxImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </div>
      )}

      {/* Notice toast */}
      {!isMobile && notice && (
        <div
          style={{
            position: 'fixed',
            top: 40,
            left: 140,
            zIndex: 60,
            background: '#000',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            fontFamily: 'var(--font-karla)',
            fontSize: 12,
            letterSpacing: '0.02em'
          }}
        >
          {notice}
        </div>
      )}

      {/* Tooltip */}
      {!isMobile && tooltip && (
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
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
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
    </div>
  )
}















