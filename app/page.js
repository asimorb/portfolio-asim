'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MobileChrome } from './components/MobileChrome'
import { loadHomeLayout, persistHomeLayout, pushNavStack } from './components/navState'
import { useMediaQuery } from './components/useMediaQuery'

const getFormattedNow = () => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return {
    time: `${hours}.${minutes}.${seconds}`,
    day: days[now.getDay()],
    date: `${day}.${month}.${year}`
  }
}

const buildInitialLayout = () => {
  const letterKeys = ['ayin', 'alif', 'sad', 'mim']
  const order = [...letterKeys].sort(() => Math.random() - 0.5)
  const positions = {}

  order.forEach((letterKey, index) => {
    let validPositions = []
    if (index === 0) {
      validPositions = ['above', 'below', 'left']
    } else if (index === 1 || index === 2) {
      validPositions = ['above', 'below']
    } else {
      validPositions = ['above', 'below', 'right']
    }
    positions[letterKey] = validPositions[Math.floor(Math.random() * validPositions.length)]
  })

  return { order, positions }
}

const syncGlowOffset = () => {
  if (typeof window === 'undefined') return { angle: 0, delaySeconds: 0 }
  const key = 'glowStartMs'
  let start = Number(window.sessionStorage.getItem(key))
  if (!start) {
    start = Date.now()
    window.sessionStorage.setItem(key, `${start}`)
  }
  const elapsedMs = Date.now() - start
  const angle = (elapsedMs / 60000) * 360 % 360
  const delaySeconds = (elapsedMs / 1000) % 60
  document.documentElement.style.setProperty('--glow-offset', `${angle}deg`)
  return { angle, delaySeconds }
}

