'use client'
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../components/TransformChrome'

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
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)

  // Rotate state (single-stage)
  const [letterPosition, setLetterPosition] = useState(null)
  const [gridDots, setGridDots] = useState([])
  const [minorGridDots, setMinorGridDots] = useState([])
  const [letterAngle, setLetterAngle] = useState(0)
  const [isDraggingRotate, setIsDraggingRotate] = useState(false)
  const [timeInZone, setTimeInZone] = useState(0)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [whiskerHovered, setWhiskerHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState(null)
  const [targetAngles, setTargetAngles] = useState([])

  // Layout constants
  const letterSize = 200
  const gridSpacing = 100
  const minorGridSpacing = 50
  const centerOffsetX = 0
  const centerOffsetY = 0
  const whiskerLength = 260
  const whiskerOffset = -30

  const stickyZone = 15
  const snapZone = 5
  const angularThreshold = 10
  const dwellMs = 250

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

  // Position from URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      setLetterPosition({ x: parseFloat(posX), y: parseFloat(posY) })
    } else {
      setLetterPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })
    }
  }, [])

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
  }

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
    const handleWindowMouseUp = () => setIsDraggingRotate(false)
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

  const analyticsText = targetAngles.length === 2
    ? `ANGLE ${Math.round(whiskerAngle)}\u00B0`
    : ''

  if (!hasMounted || !letterPosition) return null

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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

      {notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
      )}

      {readingMode && (
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
      {navigatingTo && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 51 }}>
          <h1 style={{ fontFamily: 'var(--font-karla)', fontSize: '60px', fontWeight: 700, color: '#000' }}>{navigatingTo}</h1>
        </div>
      )}

      {/* Arc fill toward furthest target */}
      {/* Target guides + labels */}
      {targetAngles.length === 2 && targetAngles.map((angleObj, index) => {
        const targetLineEndX = letterCenterX + Math.cos(angleObj.angle * Math.PI / 180) * whiskerLength
        const targetLineEndY = letterCenterY + Math.sin(angleObj.angle * Math.PI / 180) * whiskerLength
        const labelX = letterCenterX + Math.cos(angleObj.angle * Math.PI / 180) * (whiskerLength + 110)
        const labelY = letterCenterY + Math.sin(angleObj.angle * Math.PI / 180) * (whiskerLength + 90)
        const isWithinThis = Math.abs(getAngularDistance(whiskerAngle, angleObj.angle)) <= angularThreshold
        return (
          <div key={index}>
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 3 }}>
              <line x1={letterCenterX} y1={letterCenterY} x2={targetLineEndX} y2={targetLineEndY} stroke="#FDABD3" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" style={{ filter: glowFilter }} />
              <circle cx={targetLineEndX} cy={targetLineEndY} r="8" fill="#FDABD3" className="pulse-dot" opacity="0.6" style={{ filter: glowFilter }} />
            </svg>
            <div
              className="absolute"
              style={{
                left: `${labelX}px`,
                top: `${labelY}px`,
                color: '#000',
                transform: 'translate(-50%, -50%)',
                fontFamily: 'var(--font-karla)',
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'uppercase',
                textAlign: 'center',
                transition: 'color 0.3s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 6,
                filter: (isWithinThis || hoveredElement === angleObj.label) ? glowFilter : 'none',
                color: (isWithinThis || hoveredElement === angleObj.label) ? '#FDABD3' : '#000'
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${angleObj.label}`}
              onClick={() => setNavigatingTo(angleObj.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setNavigatingTo(angleObj.label)
                }
              }}
              onMouseEnter={(e) => { setHoveredElement(angleObj.label); showTooltip(`Open ${angleObj.label}`, e) }}
              onMouseLeave={() => { setHoveredElement(null); hideTooltip() }}
              onFocus={(e) => { setHoveredElement(angleObj.label); showTooltip(`Open ${angleObj.label}`, e) }}
              onBlur={() => { setHoveredElement(null); hideTooltip() }}
            >
              {angleObj.label}
            </div>
          </div>
        )
      })}

      {/* Whisker */}
      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4 }}>
        <line
          x1={letterCenterX}
          y1={letterCenterY}
          x2={whiskerEndX}
          y2={whiskerEndY}
          stroke="transparent"
          strokeWidth="20"
          style={{ cursor: isDraggingRotate ? 'grabbing' : 'grab', pointerEvents: 'auto' }}
          onMouseDown={handleWhiskerMouseDown}
          onMouseEnter={() => setWhiskerHovered(true)}
          onMouseLeave={() => setWhiskerHovered(false)}
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
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
        />
      </svg>

      {/* Letter */}
      <div
        className="absolute select-none leading-none"
        style={{
          left: `${letterPosition.x}px`,
          top: `${letterPosition.y}px`,
          fontSize: '100px',
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
          transform: `rotate(${letterAngle}deg)`,
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
      {whiskerHovered && !isDraggingRotate && mousePosition && (
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
    </div>
  )
}
