'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { MobileChrome } from '../../components/MobileChrome'
import { clearHomeLayout, pushNavStack } from '../../components/navState'
import { useMediaQuery } from '../../components/useMediaQuery'

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
          {categories.map((category) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AboutMePage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState('connect')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const messageTextareaRef = useRef(null)
  const formRef = useRef(null)
  const mediaQueryMobile = useMediaQuery('(max-width: 768px)')
  const mediaQueryMediumDesktop = useMediaQuery('(min-width: 769px) and (max-width: 1366px)')
  const isMobile = hydrated ? mediaQueryMobile : false
  const isMediumDesktop = hydrated ? mediaQueryMediumDesktop : false

  useEffect(() => {
    setHydrated(true)
  }, [])
  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    const target = path.startsWith('/') ? path : `/${path}`
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
      pushNavStack(window.location.pathname + window.location.search)
    }
    window.location.href = target
  }
  const handleBack = () => {
    navigateWithFade('/connect')
  }

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    let rafId
    const updateGuideFilters = () => {
      if (typeof window === 'undefined') return
      const key = 'glowStartMs'
      const start = Number(window.sessionStorage.getItem(key)) || Date.now()
      const elapsedMs = Date.now() - start
      const baseAngle = ((elapsedMs / 60000) * 360) % 360
      const offsetAngle = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-offset')) || 0
      const totalAngle = (baseAngle + offsetAngle) % 360
      const filterValue = `hue-rotate(${totalAngle}deg)`
      const guideElements = document.querySelectorAll('line[stroke="#FDABD3"], circle[fill="#FDABD3"]')
      guideElements.forEach((el) => {
        el.style.filter = filterValue
      })
      rafId = requestAnimationFrame(updateGuideFilters)
    }
    rafId = requestAnimationFrame(updateGuideFilters)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const readingBodyStyle = { top: 230, left: isMediumDesktop ? 460 : 800, maxWidth: 470 }
  const messageBoxHeight = isMediumDesktop ? 450 : 545
  const messageBoxBottomBuffer = 28
  const messageTextareaMinHeight = 140
  const messageBoxStyle = { top: 200, left: isMediumDesktop ? 460 : 800, width: isMediumDesktop ? 450 : 600, height: messageBoxHeight }
  const infoCalloutStyle = { left: 90, bottom: 48, lineLength: 54 }
  const bodyColumnOneParagraphs = [
    'I make things to understand them. Whether designing built spaces, developing interactive environments, or conducting user research, my practice centers on iterative making prototyping ideas, observing how people engage with them, and refining based on what emerges through use.',
    'This approach has taken me through architecture and built projects, media arts and technology, UX research, and immersive environment development. Across these contexts, I work from a consistent question: what possibilities for action do people actually perceive in an environment, and how does that shape their experience? This affordance-perception lens connects my spatial design work, my research on interactivity in virtual environments, and my facilitation of participatory processes.',
      ]
  const bodyColumnTwoParagraphs = [
        'My background integrates design thinking, empirical methods, and creative technology. I\'ve led design studios, conducted mixed-method studies, built VR environments, and coordinated collaborations between artists, technologists, and researchers. I draw on ecological psychology, phenomenology, and media theory, not as abstract frameworks but as tools for understanding how environments and inhabitants co-constitute experience.',
    'I\'m particularly interested in spatial ecologies where different communities perceive different possibilities within the same environment, and in developing methods that make these perception gaps visible and actionable.'
  ]
  const contactLinks = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asim-hameed-36587a56/' },
    { label: 'ORCID', href: 'https://orcid.org/my-orcid?orcid=0000-0002-2982-9678' },
    //{ label: 'GitHub', href: 'https://github.com/asimorb' },
    { label: 'Instagram', href: 'https://www.instagram.com/acimorlv/' }
  ]
  const emojiOptions = ['🙂', '✨', '🎉', '📚', '🧠', '🧭', '🌿', '🤝']

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)
  const handleEmojiClick = (emoji) => {
    const textarea = messageTextareaRef.current
    if (textarea) {
      const start = textarea.selectionStart ?? textarea.value.length
      const end = textarea.selectionEnd ?? textarea.value.length
      const value = textarea.value ?? ''
      textarea.value = `${value.slice(0, start)}${emoji}${value.slice(end)}`
      const cursor = start + emoji.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    }
  }

  const toggleReadingMode = () => {
    setHoveredElement(null)
    setExpandedCategory(null)
    setReadingMode((prev) => {
      const next = !prev
      setNotice(next ? 'READING MODE ON' : 'READING MODE OFF')
      return next
    })
    setTimeout(() => setNotice(null), 2000)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!isMobile || !mobileMenuOpen) return undefined
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, isMobile])

  const handleMobileNavigate = (sub, category) => {
    closeMobileMenu()
    if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
      navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
    } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
      navigateWithFade(`/view/${sub}`)
    } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
      navigateWithFade(`/reflect/${sub}`)
    } else if (category === 'connect' && sub === 'cv') {
      navigateWithFade('/connect/curriculum-vitae')
    } else if (category === 'connect' && sub === 'about me') {
      navigateWithFade('/connect/about-me')
    } else {
      navigateWithFade(`/${category}`)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    try {
      const formData = new FormData(form)
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setFormSubmitted(true)
        form.reset()
        setTimeout(() => setFormSubmitted(false), 3000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const navCategories = useMemo(() => ([
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: isMobile ? ['cv', 'about me'] : ['curriculum vitae', 'about me'] }
  ]), [isMobile])

  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        animation: 'glowHue 60s linear infinite',
        animationDelay: `-${glowDelaySeconds}s`,
        opacity: pageOpacity,
        transition: 'opacity 0.6s ease'
      }}
      className="glow-hue-driver"
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
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
        .glow-core-static { position: absolute; width: 160px; height: 160px; left: 20%; top: 36%; background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent); opacity: 0.7; filter: blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset))); animation: restlessMove 60s ease-in-out infinite; pointer-events: none; z-index: 2; }
        .glow-core-transition { position: absolute; width: 500px; height: 500px; left: 30%; top: 58%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent); opacity: 0.6; animation: hueRotate80 80s linear infinite; pointer-events: none; z-index: 0; }
        .glow-core-intersection { position: absolute; width: 300px; height: 300px; left: 26%; top: 52%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent); opacity: 0.75; animation: hueRotate70 70s linear infinite; pointer-events: none; z-index: 1; }
        .message-field { width: 100%; border: none; background: transparent; padding: 6px 0 10px; font-family: var(--font-karla); font-size: 22px; font-weight: 500; line-height: 1.3; color: #000; }
        .message-field::placeholder { font-size: 22px; font-weight: 500; letter-spacing: 0; text-transform: none; color: rgba(0, 0, 0, 0.35); }
        .message-field:focus { outline: none; }
        .message-textarea { resize: vertical; min-height: 80px; }
        .message-emoji-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
        .message-emoji { background: transparent; border: none; font-size: 18px; cursor: pointer; padding: 2px; }
        .message-emoji:focus { outline: none; }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(5px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>

      <div className="glow-core-transition" />
      <div className="glow-core-intersection" />
      <div className="glow-core-static" />

      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '90px',
            background: '#FFFDF3',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />
      )}

      {!isMobile && (
        <TopBarTransform
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          readingMode={readingMode}
          analyticsText="GET IN TOUCH"
          glowFilter={glowFilter}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          activePage="connect"
          onNavigate={(category) => navigateWithFade(`/${category}`)}
        />
      )}

      {!isMobile && (
        <LeftPanelTransform
          readingMode={readingMode}
          toggleReadingMode={toggleReadingMode}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          label="ABOUT ME"
          labelTop={170}
          onBack={handleBack}
          onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
        />
      )}

      {!isMobile && (
        <RightPanelTransform
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          expandedCategory={expandedCategory}
          setExpandedCategory={setExpandedCategory}
          readingMode={readingMode}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          glowFilter={glowFilter}
          activePage="connect"
          activeSubcategory="about me"
          categories={navCategories}
          onNavigate={(sub, category) => {
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
            } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`/view/${sub}`)
            } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
              navigateWithFade(`/reflect/${sub}`)
            } else if (category === 'connect' && sub === 'curriculum vitae') {
              navigateWithFade('/connect/curriculum-vitae')
            } else if (category === 'connect' && sub === 'about me') {
              navigateWithFade('/connect/about-me')
            } else {
              navigateWithFade(`/${category}`)
            }
          }}
        />
      )}

      {isMobile && (
        <MobileChrome
          title="about me"
          activeDot="connect"
          bottomLabel=""
          readingMode={readingMode}
          primaryActive={readingMode}
          onPrimaryAction={toggleReadingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={handleBack}
          onNavigate={(key) => navigateWithFade(`/${key}`)}
          onMenuToggle={toggleMobileMenu}
          menuExpanded={mobileMenuOpen}
        />
      )}

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

      {isMobile && readingMode && notice && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            left: '50%',
            transform: 'translateX(-50%)',
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

      <div
        className={isMobile ? '' : 'fixed left-30 max-w-sm'}
        style={{
          zIndex: 40,
          fontFamily: 'var(--font-karla)',
          fontSize: isMobile ? '24px' : isMediumDesktop ? '26px' : '40px',
          fontWeight: 200,
          lineHeight: isMobile ? '28px' : isMediumDesktop ? '26px' : '40px',
          maxWidth: isMobile ? '100%' : isMediumDesktop ? '270px' : '450px',
          top: isMobile ? 'auto' : isMediumDesktop ? '19rem' : '22.5rem',
          textAlign: isMobile ? 'left' : 'right',
          color: '#000',
          padding: isMobile ? '120px 18px 40px' : 0
        }}
      >
        Interdisciplinary researcher-designer bridging architecture, interaction design, immersive technologies, and empirical methods. I investigate how people perceive possibilities for action in physical and digital environments.
      </div>

      {readingMode && (
        <div
          style={{
            position: isMobile ? 'relative' : 'fixed',
            ...(isMobile ? {} : readingBodyStyle),
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '16px',
            color: '#000',
            display: isMobile ? 'block' : 'grid',
            gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
            columnGap: isMobile ? undefined : 12,
            textAlign: 'left',
            padding: isMobile ? '0 18px 24px' : 0
          }}
        >
          <div>
            {bodyColumnOneParagraphs.map((paragraph, index) => (
              <p key={paragraph} style={{ margin: 0, marginTop: index === 0 ? 0 : 12 }}>
                {paragraph}
              </p>
            ))}
          </div>
          <div style={{ marginTop: isMobile ? 12 : 0 }}>
            {bodyColumnTwoParagraphs.map((paragraph, index) => (
              <p key={paragraph} style={{ margin: 0, marginTop: index === 0 ? 0 : 12 }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {readingMode && (
        <div
          style={{
            position: isMobile ? 'relative' : 'fixed',
            ...(isMobile ? {} : messageBoxStyle),
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            padding: isMobile ? '0 18px 180px' : 0
          }}
        >
          <div style={{ position: 'relative', height: isMobile ? 'auto' : '100%' }}>
            <div
              style={{
                position: isMobile ? 'relative' : 'absolute',
                left: 0,
                right: 0,
                top: isMobile ? 0 : '100%',
                marginTop: isMobile ? 0 : -24,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    color: '#000',
                    textDecoration: 'none'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {!readingMode && (
        <div
          style={{
            position: isMobile ? 'relative' : 'fixed',
            ...(isMobile ? {} : messageBoxStyle),
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            padding: isMobile ? '0 18px 180px' : 0
          }}
        >
          <form
            ref={formRef}
            action="https://formspree.io/f/mkoggyer"
            method="POST"
            onSubmit={handleFormSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              <div>Get in touch</div>
            </div>
            <div style={{ height: '1px', background: '#000', opacity: 0.35, marginTop: 8 }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginTop: 12
              }}
            >
              <input
                name="name"
                type="text"
                required
                aria-label="Name"
                placeholder="Name"
                className="message-field"
              />
              <input
                name="email"
                type="email"
                required
                aria-label="Email"
                placeholder="Email"
                className="message-field"
              />
            </div>
            <textarea
              name="message"
              rows={5}
              required
              aria-label="Message"
              placeholder="Message"
              className="message-field message-textarea"
              ref={messageTextareaRef}
              style={{ marginTop: 12, minHeight: messageTextareaMinHeight, flexGrow: 1 }}
            />
            <div className="message-emoji-row" style={{ marginTop: messageBoxBottomBuffer }}>
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="message-emoji"
                  onClick={() => handleEmojiClick(emoji)}
                  aria-label={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div style={{ height: '1px', background: '#000', opacity: 0.35 }} />
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      color: '#000',
                      textDecoration: 'none'
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {formSubmitted && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      marginBottom: '8px',
                      background: '#000',
                      color: '#FFFDF3',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-karla)',
                      fontSize: '12px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      animation: 'fadeInOut 3s ease-in-out'
                    }}
                  >
                    thank you!
                  </div>
                )}
                <button
                  type="submit"
                  style={{
                    background: '#000',
                    color: '#FFFDF3',
                    border: 'none',
                    borderRadius: 999,
                    fontFamily: 'var(--font-karla)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    padding: '6px 14px'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isMobile && (
        <MobileMenuOverlay
          categories={navCategories}
          open={mobileMenuOpen}
          onClose={closeMobileMenu}
          onNavigate={handleMobileNavigate}
          glowFilter={glowFilter}
          activeMenuCategory={activeMenuCategory}
          setActiveMenuCategory={setActiveMenuCategory}
        />
      )}

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

      {!isMobile && (
        <div
          className="fixed"
          style={{
            left: infoCalloutStyle.left,
            bottom: infoCalloutStyle.bottom,
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-karla)',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: '16px',
            color: '#000',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: infoCalloutStyle.lineLength,
              height: 1,
              background: '#000',
              transform: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -2,
                top: -3,
                width: 6,
                height: 6,
                borderRight: '1px solid #000',
                borderTop: '1px solid #000',
                transform: 'rotate(225deg)'
              }}
            />
          </div>
          <div>full profile</div>
        </div>
      )}
    </div>
  )
}
