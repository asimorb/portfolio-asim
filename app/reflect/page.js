'use client'

import { useEffect, useMemo, useRef, useState, memo } from 'react'

const createSeed = (baseRadius) => {
  const angles = []
  while (angles.length < 2) {
    const candidate = Math.random() * 360
    if (angles.every((a) => Math.abs(candidate - a) > 50)) angles.push(candidate)
  }
  const radii = [
    baseRadius * (1.2 + Math.random() * 0.6),
    baseRadius * (1.6 + Math.random() * 0.9)
  ].sort(() => Math.random() - 0.5)
  const order = ['research', 'teaching'].sort(() => Math.random() - 0.5)
  return { angles, radii, order }
}

const TimeDisplay = memo(() => {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDay, setCurrentDay] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hours}.${minutes}.${seconds}`)

      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      setCurrentDay(days[now.getDay()])

      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      setCurrentDate(`${day}.${month}.${year}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 100)
    return () => clearInterval(interval)
  }, [setCurrentDate, setCurrentDay, setCurrentTime])

  return (
    <div
      className="flex items-center gap-3"
      style={{
        fontFamily: 'var(--font-karla)',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        whiteSpace: 'nowrap',
        fontSize: '14px'
      }}
    >
      <span>{currentTime}</span>
      <span>/</span>
      <span>{currentDay}</span>
      <span>/</span>
      <span>{currentDate}</span>
    </div>
  )
})
TimeDisplay.displayName = 'TimeDisplay'

