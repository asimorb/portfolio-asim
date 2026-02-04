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

const cvCategories = [
  {
    id: 'experience',
    label: 'experience',
    //heading: 'Professional Experience',
    type: 'sections',
    sections: [
      {
        //title: 'Professional Experience',
        rows: [
          {
            leftText: 'Sep 2024 - Present\nNorway',
            title: 'Independent Consultant',
            subtitle: 'Research Development, Design Practice',
            body:
              'Creative consultant on proposal targeting Marie Skłodowska-Curie grants. Reviewer at Virtual Reality Journal at Springer. Postdoctoral proposals on embodied climate adaptation, perceptual change, and XR-based environmental experience. Architectural Design Consulting (2 completed projects).'
          },
          {
            leftText: 'Mar 2018 - May 2024\nNTNU, Norway',
            title: 'Research Fellow',
            subtitle: '75% research, 25% duties',
            body:
              'Worked under Prof. Andrew Perkis on "Holistic Quality Framework for VR Experiences". Conducted empirical studies with 100+ participants. Co-developed funding proposals on XR. Creative facilitation at NTNU Artec and co-designed workshops.'
          },
          {
            leftText: 'Jan 2022 - Nov 2022\nNTNU, Norway',
            title: 'Usability Expert',
            subtitle: 'AdMire3D (EU Horizon 2020 No. 952027)',
            body:
              'Validation and quality assessments of Mixed Reality solutions for broadcasting. End-to-end system validation and user testing at three partner sites across Europe.'
          },
          {
            leftText: 'Oct 2014 - Oct 2018\nParticles, Pakistan',
            title: 'Founder + Design Director',
            subtitle: 'Founder and 50% Design Lead',
            body:
              'Conceptual design, schematic coordination, and contract administration of 10+ built projects. Founded MYOF, an intuitive platform for creating customized furniture.'
          },
          {
            leftText: 'Sep 2011 - Aug 2015\nCOMSATS, Pakistan',
            title: 'Teaching Professional',
            subtitle: 'Senior Lecturer',
            body:
              'Taught 1600+ hours of design studio courses and 600+ hours of theory courses at the undergraduate level.'
          }
        ]
      },
    ]
  },
    {
    id: 'education',
    label: 'education',
    //heading: 'Education',
    type: 'rows',
    rows: [
      {
        leftText: 'Mar 2018 - May 2024',
        title: 'PhD in Electronics & Telecommunications',
        subtitle: 'NTNU and TU Berlin',
        body:
          '(In) Authentic VR. Quality Assessments of Interactivity in Virtual Reality (cum laude). Cotutelle supervision by Prof. Andrew Perkis (NTNU) and Prof. Sebastian Moller (TU Berlin).'
      },
      {
        leftText: 'Sep 2015 - Jul 2017',
        title: 'Master\'s degree in Media Arts & Technology',
        subtitle: 'Aalborg University',
        body: '(Erasmus Mundus Scholarship)'
      },
      {
        leftText: 'Sep 2009 - Dec 2010',
        title: 'Master\'s degree in Computational Architecture',
        subtitle: 'Barcelona Tech'
      },
      {
        leftText: 'Jan 2003 - Jan 2008',
        title: 'Bachelor\'s degree in Architecture',
        subtitle: 'NCA Lahore',
        body: '(Thesis Awarded Distinction)'
      }
    ]
  },
  {
    id: 'expertise',
    label: 'expertise',
    heading: 'Expertise',
    type: 'sections',
    sections: [
      {
        heading: 'areas',
        rows: [
          {
            fullWidth: true,
            mobileLines: [
              { text: 'Mixed-Method UX Research | Interaction Design |', hasBreak: true },
              { text: 'Spatial Storytelling', hasBreak: false },
              { spacer: true, height: '18px' },
              { text: 'Usability & User Research | Information Architecture |', hasBreak: true },
              { text: 'Human-centered Evaluation', hasBreak: false },
              { spacer: true, height: '18px' },
              { text: '3D Content Creation & Visualization | Affordance Assessment |', hasBreak: true },
              { text: 'Co-Creation and Participatory Design', hasBreak: false }
            ],
            mobileLinesGap: 3,
            columns: [
              [
                'Mixed-Method UX Research',
                'Interaction Design',
                'Spatial Storytelling'
              ],
              [
                'Usability & User Research',
                'Information Architecture',
                'Human-centered Evaluation'
              ],
              [
                '3D Content Creation & Visualization',
                'Affordance Assessment',
                'Co-Creation and Participatory Design'
              ]
            ]
          }
        ]
      },
      {
        heading: 'competencies',
        rows: [
          {
            fullWidth: true,
            lines: [
              { label: 'Qualitative', text: 'Phenomenological methods, Co-creation, Situated research' },
              { label: 'Quantitative', text: 'Behavioral analysis, Psychophysical measurements, Statistical analysis' },
              { label: 'Standards', text: 'ITU & ISO frameworks, Research protocols' }
            ]
          },
          {
            fullWidth: true,
            lines: [
              { label: '3D/Spatial', text: 'Unreal Engine, AutoCAD, Rhino3D, SketchUp,  3DsMax' },
              { label: 'Digital/Interactive', text: 'Figma, Adobe Suite, Next.js, React' },
              { label: 'Accessibility', text: 'ARIA, Keyboard navigation, Focus management' },
              { label: 'Data', text: 'Tableau, Power BI, R, SPSS' }
            ]
          },
          {
            fullWidth: true,
            lines: [
              { label: 'Behavioral', text: 'BORIS, Kinovea, Google Analytics, Heap' },
              { label: 'Physiological', text: 'Tobii (eye-tracking), Emotiv Epoc, Muse' },
              { label: 'Standards & Protocols', text: 'ITU & ISO frameworks' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'academic-service-awards',
    label: 'engagement',
    type: 'sections',
    sections: [
      {
        sectionTitle: 'ACADEMIC ACTIVITIES',
        subsections: [
          {
            heading: 'Outreach',
            rows: [
              {
                fullWidth: true,
                lines: [
                  'Leader, TF7 Immersive Media in QUALINET COST Action IC1003',
                  'Member, WG3 Evaluations in INDCOR COST Action CA18230'
                ]
              }
            ]
          },
          {
            heading: 'Proposals',
            rows: [
              {
                fullWidth: true,
                lines: [
                  'IMPACT, Horizon Europe 2018: XR and Health',
                  'IDN4CCI, Horizon Europe 2021: Culture and Creative Industries',
                  'METASTORIES, MSCA 2024: Transformative Technologies'
                ]
              }
            ]
          }
        ]
      },
      {
        sectionTitle: 'TEACHING & MENTORING',
        subsections: [
          {
            heading: 'Teaching Duties / 2011-2024',
            rows: [
              {
                fullWidth: true,
                lines: [
                  '1600+ hours of design studio and 600+ hours of theory courses at undergrad level. Delivered theory-based lectures to Master\'s students on Immersive Media Technologies in the course TT8108. In addition, cosupervised Master\'s theses for 4+ students at SenseIt Lab, providing mentorship from proposal to defense with positive feedback.'
                ],
                linesGap: 3
              }
            ]
          },
          {
            heading: 'Lectures / 2017-2025',
            rows: [
              {
                fullWidth: true,
                lines: [
                  'Guest Lectures on topics related to design & science methodologies, with particular focus on immersive technologies and practices.'
                ],
                linesGap: 3
              }
            ]
          }
        ]
      },
      {
        heading: 'awards',
        rows: [
          {
            fullWidth: true,
            inlineParts: ['Cum Laude, PhD Dissertation', '2024', 'NTNU & TU Berlin']
          },
          {
            fullWidth: true,
            inlineParts: ['Erasmus Mundus Full Scholarship', '2015', 'Aalborg University']
          },
          {
            fullWidth: true,
            inlineParts: ['Winner, Architecture Design Competition', '2014', 'PCATP']
          },
          {
            fullWidth: true,
            inlineParts: ['Distinction, Bachelor Thesis', '2008', 'National College of Arts']
          }
        ]
      }
    ]
  },
]

const formatMetaLabel = (label) => label.replace('&', '&').toUpperCase()

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

export default function CurriculumVitaePage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState('connect')
  const [hydrated, setHydrated] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isNarrowDesktop = useMediaQuery('(max-width: 1400px)')
  const gatedIsNarrowDesktop = hydrated ? isNarrowDesktop : false
  const isExtraSmallPhone = useMediaQuery('(max-width: 400px)')
  const gatedIsExtraSmallPhone = hydrated ? isExtraSmallPhone : false

  // Consolidated heading styles
  const mainHeadingStyle = {
    fontSize: isMobile ? '16px' : gatedIsNarrowDesktop ? '18px' : '22px',
    fontWeight: 500,
    marginTop: isMobile ? '24px' : '0',
    marginBottom: '12px',
    textTransform: isMobile ? 'uppercase' : 'lowercase'
  }
  const subsectionHeadingStyle = { fontSize: gatedIsNarrowDesktop ? '12px' : 'inherit', fontWeight: 600, marginBottom: '4px' }

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
    setHydrated(true)
  }, [])

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    return () => clearTimeout(fadeTimer)
  }, [])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const safeCategoryIndex = Math.min(activeCategoryIndex, cvCategories.length - 1)
  const activeCategory = cvCategories[safeCategoryIndex] || cvCategories[0]
  const isExpertiseCategory = activeCategory?.id === 'expertise'
  const usePrimarySectionHeadings = isExpertiseCategory || activeCategory?.id === 'academic-service-awards'

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

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

  const navCategories = useMemo(() => ([
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: isMobile ? ['cv', 'about me'] : ['curriculum vitae', 'about me'] }
  ]), [isMobile])

  const selectCategory = (id) => {
    const idx = cvCategories.findIndex((category) => category.id === id)
    if (idx >= 0) setActiveCategoryIndex(idx)
  }

  const moveCategory = (delta) => {
    setActiveCategoryIndex((prev) => (prev + delta + cvCategories.length) % cvCategories.length)
  }

  const handleMobileNavigate = (sub, category) => {
    closeMobileMenu()
    if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
      navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
    } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
      navigateWithFade(`/view/${sub}`)
    } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
      navigateWithFade(`/reflect/${sub}`)
    } else if (category === 'connect' && sub === 'about me') {
      navigateWithFade('/connect/about-me')
    } else if (category === 'connect' && sub === 'cv') {
      navigateWithFade('/connect/curriculum-vitae')
    } else {
      navigateWithFade(`/${category}`)
    }
  }

  const renderRow = (row, index) => {
    const isFullWidth = row.fullWidth
    const leftColumnWidth = row.leftColumnWidth ?? 160
    const leftColumnValue = typeof leftColumnWidth === 'number' ? `${leftColumnWidth}px` : leftColumnWidth
    const gridTemplateColumns = row.rightText
      ? '1fr 1fr'
      : isFullWidth
        ? '1fr'
        : `${leftColumnValue} 1fr`

    // Mobile: single column layout
    if (isMobile) {
      return (
        <div
          key={row.leftText || row.title || row.body || (row.lines && row.lines[0]) || index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {row.leftText ? (
            <div style={{ fontSize: '12px', color: '#000' }}>{row.leftText}</div>
          ) : null}
          {row.title && row.showTitle !== false ? (
            <div style={{ fontWeight: 600 }}>
              {row.title}
              {row.subtitle ? <span> | {row.subtitle}</span> : null}
            </div>
          ) : null}
          {row.body ? <div>{row.body}</div> : null}
          {row.inlineParts ? (
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              {row.inlineParts.map((part, partIndex) => (
                <span key={`${part}-${partIndex}`} style={{ whiteSpace: 'nowrap' }}>
                  {part}
                  {partIndex < row.inlineParts.length - 1 ? (
                    <span style={{ margin: '0 16px' }}>|</span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
          {row.mobileLines ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {row.mobileLines.map((item, lineIndex) => {
                if (typeof item === 'object' && item.spacer) {
                  return <div key={`spacer-${lineIndex}`} style={{ height: item.height }} />
                }
                if (typeof item === 'object' && item.text) {
                  const marginBottom = item.hasBreak ? `${row.mobileLinesGap ?? 3}px` : '0'
                  if (item.text.includes('|')) {
                    const parts = item.text.split('|').map((part) => part.trim()).filter(Boolean)
                    return (
                      <div key={`${item.text}-${lineIndex}`} style={{ marginBottom }}>
                        {parts.map((part, partIndex) => (
                          <span key={`${part}-${partIndex}`}>
                            {partIndex > 0 ? <span style={{ margin: '0 16px' }}>|</span> : null}
                            {part}
                          </span>
                        ))}
                        {item.text.endsWith('|') ? <span style={{ margin: '0 16px' }}>|</span> : null}
                      </div>
                    )
                  }
                  return (
                    <div
                      key={`${item.text}-${lineIndex}`}
                      style={{ marginBottom }}
                    >
                      {item.text}
                    </div>
                  )
                }
                // Fallback for old string format
                if (typeof item === 'string') {
                  if (item === '') {
                    return <div key={`spacer-${lineIndex}`} style={{ height: '12px' }} />
                  }
                  const hasTrailingPipe = item.endsWith('|')
                  const marginBottom = hasTrailingPipe ? `${row.mobileLinesGap ?? 3}px` : '0'
                  return (
                    <div
                      key={`${item}-${lineIndex}`}
                      style={{ marginBottom }}
                    >
                      {item}
                    </div>
                  )
                }
                return null
              })}
            </div>
          ) : null}
          {row.lines ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: row.linesGap ?? 4 }}>
              {row.lines.map((line, lineIndex) => {
                if (typeof line === 'string') {
                  if (line.includes('|')) {
                    const parts = line.split('|').map((part) => part.trim()).filter(Boolean)
                    return (
                      <div key={`${line}-${lineIndex}`}>
                        {parts.map((part, partIndex) => (
                          <span key={`${part}-${partIndex}`}>
                            {partIndex > 0 ? <span style={{ margin: '0 16px' }}>|</span> : null}
                            {part}
                          </span>
                        ))}
                      </div>
                    )
                  }
                  return <div key={`${line}-${lineIndex}`}>{line}</div>
                }
                const label = line?.label || ''
                const text = line?.text || ''
                return (
                  <div key={`${label}-${lineIndex}`}>
                    {label ? <span style={{ fontWeight: 600 }}>{label}</span> : null}
                    {label && text ? ': ' : null}
                    {text}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      )
    }

    // Desktop: two-column grid layout
    return (
      <div
        key={row.leftText || row.title || row.body || (row.lines && row.lines[0]) || index}
        style={{
          display: 'grid',
          gridTemplateColumns,
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {!isFullWidth ? (
          <div style={{ fontSize: '12px', whiteSpace: 'pre-line', fontWeight: 600 }}>{row.leftText}</div>
        ) : null}
        {row.rightText ? (
          <div style={{ textAlign: 'right' }}>{row.rightText}</div>
        ) : (
          <div>
            {row.title && row.showTitle !== false ? (
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>
                {row.title}
              </div>
            ) : null}
            {row.subtitle ? (
              <div style={{ marginBottom: '6px' }}>{row.subtitle}</div>
            ) : null}
            {row.body ? <div>{row.body}</div> : null}
            {row.inlineParts ? (
              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                {row.inlineParts.map((part, partIndex) => (
                  <span key={`${part}-${partIndex}`} style={{ whiteSpace: 'nowrap' }}>
                    {part}
                    {partIndex < row.inlineParts.length - 1 ? (
                      <span style={{ margin: '0 16px' }}>|</span>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
            {row.columns ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
                {row.columns.map((column, columnIndex) => (
                  <div key={columnIndex} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {column.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
            {row.lines ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: row.linesGap ?? 4 }}>
                {row.lines.map((line, lineIndex) => {
                  if (typeof line === 'string') {
                    if (line.includes('|')) {
                      const parts = line.split('|').map((part) => part.trim()).filter(Boolean)
                      return (
                        <div key={`${line}-${lineIndex}`}>
                          {parts.map((part, partIndex) => (
                            <span key={`${part}-${partIndex}`}>
                              {partIndex > 0 ? <span style={{ margin: '0 16px' }}>|</span> : null}
                              {part}
                            </span>
                          ))}
                        </div>
                      )
                    }
                    return <div key={`${line}-${lineIndex}`}>{line}</div>
                  }
                  const label = line?.label || ''
                  const text = line?.text || ''
                  return (
                    <div key={`${label}-${lineIndex}`}>
                      {label ? <span style={{ fontWeight: 600 }}>{label}</span> : null}
                      {label && text ? ': ' : null}
                      {text}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: isMobile ? 'hidden' : 'auto',
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
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
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
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <div className="glow-core-transition" />
        <div className="glow-core-intersection" />
        <div className="glow-core-static" />
      </div>

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
            analyticsText=""
            glowFilter={glowFilter}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            activePage="connect"
            glowActive
            onNavigate={(category) => navigateWithFade(`/${category}`)}
          />
          <div
            style={{
              position: 'fixed',
              top: 40,
              left: 100,
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-karla)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <div style={{ display: 'flex', gap: '14px' }}>
              {cvCategories.map((category, idx) => {
                const isActive = category.id === activeCategory?.id
                return (
                  <button
                    key={`cv-index-${category.id}`}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    style={{
                      border: isActive ? '1px solid #000' : '1px solid transparent',
                      background: isActive ? '#000' : 'none',
                      padding: '4px 6px',
                      cursor: isActive ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 600,
                      color: isActive ? '#fff' : '#000',
                      borderRadius: '999px',
                      lineHeight: 1,
                      minWidth: '24px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {hydrated && gatedIsNarrowDesktop && (
              <div
                key={`cv-label-${activeCategory?.id}`}
                style={{
                  fontFamily: 'var(--font-karla)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  textTransform: 'lowercase',
                  animation: 'fadeIn 220ms ease'
                }}
              >
                {activeCategory?.label}
              </div>
            )}
          </div>
        </>
      )}

      {!isMobile && (
        <LeftPanelTransform
          readingMode={readingMode}
          toggleReadingMode={toggleReadingMode}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          label="CV"
          labelTop={85}
          onBack={handleBack}
          onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
          readingModeDisabled={true}
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
          activeSubcategory="curriculum vitae"
          categories={navCategories}
          glowActive
          onNavigate={(sub, category) => {
            if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
              navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
            } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`/view/${sub}`)
            } else if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
              navigateWithFade(`/reflect/${sub}`)
            } else if (category === 'connect' && sub === 'curriculum vitae') {
              navigateWithFade('/connect/curriculum-vitae')
            } else {
              navigateWithFade(`/${category}`)
            }
          }}
        />
      )}

      {isMobile && (
        <MobileChrome
          title="curriculum vitae"
          activeDot="connect"
          bottomLabel=""
          readingMode={readingMode}
          primaryActive={readingMode}
          primaryDisabled={true}
          onPrimaryAction={toggleReadingMode}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={handleBack}
          onNavigate={(key) => navigateWithFade(`/${key}`)}
          onMenuToggle={toggleMobileMenu}
          menuExpanded={mobileMenuOpen}
        />
      )}

      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
            left: 20,
            right: 20,
            zIndex: 82,
            display: 'flex',
            flexWrap: 'wrap',
            maxWidth: '100%',
            gap: '18px',
            fontFamily: 'var(--font-karla)',
            fontSize: gatedIsExtraSmallPhone ? '14.5px' : '16px'
          }}
        >
          {cvCategories.map((category) => {
            const isActive = category.id === activeCategory?.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: isActive ? 600 : 300,
                  color: '#000',
                  cursor: 'pointer',
                  textTransform: 'lowercase'
                }}
              >
                {category.label}
              </button>
            )
          })}
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
        style={{
          position: 'relative',
          zIndex: 3,
          height: isMobile ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' : 'auto',
          padding: isMobile ? '120px 12px 160px' : gatedIsNarrowDesktop ? '140px 240px 120px 50px' : '140px 240px 120px 140px',
          marginLeft: isMobile ? 0 : (gatedIsNarrowDesktop ? '-140px' : '-100px'),
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : gatedIsNarrowDesktop ? '1fr' : '200px minmax(420px, 1fr)',
          gap: isMobile ? undefined : gatedIsNarrowDesktop ? '0' : '100px',
          alignItems: 'start',
          overflowY: isMobile ? 'auto' : 'visible',
          boxSizing: 'border-box'
        }}
      >
        {!isMobile && (
          <div style={{ position: 'relative', width: '200px' }}>
            <div
              style={{
                position: 'fixed',
                left: '140px',
                top: '380px',
                display: gatedIsNarrowDesktop ? 'none' : 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'var(--font-karla)',
                fontSize: '24px'
              }}
            >
              {cvCategories.map((category) => {
                const isActive = category.id === activeCategory?.id
                return (
                  <div
                    key={category.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Show ${category.label}`}
                    onClick={() => selectCategory(category.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectCategory(category.id)
                      }
                    }}
                    style={{
                      fontWeight: isActive ? 500 : 200,
                      cursor: 'pointer',
                      textTransform: 'lowercase'
                    }}
                  >
                    {category.label}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ maxWidth: isMobile ? '100%' : '820px', fontFamily: 'var(--font-karla)', color: '#000', marginTop: isMobile ? '24px' : '60px', marginLeft: isMobile ? 0 : '220px' }}>

          <div style={{ fontSize: gatedIsNarrowDesktop ? '12px' : '13px', lineHeight: isMobile ? 1.4 : 1.1, maxWidth: isMobile ? '100%' : '760px', overflowWrap: 'break-word' }}>
            {activeCategory.type === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
                {activeCategory.columns.map((column, idx) => (
                  <div key={`${activeCategory.id}-col-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {column.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {activeCategory.type === 'rows' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '28px' : '18px',
                marginTop: isMobile && activeCategory.id === 'education' ? '70px' : '0'
              }}>
                {!isMobile && <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginBottom: '18px' }} />}
                {activeCategory.rows.map((row, index) => renderRow(row, index))}
                {!isMobile && <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginTop: '18px' }} />}
              </div>
            ) : null}

            {activeCategory.type === 'sections' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeCategory.sections.map((section, sectionIndex) => {
                  // New structure with sectionTitle and subsections
                  if (section.sectionTitle && section.subsections) {
                    return (
                      <div key={`${activeCategory.id}-${section.sectionTitle}-${sectionIndex}`}>
                        <div style={mainHeadingStyle}>
                          {section.sectionTitle}
                        </div>
                        {!isMobile && <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginBottom: '20px' }} />}
                        <div style={{ display: section.sectionTitle === 'ACADEMIC ACTIVITIES' && !isMobile ? 'grid' : 'flex', gridTemplateColumns: section.sectionTitle === 'ACADEMIC ACTIVITIES' && !isMobile ? '1fr 1fr' : undefined, flexDirection: section.sectionTitle === 'ACADEMIC ACTIVITIES' && !isMobile ? undefined : 'column', gap: '20px' }}>
                          {section.subsections.map((subsection, subsectionIndex) => (
                            <div key={`${section.sectionTitle}-${subsection.heading}-${subsectionIndex}`}>
                              {subsection.heading ? (
                                <div style={subsectionHeadingStyle}>{subsection.heading}</div>
                              ) : null}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '28px' : '16px' }}>
                                {subsection.rows.map((row, index) => renderRow(row, index))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  // Old structure (for awards section and experience without sectionTitle)
                  const sectionHeading = section.heading
                  const sectionTitle = section.title
                  const isAwardsSection = sectionHeading === 'awards'
                  const isCompetenciesSection = sectionHeading === 'competencies'
                  const isExperienceSection = activeCategory.id === 'experience' && !sectionHeading && !sectionTitle
                  const rowGap = isAwardsSection ? (isMobile ? '10px' : '6px') : (isMobile ? '28px' : '16px')
                  return (
                    <div key={`${activeCategory.id}-${sectionHeading || sectionTitle || 'section'}-${sectionIndex}`}>
                      {isExperienceSection && !isMobile && sectionIndex === 0 && (
                        <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginBottom: '18px' }} />
                      )}
                      {sectionHeading ? (
                        <>
                          <div style={{...mainHeadingStyle, marginTop: isCompetenciesSection && !isMobile ? '40px' : mainHeadingStyle.marginTop}}>
                            {sectionHeading}
                          </div>
                          {!isMobile && <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginBottom: '16px' }} />}
                        </>
                      ) : sectionTitle ? (
                        <div style={subsectionHeadingStyle}>{sectionTitle}</div>
                      ) : null}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap }}>
                        {section.rows.map((row, index) => renderRow(row, index))}
                      </div>
                      {isExperienceSection && !isMobile && sectionIndex === activeCategory.sections.length - 1 && (
                        <div style={{ height: '1px', backgroundColor: '#000', width: '100%', marginTop: '18px' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
    </div>
  )
}
