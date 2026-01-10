'use client'

import { useMemo } from 'react'
import { getNavStackLength, popNavStack, pushNavStack } from './navState'

const buildDots = () => ([
  { key: 'make', href: '/make' },
  { key: 'view', href: '/view' },
  { key: 'reflect', href: '/reflect' },
  { key: 'connect', href: '/connect' }
])

const LayerIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 2 8l10 5 10-5-10-5z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 16l10 5 10-5" />
  </svg>
)

const ShuffleIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4 7.58 4 4 7.58 4 12s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08a6 6 0 1 1-5.65-8c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
  </svg>
)

const iconMap = {
  layers: LayerIcon,
  shuffle: ShuffleIcon
}

const BackIcon = ({ size = 18 }) => (
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

export function MobileChrome({
  title = null,
  subnav = [],
  activeDot = null,
  bottomLabel = '',
  accentColor = '#FDABD3',
  readingMode = false,
  onPrimaryAction,
  primaryActive = false,
  onSecondaryAction,
  secondaryIcon = 'layers',
  onBack,
  backDisabled = false,
  hideBack = false,
  onNavigate,
  dots,
  onMenuToggle,
  menuExpanded = false,
  accentHueExpr = 'calc(var(--glow-rotation) + var(--glow-offset))'
}) {
  const dotItems = useMemo(() => dots || buildDots(), [dots])
  const SecondaryIcon = iconMap[secondaryIcon] || LayerIcon
  const hueFilter = `hue-rotate(${accentHueExpr})`
const defaultBack = () => {
  if (typeof window === 'undefined') return
  window.location.href = '/'
}
  const effectiveBack = onBack || defaultBack

  const handleNavigate = (href, key) => {
    if (typeof window !== 'undefined') {
      pushNavStack(window.location.pathname + window.location.search)
    }
    if (onNavigate) {
      onNavigate(key, href)
      return
    }
    window.location.href = href
  }

  const isMenuOpen = !!menuExpanded
  const menuArrowColor = isMenuOpen ? '#FFFDF3' : '#000'

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          pointerEvents: readingMode ? 'none' : 'auto',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 8px',
          fontFamily: 'var(--font-karla)',
          color: '#000'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {title ? (
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: accentColor,
                textTransform: 'lowercase',
                filter: hueFilter
              }}
            >
              {title}
            </div>
          ) : (
            <div />
          )}
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px' }}>
            {dotItems.map((dot) => {
              const isActive = dot.key === activeDot
              return (
                <button
                  key={dot.key}
                  type="button"
                  aria-label={`Go to ${dot.key}`}
                  onClick={() => handleNavigate(dot.href, dot.key)}
                  style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  border: 'none',
                  padding: 0,
                    background: isActive ? accentColor : '#000',
                    filter: isActive ? hueFilter : 'none',
                    cursor: isActive ? 'default' : 'pointer'
                  }}
                />
              )
            })}
          </div>
        </div>
        <div
          style={{
            height: 1,
            background: '#000',
            opacity: 0.8,
            marginTop: 10
          }}
        />
        {subnav.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              marginTop: 10,
              fontSize: '16px',
              fontWeight: 400,
              textTransform: 'lowercase'
            }}
          >
            {subnav.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-label={`Open ${item.label}`}
                onClick={() => handleNavigate(item.href, item.label)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  fontFamily: 'var(--font-karla)',
                  fontSize: '16px',
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          padding: '10px 18px calc(env(safe-area-inset-bottom, 0px) + 12px)',
          borderTop: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-karla)',
          color: '#000',
          position: 'fixed'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            top: 0,
            height: 1,
            background: '#000',
            opacity: 0.8
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            aria-label="Toggle reading mode"
            onClick={onPrimaryAction}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1.5px solid #000',
              background: primaryActive ? '#000' : 'transparent',
              color: primaryActive ? '#FFFDF3' : '#000',
              fontFamily: 'var(--font-karla)',
              fontSize: '18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            i
          </button>
          {onSecondaryAction && (
            <button
              type="button"
              aria-label="Secondary action"
              onClick={onSecondaryAction}
              disabled={readingMode}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1.5px solid #000',
                background: readingMode ? '#e5e5e5' : 'transparent',
                color: readingMode ? '#8f8f8f' : '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: readingMode ? 'not-allowed' : 'pointer'
              }}
            >
              <SecondaryIcon />
            </button>
          )}
          {!hideBack && (
            <button
              type="button"
              aria-label="Back"
              onClick={effectiveBack}
              disabled={readingMode || backDisabled}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1.5px solid #000',
                background: readingMode || backDisabled ? '#e5e5e5' : 'transparent',
                color: readingMode || backDisabled ? '#8f8f8f' : '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: readingMode || backDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              <BackIcon />
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'lowercase'
          }}
        >
          {bottomLabel}
        </div>
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuToggle}
          disabled={readingMode}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1.5px solid #000',
            background: readingMode ? '#e5e5e5' : (isMenuOpen ? '#000' : '#FFFDF3'),
            color: readingMode ? '#8f8f8f' : (isMenuOpen ? '#FFFDF3' : '#000'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: readingMode ? 'not-allowed' : 'pointer'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={readingMode ? '#8f8f8f' : menuArrowColor}
            stroke={readingMode ? '#8f8f8f' : menuArrowColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: 'translateY(2px)' }}
          >
            <path d="M12 5l-7 7h14l-7-7z" />
          </svg>
        </button>
      </div>
    </>
  )
}
