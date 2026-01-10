'use client'

import { useEffect, useMemo, useState } from 'react'
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
            title: 'Independent Research & Consulting',
            subtitle: 'Research Development, Design Practice',
            body:
              'Developing postdoctoral research proposals on embodied climate adaptation, perceptual change, and XR-based environmental experience. Manuscript preparation and peer review activities. Architectural Design Consulting (2 completed projects).'
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
        subtitle: 'NTNU and TU Berlin (cotutelle)',
        body:
          '(In) Authentic VR. Quality Assessments of Interactivity in Virtual Reality (cum laude). Supervised by Prof. Andrew Perkis (NTNU) and Prof. Sebastian Moller (TU Berlin).'
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
    id: 'academic-service-awards',
    label: 'engagement',
    //heading: 'engagement',
    type: 'sections',
    sections: [
      {
        heading: 'academic activities',
        rows: [
          {
            leftText: 'Outreach',
            leftColumnWidth: 120,
            lines: [
              'Task Force Leader | TF7: Immersive Media | 2019 - 2022 | QUALINET COST Action IC1003',
              'Working Group Member | WG3: Evaluations | 2020 - 2023 | INDCOR COST Action CA18230'
            ]
          },
          {
            leftText: 'Proposals',
            leftColumnWidth: 120,
            lines: [
              'Research Assistant | IMPACT | Horizon Europe 2018 | XR and Health',
              'Research Assistant | IDN4CCI | Horizon Europe 2021 | Culture & Creative Industries',
              'Research Assistant | METASTORIES | Horizon MSCA DN 2024 | Transformative Technologies'
            ]
          },
          {
            leftText: 'Coordination',
            leftColumnWidth: 120,
            lines: [
              'Creative Facilitator | 2018 - 2021 | NTNU ARTEC'
            ]
          },
          {
            leftText: 'Reviews',
            leftColumnWidth: 120,
            lines: [
              'Frontiers in Psychology | Springer Virtual Reality | IEEE VR | Springer IoT'
            ]
          }
        ]
      },
      {
        heading: 'teaching & mentoring',
        rows: [
          {
            leftText: 'Elsys & Sense-IT,\nNTNU, NO.',
            leftColumnWidth: 120,
            lines: [
              '2019 - 2022 | Mandated work duty during PhD, co-supervised master\'s students at the Sense-IT Lab. Presented lectures for the Course TT 8108.'
            ]
          },
          {
            leftText: 'Donau-Universitat,\nKrems, AT.',
            leftColumnWidth: 120,
            lines: [
              '2022 | Invited Guest Lecture Series. Delivered two lectures within art and science methodologies, focusing on immersive media technologies and practices.'
            ]
          },
          {
            leftText: 'Universita di Genoa, Genova, IT.',
            leftColumnWidth: 120,
            lines: [
              '2021 | Invited Guest Lectures. Delivered two lectures on human-centered design for VR, focusing on affordance-based approaches and performance evaluations.'
            ]
          },
          {
            leftText: 'COMSATS University,\nIslamabad, PK.',
            leftColumnWidth: 120,
            lines: [
              '2011 - 2015 | Taught 1600+ hours of design studio courses and 600+ hours of theory courses at the undergraduate level.'
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
            inlineParts: ['Erasmus Mundus Full Scholarship', '2015', 'Aalborg University, Denmark']
          },
          {
            fullWidth: true,
            inlineParts: ['Winner, Architecture Design Competition', '2014', 'Comsats University + PCTAP, Pakistan']
          },
          {
            fullWidth: true,
            inlineParts: ['Distinction, Bachelor Thesis', '2008', 'National College of Arts, Pakistan']
          }
        ]
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
              { label: '3D/Spatial', text: 'Unreal Engine, Unity, AutoCAD, Rhino3D, Grasshopper, SketchUp, Revit, 3DsMax' },
              { label: 'Digital/Interactive', text: 'Figma, Adobe Suite, Next.js, React, JavaScript, HTML/CSS' },
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
]

const formatMetaLabel = (label) => label.replace('&', '&').toUpperCase()

export default function CurriculumVitaePage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
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

  const navCategories = useMemo(() => ([
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]), [])

  const selectCategory = (id) => {
    const idx = cvCategories.findIndex((category) => category.id === id)
    if (idx >= 0) setActiveCategoryIndex(idx)
  }

  const moveCategory = (delta) => {
    setActiveCategoryIndex((prev) => (prev + delta + cvCategories.length) % cvCategories.length)
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
          <div style={{ fontSize: '12px', whiteSpace: 'pre-line' }}>{row.leftText}</div>
        ) : null}
        {row.rightText ? (
          <div style={{ textAlign: 'right' }}>{row.rightText}</div>
        ) : (
          <div>
            {row.title && row.showTitle !== false ? (
              <div style={{ fontWeight: 600 }}>
                {row.title}{row.subtitle ? ` | ${row.subtitle}` : ''}
              </div>
            ) : null}
            {row.body ? <div style={{ marginTop: '6px' }}>{row.body}</div> : null}
            {row.inlineParts ? (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
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
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: row.linesGap ?? 4 }}>
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
        analyticsText="CURRICULUM VITAE"
        glowFilter={glowFilter}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        activePage="connect"
        glowActive
        onNavigate={(category) => navigateWithFade(`/${category}`)}
      />

      <LeftPanelTransform
        readingMode={readingMode}
        toggleReadingMode={toggleReadingMode}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        label="CV"
        labelTop={85}
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
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '140px 240px 120px 140px',
          display: 'grid',
          gridTemplateColumns: '200px minmax(420px, 1fr)',
          gap: '100px',
          alignItems: 'start'
        }}
      >
        <div style={{ position: 'relative', width: '200px' }}>
          <div
            style={{
              position: 'fixed',
              left: '140px',
              top: '380px',
              display: 'flex',
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

        <div style={{ maxWidth: '820px', fontFamily: 'var(--font-karla)', color: '#000', marginTop: '60px', marginLeft: '220px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}
          >
            <div style={{ textAlign: 'left' }}>{formatMetaLabel(activeCategory.label)}</div>
            <div />
          </div>

          <div style={{ height: '1px', background: '#000', opacity: 0.35 }} />
          {!isExpertiseCategory && activeCategory.heading ? (
            <div style={{ marginTop: '16px', fontSize: '22px', fontWeight: 500 }}>
              {activeCategory.heading}
            </div>
          ) : null}

          <div style={{ marginTop: '18px', fontSize: '13px', lineHeight: 1.55, maxWidth: '760px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {activeCategory.rows.map((row, index) => renderRow(row, index))}
              </div>
            ) : null}

            {activeCategory.type === 'sections' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeCategory.sections.map((section) => {
                  const sectionHeading = section.heading
                  const sectionTitle = section.title
                  const headingStyle = usePrimarySectionHeadings
                    ? { fontSize: '22px', fontWeight: 500, marginBottom: '12px' }
                    : { fontWeight: 600, marginBottom: '8px' }
                  return (
                    <div key={`${activeCategory.id}-${sectionHeading || sectionTitle || 'section'}`}>
                      {sectionHeading ? (
                        <div style={headingStyle}>{sectionHeading}</div>
                      ) : sectionTitle ? (
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>{sectionTitle}</div>
                      ) : null}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {section.rows.map((row, index) => renderRow(row, index))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div style={{ position: 'relative', marginTop: '18px' }}>
            <div style={{ height: '1px', background: '#000', opacity: 0.35 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px' }}>
            <button
              type="button"
              onClick={() => moveCategory(-1)}
              aria-label="Previous category"
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-karla)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {'<-'}
            </button>
            <button
              type="button"
              onClick={() => moveCategory(1)}
              aria-label="Next category"
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-karla)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {'->'}
            </button>
          </div>
        </div>
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
    </div>
  )
}