const TopBar = ({ hoveredElement, setHoveredElement, readingMode, analyticsText, glowFilter, showTooltip, hideTooltip }) => {
  const dotCategories = ['connect', 'reflect', 'view', 'make']
  const activePage = 'reflect'
  return (
    <div
      className="fixed top-10 left-30 right-10 flex items-center justify-between"
      style={{
        zIndex: 5,
        fontFamily: 'var(--font-karla)',
        fontSize: '14px',
        fontWeight: 400,
        color: '#000',
        pointerEvents: readingMode ? 'none' : 'auto'
      }}
    >
      <div style={{ minWidth: '240px', color: '#000000' }}>
        {analyticsText}
      </div>

      <div className="flex items-center">
        <TimeDisplay />
        <div className="mx-8" style={{ width: '25vw', height: '1px', background: '#000', opacity: 0.3 }} />
        <div className="flex items-center gap-3">
          {dotCategories.map((category) => {
            const isActivePage = category === activePage
            const isHovered = hoveredElement === category
            const bgColor = isActivePage ? '#ADADAD' : isHovered ? '#FDABD3' : '#000'
            const filter = isHovered ? glowFilter : 'none'
            return (
              <div
                key={category}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: bgColor,
                  filter,
                  transition: 'background-color 0.3s ease',
                  cursor: isActivePage ? 'default' : 'pointer'
                }}
                role="button"
                aria-label={category}
                tabIndex={isActivePage ? -1 : 0}
                onMouseEnter={(e) => {
                  if (readingMode || isActivePage) return
                  setHoveredElement(category)
                  showTooltip(category, e)
                }}
                onClick={() => {
                  if (readingMode || isActivePage) return
                  window.location.href = `/${category}`
                }}
                onKeyDown={(e) => {
                  if (readingMode || isActivePage) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    window.location.href = `/${category}`
                  }
                }}
                onMouseLeave={() => {
                  setHoveredElement(null)
                  hideTooltip()
                }}
                onFocus={(e) => {
                  if (readingMode || isActivePage) return
                  setHoveredElement(category)
                  showTooltip(category, e)
                }}
                onBlur={() => {
                  setHoveredElement(null)
                  hideTooltip()
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const LeftPanel = ({ readingMode, toggleReadingMode, showTooltip, hideTooltip }) => (
  <>
    <div className="fixed left-16 top-10 bottom-10" style={{ width: '2px', background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)', opacity: 0.8, zIndex: 5 }} />
    <div className="fixed top-36" style={{ left: '16px', transform: 'rotate(-90deg)', transformOrigin: 'left top', fontFamily: 'var(--font-karla)', fontSize: '24px', fontWeight: 800, color: '#000', zIndex: 6, pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
      REFLECT
    </div>
    <div className="fixed left-4 bottom-10 flex flex-col gap-4" style={{ zIndex: 6 }}>
      <button
        onClick={() => window.location.href = '/'}
        aria-label="Home"
        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', color: '#000' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#FFFDF3'; showTooltip('Home', e, 'right') }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; hideTooltip() }}
        onFocus={(e) => showTooltip('Home', e, 'right')}
        onBlur={hideTooltip}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4 7.58 4 4 7.58 4 12s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08a6 6 0 1 1-5.65-8c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" /></svg>
      </button>
      <button
        onClick={toggleReadingMode}
        aria-label="Toggle reading mode"
        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', backgroundColor: readingMode ? '#000' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'var(--font-karla)', fontSize: '18px', fontWeight: 600, color: readingMode ? '#FFFDF3' : '#000', transition: 'all 0.3s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#FFFDF3'; showTooltip(readingMode ? 'Trivia off' : 'Trivia on', e, 'right') }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = readingMode ? '#000' : 'transparent'; e.currentTarget.style.color = readingMode ? '#FFFDF3' : '#000'; hideTooltip() }}
        onFocus={(e) => showTooltip(readingMode ? 'Trivia off' : 'Trivia on', e, 'right')}
        onBlur={hideTooltip}
      >
        i
      </button>
    </div>
  </>
)

const RightPanel = ({ hoveredElement, setHoveredElement, expandedCategory, setExpandedCategory, readingMode, glowFilter }) => {
  const disabled = readingMode
  const activePage = 'reflect'
  const categories = [
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]
  const handleSubNav = (sub, category) => {
    if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = sub === 'things' ? '/make/things' : '/make/spaces'
      return
    }
    if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
      window.location.href = `/view/${sub}`
      return
    }
    if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
      window.location.href = `/reflect/${sub}`
      return
    }
    if (category === 'connect') {
      window.location.href = '/connect'
      return
    }
  }
  const activeCategory = categories.find((c) => c.name === activePage)
  const inactiveCategories = categories.filter((c) => c.name !== activePage)
  const expandedInactive = expandedCategory && expandedCategory !== activePage
    ? inactiveCategories.find((c) => c.name === expandedCategory)
    : null
  const otherInactive = expandedInactive
    ? inactiveCategories.filter((c) => c.name !== expandedCategory)
    : inactiveCategories

  return (
    <>
      <div
        className="fixed right-10 bottom-10"
        style={{
          width: '2px',
          height: '350px',
          background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)',
          opacity: 0.8,
          zIndex: 5
        }}
      />
      <div className="fixed right-15 bottom-10" style={{ zIndex: 5 }}>
        <div
          className="flex flex-col items-end"
          onMouseLeave={() => {
            setHoveredElement(null)
            setExpandedCategory(null)
          }}
          style={{
            fontFamily: 'var(--font-karla)',
            letterSpacing: '-0.02em',
            position: 'relative',
            height: '350px',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: disabled ? 'none' : 'auto'
          }}
        >
          <div className="flex flex-col items-end gap-3">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#ADADAD', cursor: 'default', textAlign: 'right', lineHeight: 1 }}>
                {activeCategory.name}
              </div>
              <div className="flex flex-col items-end gap-1 mt-1" style={{ fontSize: '18px', fontWeight: 400, color: '#000', paddingRight: '8px' }}>
                {activeCategory.subcategories.map((sub) => (
                  <div
                    key={sub}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${sub}`}
                    onClick={() => handleSubNav(sub, activeCategory.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSubNav(sub, activeCategory.name)
                      }
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            </div>
            {expandedInactive && (
              <div
                onMouseEnter={() => {
                  if (disabled) return
                  setHoveredElement(expandedInactive.name)
                }}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', transition: 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), color 0.25s ease' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#FDABD3', filter: glowFilter, cursor: 'default', textAlign: 'right', lineHeight: 1 }}>
                  {expandedInactive.name}
                </div>
                <div className="flex flex-col items-end gap-1 mt-1" style={{ fontSize: '18px', fontWeight: 400, color: '#000', paddingRight: '8px' }}>
                  {expandedInactive.subcategories.map((sub) => (
                    <div
                      key={sub}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${sub}`}
                    onClick={() => handleSubNav(sub, expandedInactive.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSubNav(sub, expandedInactive.name)
                      }
                    }}
                  >
                    {sub}
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {otherInactive.map((category) => {
              const isHovered = hoveredElement === category.name
              return (
                <div
                  key={category.name}
                  onMouseEnter={() => {
                    if (disabled) return
                    setHoveredElement(category.name)
                  }}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', transform: isHovered ? 'translateY(-6px)' : 'translateY(0)', transition: 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), color 0.25s ease' }}
                >
                  <div
                    style={{ fontSize: '24px', fontWeight: 600, color: isHovered ? '#FDABD3' : '#000', filter: isHovered ? glowFilter : 'none', cursor: 'default', textAlign: 'right', lineHeight: 1 }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to ${category.name}`}
                  >
                    {category.name}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ReflectPage() {
  const selectedLetterKey = 'sad'
  const selectedLetter = { arabic: '\u0635', label: 'reflect' }

  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [notice, setNotice] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [timeInZone, setTimeInZone] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredKnob, setHoveredKnob] = useState(false)
  const [showScaleHint, setShowScaleHint] = useState(false)
  const [pageOpacity, setPageOpacity] = useState(0)

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)

  const letterSize = 200
  const baseRadius = 120
  const letterVisualOffset = { x: 0, y: -38 }
  const letterGlyphOffsetY = -8 // to visually center the Arabic letter
  const orbitOffset = { x: 0, y: 33 } // offset to center orbit around visual center of letter
  const readingBodyStyle = { top: 120, right: 300, maxWidth: 250 }
  const dwellMs = 250
  const targetSnapThreshold = 14
  const magneticSnapDistance = 30

  const seed = useState(() => createSeed(baseRadius))[0]
  const targetCentersRef = useRef(null)

  const letterPosition = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const posX = params.get('letterX')
    const posY = params.get('letterY')
    if (posX && posY) {
      return {
        x: parseFloat(posX) - letterVisualOffset.x,
        y: parseFloat(posY) - letterVisualOffset.y
      }
    }
    return { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 }
  }, [letterVisualOffset.x, letterVisualOffset.y])

  const targets = useMemo(() => {
    if (!letterPosition || typeof window === 'undefined') return []
    if (!targetCentersRef.current) {
      const minDist = baseRadius * 1.2
      const { innerWidth, innerHeight } = window
      const margin = { top: 200, bottom: 200, left: 220, right: 320 }
      const [r1, r2] = seed.radii
      const randomCenter = (r) => ({
        // eslint-disable-next-line react-hooks/purity -- one-time random seeding for target centers
        x: margin.left + r + Math.random() * Math.max(innerWidth - (margin.left + margin.right) - 2 * r, 200),
        // eslint-disable-next-line react-hooks/purity -- one-time random seeding for target centers
        y: margin.top + r + Math.random() * Math.max(innerHeight - (margin.top + margin.bottom) - 2 * r, 200)
      })
      let c1 = randomCenter(r1)
      let c2 = randomCenter(r2)
      let tries = 0
      while (Math.hypot(c1.x - c2.x, c1.y - c2.y) < minDist && tries < 20) {
        c2 = randomCenter(r2)
        tries += 1
      }
      targetCentersRef.current = [c1, c2]
    }
    return [
      { label: seed.order[0], angle: seed.angles[0], radius: seed.radii[0], center: targetCentersRef.current[0] },
      { label: seed.order[1], angle: seed.angles[1], radius: seed.radii[1], center: targetCentersRef.current[1] }
    ]
  }, [letterPosition, seed])

  const [knobAngle, setKnobAngle] = useState(() => (targets[0]?.angle ?? 0) + 45)
  const [knobRadius, setKnobRadius] = useState(baseRadius)

  const letterCenterX = letterPosition ? letterPosition.x + letterSize / 2 + letterVisualOffset.x : 0
  const letterCenterY = letterPosition ? letterPosition.y + letterSize / 2 + letterVisualOffset.y : 0
  const orbitCenterX = letterCenterX + orbitOffset.x
  const orbitCenterY = letterCenterY + orbitOffset.y
  const knobX = orbitCenterX + Math.cos(knobAngle * Math.PI / 180) * knobRadius
  const knobY = orbitCenterY + Math.sin(knobAngle * Math.PI / 180) * knobRadius
  const scaleFactor = knobRadius / baseRadius

  const getTargetPoint = (t) => ({
    x: t.center.x + Math.cos(t.angle * Math.PI / 180) * t.radius,
    y: t.center.y + Math.sin(t.angle * Math.PI / 180) * t.radius
  })

  const targetProximity = useMemo(() => {
    if (!letterPosition || !targets.length) return null
    let closest = null
    targets.forEach((t) => {
      const pt = getTargetPoint(t)
      const d = Math.hypot(pt.x - knobX, pt.y - knobY)
      if (!closest || d < closest.distance) closest = { target: t, point: pt, distance: d }
    })
    return closest
  }, [letterPosition, targets, knobX, knobY])
  const isAtTarget = targetProximity && targetProximity.distance <= targetSnapThreshold

  const normalizeAngle = (angle) => {
    const normalized = angle % 360
    return normalized < 0 ? normalized + 360 : normalized
  }

  useEffect(() => {
    const randomOffset = Math.floor(Math.random() * 360)
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--glow-offset', `${randomOffset}deg`)
    }
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
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
    if (hintShownRef.current) return undefined
    hintShownRef.current = true
    const showTimer = setTimeout(() => setShowScaleHint(true), 500)
    const hideTimer = setTimeout(() => setShowScaleHint(false), 2000)
    return () => {
      hintShownRef.current = false
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

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

  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    if (hoveredElement && ['make', 'view', 'reflect', 'connect'].includes(hoveredElement)) {
      expandTimerRef.current = setTimeout(() => setExpandedCategory(hoveredElement), 500)
    } else if (expandedCategory) {
      collapseTimerRef.current = setTimeout(() => setExpandedCategory(null), 500)
    }
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [hoveredElement, expandedCategory])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    e.stopPropagation()
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !letterPosition) return
    const dx = e.clientX - orbitCenterX
    const dy = e.clientY - orbitCenterY
    const angle = normalizeAngle(Math.atan2(dy, dx) * 180 / Math.PI)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const minRadius = baseRadius * 0.3
    const maxRadius = targets.length
      ? Math.max(...targets.map((t) => {
        const pt = getTargetPoint(t)
        return Math.hypot(pt.x - orbitCenterX, pt.y - orbitCenterY)
      })) + 60
      : baseRadius * 2
    let nextAngle = angle
    let nextRadius = Math.min(Math.max(dist, minRadius), maxRadius)
    if (targetProximity && targetProximity.distance <= magneticSnapDistance) {
      const targetAngle = normalizeAngle(Math.atan2(targetProximity.point.y - orbitCenterY, targetProximity.point.x - orbitCenterX) * 180 / Math.PI)
      const targetRadius = Math.hypot(targetProximity.point.x - orbitCenterX, targetProximity.point.y - orbitCenterY)
      const blend = Math.min(1, (magneticSnapDistance - targetProximity.distance) / magneticSnapDistance)
      nextAngle = targetAngle * blend + nextAngle * (1 - blend)
      nextRadius = targetRadius * blend + nextRadius * (1 - blend)
      if (targetProximity.distance <= targetSnapThreshold) {
        nextAngle = targetAngle
        nextRadius = targetRadius
      }
    }
    nextRadius = Math.min(Math.max(nextRadius, minRadius), maxRadius)
    setKnobAngle(nextAngle)
    setKnobRadius(nextRadius)
  }

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [])

  const snapToClosest = () => {
    if (!targets.length || !letterPosition) return null
    let best = targets[0]
    let bestDist = Infinity
    targets.forEach((t) => {
      const { x: tx, y: ty } = getTargetPoint(t)
      const d = Math.hypot(tx - knobX, ty - knobY)
      if (d < bestDist) {
        bestDist = d
        best = t
      }
    })
    setKnobAngle(best.angle)
    setKnobRadius(best.radius)
    return best
  }

  const handleKnobKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    const target = snapToClosest()
    if (target) {
      setTimeInZone(0)
    }
  }

  const analyticsText = `S : ${scaleFactor.toFixed(2)}x / D : ${normalizeAngle(knobAngle).toFixed(0)}\u00b0`

  useEffect(() => {
    if (!isAtTarget || !targetProximity || navigatingTo) {
      setTimeInZone(0)
      return undefined
    }
    const interval = setInterval(() => {
      setTimeInZone((prev) => {
        const next = prev + 100
        if (next >= dwellMs) {
          setNavigatingTo(targetProximity.target.label)
          return prev
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isAtTarget, targetProximity, dwellMs, navigatingTo])

  useEffect(() => {
    if (!navigatingTo) return undefined
    const timer = setTimeout(() => { window.location.href = `/reflect/${navigatingTo}` }, 300)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  if (!letterPosition) return null

  const knobActive = isDragging || hoveredKnob
  const knobFill = isAtTarget ? '#FDABD3' : '#FFFDF3'
  const knobStroke = (hoveredKnob || isDragging || isAtTarget) ? '#FDABD3' : '#000'
  const knobFilter = (hoveredKnob || isDragging || isAtTarget) ? glowFilter : 'none'

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        if (isDragging) {
          setIsDragging(false)
          snapToClosest()
        }
      }}
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

      <TopBar hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} readingMode={readingMode} analyticsText={analyticsText} glowFilter={glowFilter} showTooltip={showTooltip} hideTooltip={hideTooltip} />
      <LeftPanel readingMode={readingMode} toggleReadingMode={toggleReadingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} />
      <RightPanel hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} expandedCategory={expandedCategory} setExpandedCategory={setExpandedCategory} readingMode={readingMode} glowFilter={glowFilter} />

      {notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
      )}

      {readingMode && (
        <>
          <div className="fixed left-30 top-110 max-w-sm" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '40px', fontWeight: 200, lineHeight: '40px', maxWidth: '400px', color: '#000' }}>
            Perspectives on interactivity, presence, and quality across immersive media and design. Methods, studies, and pedagogy that are evidence-led, practice-linked, and open to challenge.
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', ...readingBodyStyle }}>
            Research and teaching as reflective practices that reshape how we perceive and build. To reflect is to fold experience back onto itself: to notice patterns, question assumptions, and surface tacit knowledge. Research and teaching are twin laboratories for this work-one probing, one distilling. Each experiment, each studio critique, is a mirror that scales our thinking up or down, revealing proportions we had not seen. Reflection is not retreat; it is calibration for what comes next.
          </div>
        </>
      )}

      <div className={`absolute inset-0 bg-white pointer-events-none ${navigatingTo ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 50, transition: 'opacity 2s ease-in-out', backgroundColor: '#FFFDF3' }} />

        {targets.length > 0 && (
          <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 2, pointerEvents: 'none' }}>
          <circle cx={orbitCenterX} cy={orbitCenterY} r={knobRadius} stroke={knobActive ? '#FDABD3' : '#000'} strokeWidth="2" strokeDasharray="4,4" fill="none" style={{ filter: knobActive ? glowFilter : 'none' }} />
          {targets.map((t, idx) => {
            const { x: tx, y: ty } = getTargetPoint(t)
            return (
                <g key={idx}>
                  <circle cx={t.center.x} cy={t.center.y} r={t.radius} stroke="#FDABD3" strokeWidth="2" strokeDasharray="6,6" fill="none" style={{ filter: glowFilter }} />
                <circle cx={tx} cy={ty} r="8" fill="#FDABD3" className="pulse-dot" style={{ filter: glowFilter }} />
              </g>
            )
          })}
        </svg>
      )}

      {targets.map((t, idx) => {
        const { x: tx, y: ty } = getTargetPoint(t)
        const labelOffset = 60
        const lx = tx + Math.cos(t.angle * Math.PI / 180) * labelOffset
        const ly = ty + Math.sin(t.angle * Math.PI / 180) * labelOffset
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
              color: '#000',
              textTransform: 'uppercase',
              pointerEvents: 'auto',
              cursor: 'pointer',
              filter: hoveredElement === labelText ? glowFilter : 'none'
            }}
            role="button"
            tabIndex={0}
            aria-label={labelText}
            onMouseEnter={(e) => { setHoveredElement(labelText); showTooltip(labelText, e) }}
            onMouseLeave={() => { setHoveredElement(null); hideTooltip() }}
            onFocus={(e) => { setHoveredElement(labelText); showTooltip(labelText, e) }}
            onBlur={() => { setHoveredElement(null); hideTooltip() }}
            onClick={() => setNavigatingTo(t.label)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setNavigatingTo(t.label)
              }
            }}
          >
            {t.label}
          </div>
        )
      })}

      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4, pointerEvents: 'auto' }}>
        <circle
          cx={knobX}
          cy={knobY}
          r="16"
          fill="transparent"
          stroke="transparent"
          style={{ cursor: 'grab', pointerEvents: 'all' }}
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to scale', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={handleKnobKeyDown}
        />
        <circle
          cx={knobX}
          cy={knobY}
          r="8"
          fill={knobFill}
          stroke={knobStroke}
          strokeWidth="2"
          style={{ cursor: 'grab', pointerEvents: 'all', filter: knobFilter, transition: 'stroke 0.3s ease, fill 0.3s ease' }}
          role="button"
          tabIndex={0}
          aria-label="Drag to scale"
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to scale', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={handleKnobKeyDown}
        />
      </svg>

      <div
        className="absolute select-none leading-none"
        style={{
          left: `${letterCenterX}px`,
          top: `${letterCenterY}px`,
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
          transform: `translate(-50%, -50%) translateY(${letterGlyphOffsetY}px) scale(${scaleFactor})`,
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

      {showScaleHint && letterPosition && (
        <div
          style={{
            position: 'fixed',
            left: `${knobX + 12}px`,
            top: `${knobY - 32}px`,
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
          SCALE
        </div>
      )}
    </div>
  )
}
