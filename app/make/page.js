'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../components/TransformChrome'

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
  const axisLength = 400
  const readingBodyStyle = { top: 120, right: 300, maxWidth: 250 }
  const [letterPosition, setLetterPosition] = useState(null)
  const [axes, setAxes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
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
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLetterPosition({ x: parseFloat(posX), y: parseFloat(posY) })
    } else {
      setLetterPosition({ x: window.innerWidth / 2 - letterSize / 2, y: window.innerHeight / 2 - letterSize / 2 })
    }
  }, [letterSize])

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

  const handleMouseDown = (e, axisIndex) => {
    e.stopPropagation()
    const axis = axes[axisIndex]
    const knobPos = getPositionOnAxis(axis.knobPosition, axis)
    const dx = e.clientX - knobPos.x
    const dy = e.clientY - knobPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 20) {
      setIsDragging(true)
      setActiveAxisIndex(axisIndex)
    }
  }
  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
    if (isDragging && activeAxisIndex !== null) {
      const axis = axes[activeAxisIndex]
      const t = projectOntoAxis(e.clientX, e.clientY, axis)
      const newAxes = [...axes]
      newAxes[activeAxisIndex] = { ...newAxes[activeAxisIndex], knobPosition: t }
      setAxes(newAxes)
    }
  }
  const handleMouseUp = () => {
    setIsDragging(false)
    setActiveAxisIndex(null)
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
  const navigateWithFade = (path) => {
    const target = path.startsWith('/') ? path : `/${path}`
    window.location.href = target
  }
  const showTooltip = (text, event, placement = 'top') => {
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

      {notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
      )}

      {readingMode && (
        <>
          <div className="fixed left-30 top-120 max-w-sm" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '40px', fontWeight: 200, lineHeight: '40px', maxWidth: '400px', color: '#000' }}>
            Works spanning built architecture and extended reality. Spaces and things as material and digital constructs, examined for how they shape modes of inhabitation and interaction. 
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', ...readingBodyStyle }}>
            We do not first encounter empty space and then fill it with things; rather, spaces and things emerge together through our engaged inhabitation. The hammer is intelligible through its place in the workshop, just as the workshop becomes a workshop through the arrangement of tools that afford our projects. Neither subject nor object, neither mind nor matter, but the unified field of meaningful action - where perception is already grasping possibilities, and where things show themselves as invitations rather than inert presences. The world does not wait to be known; it offers itself to be inhabited.
          </div>
        </>
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
        const labelOffset = 60
        const labelPos = { x: targetPos.x + ux * labelOffset, y: targetPos.y + uy * labelOffset }
        const labelBox = { x: labelPos.x - 80, y: labelPos.y - 20, width: 160, height: 40 }
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${axis.label}`}
                  onFocus={(e) => { setHoveredElement(axis.label); showTooltip(`Open ${axis.label}`, e) }}
                  onBlur={() => { setHoveredElement(null); hideTooltip() }}
                  onMouseEnter={(e) => { setHoveredElement(axis.label); showTooltip(`Open ${axis.label}`, e) }}
                  onMouseLeave={() => { setHoveredElement(null); hideTooltip() }}
                  onClick={() => {
                    if (axis.label === 'spaces' || axis.label === 'things') {
                      navigateWithFade(axis.label === 'things' ? 'make/things' : 'make/spaces')
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (axis.label === 'spaces' || axis.label === 'things') {
                        navigateWithFade(axis.label === 'things' ? 'make/things' : 'make/spaces')
                      }
                    }
                  }}
                  style={{ fontFamily: 'var(--font-karla)', fontSize: '16px', fontWeight: 500, fontStyle: 'normal', textTransform: 'uppercase', textAlign: 'center', color: hoveredElement === axis.label ? '#FDABD3' : '#000', filter: hoveredElement === axis.label ? glowFilter : 'none', transition: 'color 0.3s ease', cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none' }}
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
          fontSize: '100px',
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
          transform: getLetterTransform(),
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
        MIRROR
      </div>
    )
  })}
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



