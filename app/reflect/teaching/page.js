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

export default function TeachingPage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [heroScale, setHeroScale] = useState(1)
  const [heroGalleryIndex, setHeroGalleryIndex] = useState(0)
  const [heroPan, setHeroPan] = useState({ x: 0, y: 0 })
  const [isPanMode, setIsPanMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastWheelTimeRef = useRef(0)
  const heroDragStartRef = useRef({ x: 0, y: 0 })
  const heroPanStartRef = useRef({ x: 0, y: 0 })
  const handleBack = () => {
    navigateWithFade('/reflect')
  }
  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    const target = path.startsWith('/') ? path : `/${path}`
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
    }
    window.location.href = target
  }
  const carouselSettings = useMemo(() => {
    if (isMobile) {
      return {
        cardWidth: 200,
        cardHeight: 200,
        stackGap: 32,
        stackOffsetX: 200,
        tiltY: -12,
        perspective: 520,
        baseScaleStep: 0.06,
        baseMaxScale: 0.95,
        selectedScale: 1.08
      }
    }
    return {
      cardWidth: 260,
      cardHeight: 260,
      stackGap: 44,
      stackOffsetX: 320,
      tiltY: -18,
      perspective: 760,
      baseScaleStep: 0.05,
      baseMaxScale: 0.92,
      selectedScale: 1.16
    }
  }, [isMobile])
  const heroZoom = useMemo(() => ({
    min: 1,
    max: 3.5,
    step: 0.15,
    fill: 1.5
  }), [])

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    setHeroScale(1)
    if (selectedIndex !== null) {
      setHeroGalleryIndex(0)
      setHeroPan({ x: 0, y: 0 })
      setIsPanMode(false)
    }
  }, [selectedIndex])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const teachingImageFiles = useMemo(() => ([
    't-p- (1).jpg',
    't-p- (2).jpg',
    't-p- (3).jpg',
    't-p- (4).jpg',
    't-p- (5).jpg',
    't-p- (6).jpg',
    't-p- (7).jpg',
    't-p- (8).jpg',
    't-p- (9).jpg',
    't-p- (10).jpg',
    't-p- (11).jpg',
    't-p- (12).jpg',
    't-p- (13).jpg'
  ]), [])
  const teachingItems = useMemo(() => {
    const fallbackTints = ['#626262', '#6f6f6f', '#7b7b7b', '#8a8a8a', '#9a9a9a', '#a9a9a9', '#b8b8b8', '#c7c7c7']
    const idForFile = (file) => {
      const match = file.match(/t-p- \((\d+)\)\.jpg/i)
      return match ? `t-p-${match[1]}` : file
    }
    const fileById = Object.fromEntries(teachingImageFiles.map((file) => [idForFile(file), file]))
    const hiddenThumbnails = new Set(['t-p-3', 't-p-7', 't-p-8', 't-p-10'])
    const thumbnailFiles = teachingImageFiles.filter((file) => {
      const id = idForFile(file)
      return !hiddenThumbnails.has(id)
    })
    const overridesById = {
      't-p-1': {
        title: 'teaching philosophy',
        type: 'design and theory',
        level: 'graduate and undergraduate',
        role: 'lecturer and studio critic',
        notes: 'I teach design as a critical, interdisciplinary inquiry into space, media, and digital culture. My studio-lab approach encourages speculative thinking, hybrid methodologies, and a reimagining of design as provocation.',
        galleryIds: ['t-p-1']
      },
      't-p-2': {
        title: 'of possible worlds',
        type: 'design studio',
        level: 'graduate',
        role: 'studio critic',
        notes: 'this 14-week design studio explores speculative design as a means to interrogate and reimagine the socio-political implications of emerging technologies in shaping future urban environments.',
        galleryIds: ['t-p-2', 't-p-3']
      },
      't-p-4': {
        title: 'locating aura in the hyperreal home',
        type: 'media theory seminar',
        level: 'graduate',
        role: 'lecturer',
        notes: 'this 6-week seminar investigates the concept of "aura" in the context of hyperreal domestic spaces, examining how digital technologies mediate our experience of home and authenticity.',
        galleryIds: ['t-p-4']
      },
        't-p-5': {
        title: 'posthumanist environments',
        type: 'urban theory seminar',
        level: 'graduate',
        role: 'lecturer',
        notes: 'this 6-week seminar explores posthumanist theories and their implications for understanding and designing urban environments in the age of advanced technologies and ecological challenges.',
        galleryIds: ['t-p-5']
      },
      't-p-6': {
        title: 'the design incubator',
        type: 'architectural design studio',
        level: 'undergraduate',
        role: 'senior lecturer and studio critic',
        notes: 'understanding space, form, and program through an intensive 14 week exercise.',
        galleryIds: ['t-p-6', 't-p-7', 't-p-8']
      },
      't-p-9': {
        title: 'image of the new gallery',
        type: 'architectural design studio',
        level: 'undergraduate',
        role: 'senior lecturer and studio critic',
        notes: 'a 14-week form-finding exercise that pivots towards "form following force and geometry" as it takes on the form vs function debate.',
        galleryIds: ['t-p-9', 't-p-10']
      },
      't-p-11': {
        title: "borge's library",
        type: 'architectural design studio',
        level: 'undergraduate',
        role: 'senior lecturer and studio critic',
        notes: 'a 6-week project studying the relationship between narrative, space, and architecture. what if drawings were stories?',
        galleryIds: ['t-p-11']
      },
        't-p-12': {
        title: 'modern and contemporary architecture',
        type: 'history and theory seminar',
        level: 'undergraduate',
        role: 'senior lecturer',
        notes: 'a 14-week seminar course in the history of modern and contemporary architecture with emphasis on how politics and philosophy played a pivotal role in defining discipline.',
        galleryIds: ['t-p-12']
      },
      't-p-13': {
        title: 'exploring the uncanny',
        type: 'new media and art',
        level: 'master\'s',
        role: 'lecturer',
        notes: 'a short seminar course on discussing the anthropomorhism of social robots and AI entities in contemporary media art.',
        galleryIds: ['t-p-13']
      },
    }
    return thumbnailFiles.map((file, index) => {
      const id = idForFile(file)
      const number = id.startsWith('t-p-') ? id.replace('t-p-', '') : String(index + 1)
      const baseItem = {
        id,
        title: `Teaching Project ${number.padStart(2, '0')}`,
        type: 'Studio',
        level: 'Undergraduate',
        role: 'Instructor',
        notes: 'Placeholder summary for this teaching project.',
        galleryIds: [id]
      }
      const override = overridesById[id]
      const galleryIds = override?.galleryIds || baseItem.galleryIds
      const gallery = galleryIds
        .map((galleryId) => fileById[galleryId])
        .filter(Boolean)
        .map((galleryFile) => `/teaching/${encodeURIComponent(galleryFile)}`)
      return {
        ...baseItem,
        ...override,
        gallery,
        tint: fallbackTints[index % fallbackTints.length],
        image: `/teaching/${encodeURIComponent(file)}`
      }
    })
  }, [teachingImageFiles])
  const displayIndex = selectedIndex ?? activeIndex
  const displayItem = teachingItems[displayIndex] || teachingItems[0]
  const selectedItem = selectedIndex !== null ? teachingItems[selectedIndex] : null
  const heroGallery = selectedItem?.gallery || []
  const heroImage = heroGallery[heroGalleryIndex] || selectedItem?.image

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

  const clampValue = (value, min, max) => Math.min(max, Math.max(min, value))

  const zoomHeroBy = (delta) => {
    setHeroScale((prev) => clampValue(prev + delta, heroZoom.min, heroZoom.max))
  }

  const handleHeroDragStart = (event) => {
    if (!isPanMode || heroScale <= 1) return
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
    heroDragStartRef.current = { x: event.clientX, y: event.clientY }
    heroPanStartRef.current = { ...heroPan }
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
  const mobileSubnav = useMemo(() => ([
    { label: 'research', href: '/reflect/research' },
    { label: 'teaching', href: '/reflect/teaching' }
  ]), [])

  const stepCarousel = (delta) => {
    setSelectedIndex(null)
    setActiveIndex((prev) => {
      const next = (prev + delta + teachingItems.length) % teachingItems.length
      return next
    })
  }

  const openHeroForActive = () => {
    setSelectedIndex(activeIndex)
    setHeroGalleryIndex(0)
  }

  const moveHeroGallery = (delta) => {
    if (!heroGallery.length) return
    setHeroGalleryIndex((prev) => (prev + delta + heroGallery.length) % heroGallery.length)
    setHeroScale(1)
    setHeroPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    setHeroScale(1)
    setHeroPan({ x: 0, y: 0 })
  }, [heroGalleryIndex])

  useEffect(() => {
    if (heroScale <= 1.01) {
      setHeroPan({ x: 0, y: 0 })
    }
  }, [heroScale])

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target
      const isEditable = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (isEditable) return
      if (event.key === 'Enter') {
        event.preventDefault()
        if (selectedIndex === null) {
          openHeroForActive()
        }
      }
      if (selectedIndex === null && event.key === 'ArrowLeft') {
        event.preventDefault()
        stepCarousel(1)
      }
      if (selectedIndex === null && event.key === 'ArrowRight') {
        event.preventDefault()
        stepCarousel(-1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, selectedIndex, teachingItems.length])

  const handleCarouselWheel = (event) => {
    event.preventDefault()
    const now = Date.now()
    if (now - lastWheelTimeRef.current < 320) return
    lastWheelTimeRef.current = now
    const delta = event.deltaY || event.deltaX
    if (!delta) return
    stepCarousel(delta > 0 ? 1 : -1)
  }

  const handleHeroWheel = (event) => {
    const target = event.target
    if (target instanceof HTMLElement && target.closest('[data-hero-control]')) return
    event.preventDefault()
    const direction = event.deltaY < 0 ? 1 : -1
    zoomHeroBy(direction * heroZoom.step)
  }

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
        transition: 'opacity 0.6s ease',
        padding: isMobile ? '120px 18px 160px' : 0
      }}
      className="glow-hue-driver"
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
      `}</style>

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
        <>
          <TopBarTransform
            hoveredElement={hoveredElement}
            setHoveredElement={setHoveredElement}
            readingMode={readingMode}
            analyticsText="TEACHING OVERVIEW"
            glowFilter={glowFilter}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            activePage="reflect"
            onNavigate={(category) => navigateWithFade(`/${category}`)}
          />

          <LeftPanelTransform
            readingMode={readingMode}
            toggleReadingMode={toggleReadingMode}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            label="TEACHING"
            labelTop={175}
            onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
            onBack={handleBack}
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
            activePage="reflect"
            activeSubcategory="teaching"
            categories={navCategories}
            onNavigate={(sub, category) => {
              if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
                navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
                navigateWithFade(`/view/${sub}`)
              } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
                navigateWithFade(`/reflect/${sub}`)
              } else {
                navigateWithFade(`/${category}`)
              }
            }}
          />
        </>
      )}

      {isMobile && (
        <MobileChrome
          title="reflect"
          subnav={mobileSubnav}
          activeDot="reflect"
          bottomLabel="teaching"
          readingMode={readingMode}
          onPrimaryAction={toggleReadingMode}
          primaryActive={readingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          onBack={() => navigateWithFade('/reflect')}
          onNavigate={(key, href) => { navigateWithFade(href) }}
        />
      )}

      {readingMode && isMobile && (
        <div
          style={{
            position: 'relative',
            zIndex: 40,
            margin: '0 auto 24px',
            maxWidth: 520,
            border: '1px solid #000',
            padding: '16px',
            fontFamily: 'var(--font-karla)',
            color: '#000'
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 300, lineHeight: '24px' }}>
            Teaching projects span studios and seminars across graduate and undergraduate levels.
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', lineHeight: '16px' }}>
            Tap the active card to open the gallery, then use the arrows to move between projects.
          </div>
        </div>
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

      <div
        style={{
          position: isMobile ? 'relative' : 'fixed',
          left: isMobile ? 'auto' : 140,
          top: isMobile ? 'auto' : 250,
          width: isMobile ? '100%' : 350,
          maxWidth: isMobile ? 520 : undefined,
          margin: isMobile ? '0 auto 24px' : undefined,
          zIndex: 40,
          fontFamily: 'var(--font-karla)',
          color: '#000'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-5px' }}>project</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{displayItem.title}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-5px' }}>type</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{displayItem.type}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-5px' }}>level</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{displayItem.level}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '-5px' }}>role</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 200, letterSpacing: '-0.03em', marginBottom: '-1px' }}>{displayItem.role}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em', marginBottom: '2px' }}>notes</div>
            <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: isMobile ? '22px' : '24px', marginBottom: isMobile ? '0' : '-10px' }}>{displayItem.notes}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: isMobile ? 'relative' : 'fixed',
          left: isMobile ? 'auto' : '48%',
          top: isMobile ? 'auto' : 220,
          width: isMobile ? '100%' : 640,
          height: isMobile ? 280 : 360,
          zIndex: 40,
          transform: isMobile ? 'none' : 'translateX(-50%)',
          margin: isMobile ? '0 auto 12px' : undefined
        }}
        onWheel={handleCarouselWheel}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            perspective: `${carouselSettings.perspective}px`,
            perspectiveOrigin: isMobile ? '50% 50%' : '80% 50%',
            transformStyle: 'preserve-3d',
            cursor: 'default'
          }}
          role="region"
          aria-label="Teaching carousel"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              openHeroForActive()
            }
          }}
        >
          {teachingItems.map((item, index) => {
            const distance = index
            const isActive = activeIndex === index
            const baseScale = Math.max(
              0.7,
              Math.min(carouselSettings.baseMaxScale, 1 - distance * carouselSettings.baseScaleStep)
            )
            const scale = isActive ? carouselSettings.selectedScale : baseScale
            const translateX = carouselSettings.stackOffsetX - distance * carouselSettings.stackGap
            const opacity = 1
            const zIndex = 200 - distance + (isActive ? 120 : 0)
            const cardImage = item.image ? `url("${item.image}")` : 'none'
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Open ${item.title}`}
                onClick={() => {
                  if (!isActive) return
                  openHeroForActive()
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: carouselSettings.cardWidth,
                  height: carouselSettings.cardHeight,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: isActive ? 'pointer' : 'default',
                  transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                  transition: 'transform 0.6s ease, opacity 0.6s ease',
                  opacity,
                  zIndex,
                  pointerEvents: 'auto'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    backgroundColor: item.tint,
                    backgroundImage: cardImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: '1px solid #000',
                    boxShadow: isActive ? '0 18px 30px rgba(0,0,0,0.12)' : 'none',
                    transition: 'box-shadow 0.4s ease',
                    transform: `rotateY(${carouselSettings.tiltY}deg)`,
                    transformOrigin: 'right center',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </button>
            )
          })}

        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: isMobile ? '0 12px' : '0 40px', transform: isMobile ? 'none' : 'translateX(100px)' }}>
          <button
            type="button"
            onClick={(event) => {
              stepCarousel(1)
              event.currentTarget.blur()
            }}
            onMouseDown={(event) => event.preventDefault()}
            aria-label="Left"
            onMouseEnter={(event) => showTooltip('Left', event)}
            onMouseLeave={hideTooltip}
            onFocus={(event) => showTooltip('Left', event)}
            onBlur={hideTooltip}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-karla)',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <img
              src="/teaching/arrow_left_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
              alt="Previous"
              style={{ width: isMobile ? 28 : 24, height: isMobile ? 28 : 24, display: 'block' }}
            />
          </button>
          <button
            type="button"
            onClick={(event) => {
              stepCarousel(-1)
              event.currentTarget.blur()
            }}
            onMouseDown={(event) => event.preventDefault()}
            aria-label="Right"
            onMouseEnter={(event) => showTooltip('Right', event)}
            onMouseLeave={hideTooltip}
            onFocus={(event) => showTooltip('Right', event)}
            onBlur={hideTooltip}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-karla)',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <img
              src="/teaching/arrow_right_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
              alt="Next"
              style={{ width: isMobile ? 28 : 24, height: isMobile ? 28 : 24, display: 'block' }}
            />
          </button>
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close hero"
          onClick={() => setSelectedIndex(null)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setSelectedIndex(null)
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 240,
            cursor: 'default',
            background: 'rgba(255, 253, 243, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            onWheel={handleHeroWheel}
            onMouseMove={(event) => {
              if (!isDragging) return
              const dx = event.clientX - heroDragStartRef.current.x
              const dy = event.clientY - heroDragStartRef.current.y
              setHeroPan({
                x: heroPanStartRef.current.x + dx,
                y: heroPanStartRef.current.y + dy
              })
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {heroGallery.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'var(--font-karla)',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: '#000'
                }}
              >
                {heroGalleryIndex + 1}/{heroGallery.length}
              </div>
            )}
            <div
              style={{
                position: 'fixed',
                top: isMobile ? 16 : 26,
                right: isMobile ? 16 : 38,
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                zIndex: 260
              }}
            >
              <button
                type="button"
                aria-label="Zoom in"
                data-hero-control="true"
                onClick={(event) => {
                  event.stopPropagation()
                  zoomHeroBy(heroZoom.step)
                }}
                style={{
                  width: 34,
                  height: 34,
                  border: '1px solid #000',
                  borderRadius: 0,
                  background: '#FFFDF3',
                  color: '#000',
                  fontFamily: 'var(--font-karla)',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                +
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                data-hero-control="true"
                onClick={(event) => {
                  event.stopPropagation()
                  zoomHeroBy(-heroZoom.step)
                }}
                style={{
                  width: 34,
                  height: 34,
                  border: '1px solid #000',
                  borderRadius: 0,
                  background: '#FFFDF3',
                  color: '#000',
                  fontFamily: 'var(--font-karla)',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: 0,
                  cursor: 'pointer',
                  marginLeft: -1
                }}
              >
                -
              </button>
              <button
                type="button"
                aria-label={isPanMode ? 'Disable pan mode' : 'Enable pan mode'}
                aria-pressed={isPanMode}
                data-hero-control="true"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsPanMode((prev) => !prev)
                }}
                style={{
                  width: 34,
                  height: 34,
                  border: '1px solid #000',
                  borderRadius: 0,
                  background: isPanMode ? '#000' : '#FFFDF3',
                  color: isPanMode ? '#FFFDF3' : '#000',
                  padding: 0,
                  cursor: 'pointer',
                  marginLeft: -1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M8 1.5v13M1.5 8h13M5.5 4.5 8 1.5l2.5 3M5.5 11.5 8 14.5l2.5-3M4.5 5.5 1.5 8l3 2.5M11.5 5.5 14.5 8l-3 2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {heroGallery.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                data-hero-control="true"
                onClick={(event) => {
                  event.stopPropagation()
                  moveHeroGallery(-1)
                }}
                style={{
                  position: 'absolute',
                  left: isMobile ? 16 : -140,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 1
                }}
              >
                <img
                  src="/teaching/arrow_left_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
                  alt="Previous"
                  style={{ width: isMobile ? 28 : 24, height: isMobile ? 28 : 24, display: 'block' }}
                />
              </button>
            )}
            <img
              src={heroImage}
              alt={selectedItem?.title || 'Selected teaching project'}
              onMouseDown={handleHeroDragStart}
              draggable={false}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto',
                display: 'block',
                boxShadow: '0 24px 40px rgba(0,0,0,0.18)',
                transform: `translate(${heroPan.x}px, ${heroPan.y}px) scale(${heroScale})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease',
                cursor: isPanMode && heroScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                zIndex: 2
              }}
            />
            {heroGallery.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                data-hero-control="true"
                onClick={(event) => {
                  event.stopPropagation()
                  moveHeroGallery(1)
                }}
                style={{
                  position: 'absolute',
                  right: isMobile ? 16 : -140,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 1
                }}
              >
                <img
                  src="/teaching/arrow_right_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
                  alt="Next"
                  style={{ width: isMobile ? 28 : 24, height: isMobile ? 28 : 24, display: 'block' }}
                />
              </button>
            )}
          </div>
        </div>
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
    </div>
  )
}
