'use client'

import { useEffect, useMemo, useRef, useState, memo } from 'react'
import { MobileChrome } from '../components/MobileChrome'
import { clearHomeLayout, getNavStackLength, popNavStack, pushNavStack } from '../components/navState'
import { useMediaQuery } from '../components/useMediaQuery'

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

const TopBar = ({ hoveredElement, setHoveredElement, readingMode, analyticsText, glowFilter, showTooltip, hideTooltip, onNavigate }) => {
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
                  if (onNavigate) {
                    onNavigate(`/${category}`)
                  } else {
                    window.location.href = `/${category}`
                  }
                }}
                onKeyDown={(e) => {
                  if (readingMode || isActivePage) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (onNavigate) {
                      onNavigate(`/${category}`)
                    } else {
                      window.location.href = `/${category}`
                    }
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

const LeftPanel = ({ readingMode, toggleReadingMode, showTooltip, hideTooltip, onBack, backDisabled = false, onHome }) => (
  <>
    <div className="fixed left-16 top-10 bottom-10" style={{ width: '2px', background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)', opacity: 0.8, zIndex: 5 }} />
    <div className="fixed top-36" style={{ left: '16px', transform: 'rotate(-90deg)', transformOrigin: 'left top', fontFamily: 'var(--font-karla)', fontSize: '24px', fontWeight: 800, color: '#000', zIndex: 6, pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
      REFLECT
    </div>
    <div className="fixed left-4 bottom-10 flex flex-col gap-4" style={{ zIndex: 6 }}>
      {onBack && (
        <button
          onClick={() => { if (!readingMode && !backDisabled) onBack() }}
          aria-label="Back"
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', backgroundColor: readingMode || backDisabled ? '#e5e5e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: readingMode || backDisabled ? 'default' : 'pointer', transition: 'all 0.3s ease', color: readingMode || backDisabled ? '#8f8f8f' : '#000' }}
          onMouseEnter={(e) => { if (readingMode || backDisabled) return; e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#FFFDF3'; showTooltip('Back', e, 'right') }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = readingMode || backDisabled ? '#e5e5e5' : 'transparent'; e.currentTarget.style.color = readingMode || backDisabled ? '#8f8f8f' : '#000'; hideTooltip() }}
          onFocus={(e) => { if (!readingMode && !backDisabled) showTooltip('Back', e, 'right') }}
          onBlur={hideTooltip}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M10 7l-5 5 5 5" />
          </svg>
        </button>
      )}
      <button
        onClick={onHome}
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

const RightPanel = ({ hoveredElement, setHoveredElement, expandedCategory, setExpandedCategory, readingMode, glowFilter, onNavigate }) => {
  const disabled = readingMode
  const activePage = 'reflect'
  const categories = [
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]
  const handleSubNav = (sub, category) => {
    if (onNavigate) {
      if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
        onNavigate(`/make/${sub === 'things' ? 'things' : 'spaces'}`)
        return
      }
      if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
        onNavigate(`/view/${sub}`)
        return
      }
      if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
        onNavigate(`/reflect/${sub}`)
        return
      }
      if (category === 'connect') {
        onNavigate('/connect')
        return
      }
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [swipeStart, setSwipeStart] = useState(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const hintShownRef = useRef(false)
  const mobileMenuTimerRef = useRef(null)

  const letterSize = isMobile ? 170 : 200
  const baseRadius = isMobile ? 90 : 120
  const letterVisualOffset = { x: 0, y: -38 }
  const letterGlyphOffsetY = isMobile ? -20 : -8 // to visually center the Arabic letter
  const orbitOffset = { x: 0, y: 33 } // offset to center orbit around visual center of letter
  const readingBodyStyle = { top: 120, right: 300, maxWidth: 250 }
  const mobileSubnav = useMemo(() => ([
    { label: 'research', href: '/reflect/research' },
    { label: 'teaching', href: '/reflect/teaching' }
  ]), [])
  const dwellMs = 250
  const targetSnapThreshold = 14
  const magneticSnapDistance = 30

  const seed = useState(() => createSeed(baseRadius))[0]
  const targetCentersRef = useRef(null)

  const letterPosition = useMemo(() => {
    if (typeof window === 'undefined') return null
    if (isMobile) {
      return {
        x: window.innerWidth / 2 - letterSize / 2,
        y: window.innerHeight / 2 - letterSize / 2
      }
    }
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
  }, [isMobile, letterSize, letterVisualOffset.x, letterVisualOffset.y])

  const targets = useMemo(() => {
    if (!letterPosition || typeof window === 'undefined') return []
    if (!targetCentersRef.current) {
      const minDist = baseRadius * 1.2
      const { innerWidth, innerHeight } = window
      const margin = isMobile
        ? { top: 100, bottom: 140, left: 60, right: 60 }
        : { top: 200, bottom: 200, left: 220, right: 320 }
      const [r1, r2] = seed.radii
      const clampRange = (val, min, max) => Math.min(Math.max(val, min), max)
      const randomCenter = (r) => {
        const availX = Math.max(innerWidth - (margin.left + margin.right) - 2 * r, 0)
        const availY = Math.max(innerHeight - (margin.top + margin.bottom) - 2 * r, 0)
        const baseX = Math.random() < 0.5 ? margin.left + r : innerWidth - margin.right - r
        const baseY = Math.random() < 0.5 ? margin.top + r : innerHeight - margin.bottom - r
        const jitterX = (Math.random() - 0.5) * Math.max(availX * 0.6, 40)
        const jitterY = (Math.random() - 0.5) * Math.max(availY * 0.6, 40)
        const cx = baseX + jitterX
        const cy = baseY + jitterY
        return {
          x: clampRange(cx, r + margin.left, innerWidth - r - margin.right),
          y: clampRange(cy, r + margin.top, innerHeight - r - margin.bottom)
        }
      }
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
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const hasHistory = getNavStackLength() > 0
    const hasFallback = window.location.pathname !== '/'
    setCanGoBack(hasHistory || hasFallback)
    return undefined
  }, [])

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

  useEffect(() => {
    if (!isMobile || readingMode) return undefined
    const key = 'swipeHintReflectShown'
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
      setCanGoBack(true)
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
    if (dx < -50) {
      navigateWithFade('/connect')
    } else if (dx > 50) {
      navigateWithFade('/view')
    }
  }

  const handleBack = () => {
    const hasHistory = getNavStackLength() > 0
    const target = hasHistory ? popNavStack() : '/'
    setCanGoBack(getNavStackLength() > 0 || window.location.pathname !== '/')
    if (typeof window !== 'undefined') {
      const here = window.location.pathname + window.location.search
      if (target === here) return
    }
    window.location.href = target
  }

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

  const handleTouchStartDrag = (e) => {
    const touch = e.touches[0]
    if (!touch) return
    setIsDragging(true)
    e.stopPropagation()
    e.preventDefault()
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleTouchMoveDrag = (e) => {
    if (!isDragging) return
    const touch = e.touches[0]
    if (!touch) return
    e.stopPropagation()
    e.preventDefault()
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleTouchEndDrag = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(false)
  }

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
    const timer = setTimeout(() => { navigateWithFade(`/reflect/${navigatingTo}`) }, 300)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  if (!letterPosition) return null
  if (!hasMounted) return null

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

      {!isMobile && (
        <>
          <TopBar hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} readingMode={readingMode} analyticsText={analyticsText} glowFilter={glowFilter} showTooltip={showTooltip} hideTooltip={hideTooltip} onNavigate={navigateWithFade} />
          <LeftPanel readingMode={readingMode} toggleReadingMode={toggleReadingMode} showTooltip={showTooltip} hideTooltip={hideTooltip} onBack={handleBack} backDisabled={!canGoBack} onHome={() => navigateWithFade('/')} />
          <RightPanel hoveredElement={hoveredElement} setHoveredElement={setHoveredElement} expandedCategory={expandedCategory} setExpandedCategory={setExpandedCategory} readingMode={readingMode} glowFilter={glowFilter} onNavigate={navigateWithFade} />
        </>
      )}

      {!isMobile && notice && (
        <div className="fixed top-10 left-20" style={{ zIndex: 60, background: '#000', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--font-karla)', fontSize: '12px', letterSpacing: '0.02em' }}>
          {notice}
        </div>
      )}

      {readingMode && !isMobile && (
        <>
          <div className="fixed left-30 top-110 max-w-sm" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '40px', fontWeight: 200, lineHeight: '40px', maxWidth: '400px', color: '#000' }}>
            Perspectives on interactivity, presence, and quality across immersive media and design. Methods, studies, and pedagogy that are evidence-led, practice-linked, and open to challenge.
          </div>
          <div className="fixed" style={{ zIndex: 40, fontFamily: 'var(--font-karla)', fontSize: '13px', fontWeight: 400, lineHeight: '16px', color: '#000', ...readingBodyStyle }}>
            Research and teaching as reflective practices that reshape how we perceive and build. To reflect is to fold experience back onto itself: to notice patterns, question assumptions, and surface tacit knowledge. Research and teaching are twin laboratories for this work-one probing, one distilling. Each experiment, each studio critique, is a mirror that scales our thinking up or down, revealing proportions we had not seen. Reflection is not retreat; it is calibration for what comes next.
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
            Perspectives on interactivity, presence, and quality across immersive media and design. Methods, studies, and pedagogy that are evidence-led, practice-linked, and open to challenge.
          </div>
        </div>
      )}

      {isMobile && (
      <MobileChrome
        title="reflect"
        subnav={mobileSubnav}
        activeDot="reflect"
        bottomLabel=""
        readingMode={readingMode}
        onPrimaryAction={toggleReadingMode}
        primaryActive={readingMode}
        onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
        secondaryIcon="shuffle"
        onBack={handleBack}
        backDisabled={!canGoBack}
        onNavigate={(key, href) => { navigateWithFade(href) }}
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

      {(() => {
        if (!targets.length) return null
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

        const nodes = targets.map((t) => {
          const { x: tx, y: ty } = getTargetPoint(t)
          const alongOffset = 8
          const perpOffset = 34
          const basePos = {
            x: tx + Math.cos(t.angle * Math.PI / 180) * alongOffset,
            y: ty + Math.sin(t.angle * Math.PI / 180) * alongOffset
          }
          const perp = { x: -Math.sin(t.angle * Math.PI / 180), y: Math.cos(t.angle * Math.PI / 180) }
          const candidates = [
            { x: basePos.x + perp.x * perpOffset, y: basePos.y + perp.y * perpOffset },
            { x: basePos.x - perp.x * perpOffset, y: basePos.y - perp.y * perpOffset }
          ]
          return { target: t, pos: { tx, ty }, candidates }
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

        return labelNodes.map((ln, idx) => {
          const labelText = `Open ${ln.target.label}`
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${ln.box.x + labelSize.width / 2}px`,
                top: `${ln.box.y + labelSize.height / 2}px`,
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
              onClick={() => setNavigatingTo(ln.target.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setNavigatingTo(ln.target.label)
                }
              }}
            >
              {ln.target.label}
            </div>
          )
        })
      })()}

      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 4, pointerEvents: 'auto' }}>
        <circle
          cx={knobX}
          cy={knobY}
          r="16"
          fill="transparent"
          stroke="transparent"
          style={{ cursor: 'grab', pointerEvents: 'all', touchAction: 'none' }}
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to scale', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={handleKnobKeyDown}
          onTouchStart={handleTouchStartDrag}
          onTouchMove={handleTouchMoveDrag}
          onTouchEnd={handleTouchEndDrag}
        />
        <circle
          cx={knobX}
          cy={knobY}
          r="8"
          fill={knobFill}
          stroke={knobStroke}
          strokeWidth="2"
          style={{ cursor: 'grab', pointerEvents: 'all', filter: knobFilter, transition: 'stroke 0.3s ease, fill 0.3s ease', touchAction: 'none' }}
          role="button"
          tabIndex={0}
          aria-label="Drag to scale"
          onMouseDown={(e) => { handleMouseDown(e); showTooltip('Drag to scale', e) }}
          onMouseEnter={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onMouseLeave={() => { setHoveredKnob(false); hideTooltip() }}
          onFocus={(e) => { setHoveredKnob(true); showTooltip('Drag to scale', e) }}
          onBlur={() => { setHoveredKnob(false); hideTooltip() }}
          onKeyDown={handleKnobKeyDown}
          onTouchStart={handleTouchStartDrag}
          onTouchMove={handleTouchMoveDrag}
          onTouchEnd={handleTouchEndDrag}
        />
      </svg>

      <div
        className="absolute select-none leading-none"
        style={{
          left: `${letterCenterX}px`,
          top: `${letterCenterY}px`,
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
          lineHeight: '0.9em',
          pointerEvents: 'none',
          transform: `translate(-50%, -50%) translateY(${letterGlyphOffsetY}px) scale(${scaleFactor})`,
          transformOrigin: '50% 50%'
        }}
        aria-label={`${selectedLetterKey} letter`}
      >
        {selectedLetter.arabic}
      </div>

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

      {!isMobile && showScaleHint && letterPosition && (
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