// ========================================
// TOP BAR COMPONENT
// ========================================
const TimeDisplay = memo(() => {
  const initialTime = getFormattedNow()
  const [currentTime, setCurrentTime] = useState(initialTime.time)
  const [currentDay, setCurrentDay] = useState(initialTime.day)
  const [currentDate, setCurrentDate] = useState(initialTime.date)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const next = getFormattedNow()
      setCurrentTime(next.time)
      setCurrentDay(next.day)
      setCurrentDate(next.date)
    }, 100)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div
      className="flex items-center gap-3"
      style={{
        fontFamily: 'var(--font-karla)',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        whiteSpace: 'nowrap'
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

const TopBar = ({ hoveredElement, setHoveredElement, readingMode, showDotTooltip, hideButtonTooltip, navigateWithFade }) => {
  const dotCategories = ['make', 'view', 'reflect', 'connect']
  
  return (
    <div 
      className="fixed top-10 left-10 right-10 flex items-center justify-end"
      style={{ 
        zIndex: 5,
        fontFamily: 'var(--font-karla)',
        fontSize: '14px',
        fontWeight: 400,
        color: '#000000',
        pointerEvents: readingMode ? 'none' : 'auto'
      }}
    >
      <div className="flex items-center gap-6">
        <TimeDisplay />
        <div 
          className="mx-8"
          style={{
            width: '25vw',
            height: '1px',
            background: '#000000',
            opacity: 0.3
          }}
        />
      
        <div className="flex flex-row-reverse items-center gap-3">
          {dotCategories.map((category) => {
            const isActive = hoveredElement === category
            return (
              <div
                key={category}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#FDABD3' : '#000000',
                  filter: isActive ? 'hue-rotate(var(--glow-rotation))' : 'none',
                  transition: 'background-color 0.3s ease',
                  cursor: 'pointer'
                }}
                role="button"
                tabIndex={0}
                aria-label={`Go to ${category}`}
                onMouseEnter={(e) => {
                  if (readingMode) return
                  setHoveredElement(category)
                  showDotTooltip(category, e)
                }}
                onMouseLeave={() => {
                  setHoveredElement(null)
                  hideButtonTooltip()
                }}
                onFocus={(e) => {
                  if (readingMode) return
                  setHoveredElement(category)
                  showDotTooltip(category, e)
                }}
                onBlur={() => {
                  setHoveredElement(null)
                  hideButtonTooltip()
                }}
                onClick={() => {
                  if (readingMode) return
                  navigateWithFade(category)
                }}
                onKeyDown={(e) => {
                  if (readingMode) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigateWithFade(category)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
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

// ========================================
// RIGHT PANEL COMPONENT
// ========================================
const RightPanel = ({ hoveredElement, setHoveredElement, expandedCategory, setExpandedCategory, readingMode, navigateWithFade }) => {
  const disabled = readingMode
  const categories = [
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]
  
  const baseHeight = 140
  const expandedHeight = 350
  const lineHeight = expandedCategory ? expandedHeight : baseHeight
  const expandedEntry = expandedCategory
    ? categories.find((c) => c.name === expandedCategory)
    : null
  const selectedIndex = expandedCategory
    ? categories.findIndex((c) => c.name === expandedCategory)
    : -1

  const topCategories = selectedIndex !== -1
    ? categories.slice(0, selectedIndex + 1)
    : []
  const bottomCategories = selectedIndex !== -1
    ? categories.slice(selectedIndex + 1)
    : categories

  return (
    <>
      {/* Vertical dotted line */}
      <div 
        className="fixed right-10 bottom-10"
        style={{
          width: '2px',
          height: `${lineHeight}px`,
          background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)',
          opacity: 0.8,
          zIndex: 5,
          transition: 'height 0.3s ease'
        }}
      />
      
      {/* Category labels */}
      <div 
        className="fixed right-15 bottom-10"
        style={{ zIndex: 5 }}
      >
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
            height: `${lineHeight}px`,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: disabled ? 'none' : 'auto'
          }}
        >
          <div className="flex flex-col items-end gap-3">
            {topCategories.map((category) => {
              const isActive = hoveredElement === category.name
              const isExpanded = expandedCategory === category.name
              
              if (isExpanded) {
                return (
                    <div 
                      key={category.name}
                      onMouseEnter={() => {
                        if (disabled) return
                        setHoveredElement(category.name)
                      }}
                      onMouseLeave={() => setHoveredElement(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '6px',
                      transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                      transition: 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), color 0.25s ease'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#FDABD3',
                        filter: 'hue-rotate(var(--glow-rotation))',
                        lineHeight: 1
                      }}
                    >
                      {category.name}
                    </div>
                    <div 
                      className="flex flex-col items-end gap-1 mt-1"
                      style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#000000',
                        paddingRight: '8px'
                      }}
                    >
                      {category.subcategories.map((sub) => {
                        const target =
                          category.name === 'make' && (sub === 'spaces' || sub === 'things')
                            ? (sub === 'things' ? 'make/things' : 'make/spaces')
                            : category.name === 'connect' && (sub === 'curriculum vitae' || sub === 'about me')
                            ? `connect/${sub === 'curriculum vitae' ? 'curriculum-vitae' : sub}`
                            : category.name === 'view' && (sub === 'speculations' || sub === 'images')
                              ? `view/${sub}`
                              : category.name
                        return (
                          <div
                            key={sub}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open ${sub}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigateWithFade(target)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                navigateWithFade(target)
                              }
                            }}
                          >
                            {sub}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <div 
                  key={category.name}
                  onMouseEnter={() => {
                    if (disabled) return
                    setHoveredElement(category.name)
                  }}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                    transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                    transition: 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), color 0.25s ease'
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: isActive ? '#FDABD3' : '#000000',
                      filter: isActive ? 'hue-rotate(var(--glow-rotation))' : 'none',
                      cursor: 'default',
                      textAlign: 'right',
                      lineHeight: 1
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to ${category.name}`}
                    onClick={() => navigateWithFade(category.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigateWithFade(category.name)
                      }
                    }}
                  >
                    {category.name}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col items-end gap-3">
            {bottomCategories.map((category) => {
              const isActive = hoveredElement === category.name
              
              return (
                <div 
                  key={category.name}
                  onMouseEnter={() => {
                    if (disabled) return
                    setHoveredElement(category.name)
                  }}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                    transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                    transition: 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), color 0.25s ease'
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: isActive ? '#FDABD3' : '#000000',
                      filter: isActive ? 'hue-rotate(var(--glow-rotation))' : 'none',
                      cursor: 'default',
                      textAlign: 'right',
                      lineHeight: 1
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to ${category.name}`}
                    onClick={() => navigateWithFade(category.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigateWithFade(category.name)
                      }
                    }}
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

// ========================================
// LEFT PANEL COMPONENT
// ========================================
const LeftPanel = ({ readingMode, shuffleLetters, toggleReadingMode, showButtonTooltip, hideButtonTooltip, onBack, backDisabled = false }) => {
  return (
    <>
      {/* Vertical dotted line */}
      <div 
        className="fixed left-16 top-10 bottom-10"
        style={{
          width: '2px',
          background: 'repeating-linear-gradient(to bottom, #000 0px, #000 2px, transparent 3px, transparent 6px)',
          opacity: 0.8,
          zIndex: 5
        }}
      />
      
      {/* Vertical "asim" text in English */}
      <div
        className="fixed top-32"
        style={{
          left: '16px', // Positions it close to/overlapping the dotted line
          transform: 'rotate(-90deg)',
          transformOrigin: 'left top',
          fontFamily: 'var(--font-karla)',
          fontSize: '24px',
          fontWeight: 800,
          color: '#000000',
          zIndex: 6,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.05em'
        }}
      >
        ASIM.O
      </div>
      
        {/* Bottom buttons container */}
        <div 
          className="fixed left-4 bottom-10 flex flex-col gap-4"
          style={{ zIndex: 6 }}
        >
          {onBack && (
            <button
              onClick={() => { if (!readingMode && !backDisabled) onBack() }}
              disabled={readingMode || backDisabled}
              aria-label="Back"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #000000',
                backgroundColor: readingMode || backDisabled ? '#e5e5e5' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: readingMode || backDisabled ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                color: readingMode || backDisabled ? '#8f8f8f' : '#000000'
              }}
              onMouseEnter={(e) => {
                if (readingMode || backDisabled) return
                e.currentTarget.style.backgroundColor = '#000000'
                e.currentTarget.style.color = '#FFFDF3'
                showButtonTooltip('Back', e, 'right')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = readingMode || backDisabled ? '#e5e5e5' : 'transparent'
                e.currentTarget.style.color = readingMode || backDisabled ? '#8f8f8f' : '#000000'
                hideButtonTooltip()
              }}
              onFocus={(e) => {
                if (readingMode || backDisabled) return
                showButtonTooltip('Back', e, 'right')
              }}
              onBlur={hideButtonTooltip}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M10 7l-5 5 5 5" />
              </svg>
            </button>
          )}
          {/* Stack/layers button */}
          <button
            onClick={shuffleLetters}
            disabled={readingMode}
            aria-label="Shuffle letters"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #000000',
              backgroundColor: readingMode ? '#e5e5e5' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: readingMode ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              color: '#000000',
              opacity: readingMode ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (readingMode) return
              e.currentTarget.style.backgroundColor = '#000000'
              e.currentTarget.style.color = '#FFFDF3'
              showButtonTooltip('Shuffle', e, 'right')
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = readingMode ? '#e5e5e5' : 'transparent'
              e.currentTarget.style.color = '#000000'
              hideButtonTooltip()
            }}
            onFocus={(e) => {
              if (readingMode) return
              showButtonTooltip('Shuffle', e, 'right')
            }}
            onBlur={hideButtonTooltip}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4 7.58 4 4 7.58 4 12s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08a6 6 0 1 1-5.65-8c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
            </svg>
          </button>
          
          {/* Info button */}
          <button
            onClick={toggleReadingMode}
            aria-label="Toggle reading mode"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #000000',
              backgroundColor: readingMode ? '#000000' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-karla)',
              fontSize: '18px',
              fontWeight: 600,
              color: readingMode ? '#FFFDF3' : '#000000',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000000'
              e.currentTarget.style.color = '#FFFDF3'
              showButtonTooltip(readingMode ? 'Trivia off' : 'Trivia on', e, 'right')
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = readingMode ? '#000000' : 'transparent'
              e.currentTarget.style.color = readingMode ? '#FFFDF3' : '#000000'
              hideButtonTooltip()
            }}
            onFocus={(e) => showButtonTooltip(readingMode ? 'Trivia off' : 'Trivia on', e, 'right')}
            onBlur={hideButtonTooltip}
          >
            i
          </button>
        </div>
    </>
  )
}

