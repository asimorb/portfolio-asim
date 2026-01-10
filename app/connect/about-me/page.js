'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { clearHomeLayout, pushNavStack } from '../../components/navState'

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

export default function AboutMePage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const messageTextareaRef = useRef(null)
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

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const readingBodyStyle = { top: 230, left: 800, maxWidth: 470 }
  const messageBoxHeight = 545
  const messageBoxBottomBuffer = 28
  const messageTextareaMinHeight = 140
  const messageBoxStyle = { top: 200, left: 800, width: 600, height: messageBoxHeight }
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

  const navCategories = useMemo(() => ([
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]), [])

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
        .glow-core-static { position: absolute; width: 160px; height: 160px; left: 20%; top: 36%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FDABD3, #FDABD3, rgba(253, 171, 211, 0.6), transparent); opacity: 0.7; filter: blur(30px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset))); pointer-events: none; z-index: 2; }
        .glow-core-transition { position: absolute; width: 500px; height: 500px; left: 30%; top: 58%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, #FD7174, rgba(253, 113, 116, 0.7), rgba(253, 113, 116, 0.4), rgba(253, 113, 116, 0.15), transparent); opacity: 0.6; filter: blur(50px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 80deg)); pointer-events: none; z-index: 0; }
        .glow-core-intersection { position: absolute; width: 300px; height: 300px; left: 26%; top: 52%; transform: translate(-50%, -50%); background: radial-gradient(circle at center, #FD7174, rgba(253, 113, 116, 0.9), rgba(253, 113, 116, 0.5), transparent); opacity: 0.75; filter: blur(45px) hue-rotate(calc(var(--glow-rotation) + var(--glow-offset) + 70deg)); pointer-events: none; z-index: 1; }
        .message-field { width: 100%; border: none; background: transparent; padding: 6px 0 10px; font-family: var(--font-karla); font-size: 22px; font-weight: 500; line-height: 1.3; color: #000; }
        .message-field::placeholder { font-size: 22px; font-weight: 500; letter-spacing: 0; text-transform: none; color: rgba(0, 0, 0, 0.35); }
        .message-field:focus { outline: none; }
        .message-textarea { resize: vertical; min-height: 80px; }
        .message-emoji-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
        .message-emoji { background: transparent; border: none; font-size: 18px; cursor: pointer; padding: 2px; }
        .message-emoji:focus { outline: none; }
      `}</style>

      <div className="glow-core-transition" />
      <div className="glow-core-intersection" />
      <div className="glow-core-static" />

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

      {notice && (
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

      <div
        className="fixed left-30 top-90 max-w-sm"
        style={{
          zIndex: 40,
          fontFamily: 'var(--font-karla)',
          fontSize: '40px',
          fontWeight: 200,
          lineHeight: '40px',
          maxWidth: '450px',
          textAlign: 'right',
          color: '#000'
        }}
      >
        Interdisciplinary researcher-designer bridging architecture, interaction design, immersive technologies, and empirical methods. I investigate how people perceive possibilities for action in physical and digital environments.
      </div>

      {readingMode && (
        <div
          className="fixed"
          style={{
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '16px',
            color: '#000',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 12,
            textAlign: 'left',
            ...readingBodyStyle
          }}
        >
          <div>
            {bodyColumnOneParagraphs.map((paragraph, index) => (
              <p key={paragraph} style={{ margin: 0, marginTop: index === 0 ? 0 : 12 }}>
                {paragraph}
              </p>
            ))}
          </div>
          <div>
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
          className="fixed"
          style={{
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            ...messageBoxStyle
          }}
        >
          <div style={{ position: 'relative', height: '100%' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '100%',
                marginTop: -24,
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
          className="fixed"
          style={{
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            ...messageBoxStyle
          }}
        >
          <form
            action="https://formspree.io/f/mkoggyer"
            method="POST"
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
                  padding: '6px 14px',
                  flexShrink: 0
                }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

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
    </div>
  )
}
