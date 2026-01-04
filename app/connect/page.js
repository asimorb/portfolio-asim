'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const createSeed = (baseRadius, labels) => {
  const angles = []
  while (angles.length < labels.length) {
    const candidate = Math.random() * 360
    if (angles.every((a) => Math.abs(candidate - a) > 50)) angles.push(candidate)
  }
  const radii = labels.map((_, idx) => baseRadius * (1.1 + Math.random() * (idx === 0 ? 0.4 : 0.8)))
  return labels.map((label, idx) => ({ label, angle: angles[idx], radius: radii[idx] }))
}

const buildSmoothPathD = (pts) => {
  if (!pts.length) return ''
  const p = pts.map((pt) => [pt.x, pt.y])
  // Catmull-Rom to cubic Bezier
  let d = `M ${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = i === 0 ? p[0] : p[i - 1]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = i + 2 < p.length ? p[i + 2] : p[p.length - 1]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

const sampleSmoothPoints = (pts, samplesPerSegment = 12) => {
  if (pts.length < 2) return pts
  const p = pts.map((pt) => [pt.x, pt.y])
  const samples = []
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = i === 0 ? p[0] : p[i - 1]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = i + 2 < p.length ? p[i + 2] : p[p.length - 1]
    for (let j = 0; j <= samplesPerSegment; j += 1) {
      const t = j / samplesPerSegment
      const t2 = t * t
      const t3 = t2 * t
      const x = 0.5 * ((2 * p1[0]) +
        (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
      const y = 0.5 * ((2 * p1[1]) +
        (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      samples.push({ x, y })
    }
  }
  return samples
}

export default function ConnectPage() {
  const selectedLetterKey = 'mim'
  const selectedLetter = { arabic: '\u0645', label: 'connect' }

  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [showMoveHint, setShowMoveHint] = useState(false)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const [hoveredKnob, setHoveredKnob] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [timeInZone, setTimeInZone] = useState(0)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [letterSideSign, setLetterSideSign] = useState(1)
  const [controlPos, setControlPos] = useState(null)
  const [analyticsText, setAnalyticsText] = useState('')

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)

  const letterSize = 200
  const letterGlyphOffsetY = -8
  const letterNormalOffset = 48
  const readingBodyStyle = { top: 120, right: 300, maxWidth: 250 }
  const dwellMs = 250
  const targetSnapThreshold = 16
  const whiskerBase = 60
  const [whiskerLength, setWhiskerLength] = useState(whiskerBase)
  const [whiskerSideSign, setWhiskerSideSign] = useState(1)

  const letterParam = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      return { x: parseFloat(posX), y: parseFloat(posY) }
    }
    return null
  }, [])

  const pathPoints = useMemo(() => {
    if (typeof window === 'undefined') return []
    const { innerWidth, innerHeight } = window
    const margin = { top: 140, bottom: 180, left: 160, right: 220 }
    // eslint-disable-next-line react-hooks/purity -- one-time path seeding
    const rand = (min, max) => min + Math.random() * (max - min)
    const amplitude = rand(80, 200)
    const start = { x: rand(margin.left, innerWidth * 0.32), y: rand(margin.top, innerHeight - margin.bottom) }
    const end = { x: rand(innerWidth * 0.58, innerWidth - margin.right), y: rand(margin.top, innerHeight - margin.bottom) }
    // eslint-disable-next-line react-hooks/purity -- one-time path seeding
    const midCount = 3 + Math.floor(Math.random() * 3) // 3-5 mids
    const pts = [start]
    for (let i = 1; i <= midCount; i += 1) {
      const t = i / (midCount + 1)
      const px = start.x + (end.x - start.x) * t + rand(-120, 120)
      const wave = Math.sin(t * Math.PI * rand(1.5, 3.5)) * amplitude
      const py = start.y + (end.y - start.y) * t + wave + rand(-60, 60)
      pts.push({ x: px, y: py })
    }
    pts.push(end)
    return pts
  }, [])

  const smoothPoints = useMemo(() => sampleSmoothPoints(pathPoints, 14), [pathPoints])

  const segments = useMemo(() => {
    const segs = []
    for (let i = 0; i < smoothPoints.length - 1; i += 1) {
      const a = smoothPoints[i]
      const b = smoothPoints[i + 1]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      segs.push({ a, b, len })
    }
    return segs
  }, [smoothPoints])

  const totalLength = useMemo(() => segments.reduce((sum, s) => sum + s.len, 0), [segments])

  const [knobT, setKnobT] = useState(0.5)

  const getPointAtT = useCallback((tVal) => {
    if (!segments.length) return { x: 0, y: 0 }
    const targetLen = totalLength * Math.min(Math.max(tVal, 0), 1)
    let acc = 0
    for (const seg of segments) {
      if (acc + seg.len >= targetLen) {
        const localT = (targetLen - acc) / seg.len
        return {
          x: seg.a.x + (seg.b.x - seg.a.x) * localT,
          y: seg.a.y + (seg.b.y - seg.a.y) * localT
        }
      }
      acc += seg.len
    }
    const last = segments[segments.length - 1]
    return { x: last.b.x, y: last.b.y }
  }, [segments, totalLength])

  const getTangentAtT = useCallback((tVal) => {
    if (!segments.length) return { x: 1, y: 0 }
    const targetLen = totalLength * Math.min(Math.max(tVal, 0), 1)
    let acc = 0
    for (const seg of segments) {
      if (acc + seg.len >= targetLen || seg === segments[segments.length - 1]) {
        const dx = seg.b.x - seg.a.x
        const dy = seg.b.y - seg.a.y
        const len = Math.max(Math.hypot(dx, dy), 0.0001)
        return { x: dx / len, y: dy / len }
      }
      acc += seg.len
    }
    return { x: 1, y: 0 }
  }, [segments, totalLength])

  useEffect(() => {
    if (!letterParam || !segments.length) return
    const tang = getTangentAtT(knobT)
    const norm = { x: -tang.y, y: tang.x }
    const anchor = getPointAtT(knobT)
    const dx = letterParam.x - anchor.x
    const dy = letterParam.y - anchor.y
    const proj = dx * norm.x + dy * norm.y
    const sign = proj >= 0 ? 1 : -1
    setWhiskerSideSign(sign)
    setLetterSideSign(sign)
    setWhiskerLength(Math.max(30, Math.abs(proj) - letterNormalOffset))
  }, [letterParam, segments, knobT, letterNormalOffset, getPointAtT, getTangentAtT])

  const knobPos = useMemo(() => getPointAtT(knobT), [knobT, getPointAtT])
  const tangent = useMemo(() => getTangentAtT(knobT), [knobT, getTangentAtT])
  const normal = { x: -tangent.y, y: tangent.x }
  const knobAngle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI
  const derivedControlPos = { x: knobPos.x + normal.x * whiskerLength * whiskerSideSign, y: knobPos.y + normal.y * whiskerLength * whiskerSideSign }
  const controlKnobPos = controlPos || derivedControlPos
  // Letter follows the free control knob; control starts at landing position when provided
  const letterPos = controlKnobPos

  useEffect(() => {
    if (controlPos || !letterParam || !segments.length) return
    // initialize control knob at landing position (centered), set projection for anchor
    const letterCenter = { x: letterParam.x + letterSize / 2, y: letterParam.y + letterSize / 2 }
    setControlPos(letterCenter)
    let closestT = 0.5
    let bestDist = Infinity
    let acc = 0
    segments.forEach((seg) => {
      const vx = seg.b.x - seg.a.x
      const vy = seg.b.y - seg.a.y
      const segLenSq = vx * vx + vy * vy
      if (segLenSq === 0) return
      const wx = letterCenter.x - seg.a.x
      const wy = letterCenter.y - seg.a.y
      let t = (wx * vx + wy * vy) / segLenSq
      t = Math.max(0, Math.min(1, t))
      const px = seg.a.x + vx * t
      const py = seg.a.y + vy * t
      const d = Math.hypot(px - letterCenter.x, py - letterCenter.y)
      if (d < bestDist) {
        bestDist = d
        closestT = (acc + t * seg.len) / totalLength
      }
      acc += seg.len
    })
    setKnobT(closestT)
    const tang = getTangentAtT(closestT)
    const norm = { x: -tang.y, y: tang.x }
    const anchor = getPointAtT(closestT)
    const dx = letterCenter.x - anchor.x
    const dy = letterCenter.y - anchor.y
    const proj = dx * norm.x + dy * norm.y
    const sign = proj >= 0 ? 1 : -1
    setWhiskerSideSign(sign)
    setLetterSideSign(sign)
    setWhiskerLength(Math.max(30, Math.hypot(dx, dy)))
  }, [controlPos, letterParam, segments, totalLength, letterSize, getPointAtT, getTangentAtT])

  useEffect(() => {
    const { delaySeconds } = syncGlowOffset()
    setGlowDelaySeconds(delaySeconds)
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    const showTimer = setTimeout(() => setShowMoveHint(true), 500)
    const hideTimer = setTimeout(() => setShowMoveHint(false), 2000)
    setHasMounted(true)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

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

  const handleMouseDown = (e) => {
    setIsDragging(true)
    e.stopPropagation()
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !segments.length) return
    const mx = e.clientX
    const my = e.clientY
    setControlPos({ x: mx, y: my })
    let closestT = 0
    let bestDist = Infinity
    let acc = 0
    segments.forEach((seg) => {
      const vx = seg.b.x - seg.a.x
      const vy = seg.b.y - seg.a.y
      const segLenSq = vx * vx + vy * vy
      if (segLenSq === 0) return
      const wx = mx - seg.a.x
      const wy = my - seg.a.y
      let t = (wx * vx + wy * vy) / segLenSq
      t = Math.max(0, Math.min(1, t))
      const px = seg.a.x + vx * t
      const py = seg.a.y + vy * t
      const d = Math.hypot(px - mx, py - my)
      if (d < bestDist) {
        bestDist = d
        closestT = (acc + t * seg.len) / totalLength
      }
      acc += seg.len
    })
    setKnobT(closestT)
    const tang = getTangentAtT(closestT)
    const norm = { x: -tang.y, y: tang.x }
    const anchor = getPointAtT(closestT)
    const dx = mx - anchor.x
    const dy = my - anchor.y
    const proj = dx * norm.x + dy * norm.y
    const sign = proj >= 0 ? 1 : -1
    setWhiskerSideSign(sign)
    setLetterSideSign(sign)
    setWhiskerLength(Math.max(30, Math.hypot(dx, dy)))
  }

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [])

  const targets = useMemo(() => {
    if (!segments.length || !smoothPoints.length) return []
    const start = smoothPoints[0]
    const end = smoothPoints[smoothPoints.length - 1]
    return [
      { label: 'curriculum vitae', point: start, t: 0 },
      { label: 'about me', point: end, t: 1 }
    ]
  }, [smoothPoints, segments.length])

  const targetProximity = useMemo(() => {
    if (!targets.length) return null
    let closest = null
    targets.forEach((t) => {
      const d = Math.hypot(knobPos.x - t.point.x, knobPos.y - t.point.y)
      if (!closest || d < closest.distance) closest = { ...t, distance: d }
    })
    return closest
  }, [targets, knobPos])

  useEffect(() => {
    if (!targetProximity || targetProximity.distance > targetSnapThreshold || navigatingTo) {
      setTimeInZone(0)
      return undefined
    }
    const interval = setInterval(() => {
      setTimeInZone((prev) => {
        const next = prev + 100
        if (next >= dwellMs) {
          setNavigatingTo(targetProximity.label)
          return prev
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [targetProximity, navigatingTo])

  useEffect(() => {
    if (!navigatingTo) return undefined
    const timer = setTimeout(() => {
      if (navigatingTo === 'curriculum vitae' || navigatingTo === 'about me') {

        const slug = navigatingTo === 'curriculum vitae' ? 'curriculum-vitae' : 'about-me'

        window.location.href = `/connect/${slug}`

      } else {
        window.location.href = `/${navigatingTo}`
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  useEffect(() => {
    const x = Math.round(knobPos.x)
    const y = Math.round(knobPos.y)
    setAnalyticsText(`X : ${x} / Y : ${y}`)
  }, [knobPos.x, knobPos.y])

  const knobActive = isDragging || hoveredKnob || (targetProximity && targetProximity.distance <= targetSnapThreshold)

  if (!hasMounted || !smoothPoints.length) return null

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={() => { if (isDragging) setIsDragging(false) }}
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
        @keyframes fadeInPage { 0% { opacity: 0; } 100% { opacity: 1; } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .glow-core-static { position: absolute; width: 160px; height: 160px; left: 20%; top: 36%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent); opacity: 0.7; filter: blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset))); pointer-events: none; z-index: 2; }
        .glow-core-transition { position: absolute; width: 500px; height: 500px; left: 30%; top: 58%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent); opacity: 0.6; filter: blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg)); pointer-events: none; z-index: 0; }
        .glow-core-intersection { position: absolute; width: 300px; height: 300px; left: 26%; top: 52%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent); opacity: 0.75; filter: blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg)); pointer-events: none; z-index: 1; }
      `}</style>

      <div className="glow-core-transition" />
      <div className="glow-core-intersection" />
      <div className="glow-core-static" />

      <TopBarTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} readingMode={readingMode} analyticsText={analyticsText} glowFilter={glowFilter} showTooltip={showTooltip} hideTooltip={hideTooltip} activePage="connect" />
      <LeftPanelTransform readingMode={readingMode} toggleReadingMode={toggleReadingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} label="CONNECT" labelTop={160} />
      <RightPanelTransform hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} expandedCategory={expandedCategory} setExpandedCategory={setExpandedCategory} readingMode={readingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} glowFilter={glowFilter} activePage="connect" categories={[
        { name: 'connect', subcategories: ['curriculum vitae', 'about me'] },
        { name: 'reflect', subcategories: ['research', 'teaching'] },
        { name: 'view', subcategories: ['speculations', 'images'] },
        { name: 'make', subcategories: ['spaces', 'objects'] }
      ]} onNavigate={(sub, category) => {
        if (category === 'make' && (sub === 'spaces' || sub === 'objects')) {
          window.location.href = `/make/${sub}`
        } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
          window.location.href = `/view/${sub}`
        } else if (category === 'connect' && (sub === 'curriculum vitae' || sub === 'about me')) {

          const slug = sub === 'curriculum vitae' ? 'curriculum-vitae' : 'about-me'

          window.location.href = `/connect/${slug}`

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
          <div className="fixed left-30 top-130 max-w-sm" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '40px', fontWeight: 200, lineHeight: '40px', maxWidth: '400px', color: '#000' }}>
           Biographical and curricular trajectories presented as translations, situating practice within its disciplinary, cultural, and geographic contexts.  
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', ...readingBodyStyle }}>
            Networks of work, practice, and story. Curriculum vitae and about me as openings to conversation, not static records. Connection is a living archive: work, roles, and collaborations woven across contexts. A CV captures the surface; the stories underneath are where meaning and momentum live. About me is an invitation to dialogue — a snapshot of values, methods, and curiosities that shape how I show up with others.
          </div>
        </>
      )}

      {targets.length > 0 && (
        <>
          <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 2, pointerEvents: 'none' }}>
            <polyline
              points={smoothPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#FDABD3"
              strokeWidth="2"
              strokeDasharray="6,6"
              style={{ filter: glowFilter, strokeLinecap: 'round' }}
            />
            {targets.map((t, idx) => (
              <g key={idx}>
                <circle cx={t.point.x} cy={t.point.y} r="8" fill="#FDABD3" className="pulse-dot" style={{ filter: glowFilter }} />
              </g>
            ))}
          </svg>

          {targets.map((t, idx) => {
            const labelOffset = 70
            const nextPoint = idx === 0 ? smoothPoints[1] : smoothPoints[smoothPoints.length - 2]
            const angle = Math.atan2(nextPoint.y - t.point.y, nextPoint.x - t.point.x)
            const lx = t.point.x + Math.cos(angle + Math.PI / 2) * labelOffset
            const ly = t.point.y + Math.sin(angle + Math.PI / 2) * labelOffset
            const labelText = `Open ${t.label}`
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${lx}px`,
                  top: `${ly}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'var(--font-karla)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: hoveredElement === labelText ? '#FDABD3' : '#000',
                  textTransform: 'uppercase',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  filter: hoveredElement === labelText ? glowFilter : 'none',
                  zIndex: 10
                }}
                role="button"
                tabIndex={0}
                aria-label={labelText}
                onMouseEnter={(e) => { setHoveredElement(labelText); showTooltip(labelText, e) }}
                onMouseLeave={() => { setHoveredElement(null); hideTooltip() }}
                onFocus={(e) => { setHoveredElement(labelText); showTooltip(labelText, e) }}
                onBlur={() => { setHoveredElement(null); hideTooltip() }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setNavigatingTo(t.label)
                  }
                }}
                onClick={() => setNavigatingTo(t.label)}
              >
                {t.label}
              </div>
            )
          })}
        </>
      )}

      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4, pointerEvents: 'auto' }}>
        <line
          x1={knobPos.x}
          y1={knobPos.y}
          x2={controlKnobPos.x}
          y2={controlKnobPos.y}
          stroke="#000"
          strokeWidth="2"
          strokeDasharray="4,4"
          style={{ pointerEvents: 'none' }}
        />
        <circle
          cx={knobPos.x}
          cy={knobPos.y}
          r="8"
          fill="#FFFDF3"
          stroke={hoveredKnob || isDragging ? '#FDABD3' : '#000'}
          strokeWidth="2"
          style={{ cursor: 'grab', pointerEvents: 'all', filter: (hoveredKnob || isDragging) ? glowFilter : 'none', transition: 'stroke 0.3s ease' }}
          role="button"
          tabIndex={0}
          aria-label="Drag to move"
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to move', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setHoveredKnob(true)
            }
          }}
        />
        <circle
          cx={controlKnobPos.x}
          cy={controlKnobPos.y}
          r="16"
          fill="transparent"
          stroke="transparent"
          style={{ cursor: 'grab', pointerEvents: 'all' }}
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to move', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
        />
        <circle
          cx={controlKnobPos.x}
          cy={controlKnobPos.y}
          r="8"
          fill="#FFFDF3"
          stroke={hoveredKnob || isDragging ? '#FDABD3' : '#000'}
          strokeWidth="2"
          style={{ cursor: 'grab', pointerEvents: 'all', filter: (hoveredKnob || isDragging) ? glowFilter : 'none', transition: 'stroke 0.3s ease' }}
          role="button"
          tabIndex={0}
          aria-label="Drag to move"
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to move', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to move', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setHoveredKnob(true)
            }
          }}
        />
      </svg>

      <div
        className="absolute select-none leading-none"
        style={{
          left: `${letterPos.x}px`,
          top: `${letterPos.y}px`,
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
          lineHeight: '0.9em',
          pointerEvents: 'none',
          transform: `translate(-50%, -50%) translateY(${letterGlyphOffsetY}px)`,
          transformOrigin: '50% 50%'
        }}
        aria-label={`${selectedLetterKey} letter`}
      >
        {selectedLetter.arabic}
      </div>

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

      {showMoveHint && (
        <div
          style={{
            position: 'fixed',
            left: `${controlKnobPos.x + 24}px`,
            top: `${controlKnobPos.y - 48}px`,
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
          MOVE
        </div>
      )}
    </div>
  )
}