const GradientGlow = () => (
  <>
    <style jsx global>{`
      @property --glow-rotation {
        syntax: '<angle>';
        inherits: true;
        initial-value: 0deg;
      }

      @keyframes glowHue {
        0% { --glow-rotation: 0deg; }
        100% { --glow-rotation: 360deg; }
      }

      @keyframes restlessMove {
        0% { transform: translate(0, 0) scale(1); }
        15% { transform: translate(40px, -30px) scale(1.05); }
        30% { transform: translate(-50px, 20px) scale(0.96); }
        45% { transform: translate(35px, 45px) scale(1.03); }
        60% { transform: translate(-60px, -15px) scale(0.94); }
        75% { transform: translate(30px, -40px) scale(1.06); }
        90% { transform: translate(-40px, 30px) scale(0.98); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes hueRotate70 {
        0% { filter: blur(45px) hue-rotate(0deg); }
        100% { filter: blur(45px) hue-rotate(360deg); }
      }
      
      @keyframes hueRotate80 {
        0% { filter: blur(50px) hue-rotate(0deg); }
        100% { filter: blur(50px) hue-rotate(360deg); }
      }

      .glow-core-static {
        position: absolute;
        width: 160px;
        height: 160px;
        left: 20%;
        top: 36%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent);
        opacity: 0.7;
        filter: blur(30px) hue-rotate(var(--glow-rotation));
        animation: restlessMove 60s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
      }

      .glow-hue-driver {
        animation: glowHue 60s linear infinite;
      }
      
      .glow-core-transition {
        position: absolute;
        width: 500px;
        height: 500px;
        left: 30%;
        top: 58%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent);
        opacity: 0.6;
        animation: hueRotate80 80s linear infinite;
        pointer-events: none;
        z-index: 0;
      }
      
      .glow-core-intersection {
        position: absolute;
        width: 300px;
        height: 300px;
        left: 26%;
        top: 52%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent);
        opacity: 0.75;
        animation: hueRotate70 70s linear infinite;
        pointer-events: none;
        z-index: 1;
      }
    `}</style>
    
    <div className="glow-core-transition" />
    <div className="glow-core-intersection" />
    <div className="glow-core-static" />
  </>
)

