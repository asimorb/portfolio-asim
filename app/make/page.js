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
    if (isDragging && activeAxisIndex !== null) {
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
    setSwipeStart({ x: touch.clientX, y: touch.clientY })
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
    if (absX < 50 || absX < absY) return
    if (dx < -50) {
      navigateWithFade('/view')
    } else if (dx > 50) {
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
            { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
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
            if (category === 'connect' && (sub === 'curriculum vitae' || sub === 'about me')) {
              const slug = sub === 'curriculum vitae' ? 'curriculum-vitae' : 'about-me'
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
            Works spanning built architecture and extended reality. Spaces and things as material and digital constructs, examined for how they shape modes of inhabitation and interaction.
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', ...readingBodyStyle }}>
            We do not first encounter empty space and then fill it with things; rather, spaces and things emerge together through our engaged inhabitation. The hammer is intelligible through its place in the workshop, just as the workshop becomes a workshop through the arrangement of tools that afford our projects. Neither subject nor object, neither mind nor matter, but the unified field of meaningful action - where perception is already grasping possibilities, and where things show themselves as invitations rather than inert presences. The world does not wait to be known; it offers itself to be inhabited.
          </div>
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
            gap: '16px',
            alignItems: 'flex-end',
            pointerEvents: 'auto',
            fontFamily: 'var(--font-karla)',
            color: '#000'
          }}
        >
          <div
            style={{
              marginTop: '575px',
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
            Works spanning built architecture and extended reality. Spaces and things as material and digital constructs, examined for how they shape modes of inhabitation and interaction.
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-white pointer-events-none ${navigatingTo ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 50, transition: 'opacity 2s ease-in-out', backgroundColor: '#FFFDF3' }} />

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
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
              <line x1={axis.start.x} y1={axis.start.y} x2={axis.end.x} y2={axis.end.y} stroke="#FDABD3" strokeWidth="2" strokeDasharray="4,4" style={{ filter: glowFilter }} />
              <circle cx={targetPos.x} cy={targetPos.y} r="8" fill="#FDABD3" className={isAtTarget ? '' : 'pulse-dot'} opacity={isAtTarget ? '0.5' : undefined} style={{ filter: glowFilter }} />
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

      <div
        className="absolute select-none leading-none"
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
          opacity: navigatingTo ? 0 : 1,
          transition: navigatingTo ? 'opacity 0.5s ease-in-out' : (isDragging ? 'none' : 'transform 0.3s ease'),
          pointerEvents: 'none',
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
        return (
          <div
            key={`hint-${index}`}
            style={{
              position: 'fixed',
              left: `${knobPos.x + 12}px`,
              top: `${knobPos.y - 32}px`,
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
