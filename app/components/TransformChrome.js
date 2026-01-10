'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { clearHomeLayout, getNavStackLength, popNavStack, pushNavStack } from './navState'

export const TimeDisplay = memo(() => {
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
  }, [])

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

const BackIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="M10 7l-5 5 5 5" />
  </svg>
)

export function TopBarTransform({
  hoveredElement,
  setHoveredElement,
  readingMode,
  analyticsText,
  glowFilter,
  showTooltip,
  hideTooltip,
  activePage,
  dotCategories = ['connect', 'reflect', 'view', 'make'],
  glowActive = false,
  onNavigate = null
}) {
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
                onClick={() => {
                  if (readingMode || isActivePage) return
                  if (onNavigate) {
                    pushNavStack(window.location.pathname + window.location.search)
                    onNavigate(category)
                  } else {
                    if (typeof window !== 'undefined') {
                      pushNavStack(window.location.pathname + window.location.search)
                    }
                    window.location.href = `/${category}`
                  }
                }}
                onKeyDown={(e) => {
                  if (readingMode || isActivePage) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (onNavigate) {
                      pushNavStack(window.location.pathname + window.location.search)
                      onNavigate(category)
                    } else {
                      if (typeof window !== 'undefined') {
                        pushNavStack(window.location.pathname + window.location.search)
                      }
                      window.location.href = `/${category}`
                    }
                  }
                }}
                onMouseEnter={(e) => {
                  if (readingMode || isActivePage) return
                  setHoveredElement(category)
                  showTooltip(category, e)
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

export function LeftPanelTransform({
  readingMode,
  toggleReadingMode,
  showTooltip,
  hideTooltip,
  label,
  labelTop = 28,
  onBack = null,
  backDisabled = false,
  onShuffle = () => {
    if (typeof window !== 'undefined') {
      clearHomeLayout()
      window.location.replace('/')
    }
  },
  shuffleDisabled = false,
  hideBack = false
}) {
  const defaultBack = () => {
    if (typeof window === 'undefined') return
    window.location.href = '/'
  }
  const effectiveBack = onBack || defaultBack
  return (
    <>
      <div className="fixed left-16 top-10 bottom-10" style={{ width: '2px', background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)', opacity: 0.8, zIndex: 5 }} />
      <div
        className="fixed"
        style={{
          left: '16px',
          top: `${labelTop}px`,
          transform: 'rotate(-90deg)',
          transformOrigin: 'left top',
          fontFamily: 'var(--font-karla)',
          fontSize: '24px',
          fontWeight: 800,
          color: '#000',
          zIndex: 6,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </div>
      <div className="fixed left-4 bottom-10 flex flex-col gap-4" style={{ zIndex: 6 }}>
        {!hideBack && (
          <button
            onClick={() => { if (!readingMode && !backDisabled) effectiveBack() }}
            aria-label="Back"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', backgroundColor: readingMode || backDisabled ? '#e5e5e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: readingMode || backDisabled ? 'default' : 'pointer', transition: 'all 0.3s ease', color: readingMode || backDisabled ? '#8f8f8f' : '#000' }}
            onMouseEnter={(e) => {
              if (readingMode || backDisabled) return
              e.currentTarget.style.backgroundColor = '#000'
              e.currentTarget.style.color = '#FFFDF3'
              showTooltip('Back', e, 'right')
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = readingMode || backDisabled ? '#e5e5e5' : 'transparent'
              e.currentTarget.style.color = readingMode || backDisabled ? '#8f8f8f' : '#000'
              hideTooltip()
            }}
            onFocus={(e) => { if (!readingMode && !backDisabled) showTooltip('Back', e, 'right') }}
            onBlur={hideTooltip}
          >
            <BackIcon size={18} />
          </button>
        )}
        <button
          onClick={() => { if (!readingMode && !shuffleDisabled) onShuffle() }}
          aria-label="Shuffle"
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', backgroundColor: readingMode || shuffleDisabled ? '#e5e5e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: readingMode || shuffleDisabled ? 'default' : 'pointer', transition: 'all 0.3s ease', color: readingMode || shuffleDisabled ? '#8f8f8f' : '#000' }}
          onMouseEnter={(e) => { if (readingMode || shuffleDisabled) return; e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#FFFDF3'; showTooltip('Shuffle', e, 'right') }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = readingMode || shuffleDisabled ? '#e5e5e5' : 'transparent'; e.currentTarget.style.color = readingMode || shuffleDisabled ? '#8f8f8f' : '#000'; hideTooltip() }}
          onFocus={(e) => { if (!readingMode && !shuffleDisabled) showTooltip('Shuffle', e, 'right') }}
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
}

export function RightPanelTransform({
  hoveredElement,
  setHoveredElement,
  expandedCategory,
  setExpandedCategory,
  readingMode,
  showTooltip,
  hideTooltip,
  glowFilter,
  activePage,
  activeSubcategory = null,
  categories,
  onNavigate,
  glowActive = false
}) {
  const disabled = readingMode
  const handleNavigate = (sub, category) => {
    if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
      if (typeof window !== 'undefined') {
        pushNavStack(window.location.pathname + window.location.search)
      }
      window.location.href = `/view/${sub}`
      return
    }
    if (category === 'connect' && (sub === 'curriculum vitae' || sub === 'about me')) {
      const slug = sub === 'curriculum vitae' ? 'curriculum-vitae' : 'about-me'
      if (typeof window !== 'undefined') {
        pushNavStack(window.location.pathname + window.location.search)
      }
      window.location.href = `/connect/${slug}`
      return
    }
    if (onNavigate) {
      if (typeof window !== 'undefined') {
        pushNavStack(window.location.pathname + window.location.search)
      }
      onNavigate(sub, category)
      return
    }
    if (typeof window !== 'undefined') {
      pushNavStack(window.location.pathname + window.location.search)
    }
    window.location.href = `/${category}`
  }
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const activeCategory = categories.find((c) => c.name === activePage)
  const inactiveCategories = categories.filter((c) => c.name !== activePage)
  const expandedInactive = expandedCategory && expandedCategory !== activePage
    ? inactiveCategories.find((c) => c.name === expandedCategory)
    : null
  const otherInactive = expandedInactive
    ? inactiveCategories.filter((c) => c.name !== expandedCategory)
    : inactiveCategories

  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    if (hoveredElement && categories.some((c) => c.name === hoveredElement)) {
      expandTimerRef.current = setTimeout(() => setExpandedCategory(hoveredElement), 500)
    } else if (expandedCategory) {
      collapseTimerRef.current = setTimeout(() => setExpandedCategory(null), 500)
    }
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [hoveredElement, expandedCategory, categories, setExpandedCategory])

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
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${sub}`}
                    title={sub}
                    onClick={() => handleNavigate(sub, activeCategory.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleNavigate(sub, activeCategory.name)
                      }
                    }}
                  >
                    <span style={{ fontWeight: activeSubcategory === sub ? 800 : 400 }}>
                      {activeSubcategory === sub ? `${sub}   \u25CF` : sub}
                    </span>
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
                      title={sub}
                      onClick={() => handleNavigate(sub, expandedInactive.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleNavigate(sub, expandedInactive.name)
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
                  onMouseLeave={() => {
                    setHoveredElement(null)
                  }}
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