const LetterStack = ({
  readingMode,
  lettersVisible,
  letterOrder,
  letters,
  hoveredLetter,
  hoveredElement,
  setHoveredLetter,
  setHoveredElement,
  setTooltipStyle,
  letterRefs,
  handleLetterClick,
  calculateTooltipPosition,
  tooltipStyle,
  showTooltip,
  isMobile = false,
  stackOffset = { x: -30, y: 325 },
  stackScale = 1
}) => {
  const fontSize = isMobile ? 85 : 100
  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${stackOffset.x}px, ${stackOffset.y}px) scale(${stackScale})`,
          transformOrigin: 'center',
          zIndex: 10,
          position: 'relative'
        }}
      >
        <style jsx>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.04); opacity: 0.95; }
          }
          
          .breathing {
            animation: breathe 2.5s ease-in-out infinite;
          }
          
          .fade-in {
            transition: opacity 0.8s ease-in-out;
          }

          @keyframes breatheSpacing0 {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(6px); }
          }
          
          @keyframes breatheSpacing1 {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(2px); }
          }
          
          @keyframes breatheSpacing2 {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(-2px); }
          }
          
          @keyframes breatheSpacing3 {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(-6px); }
          }
        `}</style>
        
        <div 
          className={`breathing fade-in flex items-center justify-center ${lettersVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {letterOrder.map((letterKey, index) => {
            const letter = letters[letterKey]
            const isHovered = hoveredLetter === letterKey
            
            return (
              <span
                key={letterKey}
                ref={(el) => { letterRefs.current[letterKey] = el }}
                className="cursor-pointer inline-block"
                role="button"
                tabIndex={0}
                aria-label={`${letterKey} letter, open ${letter.category}`}
                style={{
                  fontFamily: 'var(--font-nastaliq)',
                  fontSize: `${fontSize}px`,
                  fontWeight: 700,
                  color: (isHovered || hoveredElement === letter.category) ? '#FDABD3' : '#000000',
                  filter: (isHovered || hoveredElement === letter.category) ? 'hue-rotate(var(--glow-rotation))' : 'none',
                  display: 'inline-flex',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 12px',
                  marginRight: index < letterOrder.length - 1 ? '-18px' : '-12px',
                  lineHeight: 1,
                  animation: `breatheSpacing${index} 2.5s ease-in-out infinite`,
                  transform: letterKey === 'alif' ? 'rotate(-3deg)' : 'none',
                  transition: 'color 0.3s ease',
                  pointerEvents: readingMode ? 'none' : 'auto'
                }}
                onMouseEnter={() => {
                  if (readingMode) return
                  setHoveredLetter(letterKey)
                  setHoveredElement(letter.category)
                  const res = calculateTooltipPosition(letterKey)
                  if (res) setTooltipStyle(res)
                }}
                onMouseLeave={() => {
                  setHoveredLetter(null)
                  setHoveredElement(null)
                  setTooltipStyle(null)
                }}
                onFocus={() => {
                  if (readingMode) return
                  setHoveredLetter(letterKey)
                  setHoveredElement(letter.category)
                  const res = calculateTooltipPosition(letterKey)
                  if (res) setTooltipStyle(res)
                }}
                onBlur={() => {
                  setHoveredLetter(null)
                  setHoveredElement(null)
                  setTooltipStyle(null)
                }}
                onClick={() => handleLetterClick(letterKey)}
              >
                <span style={{ display: 'inline-block', transform: letterKey === 'alif' ? 'rotate(-3deg)' : 'none' }}>
                  {letter.arabic}
                </span>
              </span>
            )
          })}
        </div>
      </div>
      
      {readingMode && !isMobile ? (() => {
        const gridPositions = [
          { top: window.innerHeight * 0.35, left: window.innerWidth * 0.82 },   // mim
          { top: window.innerHeight * 0.15, left: window.innerWidth * 0.71 },   // sad
          { top: window.innerHeight * 0.15, left: window.innerWidth * 0.82 },   // alif
          { top: window.innerHeight * 0.15, left: window.innerWidth * 0.59 }   //ayin
        ]
        const tooltipWidth = 185
        const tooltipHeight = 140

        return (
          <>
            {letterOrder.map((key, idx) => {
              const target = gridPositions[idx]
              const textAlign = 'left'
              return (
                <div
                  key={key}
                  className="fixed z-50 pointer-events-none overflow-hidden"
                  style={{
                    top: `${target.top}px`,
                    left: `${target.left}px`,
                    width: `${tooltipWidth}px`,
                    minHeight: `${tooltipHeight}px`,
                    opacity: 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <p 
                    style={{
                      fontFamily: 'var(--font-karla)',
                      fontSize: '13px',
                      fontWeight: 400,
                      lineHeight: '14px',
                      color: '#000000',
                      margin: 0,
                      padding: 0,
                      textAlign
                    }}
                  >
                    {letters[key].trivia}
                  </p>
                </div>
              )
            })}
          </>
        )
      })()
      : (!isMobile && hoveredLetter && tooltipStyle?.style && (
        <div
          className="fixed z-50 pointer-events-none overflow-hidden"
          style={{
            ...tooltipStyle.style,
            opacity: showTooltip ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <p 
            style={{
              fontFamily: 'var(--font-karla)',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '14px',
              color: '#000000',
              margin: 0,
              padding: 0,
              textAlign: tooltipStyle.textAlign || 'left'
            }}
          >
            {letters[hoveredLetter].trivia}
          </p>
        </div>
      ))}
    </>
  )
}

export default function Home() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [hasMounted, setHasMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const initialLayout = useMemo(() => {
    const stored = loadHomeLayout()
    if (stored?.order?.length) return stored
    return buildInitialLayout()
  }, [])
  const [letterOrder, setLetterOrder] = useState(initialLayout.order)
  const [lettersVisible] = useState(true)
  const [tooltipPositions] = useState(initialLayout.positions)
  const [isolatedLetter, setIsolatedLetter] = useState(null)
  const [hoveredLetter, setHoveredLetter] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState(null)
  const [buttonTooltip, setButtonTooltip] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)  // 'make', 'view', 'reflect', 'connect', or null
  const [expandedCategory, setExpandedCategory] = useState(null)  // same values
  const [readingMode, setReadingMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [notice, setNotice] = useState(null)
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [swipeStart, setSwipeStart] = useState(null)
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const noticeTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const mobileMenuTimerRef = useRef(null)
  const letterRefs = useRef({})

  const letters = {
    ayin: {
      arabic: '\u0639',
      category: 'make',
      trivia: "The Arabic letter 'Ayn (\u0639) is the 18th letter of the Arabic alphabet. It is known for a guttural sound produced deep in the throat and has no exact English equivalent. The name 'Ayn' comes from an ancient word meaning 'eye,' and so does its historical form.",
    },
    alif: {
      arabic: '\u0627',
      category: 'view',
      trivia: "Alif (\u0627 / \u0623) is the first letter of the Arabic alphabet. It serves as a carrier for the glottal stop hamza (\u0621) and represents the long vowel sound /a/. Alif is written as a straight vertical stroke, making it one of the simplest letters to recognize. Its written shape changes when combined with other letters like Lam (\u0644\u0627).",
    },
    sad: {
      arabic: '\u0635',
      category: 'reflect',
      trivia: "The Arabic letter Sad (\u0635) is the 14th letter of the Arabic alphabet. It is an emphatic consonant pronounced with a deeper resonance than its non-emphatic counterpart. Sad is visually similar to Sin (\u0633) but has a dot above it. Its sound makes it distinct in meaning and pronunciation.",
    },
    mim: {
      arabic: '\u0645',
      category: 'connect',
      trivia: "The Arabic letter Mim (\u0645) is the 24th letter of the Arabic alphabet. It corresponds to the English 'm' sound. Mim is written with a rounded loop, resembling a small circle or semicircle. It connects smoothly to other letters, changing shape depending on its position.",
    }
  }

  // ========================================
  // TOOLTIP POSITIONING LOGIC
  // ========================================
  const calculateTooltipPosition = useCallback((letterKey) => {
    const letterElement = letterRefs.current[letterKey]
    if (!letterElement) return null

    const rect = letterElement.getBoundingClientRect()
    const visualCenterX = rect.left + rect.width / 2
    const visualCenterY = rect.top + (rect.height * 0.68)
    
    const tooltipWidth = 170
    const tooltipMinHeight = 80
    const spacingDefault = 80
    const spacingBelow = 130
    let position = tooltipPositions[letterKey]

    const idx = letterOrder.indexOf(letterKey)
    if (idx === 1 || idx === 2) {
      if (position === 'left' || position === 'right') {
        position = Math.random() < 0.5 ? 'above' : 'below'
      }
    }
    
    let style = {
      width: `${tooltipWidth}px`,
      minHeight: `${tooltipMinHeight}px`
    }
    
    let textAlign = 'left'
    
    switch(position) {
      case 'above':
        style.left = `${visualCenterX - tooltipWidth / 2}px`
        style.bottom = `${window.innerHeight - (visualCenterY - spacingDefault)}px`
        style.maxHeight = `${visualCenterY - spacingDefault - 20}px`
        break
      case 'below':
        style.left = `${visualCenterX - tooltipWidth / 2}px`
        style.top = `${visualCenterY + spacingBelow}px`
        style.maxHeight = `${window.innerHeight - (visualCenterY + spacingBelow) - 20}px`
        break
      case 'left':
        style.right = `${window.innerWidth - (visualCenterX - spacingDefault)}px`
        style.top = `${visualCenterY - tooltipMinHeight / 2}px`
        style.maxHeight = `${window.innerHeight - (visualCenterY - tooltipMinHeight / 2) - 20}px`
        textAlign = 'right'
        break
      case 'right':
        style.left = `${visualCenterX + spacingDefault}px`
        style.top = `${visualCenterY - tooltipMinHeight / 2}px`
        style.maxHeight = `${window.innerHeight - (visualCenterY - tooltipMinHeight / 2) - 20}px`
        textAlign = 'left'
        break
    }
    
  return { style, textAlign }
}, [letterOrder, tooltipPositions])

  const showTooltip = Boolean(tooltipStyle)

  // Hover timer for category expansion
useEffect(() => {
  if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
  if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
  
  if (hoveredElement && ['make', 'view', 'reflect', 'connect'].includes(hoveredElement)) {
    // Sustained 0.3s hover expands to reveal subcategories
    expandTimerRef.current = setTimeout(() => {
      setExpandedCategory(hoveredElement)
    }, 300)
  } else if (expandedCategory) {
    // Grace period before collapsing when hover leaves
    collapseTimerRef.current = setTimeout(() => {
      setExpandedCategory(null)
    }, 500)
  }
  
  return () => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
  }
}, [hoveredElement, expandedCategory])


// Helper to get category from letter key
const getCategoryFromLetter = (letterKey) => {
  return letters[letterKey]?.category || null
}

// Helper to get letter key from category
  const getLetterFromCategory = (category) => {
    const entry = Object.entries(letters).find(([key, val]) => val.category === category)
    return entry ? entry[0] : null
  }

const getLetterPositionForCategory = (category) => {
  if (typeof window === 'undefined') return null
  const letterKey = getLetterFromCategory(category)
  const el = letterKey ? letterRefs.current[letterKey] : null
  if (el) {
      const rect = el.getBoundingClientRect()
      return { x: rect.left + rect.width / 2 - 100, y: rect.top + rect.height / 2 - 100 }
    }
    return { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 }
  }

const navigateWithFade = (category, coords) => {
  if (transitioning) return
  setMobileMenuOpen(false)
  const target = coords || getLetterPositionForCategory(category)
  setTransitioning(true)
  transitionTimerRef.current = setTimeout(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search
      pushNavStack(currentPath)
    }
    if (target?.x != null && target?.y != null) {
      window.location.href = `/${category}?letterX=${target.x}&letterY=${target.y}`
    } else {
      window.location.href = `/${category}`
    }
  }, 350)
}

// ========================================
// CONTROL HANDLERS
// ========================================
  const shuffleLetters = () => {
    if (readingMode) return
    setHoveredLetter(null)
    setHoveredElement(null)
    setExpandedCategory(null)
    setLetterOrder((prev) => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5)
      return shuffled
    })
  }

  const toggleReadingMode = () => {
    setHoveredElement(null)
    setHoveredLetter(null)
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

  // ========================================
  // PASTE THE NEW NAVIGATION HANDLER HERE
  // ========================================
  const handleLetterClick = (letterKey) => {
    if (readingMode || transitioning) return
    
    const category = letters[letterKey].category
    const letterElement = letterRefs.current[letterKey]
    let coords = null
    if (letterElement) {
      const rect = letterElement.getBoundingClientRect()
      coords = { x: rect.left + rect.width / 2 - 100, y: rect.top + rect.height / 2 - 100 }
    }
    navigateWithFade(category, coords)
  }
  // ========================================
  // END OF NEW HANDLER
  // ========================================

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    }
  }, [])

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setHasMounted(true)
  return () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
  }
}, [])

useEffect(() => {
  const { delaySeconds } = syncGlowOffset()
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setGlowDelaySeconds(delaySeconds)
}, [])

useEffect(() => {
  persistHomeLayout({ order: letterOrder, positions: tooltipPositions })
}, [letterOrder, tooltipPositions])

useEffect(() => {
  if (!isMobile) return undefined
  if (mobileMenuTimerRef.current) {
    clearTimeout(mobileMenuTimerRef.current)
    mobileMenuTimerRef.current = null
  }
  if (mobileMenuOpen) {
    mobileMenuTimerRef.current = setTimeout(() => {
      setMobileMenuOpen(false)
    }, 2000)
  }
  return () => {
    if (mobileMenuTimerRef.current) {
      clearTimeout(mobileMenuTimerRef.current)
      mobileMenuTimerRef.current = null
    }
  }
}, [mobileMenuOpen, isMobile])

  const showButtonTooltip = (text, event, placement = 'right') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setButtonTooltip({
        text,
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
        placement
      })
    } else {
      setButtonTooltip({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        placement
      })
    }
  }
  const hideButtonTooltip = () => setButtonTooltip(null)
  const showDotTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    setButtonTooltip({
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      placement
    })
  }

  useEffect(() => {
    if (!isMobile || readingMode) return undefined
    const key = 'swipeHintHomeShown'
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

  const handleTouchStart = (e) => {
    if (readingMode) return
    const touch = e.touches[0]
    if (!touch) return
    setSwipeStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e) => {
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
      navigateWithFade('make')
    }
  }

// ========================================
// MAIN RENDER
// ========================================
if (!hasMounted) return null

  return (
    <div 
      className="min-h-screen relative overflow-hidden glow-hue-driver"
      style={{ 
        backgroundColor: '#FFFDF3',
        animationDelay: `-${glowDelaySeconds}s`,
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.35s ease'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
    <GradientGlow />
    {!isMobile && (
      <>
        <TopBar 
          hoveredElement={hoveredElement} 
          setHoveredElement={setHoveredElement} 
          readingMode={readingMode}
          showDotTooltip={showDotTooltip}
          hideButtonTooltip={hideButtonTooltip}
          navigateWithFade={navigateWithFade}
        />
        <LeftPanel 
          readingMode={readingMode}
          shuffleLetters={shuffleLetters}
          toggleReadingMode={toggleReadingMode}
          showButtonTooltip={showButtonTooltip}
          hideButtonTooltip={hideButtonTooltip}
        />
        <RightPanel 
          hoveredElement={hoveredElement} 
          setHoveredElement={setHoveredElement} 
          expandedCategory={expandedCategory}
          setExpandedCategory={setExpandedCategory}
          readingMode={readingMode}
          navigateWithFade={navigateWithFade}
        />
      </>
    )}
    {isMobile && (
      <MobileChrome
        title="asim.o"
        activeDot={null}
        bottomLabel=""
        readingMode={readingMode}
        accentHueExpr="var(--glow-rotation)"
        onPrimaryAction={() => {
          setMobileMenuOpen(false)
          toggleReadingMode()
        }}
        primaryActive={readingMode}
        onSecondaryAction={shuffleLetters}
        secondaryIcon="shuffle"
        hideBack
        onNavigate={(key) => navigateWithFade(key)}
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
          pointerEvents: 'auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            pointerEvents: 'auto',
            border: '1px solid #000',
            maxWidth: '90%',
            alignSelf: 'center'
          }}
        >
          {letterOrder.map((key) => {
            const letterOffsets = {
              ayin: { x: 6, y: -15 }, 
              alif: { x: -4, y: -5 },
              sad: { x: 2, y: -12 },
              mim: { x: 0, y: -17 }
            }
            const offsets = letterOffsets[key] || {}
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'transparent',
                  borderBottom: key !== letterOrder[letterOrder.length - 1] ? '1.25px solid #000' : 'none'
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-nastaliq)',
                    fontSize: '30px',
                    lineHeight: 1,
                    minWidth: '52px',
                    textAlign: 'center',
                    transform: `translate(${offsets.x || 0}px, ${offsets.y || 0}px)`
                  }}
                >
                  {letters[key].arabic}
                </div>
                <div style={{ fontSize: '13px', lineHeight: '16px', flex: 1, textAlign: 'right' }}>
                  {letters[key].trivia}
                </div>
              </div>
            )
          })}
        </div>
        <div
          style={{
            marginTop: '80px',
            marginRight: '25px',
            paddingBottom: '16px',
            fontSize: '28px',
            lineHeight: '26px',
            fontWeight: 300,
            maxWidth: '85%',
            pointerEvents: 'auto',
            alignSelf: 'flex-end',
            textAlign: 'right'
          }}
        >
          Welcome. This is a place where fragments are assembled - spaces, images, reflections. Not to explain, but to invite different ways of seeing.
        </div>
      </div>
    )}

    {/* Notice banner */}
    {!isMobile && notice && (
      <div
        className="fixed top-10 left-20"
        style={{
          zIndex: 60,
          background: '#000',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontFamily: 'var(--font-karla)',
          fontSize: '12px',
          letterSpacing: '0.02em'
        }}
      >
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
            width: '60px',
            height: '60px',
            pointerEvents: 'none',
            transform: 'translateX(-50%)'
          }}
        >
          <img src="/website_interaction/S_L.png" alt="swipe hint" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        </div>
      )}


    {!isMobile && buttonTooltip && (
      <div
        style={{
          position: 'fixed',
          left: buttonTooltip.x,
          top: buttonTooltip.y,
          transform: buttonTooltip.placement === 'right' ? 'translate(0, -50%)' : 'translate(-50%, -100%)',
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
        {buttonTooltip.text}
      </div>
    )}

    {/* Reading mode welcome text */}
    {readingMode && !isMobile && (
      <div
        className="fixed left-30 top-120 max-w-sm"
        style={{
          zIndex: 40,
          fontFamily: 'var(--font-karla)',
          fontSize: '40px',
          fontWeight: 200,
          lineHeight: '40px',
          maxWidth: '400px',
          color: '#000'
        }}
      >
        Welcome. This is a place where fragments are assembled — spaces, images, reflections. Not to explain, but to invite different ways of seeing.
      </div>
    )}
    
    {!isolatedLetter && (!readingMode || !isMobile) && (
      <LetterStack
        readingMode={readingMode}
        lettersVisible={lettersVisible}
        letterOrder={letterOrder}
        letters={letters}
        hoveredLetter={hoveredLetter}
        hoveredElement={hoveredElement}
        setHoveredLetter={setHoveredLetter}
        setHoveredElement={setHoveredElement}
        setTooltipStyle={setTooltipStyle}
        letterRefs={letterRefs}
        handleLetterClick={handleLetterClick}
        calculateTooltipPosition={calculateTooltipPosition}
        tooltipStyle={tooltipStyle}
        showTooltip={showTooltip}
        isMobile={isMobile}
        stackOffset={isMobile ? { x: 0, y: 350 } : { x: -30, y: 325 }}
        stackScale={isMobile ? 0.9 : 1}
      />
    )}
    {isolatedLetter === 'ayin' && <div>Mirror Transform</div>}
    {isolatedLetter === 'alif' && <div>Rotate Transform</div>}
    {isolatedLetter === 'sad' && <div>Scale Transform</div>}
    {isolatedLetter === 'mim' && <div>Move Transform</div>}
  </div>
)
}
