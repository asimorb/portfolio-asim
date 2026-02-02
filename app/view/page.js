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
            {categories.map((category) => {
              return (
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
                <div
                  style={{
                    height: '2px',
                    width: '100%',
                    background: '#000',
                    opacity: 0.7
                  }}
                />
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
  const letterRef = useRef(null)

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

  const getDragHintPosition = (knobX, knobY) => {
    const fallback = { x: knobX + 12, y: knobY - 32 }
    if (typeof window === 'undefined') return fallback
    const hintWidth = isMobile ? 140 : 80
    const hintHeight = 24
    const padding = 8
    const letterRect = letterRef.current ? letterRef.current.getBoundingClientRect() : null
    const clamp = (x, y) => ({
      x: Math.min(Math.max(x, padding), window.innerWidth - hintWidth - padding),
      y: Math.min(Math.max(y, padding), window.innerHeight - hintHeight - padding)
    })
    const toRect = (x, y) => ({
      left: x,
      top: y,
      right: x + hintWidth,
      bottom: y + hintHeight
    })
    const overlaps = (a, b) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
    const candidates = [
      { x: knobX + 12, y: knobY - 32 },
      { x: knobX - hintWidth - 12, y: knobY - 32 },
      { x: knobX + 12, y: knobY + 12 },
      { x: knobX - hintWidth - 12, y: knobY + 12 }
    ]
    for (const candidate of candidates) {
      const clamped = clamp(candidate.x, candidate.y)
      if (!letterRect || !overlaps(toRect(clamped.x, clamped.y), letterRect)) {
        return clamped
      }
    }
    if (letterRect) {
      const aboveY = letterRect.top - hintHeight - padding
      const belowY = letterRect.bottom + padding
      const preferredY = aboveY >= padding ? aboveY : belowY
      const clamped = clamp(knobX + 12, preferredY)
      if (!overlaps(toRect(clamped.x, clamped.y), letterRect)) {
        return clamped
      }
    }
    return clamp(fallback.x, fallback.y)
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
    if (!isDraggingRotateRef.current) return
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
    const touchX = touch.clientX
    const touchY = touch.clientY
    const knobTouchRadius = 80
    const dx = touchX - whiskerEndX
    const dy = touchY - whiskerEndY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const isTouchingKnob = distance < knobTouchRadius
    if (isTouchingKnob) return
    setSwipeStart({ x: touchX, y: touchY })
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
    const swipeThreshold = 100
    if (absX < swipeThreshold || absX < absY * 1.2) return
    if (dx < -swipeThreshold) {
      navigateWithFade('/reflect')
    } else if (dx > swipeThreshold) {
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
        animationPlayState: 'running',
        willChange: '--glow-rotation',
        opacity: pageOpacity,
        transition: 'opacity 0.6s ease'
      }}
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.25); } }
        @keyframes restlessMove {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          15% { transform: translate(-50%, -50%) translate(40px, -30px) scale(1.05); }
          30% { transform: translate(-50%, -50%) translate(-50px, 20px) scale(0.96); }
          45% { transform: translate(-50%, -50%) translate(35px, 45px) scale(1.03); }
          60% { transform: translate(-50%, -50%) translate(-60px, -15px) scale(0.94); }
          75% { transform: translate(-50%, -50%) translate(30px, -40px) scale(1.06); }
          90% { transform: translate(-50%, -50%) translate(-40px, 30px) scale(0.98); }
          100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
        }
        @keyframes hueRotate70 {
          0% { filter: blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg + 0deg)); }
          100% { filter: blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg + 360deg)); }
        }
        @keyframes hueRotate80 {
          0% { filter: blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg + 0deg)); }
          100% { filter: blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg + 360deg)); }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .glow-core-static { position: absolute; width: 160px; height: 160px; left: 20%; top: 36%; background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent); opacity: 0.7; filter: blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset))); animation: restlessMove 60s ease-in-out infinite; pointer-events: none; z-index: 2; }
        .glow-core-transition { position: absolute; width: 500px; height: 500px; left: 30%; top: 58%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent); opacity: 0.6; animation: hueRotate80 80s linear infinite; pointer-events: none; z-index: 0; }
        .glow-core-intersection { position: absolute; width: 300px; height: 300px; left: 26%; top: 52%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent); opacity: 0.75; animation: hueRotate70 70s linear infinite; pointer-events: none; z-index: 1; }
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
          className="mobile-reading-overlay"
          style={{
            zIndex: 60,
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              marginTop: '320px',
              marginRight: 'var(--m-space-2)',
              paddingBottom: 'var(--m-space-2)',
              fontSize: 'clamp(22px, 6vw, 28px)',
              lineHeight: 'clamp(26px, 6.4vw, 32px)',
              fontWeight: 300,
              maxWidth: 'var(--m-reading-max)',
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
        <div className="mobile-reading-pill">reading mode</div>
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
          <div className="view-reading-description">
            Visual inquiries from documentation to speculation. Photography and visual experiments, documenting realities while opening questions about possible futures.
          </div>
          <div className="view-reading-body">
            Looking is a form of making: framing, composing, speculating. Images document what is, but they also rehearse what could be. Each photograph, rendering, or sketch is a proposal — an argument about how the world might be seen. To view is to test hypotheses with our eyes, to surface patterns, and to spark the next question. Speculations and images here invite that loop of seeing, questioning, and seeing again.
          </div>
          <div className="view-reading-quote">
            to rotate is to reorient your gaze
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
            { name: 'connect', subcategories: ['cv', 'about me'] }
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
            if (category === 'connect' && (sub === 'cv' || sub === 'about me')) {
              const slug = sub === 'cv' ? 'curriculum-vitae' : 'about-me'
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
      <div className={`view-interactive-layer ${readingMode ? 'view-interactive-hidden' : ''}`}>
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
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 3, filter: glowFilter, WebkitFilter: glowFilter }}>
                <line x1={letterCenterX} y1={letterCenterY} x2={ln.targetLineEndX} y2={ln.targetLineEndY} stroke="#FDABD3" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
                <circle cx={ln.targetLineEndX} cy={ln.targetLineEndY} r="8" fill="#FDABD3" className="pulse-dot" opacity="0.6" />
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
      </div>

      {/* Whisker */}
      <div className={`view-interactive-layer ${readingMode ? 'view-interactive-hidden' : ''}`}>
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
      </div>

      {/* Letter */}
      <div
        className={`absolute select-none leading-none view-interactive-layer ${readingMode ? 'view-interactive-hidden' : ''}`}
        ref={letterRef}
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
          opacity: navigatingTo ? 0 : (readingMode ? 0 : 1),
          transition: 'opacity 900ms ease-out, visibility 900ms ease-out, transform 200ms ease-out',
          pointerEvents: readingMode ? 'none' : 'auto',
          transform: `translateY(${letterGlyphOffsetY}px) rotate(${letterAngle - 3}deg)`,
          transformOrigin: '50% 50%'
        }}
        aria-label={`${selectedLetterKey} letter`}
        onMouseMove={handleLetterMouseMove}
      >
        {selectedLetter.arabic}
      </div>

      {showDragHint && (
        <div
          style={{
            position: 'fixed',
            left: `${getDragHintPosition(whiskerEndX, whiskerEndY).x}px`,
            top: `${getDragHintPosition(whiskerEndX, whiskerEndY).y}px`,
            pointerEvents: 'none',
            backgroundColor: '#000',
            border: '1px solid #000',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#FFFDF3',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-karla)',
            zIndex: 60,
            whiteSpace: 'nowrap'
          }}
        >
          {isMobile ? 'DRAG TO ROTATE' : 'ROTATE'}
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

