'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../components/TransformChrome'
import { MobileChrome } from '../components/MobileChrome'
import { clearHomeLayout, pushNavStack } from '../components/navState'
import { useMediaQuery } from '../components/useMediaQuery'

const buildAxes = (letterPosition, letterSize, axisLength) => {
  if (!letterPosition) return []
  const centerX = letterPosition.x + letterSize / 2
  const centerY = letterPosition.y + letterSize / 2
  const offset = axisLength / (2 * Math.sqrt(2))
  const axisOrientations = [
    { type: 'vertical', dir: 'tob', base: 'v', start: { x: centerX, y: centerY - axisLength / 2 }, end: { x: centerX, y: centerY + axisLength / 2 } },
    { type: 'vertical', dir: 'bot', base: 'v', start: { x: centerX, y: centerY + axisLength / 2 }, end: { x: centerX, y: centerY - axisLength / 2 } },
    { type: 'horizontal', dir: 'ltr', base: 'h', start: { x: centerX - axisLength / 2, y: centerY }, end: { x: centerX + axisLength / 2, y: centerY } },
    { type: 'horizontal', dir: 'rtl', base: 'h', start: { x: centerX + axisLength / 2, y: centerY }, end: { x: centerX - axisLength / 2, y: centerY } },
    { type: 'diagonal', dir: 'tlbr', base: 'd1', start: { x: centerX - offset, y: centerY - offset }, end: { x: centerX + offset, y: centerY + offset } },
    { type: 'diagonal', dir: 'brtl', base: 'd1', start: { x: centerX + offset, y: centerY + offset }, end: { x: centerX - offset, y: centerY - offset } },
    { type: 'diagonal', dir: 'trbl', base: 'd2', start: { x: centerX + offset, y: centerY - offset }, end: { x: centerX - offset, y: centerY + offset } },
    { type: 'diagonal', dir: 'bltr', base: 'd2', start: { x: centerX - offset, y: centerY + offset }, end: { x: centerX + offset, y: centerY - offset } }
  ]
  const picks = []
  const pool = [...axisOrientations].sort(() => Math.random() - 0.5)
  for (const axis of pool) {
    if (!picks.some((p) => p.base === axis.base)) {
      picks.push(axis)
    }
    if (picks.length === 2) break
  }
  return picks.map((axis, idx) => ({
    ...axis,
    label: idx === 0 ? 'spaces' : 'things',
    knobPosition: 0
  }))
}

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
// MAIN PAGE
// =========================
export default function MakePage() {
  const selectedLetterKey = 'ayin'
  const letterMap = {
    ayin: { arabic: '\u0639', label: 'make' },
    alif: { arabic: '\u0627', label: 'view' },
    sad: { arabic: '\u0635', label: 'reflect' },
    mim: { arabic: '\u0645', label: 'connect' }
  }
  const selectedLetter = letterMap[selectedLetterKey]

  const letterSize = 200
  const axisLengthBase = 400
  const readingBodyStyle = { top: 120, right: 300, maxWidth: 250 }
  const mobileSubnav = useMemo(() => ([
    { label: 'spaces', href: '/make/spaces' },
    { label: 'things', href: '/make/things' }
  ]), [])
  const [letterPosition, setLetterPosition] = useState(null)
  const [axes, setAxes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const [activeAxisIndex, setActiveAxisIndex] = useState(null)
  const [timeInZone, setTimeInZone] = useState(0)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)
  const [hoveredKnob, setHoveredKnob] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [showDragHint, setShowDragHint] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const axisLength = isMobile ? 280 : axisLengthBase
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [swipeStart, setSwipeStart] = useState(null)
  const letterOffsetY = isMobile ? -50 : 0
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)
  const mobileMenuTimerRef = useRef(null)
  const letterRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const clampLetterPosition = (pos) => {
      const padding = 20
      const axisHalf = axisLength / 2
      const letterHalf = letterSize / 2
      const maxReach = axisHalf
      const minX = padding + maxReach - letterHalf
      const maxX = window.innerWidth - padding - maxReach - letterHalf
      const minY = padding + maxReach - letterHalf
      const maxY = window.innerHeight - padding - maxReach - letterHalf
      return {
        x: Math.min(Math.max(pos.x, minX), maxX),
        y: Math.min(Math.max(pos.y, minY), maxY)
      }
    }
    if (isMobile) {
      setLetterPosition(clampLetterPosition({ x: window.innerWidth / 2 - letterSize / 2, y: window.innerHeight / 2 - letterSize / 2 }))
      return
    }
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLetterPosition(clampLetterPosition({ x: parseFloat(posX), y: parseFloat(posY) }))
    } else {
      setLetterPosition(clampLetterPosition({ x: window.innerWidth / 2 - letterSize / 2, y: window.innerHeight / 2 - letterSize / 2 }))
    }
  }, [letterSize, axisLength, isMobile])

  useEffect(() => {
    if (!letterPosition || axes.length) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAxes(buildAxes(letterPosition, letterSize, axisLength))
  }, [letterPosition, axes.length, letterSize, axisLength])

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

  const getPositionOnAxis = (t, axis) => {
    const { start, end } = axis
    return { x: start.x + t * (end.x - start.x), y: start.y + t * (end.y - start.y) }
  }
  const projectOntoAxis = (mouseX, mouseY, axis) => {
    const { start, end } = axis
    const axisVectorX = end.x - start.x
    const axisVectorY = end.y - start.y
    const mouseVectorX = mouseX - start.x
    const mouseVectorY = mouseY - start.y
    const dotProduct = mouseVectorX * axisVectorX + mouseVectorY * axisVectorY
    const axisLengthSquared = axisVectorX * axisVectorX + axisVectorY * axisVectorY
    let t = dotProduct / axisLengthSquared
    t = Math.max(0, Math.min(1, t))
    return t
  }

  const startDrag = (x, y, axisIndex) => {
    const axis = axes[axisIndex]
    const knobPos = getPositionOnAxis(axis.knobPosition, axis)
    const dx = x - knobPos.x
    const dy = y - knobPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 20) {
      setIsDragging(true)
      isDraggingRef.current = true
      setActiveAxisIndex(axisIndex)
    }
  }
  const updateDrag = (x, y) => {
    setMousePosition({ x, y })
    if (isDraggingRef.current && activeAxisIndex !== null) {
      const axis = axes[activeAxisIndex]
      const t = projectOntoAxis(x, y, axis)
      const newAxes = [...axes]
      newAxes[activeAxisIndex] = { ...newAxes[activeAxisIndex], knobPosition: t }
      setAxes(newAxes)
    }
  }
  const endDrag = () => {
    setIsDragging(false)
    isDraggingRef.current = false
    setActiveAxisIndex(null)
  }

  const handleMouseDown = (e, axisIndex) => {
    e.stopPropagation()
    startDrag(e.clientX, e.clientY, axisIndex)
  }
  const handleMouseMove = (e) => {
    updateDrag(e.clientX, e.clientY)
  }
  const handleMouseUp = () => {
    endDrag()
  }
  const handleTouchStart = (e, axisIndex) => {
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    startDrag(touch.clientX, touch.clientY, axisIndex)
  }
  const handleTouchMove = (e) => {
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    updateDrag(touch.clientX, touch.clientY)
  }
  const handleTouchEnd = (e) => {
    if (e) e.stopPropagation()
    endDrag()
  }

  useEffect(() => {
    if (axes.length === 0) return undefined
    const interval = setInterval(() => {
      const targetAxis = axes.find((axis) => axis.knobPosition > 0.95)
      if (targetAxis) {
        setTimeInZone((prev) => {
          const next = prev + 100
          if (next >= 250) {
            setNavigatingTo(targetAxis.label)
          }
          return next
        })
      } else {
        setTimeInZone(0)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [axes])

  useEffect(() => {
    if (hintShownRef.current) return undefined
    hintShownRef.current = true
    const showTimer = setTimeout(() => setShowDragHint(true), 500)
    const hideTimer = setTimeout(() => setShowDragHint(false), 2000)
    return () => {
      hintShownRef.current = false
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    const { delaySeconds } = syncGlowOffset()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGlowDelaySeconds(delaySeconds)
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
  }, [])


  useEffect(() => {
    if (!isMobile || readingMode) return undefined
    const key = 'swipeHintMakeShown'
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

  useEffect(() => {
    if (!navigatingTo) return undefined
    const timer = setTimeout(() => {
      const target = navigatingTo === 'spaces' || navigatingTo === 'things'
        ? `/make/${navigatingTo}`
        : `/${navigatingTo}`
      window.location.href = target
    }, 300)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  const getLetterTransform = () => {
    const transforms = []
    axes.forEach((axis) => {
      const progress = axis.knobPosition
      if (progress > 0) {
        if (axis.type === 'vertical') {
          transforms.push(`scaleX(${1 - 2 * progress})`)
        } else if (axis.type === 'horizontal') {
          transforms.push(`scaleY(${1 - 2 * progress})`)
        } else {
          const s = 1 - 2 * progress
          if (axis.dir === 'tlbr' || axis.dir === 'brtl') {
            transforms.push(`rotate(-45deg) scaleX(${s}) rotate(45deg)`)
          } else {
            transforms.push(`rotate(45deg) scaleX(${s}) rotate(-45deg)`)
          }
        }
      }
    })
    return transforms.length > 0 ? transforms.join(' ') : 'none'
  }

  const getDragHintPosition = (knobX, knobY) => {
    const fallback = { x: knobX + 12, y: knobY - 32 }
    if (typeof window === 'undefined') return fallback
    const hintWidth = isMobile ? 150 : 110
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
  const getAxisName = (axisType) => axisType === 'horizontal' ? 'H' : axisType === 'vertical' ? 'V' : 'D'
  const analyticsText = axes.length > 0 ? axes.map((axis) => `${getAxisName(axis.type)} ${(axis.knobPosition * 100).toFixed(0)}%`).join(' / ') : ''
  const primaryHintPos = axes.length > 0 ? getPositionOnAxis(axes[0].knobPosition, axes[0]) : null
  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
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
    if (readingMode || isDraggingRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    const touchX = touch.clientX
    const touchY = touch.clientY
    const knobTouchRadius = 60
    const isTouchingKnob = axes.some((axis) => {
      const knobPos = getPositionOnAxis(axis.knobPosition, axis)
      const dx = touchX - knobPos.x
      const dy = touchY - knobPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < knobTouchRadius
    })
    if (isTouchingKnob) return
    setSwipeStart({ x: touchX, y: touchY })
  }
  const handleSwipeTouchEnd = (e) => {
    if (readingMode || isDraggingRef.current) return
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
      navigateWithFade('/view')
    } else if (dx > swipeThreshold) {
      navigateWithFade('/', { preserveHomeLayout: false })
    }
  }
  const showTooltip = (text, event, placement = 'top') => {
    if (isMobile) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({
        text,
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
        placement
      })
    } else {
      setTooltip({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        placement
      })
    }
  }
  const hideTooltip = () => setTooltip(null)

  if (!letterPosition || axes.length === 0) return null

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleSwipeTouchStart}
      onTouchEndCapture={handleSwipeTouchEnd}
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
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
          <TopBarTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} readingMode={readingMode} analyticsText={analyticsText} glowFilter={glowFilter} showTooltip={showTooltip} hideTooltip={hideTooltip} activePage="make" />
          <LeftPanelTransform readingMode={readingMode} toggleReadingMode={toggleReadingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} label="MAKE" labelTop={110} />
          <RightPanelTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} expandedCategory={expandedCategory} setExpandedCategory={setExpandedCategory} readingMode={readingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} glowFilter={glowFilter} activePage="make" categories={[
            { name: 'make', subcategories: ['spaces', 'things'] },
            { name: 'view', subcategories: ['speculations', 'images'] },
            { name: 'reflect', subcategories: ['research', 'teaching'] },
            { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
          ]} onNavigate={(sub, category) => {
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              navigateWithFade(sub === 'things' ? 'make/things' : 'make/spaces')
            } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`view/${sub}`)
            } else if (sub === 'spaces' || sub === 'things') {
              navigateWithFade(sub === 'things' ? 'make/things' : 'make/spaces')
            }
          }} />
        </>
      )}

      {isMobile && (
        <MobileChrome
          title="make"
          subnav={mobileSubnav}
          activeDot="make"
          bottomLabel=""
          readingMode={readingMode}
          onPrimaryAction={toggleReadingMode}
          primaryActive={readingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={() => navigateWithFade('/')}
          onNavigate={(key, href) => navigateWithFade(href)}
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          menuExpanded={mobileMenuOpen}
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
              navigateWithFade(sub === 'things' ? 'make/things' : 'make/spaces')
              return
            }
            if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`view/${sub}`)
              return
            }
            if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
              navigateWithFade(`reflect/${sub}`)
              return
            }
            if (category === 'connect' && (sub === 'cv' || sub === 'about me')) {
              const slug = sub === 'cv' ? 'curriculum-vitae' : 'about-me'
              navigateWithFade(`connect/${slug}`)
              return
            }
            navigateWithFade(category)
          }}
          glowFilter="hue-rotate(var(--glow-rotation))"
          activeMenuCategory={activeMenuCategory}
          setActiveMenuCategory={setActiveMenuCategory}
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
          <div className="make-reading-description">
            Works spanning built architecture and extended reality. Spaces and things as material and digital constructs, examined for how they shape modes of inhabitation and interaction.
          </div>
          <div className="make-reading-body">
            We do not first encounter empty space and then fill it with things; rather, spaces and things emerge together through our engaged inhabitation. The hammer is intelligible through its place in the workshop, just as the workshop becomes a workshop through the arrangement of tools that afford our projects. Neither subject nor object, neither mind nor matter, but the unified field of meaningful action - where perception is already grasping possibilities, and where things show themselves as invitations rather than inert presences. The world does not wait to be known; it offers itself to be inhabited.
          </div>
          <div className="make-reading-quote">
            to mirror is to implore reflective logic
          </div>
        </>
      )}

      {readingMode && isMobile && (
        <div
          className="mobile-reading-overlay"
          style={{
            zIndex: 60,
            gap: 'var(--m-space-3, 16px)',
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              marginTop: '320px',
              marginRight: 'var(--m-space-2)',
              paddingBottom: 'var(--m-space-2)',
              fontSize: 'clamp(18px, 6vw, 28px)',
              lineHeight: 'clamp(18px, 6.4vw, 28px)',
              fontWeight: 300,
              maxWidth: 'var(--m-reading-max)',
              textAlign: 'right',
              alignSelf: 'flex-end',
              pointerEvents: 'auto'
            }}
          >
            Works spanning built architecture and extended reality. Spaces and things as material and digital constructs, examined for how they shape modes of inhabitation and interaction.
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-white pointer-events-none ${navigatingTo ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 50, transition: 'opacity 2s ease-in-out', backgroundColor: '#FFFDF3' }} />

      <div className={`make-interactive-layer ${readingMode ? 'make-interactive-hidden' : ''}`}>
        {axes.map((axis, index) => {
          const knobPos = getPositionOnAxis(axis.knobPosition, axis)
          const targetPos = getPositionOnAxis(1, axis)
          const isAtTarget = axis.knobPosition > 0.95
          const vx = axis.end.x - axis.start.x
          const vy = axis.end.y - axis.start.y
          const vlen = Math.max(Math.sqrt(vx * vx + vy * vy), 1)
          const ux = vx / vlen
          const uy = vy / vlen
          const letterCenter = letterPosition ? { x: letterPosition.x + letterSize / 2, y: letterPosition.y + letterSize / 2 } : { x: 0, y: 0 }
          const vToTarget = { x: targetPos.x - letterCenter.x, y: targetPos.y - letterCenter.y }
          const vLenTarget = Math.max(Math.sqrt(vToTarget.x * vToTarget.x + vToTarget.y * vToTarget.y), 1)
          const vnx = vToTarget.x / vLenTarget
          const vny = vToTarget.y / vLenTarget
          const alongOffset = 6
          const basePos = { x: targetPos.x + vnx * alongOffset, y: targetPos.y + vny * alongOffset }
          const perp = { x: -vny, y: vnx }
          const perpLen = Math.max(Math.sqrt(perp.x * perp.x + perp.y * perp.y), 1)
          const pnx = perp.x / perpLen
          const pny = perp.y / perpLen
          const perpOffset = 28
          const candidates = [
            { x: basePos.x + pnx * perpOffset, y: basePos.y + pny * perpOffset },
            { x: basePos.x - pnx * perpOffset, y: basePos.y - pny * perpOffset }
          ]
          const labelSize = { width: 160, height: 40 }
          const pad = 16
          const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
          const chooseCandidate = (cand) => {
            if (typeof window === 'undefined') {
              return { boxX: cand.x - labelSize.width / 2, boxY: cand.y - labelSize.height / 2, delta: 0 }
            }
            const maxX = window.innerWidth - labelSize.width - pad
            const maxY = window.innerHeight - labelSize.height - pad
            const boxX = clamp(cand.x - labelSize.width / 2, pad, maxX)
            const boxY = clamp(cand.y - labelSize.height / 2, pad, maxY)
            const dx = (cand.x - labelSize.width / 2) - boxX
            const dy = (cand.y - labelSize.height / 2) - boxY
            return { boxX, boxY, delta: dx * dx + dy * dy }
          }
          const c1 = chooseCandidate(candidates[0])
          const c2 = chooseCandidate(candidates[1])
          const best = c1.delta <= c2.delta ? c1 : c2
          const labelBox = { x: best.boxX, y: best.boxY, width: labelSize.width, height: labelSize.height }
          const knobStroke = (hoveredKnob === index || isAtTarget || isDragging) ? '#FDABD3' : '#000'
          const knobFilter = knobStroke === '#FDABD3' ? glowFilter : 'none'
          const knobFill = isAtTarget ? '#FDABD3' : '#FFFDF3'
          return (
            <div key={index}>
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2, filter: glowFilter, WebkitFilter: glowFilter }}>
                <line x1={axis.start.x} y1={axis.start.y} x2={axis.end.x} y2={axis.end.y} stroke="#FDABD3" strokeWidth="2" strokeDasharray="4,4" />
                <circle cx={targetPos.x} cy={targetPos.y} r="8" fill="#FDABD3" className={isAtTarget ? '' : 'pulse-dot'} opacity={isAtTarget ? '0.5' : undefined} />
                <foreignObject x={labelBox.x} y={labelBox.y} width={labelBox.width} height={labelBox.height}>
                  <div
                    onMouseEnter={!isMobile ? (e) => { setHoveredElement(axis.label); showTooltip(axis.label, e) } : undefined}
                    onMouseLeave={!isMobile ? () => { setHoveredElement(null); hideTooltip() } : undefined}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onKeyDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    tabIndex={-1}
                    style={{ fontFamily: 'var(--font-karla)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500, fontStyle: 'normal', textTransform: 'uppercase', textAlign: 'center', color: hoveredElement === axis.label ? '#FDABD3' : '#000', filter: hoveredElement === axis.label ? glowFilter : 'none', transition: 'color 0.3s ease', cursor: 'default', pointerEvents: isMobile ? 'none' : 'auto', userSelect: 'none' }}
                  >
                    {axis.label}
                  </div>
                </foreignObject>
              </svg>
              <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4, pointerEvents: 'none' }}>
                <circle
                  cx={knobPos.x}
                  cy={knobPos.y}
                  r="8"
                  fill={knobFill}
                  stroke={knobStroke}
                  strokeWidth="2"
                  style={{ cursor: 'grab', pointerEvents: 'auto', filter: knobFilter, transition: 'fill 0.3s ease, stroke 0.3s ease', outline: 'none' }}
                  role="button"
                  tabIndex={0}
                  aria-label="Drag to mirror"
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onMouseEnter={(e) => { setHoveredKnob(index); showTooltip('Drag to mirror', e) }}
                  onMouseLeave={() => { setHoveredKnob(null); hideTooltip() }}
                  onFocus={(e) => { setHoveredKnob(index); showTooltip('Drag to mirror', e) }}
                  onBlur={() => { setHoveredKnob(null); hideTooltip() }}
                />
              </svg>
            </div>
          )
        })}
      </div>

      <div
        className={`absolute select-none leading-none make-interactive-layer ${readingMode ? 'make-interactive-hidden' : ''}`}
        ref={letterRef}
        style={{
          left: `${letterPosition.x}px`,
          top: `${letterPosition.y}px`,
          fontSize: isMobile ? '85px' : '100px',
          fontFamily: 'var(--font-nastaliq)',
          fontWeight: 700,
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          color: '#000',
          opacity: navigatingTo ? 0 : (readingMode ? 0 : 1),
          transition: 'opacity 900ms ease-out, visibility 900ms ease-out, transform 200ms ease-out',
          pointerEvents: readingMode ? 'none' : 'auto',
          transform: `${getLetterTransform() === 'none' ? '' : getLetterTransform()} ${letterOffsetY !== 0 ? `translateY(${letterOffsetY}px)` : ''}`.trim() || 'none',
          transformOrigin: 'center'
        }}
        aria-label={`${selectedLetterKey} letter`}
      >
        {selectedLetter.arabic}
      </div>

      {hoveredKnob !== null && !isDragging && mousePosition && (
        <></>
      )}

      {showDragHint && axes.map((axis, index) => {
        const knobPos = getPositionOnAxis(axis.knobPosition, axis)
        const hintPos = getDragHintPosition(knobPos.x, knobPos.y)
        return (
          <div
            key={`hint-${index}`}
            style={{
              position: 'fixed',
              left: `${hintPos.x}px`,
              top: `${hintPos.y}px`,
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
            DRAG TO MIRROR
          </div>
        )
      })}
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

