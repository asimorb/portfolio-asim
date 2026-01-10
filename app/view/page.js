'use client'
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../components/TransformChrome'
import { MobileChrome } from '../components/MobileChrome'
import { clearHomeLayout, pushNavStack } from '../components/navState'
import { useMediaQuery } from '../components/useMediaQuery'

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

const MobileMenuOverlay = ({
  categories,
  open,
  onClose,
  onNavigate,
  glowFilter,
  activeMenuCategory,
  setActiveMenuCategory
}) => {
  const lineWidth = '220px'
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

  const panelScale = closing || !animatingIn ? 'scaleY(0.001)' : 'scaleY(1)'
  const panelOpacity = closing ? 0 : 1
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'transparent',
        backdropFilter: 'none',
        zIndex: 90,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 200ms ease'
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          minWidth: lineWidth,
          maxWidth: '80%',
          background: 'transparent',
          borderRadius: 0,
          boxShadow: 'none',
          padding: '12px 0px 18px',
          fontFamily: 'var(--font-karla)',
          color: '#000',
          alignSelf: 'flex-end',
          position: 'relative',
          right: '20px',
          bottom: 'calc(65px + env(safe-area-inset-bottom, 0px))',
          transformOrigin: 'bottom right',
          transform: panelScale,
          opacity: panelOpacity,
          transition: 'transform 200ms ease, opacity 200ms ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: 8,
            height: '350px',
            width: '0px',
            background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)',
            opacity: 0.8,
            pointerEvents: 'none'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', alignItems: 'flex-end', paddingRight: '0px', minWidth: lineWidth }}>
          {categories.map((category) => {
            const isActive = activeMenuCategory === category.name
            const titleStyle = {
              fontSize: '20px',
              fontWeight: 700,
              textTransform: 'lowercase',
              cursor: 'default',
              color: isActive ? '#FDABD3' : '#000',
              filter: isActive ? glowFilter : 'none',
              transition: 'color 0.2s ease',
              textAlign: 'right'
            }
            return (
              <div key={category.name} style={{ display: 'flex', flexDirection: 'column', gap: '0px', alignItems: 'flex-end' }}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={category.name}
                  style={titleStyle}
                  onClick={() => {
                    setActiveMenuCategory(category.name)
                    onNavigate(category.name, category.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveMenuCategory(category.name)
                      onNavigate(category.name, category.name)
                    }
                  }}
                >
                  {category.name}
                </div>
                <div style={{ height: '0px', borderBottom: '2px solid #000', width: lineWidth, margin: '2px 0 6px' }} />
                <div style={{ display: 'flex', flexDirection: 'row', gap: '28px', paddingLeft: '0px', paddingRight: '0px', alignItems: 'flex-end', width: lineWidth, justifyContent: 'flex-end' }}>
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      aria-label={`Open ${sub}`}
                      onClick={() => onNavigate(sub, category.name)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '0',
                        fontSize: '16px',
                        fontWeight: 400,
                        textAlign: 'right',
                        textTransform: 'lowercase',
                        color: '#000',
                        cursor: 'pointer'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                <div style={{ height: '14px' }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =========================
// TOP BAR COMPONENT
// =========================
// =========================
// MAIN PAGE (ROTATE TRANSFORM)
// =========================
export default function ViewPage() {
  const selectedLetterKey = 'alif'
  const letterMap = {
    alif: { arabic: '\u0627', label: 'view' }
  }
  const selectedLetter = letterMap[selectedLetterKey]

  // Chrome state
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [showDragHint, setShowDragHint] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [pageOpacity, setPageOpacity] = useState(0)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [swipeStart, setSwipeStart] = useState(null)
  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)
  const mobileMenuTimerRef = useRef(null)

  // Rotate state (single-stage)
  const [letterPosition, setLetterPosition] = useState(null)
  const [gridDots, setGridDots] = useState([])
  const [minorGridDots, setMinorGridDots] = useState([])
  const [letterAngle, setLetterAngle] = useState(0)
  const [isDraggingRotate, setIsDraggingRotate] = useState(false)
  const isDraggingRotateRef = useRef(false)
  const [timeInZone, setTimeInZone] = useState(0)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [whiskerHovered, setWhiskerHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState(null)
  const [targetAngles, setTargetAngles] = useState([])

  // Layout constants
  const letterSize = isMobile ? 170 : 200
  const letterGlyphOffsetY = isMobile ? -30 : 0
  const gridSpacing = 100
  const minorGridSpacing = 50
  const centerOffsetX = 0
  const centerOffsetY = 0
  const whiskerLength = isMobile ? 200 : 260
  const whiskerOffset = -30

  const stickyZone = 15
  const snapZone = 5
  const angularThreshold = 10
  const dwellMs = 250
  const mobileSubnav = [
    { label: 'speculations', href: '/view/speculations' },
    { label: 'images', href: '/view/images' }
  ]

  // Derived
  const letterCenterX = letterPosition ? letterPosition.x + letterSize / 2 + centerOffsetX : 0
  const letterCenterY = letterPosition ? letterPosition.y + letterSize / 2 + centerOffsetY : 0
  const whiskerAngle = (letterAngle + whiskerOffset + 360) % 360
  const whiskerEndX = letterCenterX + Math.cos(whiskerAngle * Math.PI / 180) * whiskerLength
  const whiskerEndY = letterCenterY + Math.sin(whiskerAngle * Math.PI / 180) * whiskerLength

  // Helpers
  function calculateAngle(cx, cy, px, py) {
    const angle = Math.atan2(py - cy, px - cx) * 180 / Math.PI
    return (angle + 360) % 360
  }
  function getAngularDistance(a1, a2) {
    let diff = a2 - a1
    while (diff > 180) diff -= 360
    while (diff < -180) diff += 360
    return diff
  }
  function applyMagneticForce(angle, target) {
    const distance = Math.abs(getAngularDistance(angle, target))
    if (distance <= snapZone) return target
    if (distance <= stickyZone) {
      const strength = 1 - (distance - snapZone) / (stickyZone - snapZone)
      const diff = getAngularDistance(angle, target)
      return angle + diff * strength * 0.3
    }
    return angle
  }
  const normalizeAngle = (angle) => {
    const normalized = angle % 360
    return normalized < 0 ? normalized + 360 : normalized
  }

  // Position from URL (desktop) or centered (mobile)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isMobile) {
      setLetterPosition({ x: window.innerWidth / 2 - letterSize / 2, y: window.innerHeight / 2 - letterSize / 2 })
      return
    }
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      setLetterPosition({ x: parseFloat(posX), y: parseFloat(posY) })
    } else {
      setLetterPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })
    }
  }, [isMobile, letterSize])

  // Clamp letter position on mobile so whisker + labels stay on-canvas
  useEffect(() => {
    if (!isMobile) return
    setLetterPosition({ x: window.innerWidth / 2 - letterSize / 2, y: window.innerHeight / 2 - letterSize / 2 })
  }, [isMobile, letterSize])

  // Grid + targets after position
  useEffect(() => {
    if (!letterPosition) return
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const dots = []
    for (let x = 0; x <= windowWidth; x += gridSpacing) {
      for (let y = 0; y <= windowHeight; y += gridSpacing) {
        dots.push({ x, y })
      }
    }
    setGridDots(dots)
    const minorDots = []
    for (let x = 0; x <= windowWidth; x += minorGridSpacing) {
      for (let y = 0; y <= windowHeight; y += minorGridSpacing) {
        if (x % gridSpacing !== 0 || y % gridSpacing !== 0) {
          minorDots.push({ x, y })
        }
      }
    }
    setMinorGridDots(minorDots)

    // Two targets (speculations/images) with spacing
    const initialWhiskerAngle = normalizeAngle(whiskerOffset) // whiskerAngle when letterAngle starts at 0
    const minFromWhisker = 30
    let angle1 = Math.random() * 360
    while (Math.abs(getAngularDistance(angle1, initialWhiskerAngle)) < minFromWhisker) {
      angle1 = Math.random() * 360
    }
    let angle2 = Math.random() * 360
    while (
      Math.abs(getAngularDistance(angle1, angle2)) < 60 ||
      Math.abs(getAngularDistance(angle2, initialWhiskerAngle)) < minFromWhisker
    ) {
      angle2 = Math.random() * 360
    }
    const labels = ['speculations', 'images'].sort(() => Math.random() - 0.5)
    setTargetAngles([
      { angle: angle1, label: labels[0] },
      { angle: angle2, label: labels[1] }
    ])
  }, [letterPosition, whiskerOffset])

  // Tooltip helpers
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

  // Hover expand timers
  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    if (hoveredElement && ['make', 'view', 'reflect', 'connect'].includes(hoveredElement)) {
      expandTimerRef.current = setTimeout(() => setExpandedCategory(hoveredElement), 300)
    } else if (expandedCategory) {
      collapseTimerRef.current = setTimeout(() => setExpandedCategory(null), 500)
    }
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [hoveredElement, expandedCategory])

  // Reading mode toggle
  const toggleReadingMode = () => {
    setHoveredElement(null)
    setExpandedCategory(null)
    setReadingMode((prev) => {
      const next = !prev
      const label = next ? 'READING MODE ON' : 'READING MODE OFF'
      setNotice(label)
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
      noticeTimerRef.current = setTimeout(() => setNotice(null), 2500)
      return next
    })
  }
  useEffect(() => () => { if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current) }, [])

  // Dwell timer for targets
  useEffect(() => {
    if (targetAngles.length !== 2) return
    let interval
    const dist1 = Math.abs(getAngularDistance(whiskerAngle, targetAngles[0].angle))
    const dist2 = Math.abs(getAngularDistance(whiskerAngle, targetAngles[1].angle))
    const isWithin1 = dist1 <= angularThreshold
    const isWithin2 = dist2 <= angularThreshold

    if (isWithin1 || isWithin2) {
      const targetObj = isWithin1 ? targetAngles[0] : targetAngles[1]
      interval = setInterval(() => {
        setTimeInZone((prev) => {
          const next = prev + 100
          if (next >= dwellMs) {
            setNavigatingTo(targetObj.label)
            return prev
          }
          return next
        })
      }, 100)
    } else {
      setTimeInZone(0)
    }

    return () => clearInterval(interval)
  }, [whiskerAngle, targetAngles])

  // Drag handlers
  const handleWhiskerMouseDown = (e) => {
    setIsDraggingRotate(true)
    isDraggingRotateRef.current = true
    e.stopPropagation()
  }
  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
    if (!isDraggingRotate) return
    const mouseAngle = calculateAngle(letterCenterX, letterCenterY, e.clientX, e.clientY)
    const desiredLetterAngle = normalizeAngle(mouseAngle - whiskerOffset)
    let magneticLetterAngle = desiredLetterAngle
    if (targetAngles.length === 2) {
      const target1 = targetAngles[0].angle - whiskerOffset
      const target2 = targetAngles[1].angle - whiskerOffset
      const dist1 = Math.abs(getAngularDistance(desiredLetterAngle, target1))
      const dist2 = Math.abs(getAngularDistance(desiredLetterAngle, target2))
      const closestTarget = dist1 < dist2 ? target1 : target2
      magneticLetterAngle = applyMagneticForce(desiredLetterAngle, closestTarget)
    }
    setLetterAngle(normalizeAngle(magneticLetterAngle))
  }
  const handleMouseUp = () => {
    if (isDraggingRotate && targetAngles.length === 2) {
      const dist1 = Math.abs(getAngularDistance(whiskerAngle, targetAngles[0].angle))
      const dist2 = Math.abs(getAngularDistance(whiskerAngle, targetAngles[1].angle))
      if (dist1 <= snapZone) setLetterAngle(normalizeAngle(targetAngles[0].angle - whiskerOffset))
      else if (dist2 <= snapZone) setLetterAngle(normalizeAngle(targetAngles[1].angle - whiskerOffset))
    }
    setIsDraggingRotate(false)
    isDraggingRotateRef.current = false
  }

  const handleWhiskerTouchStart = (e) => {
    const touch = e.touches[0]
    if (!touch) return
    setIsDraggingRotate(true)
    isDraggingRotateRef.current = true
    e.stopPropagation()
    e.preventDefault()
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleWhiskerTouchMove = (e) => {
    if (!isDraggingRotate) return
    const touch = e.touches[0]
    if (!touch) return
    e.stopPropagation()
    e.preventDefault()
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleWhiskerTouchEnd = (e) => {
    e.stopPropagation()
    e.preventDefault()
    handleMouseUp()
  }

  useEffect(() => {
    const handleTouchEndGlobal = () => { setIsDraggingRotate(false); isDraggingRotateRef.current = false }
    window.addEventListener('touchend', handleTouchEndGlobal, { passive: false })
    return () => window.removeEventListener('touchend', handleTouchEndGlobal)
  }, [])

  const handleLetterMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
    e.stopPropagation()
  }

  // Arc helper
  const createArcPath = (cx, cy, r, startAngle, endAngle) => {
    const start = { x: cx + r * Math.cos(startAngle * Math.PI / 180), y: cy + r * Math.sin(startAngle * Math.PI / 180) }
    const end = { x: cx + r * Math.cos(endAngle * Math.PI / 180), y: cy + r * Math.sin(endAngle * Math.PI / 180) }
    const diff = getAngularDistance(startAngle, endAngle)
    const largeArc = Math.abs(diff) > 180 ? 1 : 0
    const sweep = diff > 0 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`
  }

  // Visual state
  let furthestTargetAngle = targetAngles.length === 2 ? (Math.abs(getAngularDistance(whiskerAngle, targetAngles[0].angle)) > Math.abs(getAngularDistance(whiskerAngle, targetAngles[1].angle)) ? targetAngles[0].angle : targetAngles[1].angle) : whiskerAngle
  const isAnySubAngleHovered = targetAngles.length === 2 && targetAngles.some((angleObj) => Math.abs(getAngularDistance(whiskerAngle, angleObj.angle)) <= angularThreshold)
  const isAtTarget = targetAngles.length === 2 && (
    Math.abs(getAngularDistance(whiskerAngle, targetAngles[0].angle)) <= angularThreshold ||
    Math.abs(getAngularDistance(whiskerAngle, targetAngles[1].angle)) <= angularThreshold
  )

  // Fade-in + glow offset
  useEffect(() => {
      setHasMounted(true)
      setTimeout(() => setPageOpacity(1), 30)
    const { delaySeconds } = syncGlowOffset()
    setGlowDelaySeconds(delaySeconds)
    }, [])

  useEffect(() => {
    if (!navigatingTo) return undefined
    const timer = setTimeout(() => {
      window.location.href = `/${navigatingTo}`
    }, 300)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  useEffect(() => {
    const handleWindowMouseUp = () => { setIsDraggingRotate(false); isDraggingRotateRef.current = false }
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => window.removeEventListener('mouseup', handleWindowMouseUp)
  }, [])

  useEffect(() => {
    if (hintShownRef.current) return
    hintShownRef.current = true
    const showTimer = setTimeout(() => setShowDragHint(true), 500)
    const hideTimer = setTimeout(() => setShowDragHint(false), 2000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    if (!isMobile || readingMode) return undefined
    const key = 'swipeHintViewShown'
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

  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    setMobileMenuOpen(false)
    const target = path.startsWith('/') ? path : `/${path}`
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
      pushNavStack(window.location.pathname + window.location.search)
    }
    window.location.href = target
  }

  const handleSwipeTouchStart = (e) => {
    if (readingMode || isDraggingRotateRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    setSwipeStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleSwipeTouchEnd = (e) => {
    if (readingMode || isDraggingRotateRef.current) return
    if (!swipeStart) return
    const touch = e.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - swipeStart.x
    const dy = touch.clientY - swipeStart.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    setSwipeStart(null)
    if (absX < 50 || absX < absY) return
    if (dx < -50) {
      navigateWithFade('/reflect')
    } else if (dx > 50) {
      navigateWithFade('/make')
    }
  }

  const analyticsText = targetAngles.length === 2
    ? `ANGLE ${Math.round(whiskerAngle)}\u00B0`
    : ''

  if (!hasMounted || !letterPosition) return null

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleSwipeTouchStart}
      onTouchEnd={handleSwipeTouchEnd}
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        cursor: isDraggingRotate ? 'grabbing' : 'default',
        userSelect: isDraggingRotate ? 'none' : 'auto',
        overflow: 'hidden',
        animation: 'glowHue 60s linear infinite',
        animationDelay: `-${glowDelaySeconds}s`,
        opacity: pageOpacity,
        transition: 'opacity 0.6s ease'
      }}
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.25); } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .glow-core-static { position: absolute; width: 160px; height: 160px; left: 20%; top: 36%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent); opacity: 0.7; filter: blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset))); pointer-events: none; z-index: 2; }
        .glow-core-transition { position: absolute; width: 500px; height: 500px; left: 30%; top: 58%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent); opacity: 0.6; filter: blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg)); pointer-events: none; z-index: 0; }
        .glow-core-intersection { position: absolute; width: 300px; height: 300px; left: 26%; top: 52%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent); opacity: 0.75; filter: blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg)); pointer-events: none; z-index: 1; }
      `}</style>

      <div className="glow-core-transition" />
      <div className="glow-core-intersection" />
      <div className="glow-core-static" />

      {!isMobile && (
        <>
          <TopBarTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} readingMode={readingMode} analyticsText={analyticsText} glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))" showTooltip={showTooltip} hideTooltip={hideTooltip} activePage="view" />
          <LeftPanelTransform readingMode={readingMode} toggleReadingMode={toggleReadingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} label="VIEW" labelTop={105} />
          <RightPanelTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} expandedCategory={expandedCategory} setExpandedCategory={setExpandedCategory} readingMode={readingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))" activePage="view" categories={[
            { name: 'view', subcategories: ['speculations', 'images'] },
            { name: 'make', subcategories: ['spaces', 'things'] },
            { name: 'reflect', subcategories: ['research', 'teaching'] },
            { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
          ]} onNavigate={(sub, category) => {
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              window.location.href = sub === 'things' ? '/make/things' : '/make/spaces'
            } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              window.location.href = `/view/${sub}`
            } else {
              window.location.href = `/${category}`
            }
          }} />
        </>
      )}

      {readingMode && isMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            padding: '110px 18px 120px',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontFamily: 'var(--font-karla)',
            color: '#000',
            overflowY: 'auto',
            pointerEvents: 'auto',
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              marginTop: '570px',
              marginRight: '25px',
              paddingBottom: '16px',
              fontSize: '28px',
              lineHeight: '26px',
              fontWeight: 300,
              maxWidth: '85%',
              textAlign: 'right',
              alignSelf: 'flex-end',
              pointerEvents: 'auto'
            }}
          >
            Visual inquiries from documentation to speculation. Photography and visual experiments, documenting realities while opening questions about possible futures.
          </div>
        </div>
      )}

      {isMobile && (
        <MobileChrome
          title="view"
          subnav={mobileSubnav}
          activeDot="view"
          bottomLabel=""
          readingMode={readingMode}
          onPrimaryAction={toggleReadingMode}
          primaryActive={readingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={() => navigateWithFade('/')}
          onNavigate={(key, href) => { navigateWithFade(href) }}
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          menuExpanded={mobileMenuOpen}
        />
      )}

      {!isMobile && notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
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

      {readingMode && !isMobile && (
        <>
          <div className="fixed left-30 top-120 max-w-sm" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '40px', fontWeight: 200, lineHeight: '40px', maxWidth: '400px', color: '#000' }}>
            Visual inquiries from documentation to speculation. Photography and visual experiments, documenting realities while opening questions about possible futures.
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', top: 120, right: 300, maxWidth: 250 }}>
            Looking is a form of making: framing, composing, speculating. Images document what is, but they also rehearse what could be. Each photograph, rendering, or sketch is a proposal — an argument about how the world might be seen. To view is to test hypotheses with our eyes, to surface patterns, and to spark the next question. Speculations and images here invite that loop of seeing, questioning, and seeing again.
          </div>
        </>
      )}

      <div className={`absolute inset-0 bg-white pointer-events-none ${navigatingTo ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 50, transition: 'opacity 2s ease-in-out', backgroundColor: '#FFFDF3' }} />
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
            setMobileMenuOpen(false)
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
        />
      )}

      {/* Arc fill toward furthest target */}
      {/* Target guides + labels */}
      {(() => {
        if (targetAngles.length !== 2) return null
        const labelSize = { width: 160, height: 40 }
        const pad = 16
        const placed = []
        const clampBox = (box) => {
          if (typeof window === 'undefined') return box
          const maxX = window.innerWidth - pad
          const maxY = window.innerHeight - pad
          return {
            x: Math.min(Math.max(box.x, pad), maxX - labelSize.width),
            y: Math.min(Math.max(box.y, pad), maxY - labelSize.height)
          }
        }
        const boxOverlap = (a, b) => !(a.x + labelSize.width < b.x || b.x + labelSize.width < a.x || a.y + labelSize.height < b.y || b.y + labelSize.height < a.y)
        const letterBox = {
          x: letterCenterX - letterSize / 2,
          y: letterCenterY - letterSize / 2,
          w: letterSize,
          h: letterSize
        }
        const overlapsLetter = (box) => !(box.x + labelSize.width < letterBox.x || letterBox.x + letterBox.w < box.x || box.y + labelSize.height < letterBox.y || letterBox.y + letterBox.h < box.y)

        const nodes = targetAngles.map((angleObj) => {
          const targetLineEndX = letterCenterX + Math.cos(angleObj.angle * Math.PI / 180) * whiskerLength
          const targetLineEndY = letterCenterY + Math.sin(angleObj.angle * Math.PI / 180) * whiskerLength
          const alongOffset = 6
          const perpOffset = 28
          const basePos = {
            x: targetLineEndX + Math.cos(angleObj.angle * Math.PI / 180) * alongOffset,
            y: targetLineEndY + Math.sin(angleObj.angle * Math.PI / 180) * alongOffset
          }
          const perp = { x: -Math.sin(angleObj.angle * Math.PI / 180), y: Math.cos(angleObj.angle * Math.PI / 180) }
          const candidates = [
            { x: basePos.x + perp.x * perpOffset, y: basePos.y + perp.y * perpOffset },
            { x: basePos.x - perp.x * perpOffset, y: basePos.y - perp.y * perpOffset }
          ]
          return { angleObj, targetLineEndX, targetLineEndY, candidates }
        })

        const labelNodes = nodes.map((node) => {
          let chosen = null
          node.candidates.forEach((cand, idx) => {
            const rawBox = { x: cand.x - labelSize.width / 2, y: cand.y - labelSize.height / 2 }
            const clamped = clampBox(rawBox)
            const overlapLetter = overlapsLetter(clamped)
            const overlapPlaced = placed.some((p) => boxOverlap(clamped, p))
            const score = (overlapLetter ? 1000 : 0) + (overlapPlaced ? 500 : 0) + idx * 10
            if (!chosen || score < chosen.score) {
              chosen = { box: clamped, score }
            }
          })
          placed.push(chosen.box)
          return { ...node, box: chosen.box }
        })

        return labelNodes.map((ln, index) => {
          const isWithinThis = Math.abs(getAngularDistance(whiskerAngle, ln.angleObj.angle)) <= angularThreshold
          return (
            <div key={index}>
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 3 }}>
                <line x1={letterCenterX} y1={letterCenterY} x2={ln.targetLineEndX} y2={ln.targetLineEndY} stroke="#FDABD3" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" style={{ filter: glowFilter }} />
                <circle cx={ln.targetLineEndX} cy={ln.targetLineEndY} r="8" fill="#FDABD3" className="pulse-dot" opacity="0.6" style={{ filter: glowFilter }} />
              </svg>
              <div
                className="absolute"
                style={{
                  left: `${ln.box.x + labelSize.width / 2}px`,
                  top: `${ln.box.y + labelSize.height / 2}px`,
                  color: '#000',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'var(--font-karla)',
                  fontSize: '16px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  transition: 'color 0.3s ease',
                  cursor: 'default',
                  pointerEvents: isMobile ? 'none' : 'auto',
                  zIndex: 6,
                  filter: (isWithinThis || hoveredElement === ln.angleObj.label) ? glowFilter : 'none',
                  color: (isWithinThis || hoveredElement === ln.angleObj.label) ? '#FDABD3' : '#000'
                }}
                tabIndex={-1}
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                onKeyDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                onMouseEnter={!isMobile ? (e) => { setHoveredElement(ln.angleObj.label); showTooltip(ln.angleObj.label, e) } : undefined}
                onMouseLeave={!isMobile ? () => { setHoveredElement(null); hideTooltip() } : undefined}
              >
                {ln.angleObj.label}
              </div>
            </div>
          )
        })
      })()}

      {/* Whisker */}
      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4 }}>
        <line
          x1={letterCenterX}
          y1={letterCenterY}
          x2={whiskerEndX}
          y2={whiskerEndY}
          stroke="transparent"
          strokeWidth="36"
          style={{ cursor: isDraggingRotate ? 'grabbing' : 'grab', pointerEvents: 'auto', touchAction: 'none' }}
          onMouseDown={handleWhiskerMouseDown}
          onMouseEnter={() => setWhiskerHovered(true)}
          onMouseLeave={() => setWhiskerHovered(false)}
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
          onTouchStart={handleWhiskerTouchStart}
          onTouchMove={handleWhiskerTouchMove}
          onTouchEnd={handleWhiskerTouchEnd}
        />
        <line
          x1={letterCenterX}
          y1={letterCenterY}
          x2={whiskerEndX}
          y2={whiskerEndY}
          stroke={isDraggingRotate || isAtTarget ? '#FDABD3' : '#000'}
          strokeWidth="2"
          strokeDasharray="4,4"
          style={{ pointerEvents: 'none', filter: isDraggingRotate || isAtTarget ? glowFilter : 'none' }}
        />
        {/* Make the entire whisker + knob easy to grab on touch/mouse */}
        <line
          x1={letterCenterX}
          y1={letterCenterY}
          x2={whiskerEndX}
          y2={whiskerEndY}
          stroke="transparent"
          strokeWidth="44"
          style={{ cursor: isDraggingRotate ? 'grabbing' : 'grab', pointerEvents: 'auto', touchAction: 'none' }}
          onMouseDown={handleWhiskerMouseDown}
          onMouseEnter={() => setWhiskerHovered(true)}
          onMouseLeave={() => setWhiskerHovered(false)}
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
          onTouchStart={handleWhiskerTouchStart}
          onTouchMove={handleWhiskerTouchMove}
          onTouchEnd={handleWhiskerTouchEnd}
        />
        <circle
          cx={whiskerEndX}
          cy={whiskerEndY}
          r="8"
          fill={isAtTarget ? '#FDABD3' : '#FFFDF3'}
          stroke={isDraggingRotate || isAtTarget ? '#FDABD3' : '#000'}
          strokeWidth="2"
          style={{ cursor: isDraggingRotate ? 'grabbing' : 'grab', pointerEvents: 'auto', outline: 'none', filter: isDraggingRotate || isAtTarget ? glowFilter : 'none' }}
          role="button"
          tabIndex={0}
          aria-label="Drag to rotate"
          onMouseDown={handleWhiskerMouseDown}
          onMouseEnter={() => setWhiskerHovered(true)}
          onMouseLeave={() => setWhiskerHovered(false)}
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
          onTouchStart={handleWhiskerTouchStart}
          onTouchMove={handleWhiskerTouchMove}
          onTouchEnd={handleWhiskerTouchEnd}
        />
      </svg>

      {/* Letter */}
      <div
        className="absolute select-none leading-none"
        style={{
          left: `${letterPosition.x}px`,
          top: `${letterPosition.y}px`,
          fontSize: isMobile ? '85px' : '100px',
          fontFamily: 'var(--font-nastaliq)',
          fontWeight: 700,
          width: `${letterSize}px`,
          height: `${letterSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          color: '#000',
          opacity: navigatingTo ? 0 : 1,
          transition: navigatingTo ? 'opacity 0.5s ease-in-out' : (isDraggingRotate ? 'none' : 'transform 0.2s ease'),
          pointerEvents: 'none',
        transform: `translateY(${letterGlyphOffsetY}px) rotate(${letterAngle - 3}deg)`,
        transformOrigin: '50% 50%'
      }}
        aria-label={`${selectedLetterKey} letter`}
        onMouseMove={handleLetterMouseMove}
      >
        {selectedLetter.arabic}
      </div>

      {!isMobile && showDragHint && (
        <div
          style={{
            position: 'fixed',
            left: `${whiskerEndX + 12}px`,
            top: `${whiskerEndY - 32}px`,
            pointerEvents: 'none',
            backgroundColor: '#000',
            border: '1px solid #000',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#FFFDF3',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-karla)',
            zIndex: 60,
            whiteSpace: 'nowrap'
          }}
        >
          ROTATE
        </div>
      )}

      {/* Tooltip on whisker hover */}
      {!isMobile && whiskerHovered && !isDraggingRotate && mousePosition && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
            pointerEvents: 'none',
            backgroundColor: '#000',
            color: '#FFFDF3',
            border: '1px solid #000',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-karla)',
            zIndex: 100,
            whiteSpace: 'nowrap'
          }}
        >
          Drag to rotate
        </div>
      )}

      {/* Shared tooltip */}
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
