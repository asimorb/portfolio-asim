'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { MobileChrome } from '../../components/MobileChrome'
import { clearHomeLayout, getNavStackLength, popNavStack, pushNavStack } from '../../components/navState'
import { useMediaQuery } from '../../components/useMediaQuery'
import { thingsProjects as spacesProjects } from './data'

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
          <div
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              left: `calc(26vw - ${panelOffset.left}px)`,
              top: `calc(52vh - ${panelOffset.top}px)`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent)',
              opacity: 0.9,
              filter: 'blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg))',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              left: `calc(20vw - ${panelOffset.left}px)`,
              top: `calc(36vh - ${panelOffset.top}px)`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent)',
              opacity: 0.9,
              filter: 'blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))',
              pointerEvents: 'none'
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%22120%22%20viewBox=%220%200%20120%20120%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%222%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22120%22%20height=%22120%22%20filter=%22url(%23n)%22/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '120px 120px',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
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
                  textAlign: 'right',
                  transform: 'translateY(7px)'
                }}
              >
                {cat.name}
              </button>
              <div
                style={{
                  height: '2px',
                  width: '100%',
                  background: '#000',
                  opacity: 0.7
                }}
              />
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
  const [overlayImageLoaded, setOverlayImageLoaded] = useState(true)
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
  const [enlargedImage, setEnlargedImage] = useState(null)
  const [enlargedZoomed, setEnlargedZoomed] = useState(false)
  const [enlargedOffset, setEnlargedOffset] = useState({ x: 0, y: 0 })
  const enlargedDragRef = useRef(null)
  const overlaySwipeRef = useRef(null)
  const overlayDragActiveRef = useRef(false)
  const [overlayDragY, setOverlayDragY] = useState(0)
  const [overlayDragTransition, setOverlayDragTransition] = useState('transform 200ms ease')

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

  const handleOverlaySwipeStart = (e) => {
    const touch = e.touches?.[0]
    if (!touch) return
    overlaySwipeRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() }
    overlayDragActiveRef.current = true
    setOverlayDragTransition('none')
  }

  const handleOverlaySwipeMove = (e) => {
    if (!overlaySwipeRef.current || !overlayDragActiveRef.current) return
    const touch = e.touches?.[0]
    if (!touch) return
    const dx = touch.clientX - overlaySwipeRef.current.x
    const dy = touch.clientY - overlaySwipeRef.current.y
    if (Math.abs(dy) < Math.abs(dx) + 10) return
    const limited = Math.max(-140, Math.min(140, dy))
    setOverlayDragY(limited)
  }

  const handleOverlaySwipeEnd = (e) => {
    if (!overlaySwipeRef.current) return
    const touch = e.changedTouches?.[0]
    if (!touch) {
      overlaySwipeRef.current = null
      overlayDragActiveRef.current = false
      setOverlayDragTransition('transform 200ms ease')
      setOverlayDragY(0)
      return
    }
    const startPt = overlaySwipeRef.current
    const dx = touch.clientX - startPt.x
    const dy = touch.clientY - startPt.y
    const dt = Math.max(1, Date.now() - (startPt.t || Date.now()))
    const velocityY = (dy / dt) * 1000
    overlaySwipeRef.current = null
    let handled = false
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 60) {
      const fast = Math.abs(velocityY) > 900
      setOverlayDragTransition(fast ? 'transform 160ms ease-out' : 'transform 260ms ease')
      const direction = dy < 0 ? 1 : -1
      const nextIdx = overlayProject
        ? direction > 0
          ? (overlayProject.idx + 1) % spacesProjects.length
          : (overlayProject.idx - 1 + spacesProjects.length) % spacesProjects.length
        : null
      if (nextIdx !== null) {
        const nextProject = spacesProjects[nextIdx]
        setOverlayDragY(direction < 0 ? 30 : -30)
        setTimeout(() => {
          setOverlayDragY(0)
          setOverlayDragTransition('transform 200ms ease')
        }, fast ? 160 : 260)
        handleOpenOverlay(nextProject, nextIdx, null, 'gallery', 0)
        handled = true
      }
    }
    if (!handled) {
      setOverlayDragTransition('transform 200ms ease')
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) && overlayGallery.length) {
        if (dx < -40) {
          setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
        } else if (dx > 40) {
          setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
        }
      }
      setOverlayDragY(0)
    }
    overlayDragActiveRef.current = false
  }

  const handleOverlayKeyDown = (e) => {
    if (!overlayProject) return
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCloseOverlay()
      return
    }
    if (e.key === 'ArrowLeft' && overlayGallery.length) {
      e.preventDefault()
      setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
      return
    }
    if (e.key === 'ArrowRight' && overlayGallery.length) {
      e.preventDefault()
      setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const direction = e.key === 'ArrowUp' ? -1 : 1
      const nextIdx = (overlayProject.idx + direction + spacesProjects.length) % spacesProjects.length
      const nextProject = spacesProjects[nextIdx]
      handleOpenOverlay(nextProject, nextIdx, null, 'gallery', 0)
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
  const firstVisibleImage = (gallery = []) => gallery.find((img) => !img?.hideThumb)
  const getObjectPosition = (img, variant = 'thumb') => {
    if (!img) return '50% 50%'
    if (variant === 'overlay') return img.overlayPosition || img.thumbPosition || '50% 50%'
    return img.thumbPosition || '50% 50%'
  }
  const getImageSrc = (img, variant = 'overlay') => {
    if (!img) return null
    if (variant === 'thumb') return img?.thumbSrc || img?.src || null
    return img?.overlaySrc || img?.src || null
  }
  const selectThumb = (project) => {
    const gallery = project?.gallery || []
    const withSrc = gallery.filter((img) => !img?.hideThumb && !img?.skipThumb && getImageSrc(img, 'thumb'))
    if (withSrc.length) return withSrc[Math.floor(Math.random() * withSrc.length)]
    const fallback = gallery.find((img) => !img?.hideThumb && !img?.skipThumb)
    return fallback || gallery[0] || null
  }
  const projectThumbs = useMemo(() => {
    const map = {}
    spacesProjects.forEach((proj) => {
      map[proj.slug] = selectThumb(proj)
    })
    return map
  }, [spacesProjects])
  const getThumbFor = (project) => {
    const cached = projectThumbs[project.slug]
    if (cached && !cached?.skipThumb && !cached?.hideThumb) return cached
    return selectThumb(project)
  }

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
    const heroSlideOffset = 80
    const defaultOverlayWidth = Math.min(540, window.innerWidth * 0.55)
    const defaultOverlayHeight = defaultOverlayWidth * 1.25
    const heroLeftMargin = (window.innerWidth - defaultOverlayWidth) / 2 - 50 + heroSlideOffset
    const start = rect
      ? {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          borderRadius: 8
        }
      : overlayStyle || {
          width: defaultOverlayWidth,
          height: defaultOverlayHeight,
          top: window.innerHeight * 0.2,
          left: heroLeftMargin,
          borderRadius: 8
        }

    const gallery = shuffle(buildGallery(project))
    const firstAllowed = gallery.findIndex((img) => !img?.skipThumb && !img?.hideThumb && getImageSrc(img, 'overlay'))
    const fallbackAllowed = gallery.findIndex((img) => !img?.skipThumb && !img?.hideThumb)
    const startIndex =
      imageIndex > 0
        ? imageIndex
        : firstAllowed !== -1
        ? firstAllowed
        : fallbackAllowed !== -1
        ? fallbackAllowed
        : 0

    setOverlayProject({ ...project, idx })
    setOverlayGallery(gallery)
    setActiveImageIndex(startIndex)
    setNavMode(mode)
    setOverlayStyle(start)
    setOverlayMetaVisible(false)

    requestAnimationFrame(() => {
      const targetWidth = defaultOverlayWidth
      const targetHeight = defaultOverlayHeight
      const targetLeft = heroLeftMargin
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

  useEffect(() => {
    if (getImageSrc(overlayGallery[activeImageIndex], 'overlay')) {
      setOverlayImageLoaded(false)
    } else {
      setOverlayImageLoaded(true)
    }
  }, [activeImageIndex, overlayGallery])

  if (!hasMounted) return null

  return (
    <div
      onTouchStart={handleSwipeTouchStart}
      onTouchEnd={handleSwipeTouchEnd}
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
                navigateWithFade(sub === 'spaces' ? '/make/spaces' : '/make/things')
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
            { name: 'connect', subcategories: ['cv', 'about me'] }
          ]}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={(sub, category) => {
            setActiveMenuCategory(category)
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              navigateWithFade(sub === 'spaces' ? '/make/spaces' : '/make/things')
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
            if (category === 'connect' && (sub === 'cv' || sub === 'about me')) {
              const slug = sub === 'cv' ? 'curriculum-vitae' : 'about-me'
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
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-karla)',
            zIndex: 220,
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
              marginRight: isMobile ? '24px' : '0',
              alignSelf: 'flex-end',
              justifySelf: 'end',
              position: isMobile ? 'fixed' : 'static',
              right: isMobile ? '20px' : undefined,
              bottom: isMobile ? '75px' : undefined
            }}>
              This selection includes works from various stages of my career. My architectural practice has been a blend of freelance commissions and collaborative studio projects, spanning from two thousand and eight to the present.
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
                ? (projectGrid.length ? projectGrid : spacesProjects.map((proj) => ({ project: proj, size: 'small' })))
                : spacesProjects
              ).map((entry, idx) => {
                const project = isMobile ? entry.project : entry
                const projIdx = spacesProjects.findIndex((p) => p.slug === project.slug)
                const isActive = overlayProject?.slug === project.slug
                const span = isMobile && entry.size === 'large' ? 2 : 1
                const aspectRatio = isMobile ? null : (project.aspectRatio || (idx % 2 === 0 ? '4 / 3' : '3 / 4'))
                const thumb = getThumbFor(project)
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
                        background: getImageSrc(thumb, 'thumb')
                          ? '#f5f5f5'
                          : `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                        borderRadius: '6px',
                        border: isActive ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {getImageSrc(thumb, 'thumb') && (
                        <img
                          src={getImageSrc(thumb, 'thumb')}
                          alt={project.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: getObjectPosition(thumb, 'thumb'),
                            display: 'block'
                          }}
                        />
                      )}
                      {isMobile && (
                        <span style={{ position: 'absolute', left: '6px', top: '6px', fontSize: '10px', fontWeight: 700, color: getImageSrc(thumb, 'thumb') ? '#fff' : '#000', textShadow: getImageSrc(thumb, 'thumb') ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>
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
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
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
            onKeyDown={handleOverlayKeyDown}
            aria-label="Overlay backdrop, click to close"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                flex: '1 1 auto',
                transform: `translateY(${overlayDragY}px)`,
                transition: overlayDragTransition
              }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => { e.stopPropagation(); handleOverlaySwipeStart(e) }}
              onTouchMove={(e) => { e.stopPropagation(); handleOverlaySwipeMove(e) }}
              onTouchEnd={(e) => { e.stopPropagation(); handleOverlaySwipeEnd(e) }}
            >
              <div
                style={{
                flex: '0 0 66%',
                position: 'relative',
                background: getImageSrc(overlayGallery[activeImageIndex], 'overlay')
                  ? '#f5f5f5'
                  : overlayGallery[activeImageIndex]
                  ? `linear-gradient(135deg, ${paletteForIndex(activeImageIndex)} 0%, #fffdf3 100%)`
                  : `linear-gradient(135deg, ${paletteForIndex(overlayProject.idx)} 0%, #fffdf3 100%)`,
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '14px 14px 0 0',
                overflow: 'hidden',
                marginBottom: '0px',
                cursor: getImageSrc(overlayGallery[activeImageIndex], 'overlay') ? 'zoom-in' : 'default'
              }}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                if (getImageSrc(overlayGallery[activeImageIndex], 'overlay')) {
                  setEnlargedZoomed(false)
                  setEnlargedOffset({ x: 0, y: 0 })
                  setEnlargedImage(getImageSrc(overlayGallery[activeImageIndex], 'overlay'))
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && getImageSrc(overlayGallery[activeImageIndex], 'overlay')) {
                  e.preventDefault()
                  setEnlargedImage(getImageSrc(overlayGallery[activeImageIndex], 'overlay'))
                }
              }}
            >
              {getImageSrc(overlayGallery[activeImageIndex], 'overlay') && (
                <img
                  src={getImageSrc(overlayGallery[activeImageIndex], 'overlay')}
                  alt={overlayGallery[activeImageIndex].label || `${overlayProject.title} image ${activeImageIndex + 1}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: getObjectPosition(overlayGallery[activeImageIndex], 'overlay')
                  }}
                />
              )}
              {overlayGallery.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '10px',
                    right: '10px',
                    bottom: '10px',
                    padding: '0px 4px',
                    borderRadius: '999px',
                    background: 'rgba(255, 253, 243, 0.94)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {overlayGallery.length > 1 && (
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImageIndex((prev) => (prev - 1 + overlayGallery.length) % overlayGallery.length)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                      </svg>
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }} role="group" aria-label="Image selector">
                    {overlayGallery.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        aria-label={`Go to image ${idx + 1} of ${overlayGallery.length}`}
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx) }}
                        onFocus={(e) => showTooltip(`Image ${idx + 1}`, e)}
                        onBlur={hideTooltip}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: idx === activeImageIndex ? '#000' : 'rgba(0,0,0,0.25)',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                  {overlayGallery.length > 1 && (
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImageIndex((prev) => (prev + 1) % overlayGallery.length)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1f1f1f" aria-hidden="true">
                        <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div
              style={{
                flex: '1 1 34%',
                height: '34%',
                maxHeight: '36%',
                padding: '16px 16px 12px',
                background: '#FFFDF3',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '0 0 14px 14px',
                fontFamily: 'var(--font-karla)',
                color: '#000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
                overflow: 'hidden',
                marginTop: '0px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const titleSize = 10
                const valueSize = 20
                const letterSpacing = '-0.02em'
                return (
                  <div
                    style={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      gridAutoColumns: '100%',
                      gap: '12px',
                      overflowX: 'auto',
                      scrollSnapType: 'x mandatory',
                      touchAction: 'pan-x',
                      marginTop: '0px',
                      paddingBottom: '4px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        scrollSnapAlign: 'start',
                        overflowY: 'auto',
                        paddingRight: '4px',
                        marginTop: '0px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-2px' }}>project</div>
                        <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing }}>{overlayProject.title}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: titleSize, fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-2px' }}>notes</div>
                        <div style={{ fontSize: valueSize, fontWeight: 200, letterSpacing, lineHeight: '22px' }}>{overlayProject.notes}</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
            </div>
        ) : (
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'transparent',
              zIndex: 200,
              opacity: 1,
              transition: 'opacity 240ms ease'
            }}
            onClick={handleCloseOverlay}
            onKeyDown={handleOverlayKeyDown}
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
                background: getImageSrc(overlayGallery[activeImageIndex], 'overlay')
                  ? '#f5f5f5'
                  : overlayGallery[activeImageIndex]
                  ? `linear-gradient(135deg, ${paletteForIndex(activeImageIndex)} 0%, #fffdf3 100%)`
                  : `linear-gradient(135deg, ${paletteForIndex(overlayProject.idx)} 0%, #fffdf3 100%)`,
                border: '1px solid rgba(0,0,0,0.15)',
                boxShadow: overlayStyle.boxShadow || 'none',
                transition: overlayStyle.transition,
                overflow: 'hidden',
                pointerEvents: 'auto',
                cursor: getImageSrc(overlayGallery[activeImageIndex], 'overlay') ? 'zoom-in' : 'default'
              }}
              aria-live="polite"
              aria-label={`Image ${activeImageIndex + 1} of ${overlayGallery.length || 1} for ${overlayProject.title}`}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                if (getImageSrc(overlayGallery[activeImageIndex], 'overlay')) {
                  setEnlargedImage(getImageSrc(overlayGallery[activeImageIndex], 'overlay'))
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && getImageSrc(overlayGallery[activeImageIndex], 'overlay')) {
                  e.preventDefault()
                  setEnlargedImage(getImageSrc(overlayGallery[activeImageIndex], 'overlay'))
                }
              }}
            >
              {getImageSrc(overlayGallery[activeImageIndex], 'overlay') && (
                <img
                  src={getImageSrc(overlayGallery[activeImageIndex], 'overlay')}
                  alt={overlayGallery[activeImageIndex].label || `${overlayProject.title} image ${activeImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: getObjectPosition(overlayGallery[activeImageIndex], 'overlay'),
                    display: 'block'
                  }}
                />
              )}
            </div>

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
                gap: '12px',
                pointerEvents: 'none'
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
                    gridAutoColumns: '50px',
                    gap: '6px',
                    maxWidth: '50%',
                    pointerEvents: 'auto'
                  }}
                >
                  {overlayGallery.map((img, idx) => (
                    <button
                      key={`meta-thumb-${idx}`}
                      type="button"
                      onClick={() => { setActiveImageIndex(idx); setNavMode('gallery') }}
                      onMouseEnter={(e) => showTooltip(`Image ${idx + 1}`, e)}
                      onMouseLeave={hideTooltip}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        background: img.src ? '#f5f5f5' : `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                        borderRadius: '6px',
                        border: idx === activeImageIndex ? '2px solid #000' : '1px solid rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                        padding: 0,
                        overflow: 'hidden'
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {img.src && (
                        <img
                          src={getImageSrc(img, 'thumb')}
                          alt={img.label || `Image ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: getObjectPosition(img, 'overlay'),
                            display: 'block'
                          }}
                        />
                      )}
                      {!img.src && (
                        <span style={{ position: 'absolute', left: '2px', top: '2px', fontSize: '8px', fontWeight: 700, color: '#000' }}>{img.label || idx + 1}</span>
                      )}
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
                  const thumb = getThumbFor(proj)
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
                      background: getImageSrc(thumb, 'thumb') ? '#f5f5f5' : `linear-gradient(135deg, ${paletteForIndex(idx)} 0%, #fffdf3 100%)`,
                      borderRadius: '6px',
                      border: isActive ? '2px solid #000' : '1px solid rgba(0,0,0,0.12)',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      overflow: 'hidden'
                    }}
                  >
                    {getImageSrc(thumb, 'thumb') && (
                      <img
                        src={getImageSrc(thumb, 'thumb')}
                        alt={proj.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: getObjectPosition(thumb, 'thumb'),
                          display: 'block'
                        }}
                      />
                    )}
                    <span style={{ position: 'absolute', left: '6px', top: '6px', fontSize: '10px', fontWeight: 700, color: proj.gallery?.[0]?.src ? '#fff' : '#000', textShadow: proj.gallery?.[0]?.src ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>{idx + 1}</span>
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
                    top: overlayStyle.top + overlayStyle.height - 48,
                    transform: 'translateY(-50%)',
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
                    top: overlayStyle.top + overlayStyle.height - 48,
                    transform: 'translateY(-50%)',
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

      {enlargedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isMobile ? '#000' : 'rgba(0, 0, 0, 0.9)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => { setEnlargedZoomed(false); setEnlargedOffset({ x: 0, y: 0 }); setEnlargedImage(null) }}
          aria-label="Enlarged image view, click to close"
        >
          <img
            src={enlargedImage}
            alt="Enlarged view"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              transform: `translate(${enlargedOffset.x}px, ${enlargedOffset.y}px) scale(${enlargedZoomed ? 1.8 : 1})`,
              transition: enlargedDragRef.current ? 'none' : 'transform 160ms ease',
              cursor: enlargedZoomed ? 'grab' : 'zoom-in',
              touchAction: enlargedZoomed ? 'none' : 'auto'
            }}
            onClick={(e) => { e.stopPropagation(); setEnlargedZoomed((z) => { const next = !z; if (next) setEnlargedOffset({ x: 0, y: 0 }); return next }) }}
            onMouseDown={(e) => { if (!enlargedZoomed) return; enlargedDragRef.current = { startX: e.clientX, startY: e.clientY, baseX: enlargedOffset.x, baseY: enlargedOffset.y }; e.preventDefault() }}
            onMouseMove={(e) => { if (!enlargedZoomed || !enlargedDragRef.current) return; const dx = e.clientX - enlargedDragRef.current.startX; const dy = e.clientY - enlargedDragRef.current.startY; setEnlargedOffset({ x: enlargedDragRef.current.baseX + dx, y: enlargedDragRef.current.baseY + dy }) }}
            onMouseUp={() => { enlargedDragRef.current = null }}
            onMouseLeave={() => { enlargedDragRef.current = null }}
            onTouchStart={(e) => { if (!enlargedZoomed) return; const t = e.touches?.[0]; if (!t) return; enlargedDragRef.current = { startX: t.clientX, startY: t.clientY, baseX: enlargedOffset.x, baseY: enlargedOffset.y }; }}
            onTouchMove={(e) => { if (!enlargedZoomed || !enlargedDragRef.current) return; const t = e.touches?.[0]; if (!t) return; const dx = t.clientX - enlargedDragRef.current.startX; const dy = t.clientY - enlargedDragRef.current.startY; setEnlargedOffset({ x: enlargedDragRef.current.baseX + dx, y: enlargedDragRef.current.baseY + dy }); e.preventDefault() }}
            onTouchEnd={() => { enlargedDragRef.current = null }}
          />
        </div>
      )}
    </div>
  )
}