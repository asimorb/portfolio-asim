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
            backgroundImage: 'url(\"data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%22120%22%20viewBox=%220%200%20120%20120%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%222%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22120%22%20height=%22120%22%20filter=%22url(%23n)%22/%3E%3C/svg%3E\")',
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

export default function TeachingPage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const mediaQueryMatch = useMediaQuery('(max-width: 768px)')
  const isMobile = hydrated ? mediaQueryMatch : false
  const mediaQueryNarrow = useMediaQuery('(max-width: 1400px)')
  const isNarrowDesktop = hydrated ? mediaQueryNarrow : false
  const mediaQueryShortHeight = useMediaQuery('(max-height: 750px)')
  const isSmallPhone = hydrated ? (isMobile && mediaQueryShortHeight) : false
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)')
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [activeCategoryId, setActiveCategoryId] = useState('studio')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [heroScale, setHeroScale] = useState(1)
  const [heroGalleryIndex, setHeroGalleryIndex] = useState(0)
  const [heroPan, setHeroPan] = useState({ x: 0, y: 0 })
  const [isPanMode, setIsPanMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [heroLightboxIndex, setHeroLightboxIndex] = useState(null)
  const [mobileMetaHeight, setMobileMetaHeight] = useState(null)
  const [mobileNotesExpanded, setMobileNotesExpanded] = useState(false)
  const [showLectureToast, setShowLectureToast] = useState(false)
  const [carouselSwipeOffset, setCarouselSwipeOffset] = useState(0)
  const [heroPage, setHeroPage] = useState(0)
  const mobileMenuTimerRef = useRef(null)
  const lastWheelTimeRef = useRef(0)
  const heroDragStartRef = useRef({ x: 0, y: 0 })
  const heroPanStartRef = useRef({ x: 0, y: 0 })
  const mobileMetaRef = useRef(null)
  const heroThumbSwipeStartRef = useRef(null)
  const heroGalleryWheelRef = useRef(0)
  const carouselSwipeStartRef = useRef(null)
  const carouselSwipeIntervalRef = useRef(null)
  const carouselSwipeLastTimeRef = useRef(0)
  const carouselLongPressTimeoutRef = useRef(null)
  const carouselLongPressIntervalRef = useRef(null)
  const desktopCarouselSwipeStartRef = useRef(null)
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
    if (isSmallPhone) {
      return {
        cardWidth: 150,
        cardHeight: 195,
        stackGap: 33,
        stackOffsetX: 38,
        tiltY: -9,
        perspective: 390,
        baseScaleStep: 0.06,
        baseMaxScale: 0.95,
        selectedScale: 1.08
      }
    }
    if (isMobile) {
      return {
        cardWidth: 200,
        cardHeight: 260,
        stackGap: 44,
        stackOffsetX: 50,
        tiltY: -12,
        perspective: 520,
        baseScaleStep: 0.06,
        baseMaxScale: 0.95,
        selectedScale: 1.08
      }
    }
    if (isNarrowDesktop) {
      return {
        cardWidth: 208,
        cardHeight: 208,
        stackGap: 25,
        stackOffsetX: 128,
        tiltY: -14,
        perspective: 608,
        baseScaleStep: 0.04,
        baseMaxScale: 0.74,
        selectedScale: 0.93
      }
    }
    return {
      cardWidth: 260,
      cardHeight: 260,
      stackGap: 44,
      stackOffsetX: 160,
      tiltY: -18,
      perspective: 760,
      baseScaleStep: 0.05,
      baseMaxScale: 0.92,
      selectedScale: 1.16
    }
  }, [isSmallPhone, isMobile, isNarrowDesktop])
  const mobileCascadeOffsetY = isSmallPhone ? 80 : 120
  const mobileNavGap = 160
  const mobileMetaBottomOffset = activeCategoryId === 'mentor' ? 130 : 80
  const mobileArrowSize = 24
  const arrowSize = isMobile ? mobileArrowSize : (isNarrowDesktop ? 19 : 24)
  const heroCardWidthDesktop = 640
  const sideRailLeft = isMobile ? 0 : (isNarrowDesktop ? 96 : 140)
  const sideRailTop = isMobile ? 0 : (isNarrowDesktop ? 180 : 220)
  const sideRailWidth = isMobile ? 0 : (isNarrowDesktop ? 260 : 220)
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

  useEffect(() => {
    if (!isMobile || mobileMetaHeight !== null) return
    if (!mobileMetaRef.current) return
    const frame = requestAnimationFrame(() => {
      if (!mobileMetaRef.current) return
      const measuredHeight = Math.ceil(mobileMetaRef.current.getBoundingClientRect().height)
      if (measuredHeight) {
        setMobileMetaHeight(measuredHeight)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [isMobile, mobileMetaHeight])

  useEffect(() => {
    setHeroScale(1)
    if (selectedIndex !== null) {
      setHeroGalleryIndex(0)
      setHeroPan({ x: 0, y: 0 })
      setIsPanMode(false)
    }
    if (selectedIndex === null) {
      setHeroLightboxIndex(null)
    }
  }, [selectedIndex])

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'
  const teachingItems = useMemo(() => ([
    {
      id: 'studio-1',
      category: 'studio',
      title: 'of possible worlds: designing fictions and artefacts',
      heroTitle: 'Of POssible Worlds',
      duration: '14-weeks',
      type: 'studio',
      level: 'graduate',
      role: '',
      notes: 'this 14-week design studio explores speculative design as a means to interrogate and reimagine the socio-political implications of emerging technologies in shaping future urban environments.',
      description: 'This studio is devised around the evolving discipline of design fiction that envisions new products and technologies for "would-be" futures. In doing so, it provides a critical method for exploring and probing the social, cultural and ethical implications of such advances. Grounded as much in imagination as reality, design fiction is about bending the rules. It is about asking "What if?", and using the remains to probe the edges of our changing world.\n\nStudents will be tasked with cultivating fiction as a testing ground for reality. Through building and examining "possible worlds", they put forth behavioral, social and design trajectories for prospective endeavors. Students utilize design fiction as a novel tool for effectively normalizing fictional futures and assimilating them into here and now for much required introspection.\n\nFor a successful resonation with its audience, the student-designed "possible worlds" will take into consideration three important aspects of design fiction. The exercise will focus on:\n\n- the narrative of the fictional world;\n\n- the development of diegetic prototypes, i.e. objects/designs inside this fictional world;\n\n- the contextual emplacement of these prototypes inside the fiction.\n\nThe diegetic purposing of prototypes will enable students to make use of the "material tales" offered by these objects, designs and technologies. Students will be challenged to use, and view, objects beyond their obvious functionality, but as visionary devices that can stimulate a commentary on current practices and matters-of-concern as well as raising further design questions. This exploratory course in contextually-positioned fictional artefacts, offers students a methodological approach to craft stories of distant futures with a narrowed focus on objects/designs of particularity.',
      goals: 'This course will be mainly set inside a studio, writing and making. Additionally, conversations, readings and workshops will drive the direction of the course. A range of topics including, but not limited to, migrations, AI, gender roles, climate change, mixed-reality, resources scarcity, emergent territories, cybernetics, will be discussed and explored through the scope of trend analysis, fiction writing, analog & digital storyboarding. Finally touching upon product, system and communication design. \n\nFurthermore, the course will be divided into various phases and student progress will be evaluated respectively. The final project will be an objectified design/thing, which will be judged on the successful, and cohesive, culmination of all three aspects of design fiction.',
      aims: 'The studio aims to strengthen the conceptual and critical thinking of students by introducing them to a culture of envisioning/thinking through making. In addition, it will help them develop skills, which are not solely based on design tools, but are narrative and critical in nature. Students will learn to invent futures, be able to analyze them, rework when required, before communicating these futures to an audience as plausible extrapolations and embedded critical tales. The exercise intends to expand design understanding in students where thinking, analyzing, writing and making/creating are of equal importance.',
      gallery: [],
      image: null
    },
    {
      id: 'studio-2',
      category: 'studio',
      title: 'The design incubator: understanding space and program',
      heroTitle: 'THE DESIGN INCUBATOR',
      duration: '16 weeks',
      type: 'studio',
      level: 'undergraduate',
      role: '',
      notes: 'understanding space, form, and program through an intensive 14 week exercise.',
      description: 'This intermediate design studio emphasizes on objective observation in approaching an array of architectural ideas and issues. Students are introduced to develop fundamental methods to experience architectural design through seeing, understanding and judging the coordination and integration of its various spatial, structural and circulation components. These observations are illustrated using drawing exercises, precedent analysis and explored design methodologies.\n\nThe critique and observation is pivotal in informing the personal design, subjective interpretation, of the students. The course inculcates reflective design skills in students to enable them to conceptualize, represent and aesthetically formalize their views on built space. Further, the scale is magnified from private to public and students are challenged to explore various spatial configurations in correspondence with programmatic requirements to develop spatial, formal and aesthetic considerations of their designs, and vocabulary.',
      goals: [
        "To be able to conduct space critique through the observation of spatial principles rather than 'style'.",
        'To understand and successfully apply the observations, made previously, in developing an attitude towards design. These interpretations can be spatial, contextual, structural or phenomenological in nature.',
        'To understand the use of various spatial configurations in terms of their applicability to context and program.',
        'To further the representation methods used by students emphasizing on intricate model-making and ink drawings.'
      ],
      gallery: [
        '/teaching/st-01.jpg',
        '/teaching/st-02.jpg',
        '/teaching/st-03.jpg',
        '/teaching/st-04.jpg',
        '/teaching/st-05.jpg',
        '/teaching/st-06.jpg',
        '/teaching/st-07.jpg',
        '/teaching/st-08.jpg'
      ],
      image: null
    },
    {
      id: 'studio-3',
      category: 'studio',
      title: 'living gallery: an exercise in geometry and form-finding',
      heroTitle: 'LIVING GALLERY',
      duration: '14-week',
      type: 'studio',
      level: 'undergraduate',
      role: '',
      notes: 'a 14-week form-finding exercise that pivots towards "form following force and geometry" as it takes on the form vs function debate.',
      description: 'This intensive advance studio questions the dualist opposition of the heart of the form vs function debate. It contemplates contemporary approaches to built forms inspired from various biological, physical and geometric phenomena to render intelligent and efficient systems. Of the two alternative positions available, i.e. shape-finding and form-forming. The studio recognizes the latter, classical form-finding, as the study of discovering the dynamic adaptability and optimum form arising out of the relationship of "form following force and geometry". These structures are primarily based on natural systems where optimization is achieved out of the coordinated interaction of various disjuntive components.\n\nTo discourage computer-simulated, mathematically defined free-forms, students will be first required to develop cumbersome physical models tested under applied loads. The process can be then replicated using specialized modeling software with physics engines to produce their final architectural drawings.',
      goals: [
        'To observe and learn from natural systems and forms for informing our design processes.',
        'To study the works of Candela, Isler and Otto as examples of classical form-finding, and more recent works of Hadid, Ban and Balmond as examples of digitally optimized forms and geometries.',
        'To illustrate an understanding of natural membrane, lattice and shell structures and their corresponding geometries.',
        'To develop manual and digital skills of modeling applied loads.'
      ],
      gallery: [
        '/teaching/st-11.jpg',
        '/teaching/st-12.jpg',
        '/teaching/st-13.jpg',
        '/teaching/st-14.jpg',
        '/teaching/st-15.jpg'
      ],
      image: null
    },
    {
      id: 'studio-4',
      category: 'studio',
      title: "borge's library: narratives, spaces, and architecture",
      heroTitle: "borge's library",
      duration: '6-weeks',
      type: 'studio',
      level: 'undergraduate',
      role: '',
      notes: 'a 6-week project studying the relationship between narrative, space, and architecture. what if drawings were stories?',
      description: 'This assignment explores Borges\' "Library of Babel" as a space syntax tool for architecture. In his fiction, using simple language, Borges intertwines architecture and writing to an extent where the narrative structure can not be understood without the architectural expression - its mechanisms and preoccupations. He ties signification with space and narrative with order through a systematic relationship.\n\nThe space-to-words and words-to-space relation inside this fiction gets particularly complex owing to the paradoxically self-referentiality that links the fiction to its content. A careful analysis of the text is necessary to understand the loop used by Borges. Students are to use two-dimensional techniques to illustrate the looped order and geometry found within the narrative.',
      goals: [
        'To be able to view a text outside its semantic meaning alone and analyze it in terms of its linearity, non-linearity or the looped nature of its narrative structure.',
        'To learn to identify and map the spatiality and/or sequentiality embedded within a narrative through the use of graphical representation.',
        'To develop two-dimensional representation techniques beyond architectural perspectivism to negotiate the combative position between text and graphic. Students are tasked to explore the spatial connections inside the text to be able to trace them outside to understand the architecture of his library.'
      ],
      gallery: [
        '/teaching/st-21.jpg',
        '/teaching/st-22.jpg',
        '/teaching/st-23.jpg'
      ],
      image: null
    },
    {
      id: 'seminar-1',
      category: 'seminar',
      title: 'posthumanist environments: biopolitics and design',
      type: 'seminar',
      level: 'graduate',
      role: '',
      notes: 'this 6-week seminar explores posthumanist theories and their implications for understanding and designing urban environments in the age of advanced technologies and ecological challenges.',
      description: 'The analogy, "cities are like living organisms", has been around for quite some time. Falling in and out of favor, disappearing and re-appearing as the cultural discourse oscillates between tech-drive, people-driven and planet-driven attractors. The use of biological terms in describing cities does not usually suggest that a city is literally a living organism but that it is particularly similar in its operation to organisms. Utilizing literature on posthumanist debates, this seminar furthers architecture, design and urbanism towards the end of the anthropocene. It investigates if cities really do behave like living organisms following a distinct biological design? Or, are they unprecedented phenomena, owing to their social variables? \n The seminar will comprise of talks, readings, documentaries and discussions to analyze various metropolis around the world and understand them beyond the surface difference for constants, if any. This will take into consideration environmental and urban design approaches that look beyond a solely human-focused agenda, which is steered to change the world to suit us. Instead, the focus would be to study strategies that are more inclusive and encourage an approach to an interspecies civic-organism consisting of human and non-human inhabitants. Such a position requires us to change ourselves to suit the world. Literature from bio-philosophy, sociology and environmental psychology will guide the discourse that generates through this seminar.',
      gallery: [],
      image: null
    },
    {
      id: 'seminar-2',
      category: 'seminar',
      title: 'hyperreal spaces: locating aura in smart homes',
      type: 'seminar',
      level: 'graduate',
      role: '',
      notes: 'this 6-week seminar investigates the concept of "aura" in the context of hyperreal domestic spaces, examining how digital technologies mediate our experience of home and authenticity.',
      description: 'This course addresses the changes in the nature of dwelling/home; both as a container and living. It notes how contemporary dwellings are fast ceasing to be a univalent product of physical spatiality only and moving towards a complex mixed-reality amalgam consisting of networked real and virtual objects. The course investigates dwelling as an example of our techno-social reality requiring the conceptualization and organization of its own psycho-social aspects. The class will be structured around lectures, readings and discussions that will primarily investigate two key concepts. Firstly, building on the experiential phenomenology of the mid-twentieth century, the course will reconsider lived experience inside the mixed-reality, media-saturated dwelling of today, called the "hyperreal" home. Secondly, through "smart homes" students will be introduced to networked internet-of-things stratosphere -- where bodies, data, objects, and infrastructure, all contribute as interface for one another -- making a case for objects existing without being "ontologically exhausted" by their relations with humans or other objects. The course will rely on a media-philosophical discourse to explicate concepts, theories and strains of philosophy that affect contemporary dwelling.',
      gallery: [],
      image: null
    },
    {
      id: 'seminar-3',
      category: 'seminar',
      title: 'new media aesthetics: anthropomorphism of social robots',
      type: 'seminar',
      level: 'graduate',
      role: '',
      notes: 'a short seminar course on discussing the anthropomorhism of social robots and AI entities in contemporary media art.',
      description: 'For a perception to carry a meaning or significance, it must be recognizable. It is no wonder then that we find the world around as shaped by such discernible gestalts that helps us in the composition and reading of the world we make (Hesselgren, 1975). A gestalt is commonly understood as an organized unit with a meaning that is not derivable from its parts. For example, a square is immediately recognizable as such. So to speak, we employ such structures or phenomena as rationalization techniques to aid our interpretation of what centers our social or cultural spheres, be it a pet or in our case, a robot. Brian Duffy (2003) in his paper, "Anthropomorphism and the Social Robot", employs this argument in advocating the increase in anthropomorphism in a quest for fully synthetic humanoids. While his essay examines anthropomorphism as a tool for the social development of robots, it does provide a desirable background to explore the notion of "uncanny" that accompanies soft robotics and the attributions of human characteristics (physical or otherwise) to systems. For where perception forms meaning it also forms expectation. The lack of which may lead to disappointment or a negative aesthetic evaluation (Hall, 1995). Like the case of skeuomorphism in software design, where the visual texture of the tacky leather binding of the Apple iOS calendar (for example) gives rise to a mental image or expectation of tactility that is absent from graphic aesthetic leading to an inferior visual feel. Having said that, the binder does not nudge one in to the eeriness or discomfort associated with the "uncanny" softness and anthropomorphic features found in some of the "social robots" discussed in this paper.\n\nThe first robot introduced in the world of science came in the guise of a cuboidal, solid structure that lacked any intricacy in form and was rather a tool of functionality: a machine. But that was not to stay. The early robots underwent the Darwinian process of evolution in an attempt to take the physical form of humans. This imposed trajectory was the mastermind of contributors to the worlds of science and art emulating a gradual change as asserted in Darwin\'s theory. But unlike the latter, this transformative transition still prevails and seems to lack finitude.\n\nThe recent creation of soft robotics furthers this notion. Soft robotics are similar to rigid, machine-like robots in functionality but it is their appearance that sets them apart from the earlier robots. With the new wave of technological development, soft robotics has come to light as an emerging field which is not confined to the realm of science only but serves at an interdisciplinary level such as encouraging the participation of artists and creative designers. Thus, it becomes manifest that the nascent robots will be a product of the engagement of scientific and artistic faculties resulting in a complex, an aesthetically pleasing robot unlike industrial robots used at assembly lines or in the mines (R. Wood & C. Walsh, 2013). To reach this end, materials such as "polymers -- specifically, elastomers with moduli comparable with human skin" are used to create such soft robots. (Shepherd R.F. et al., 2011). Walsh and Wood further assert the aim behind this development, "Yet, the promise of soft robots has motivated a nascent field at the intersection of materials, mechanical and electrical engineering, and biology aimed at embodying the core robotics technologies in composites as soft as skin."',
      gallery: [],
      image: null
    },
    {
      id: 'seminar-4',
      category: 'seminar',
      title: 'theory series: modern and contemporary architecture',
      type: 'seminar',
      level: 'undergraduate',
      role: '',
      notes: 'a 14-week seminar course in the history of modern and contemporary architecture with emphasis on how politics and philosophy played a pivotal role in defining discipline.',
      description: 'A topic-based course in the history of modern and contemporary architecture with particular importance given to the movements and theories that proved definitive for the discipline.\n\nThis was achieved through a series of seminars, each focusing on a particular architect, practice, movement or theory to explicating the socio-economic, political and technological trends of the time.\n\nSeminars were frequently aided with documentaries. Class assessments primarily relied on panel discussions, written essays, but also included poster presentations.\n\ntopics:\n\n01\nCorbusier, La Modular & the Domino House.\n\n02\nKurokawa and the Japanese Metabolists.\n\n03\nCedric Price: The Fun Palace.\n\n04\nAllan Kaprow does installations: temporary art & environment\n\n05\nTracing transformability; from Buckminster to Hoberman.\n\n06\nThe Prada Transformer\n\n07\nPleasures in Parc De La Villette\n\n08\nHimmelb(l)au\'s cavernous rooftop remodeling\n\n09\nThe polemics of Wexner Center\n\n10\nFinding absense in the Jewish Museum\n\n11\nThe Peak and Hadid\'s suprematist geology\n\n12\nKhora: Designing Derrida\'s Garden\n\n13\nMoving towards a new architecture with Jeffrey Kipnis\n\n14\nBuilding, and the terror of time.',
      gallery: [],
      image: null
    },
   {
      id: 'lecture-1',
      category: 'lecture',
      title: 'designing action-possibilities inside VR',
      type: 'lecture',
      level: 'tu berlin, de. / donau universitat, at.',
      role: '',
      notes: 'how humans experience and inhabit physical vs. virtual spaces, emphasizing the role of perception and mental models inside virtual environments, and how action possibilities (affordances) shape the coherence and realism virtual scenarios.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-2',
      category: 'lecture',
      title: 'experiencing climate data through immersive human narratives in VR',
      type: 'lecture',
      level: 'ntnu, no.',
      role: '',
      notes: 'our perception challenge of climate change often seems abstract or distant. by integrating human stories with complex climate data visualization, this lecture explored the experiential potential within narrative digital twins, and the need for participatory methods that make solutions relatable.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-3',
      category: 'lecture',
      title: 'producing knowledge through architectural design research',
      type: 'lecture',
      level: 'ivs, pk.',
      role: '',
      notes: 'architectural design is presented as a systematic method for inquiry and knowledge production, outlining various ways of knowing. we categorizes numerous types of architectural inquiry, including cultural, historical, economic, and socio-cultural studies, to achieve specificity in design.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-4',
      category: 'lecture',
      title: 'the pragmatic and hedonic affordances of VR experiences',
      type: 'lecture',
      level: 'ntnu, no. / unige, it.',
      role: '',
      notes: 'this talk focuses on how both practical usefulness and emotional enjoyment work together to create engaging and effective immersive experiences in virtual environments, showing that balancing these qualities is key to user satisfaction and presence.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-5',
      category: 'lecture',
      title: 'immersive media experiences: design and evaluation',
      type: 'lecture',
      level: 'ntnu, no. / donau universitat, at.',
      role: '',
      notes: 'an in-depth exploration of immersive media technologies (XR) and what constitutes their underlying components. it covers the technical landscape of the reality-virtuality continuum across applications in education, gaming, and immersive storytelling.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-6',
      category: 'lecture',
      title: 'measuring perceived quality inside VR',
      type: 'lecture',
      level: 'ntnu, no. / unige, it.',
      role: '',
      notes: 'discusses the challenges in Quality of Experience (QoE) modeling by detailing MPEG-I standards for efficient compression. in addition it discusses the technical aspects of HMDs and the psychological concept of presence and immersion in immersive VR.',
      gallery: [],
      image: null
    },
    {
      id: 'lecture-7',
      category: 'lecture',
      title: 'new advances in human-computer interaction for VR',
      type: 'lecture',
      level: 'uib, no.',
      role: '',
      notes: 'explores new developments in human-computer interaction and VR, establishing a theoretical basis in human-environment interaction and the concept of affordances. key advances include natural user interfaces and context-sensitive, user-adaptive VR systems.',
      gallery: [],
      image: null
    },
    {
      id: 'mentor-1',
      category: 'mentor',
      title: 'A web-based application for QoE evaluations',
      studentName: 'Fredrik Skorstol',
      linkLabel: 'LINK 1',
      linkUrl: 'https://nva.sikt.no/registration/0198eb9bad76-f3ed34d5-8b76-4974-bbc1-d5b14ad9ce2d',
      type: 'master thesis',
      level: '',
      role: '',
      notes: 'co-supervised this master\'s thesis based on a project developed at the sense-it lab, under the primary supervision of Prof. Andrew Perkis.',
      description: 'This project creates an application that combines and presents data from evaluation of XR experiences. The objective is to make the process easier and more efficient for the conductor of an extended reality experiment, filling the gap between testing and evaluation.\n\nThe use of extended reality is growing rapidly within multiple platforms, applications, and development fields. The technology has proven to be helpful for simplifying and streamlining situations and problems related to the real world, creating innovative and forward-thinking solutions. Different subjective and objective evaluations are being used to ensure that performance quality is as good as possible, which often requires numerous manually conducted steps. The application will include various evaluation methods where multiple of them can be chosen for the same experiment, according to whatever the user needs. Techniques selected are determined according to the most frequently used evaluation procedures of virtual reality experiments and studies. After the toolbox is up and running, it will be put through its own evaluation by being rated by a selection of people using a usability scale. The test results show that the app will need more work in order to enhance performance and user experience. Furthermore, some aspects concerning data protection and security encountered when designing and implementing an application dependent on user information will be addressed.',
      gallery: [],
      image: null
    },
    {
      id: 'mentor-2',
      category: 'mentor',
      title: 'VR i sport',
      studentName: 'Daniel Breive Havre',
      linkLabel: 'LINK 1',
      linkUrl: 'https://nva.sikt.no/registration/0198eb874b7e-aa3f83db-dedd-43d7-86f6-dd00bc2edb58',
      type: 'master thesis',
      level: '',
      role: '',
      notes: 'co-supervised this master\'s thesis based on a project developed at the sense-it lab, under the primary supervision of Prof. Andrew Perkis.',
      description: 'Repetitive indoor endurance exercises such as running on a treadmill or rowing on an ergometer used to be tedious. The use of technology in sports and other physical aspects is rapidly emerging to improve performance, motivation, and experience. This has led to the development of immersive experience products (such as Nintendo Wii and PS4 VR/AR). Where one of the more popular experiences is Virtual Reality. This project looks at how technique related feedback presented inside a virtual reality during an ergometer rowing session affects the Quality of Experience regarding the user\'s motivation, performance, and immersion. The testing setup consists of a rowing ergometer and a head-mounted display connected to a virtual world. Here the user is be fed information in real-time throughout the session. The system was tested by 30 participants, 20 males, and 10 females, with an average age of 24.3. After experiencing the scenarios, the participants filled out a subjective evaluation of the system. The results indicate that the participants had a positive increase in motivation, performance, and immersion. The total experienced workload had increased significantly compared to the previous system. Additionally, the results show that the overall Quality of Experience was higher for the new system.',
      gallery: [],
      image: null
    },
    {
      id: 'mentor-3',
      category: 'mentor',
      title: "narrative's impact on QoE in digital storytelling",
      studentName: 'Oeyvind Sørdal Klungre',
      linkLabel: 'LINK 1',
      linkUrl: 'https://nva.sikt.no/registration/0198eb8369ea-2d526c17-222d-4881-b457-5fcb37057e39',
      type: 'master thesis',
      level: '',
      role: '',
      notes: 'co-supervised this master\'s thesis based on a project developed at the sense-it lab, under the primary supervision of Prof. Andrew Perkis.',
      description: 'As long as there have been humans, storytelling has existed as well. Our ways of telling stories have evolved along with advances in technology. This has led to the emergence of digital storytelling, which puts emphasis on multimodality as well as interactivity. Of the recent advances in digital storytelling, this report will focus on location based projects and sensor based narratives. This project looks at how the narrative inﬂuences the Quality of Experience of the user in a digital story. This is done by creating and implementing a location driven digital story based on troll stories from the Trollheimen area in Norway. The narrative is presented to the user by an augmented reality application made in Unity on a mobile device. The narrative is driven by location obtained by tracking the user\'s movement with the OptiTrack system. This narrative system has then been evaluated by 30 people who have participated in a subjective evaluation. This has been done with two diﬀerent experiment setups: one that it narrative based, and one that is instruction based. The results show that the narrative setup results in a richer, livelier and more engaging experience. This eﬀect is diminished if one is exposed to both setups. As of ease of use we showed that for the participants who did both setups, the instruction setup proved to be signiﬁcantly easier than the narrative driven approach.',
      gallery: [],
      image: null
    },
    {
      id: 'mentor-4',
      category: 'mentor',
      title: "design of an AR-based framework for acoustic simulation",
      studentName: 'Karl Henrik Olof Ejdfors',
      linkLabel: 'LINK 1',
      linkUrl: 'https://nva.sikt.no/registration/0198eb83e72f-d6d59ab9-47f7-4201-ad9c-b3453eb214c5',
      type: 'master thesis',
      level: '',
      role: '',
      notes: 'co-supervised this master\'s thesis based on a project developed at the sense-it lab, under the primary supervision of Prof. Andrew Perkis.',
      description: 'Proper room acoustics is vital for a holistic experience and comfort but can be challenging to achieve. Classic acoustic simulation software can present properties about a room\'s acoustics but does not let a client "experience" the results. This thesis looks into how immersive technologies can let clients experience different acoustical designs and what effects augmented reality (AR) contribute to spatial presence and sound perception for acoustic simulations. An Android application is developed as a framework for real-time acoustic room simulations in AR. This framework aims to give the user an arena for experiencing a virtual room\'s acoustics and perceiving how changes to the design affect the sound. The acoustic replication of the room is based on the image-source model for generating room impulse responses to be convolved with anechoic sounds. The system is tested by a focus group, whose profession is acoustics, for evaluating the concept and indicate the immersive effects AR provides to acoustic simulations. The results from the experiment with the focus group suggest that real-time acoustic room simulation in AR provides a client a sense of being present in an acoustical room. It was also evident that AR technology enhances the perception of small changes in sound. However, the acoustic representation needs further improvements to give the user a more realistic feeling.',
      gallery: [],
      image: null
    }
  ]), [])
  const teachingCategories = useMemo(() => ([
    { id: 'studio', label: 'studio' },
    { id: 'seminar', label: 'seminar' },
    { id: 'lecture', label: 'lecture' },
    { id: 'mentor', label: 'mentor' }
  ]), [])
  const filteredTeachingItems = useMemo(() => {
    const filtered = teachingItems.filter((item) => item.category === activeCategoryId)
    return filtered.length ? filtered : teachingItems
  }, [teachingItems, activeCategoryId])

  useEffect(() => {
    setActiveIndex(0)
    setSelectedIndex(null)
    setHeroGalleryIndex(0)
    setHeroScale(1)
    setHeroPan({ x: 0, y: 0 })
    setMobileNotesExpanded(false)

    // Show toast when entering lecture category
    if (activeCategoryId === 'lecture') {
      setShowLectureToast(true)
      const timer = setTimeout(() => setShowLectureToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeCategoryId])

  useEffect(() => {
    setMobileNotesExpanded(false)
  }, [activeIndex])

  useEffect(() => setHydrated(true), [])

  const displayIndex = selectedIndex ?? activeIndex
  const displayItem = filteredTeachingItems[displayIndex] || filteredTeachingItems[0]
  const selectedItem = selectedIndex !== null ? filteredTeachingItems[selectedIndex] : null
  const isSeminar = selectedItem?.type === 'seminar'
  const isMentor = selectedItem?.category === 'mentor'
  const useMentorColumns = isMentor && !isMobile
  const heroGallery = selectedItem?.gallery || []
  const heroThumbs = heroGallery.length ? heroGallery : (selectedItem?.image ? [selectedItem.image] : [])
  const heroLightboxImage = heroLightboxIndex !== null ? heroThumbs[heroLightboxIndex] : null
  const descriptionText = selectedItem?.description || ''
  const seminarTopicsSplit = isSeminar
    ? descriptionText.split(/\n\s*topics:\s*\n/i)
    : [descriptionText]
  const seminarTopicsText = seminarTopicsSplit.length > 1 ? seminarTopicsSplit[1] : ''
  const descriptionSource = seminarTopicsSplit[0] || ''
  const heroDescriptionBlocks = descriptionSource
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  const seminarTopicLines = seminarTopicsText
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const seminarTopics = seminarTopicLines.reduce((acc, line) => {
    const numberMatch = line.match(/^(\d{1,2})\.?\s*(.*)$/)
    if (numberMatch) {
      const [, number, text] = numberMatch
      acc.push({ number, text: text || '' })
      return acc
    }
    if (/^\d{1,2}$/.test(line)) {
      acc.push({ number: line, text: '' })
      return acc
    }
    if (!acc.length) {
      acc.push({ number: '', text: line })
      return acc
    }
    const current = acc[acc.length - 1]
    current.text = current.text ? `${current.text} ${line}` : line
    return acc
  }, [])
  const heroGoalsList = Array.isArray(selectedItem?.goals) ? selectedItem.goals : []
  const heroGoalsTextBlocks = !Array.isArray(selectedItem?.goals)
    ? (selectedItem?.goals || '')
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
    : []
  const heroAimsBlocks = (selectedItem?.aims || '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  const levelLabel = displayItem?.category === 'mentor'
    ? 'student'
    : displayItem?.type === 'lecture'
      ? 'venue'
      : 'level'
  const levelValue = displayItem?.studentName || displayItem?.level || ''
  const heroHeaderLeft = selectedItem?.category === 'mentor'
    ? (selectedItem?.title || '')
    : (selectedItem?.heroTitle || selectedItem?.title)
  const heroHeaderRight = selectedItem?.headerRight || selectedItem?.duration || ''
  const heroLinkLabel = selectedItem?.linkLabel || ''
  const heroLinkUrl = selectedItem?.linkUrl || ''
  const descriptionLabel = selectedItem?.category === 'mentor'
    ? 'description'
    : 'description'

  // Determine if hero needs pagination (for items with long content)
  const hasGoalsOrAims = !isSeminar && (heroGoalsList.length > 0 || heroGoalsTextBlocks.length > 0 || heroAimsBlocks.length > 0)
  const heroTotalPages = hasGoalsOrAims ? 2 : 1

  const heroCardHeight = isMobile ? '70vh' : '72vh'
  const totalItems = filteredTeachingItems.length || 1
  const dynamicStackGap = isMobile
    ? Math.max(24, carouselSettings.stackGap - Math.max(0, totalItems - 4) * 2)
    : carouselSettings.stackGap
  const dynamicStackOffsetX = isMobile
    ? ((totalItems - 1) / 2) * dynamicStackGap
    : carouselSettings.stackOffsetX

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

  const handleHeroDragMove = (event) => {
    if (!isDragging || !isPanMode || heroScale <= 1) return
    event.preventDefault()
    const deltaX = event.clientX - heroDragStartRef.current.x
    const deltaY = event.clientY - heroDragStartRef.current.y
    setHeroPan({
      x: heroPanStartRef.current.x + deltaX,
      y: heroPanStartRef.current.y + deltaY
    })
  }

  const handleHeroDragEnd = () => {
    setIsDragging(false)
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
      const total = filteredTeachingItems.length || 1
      const next = (prev + delta + total) % total
      return next
    })
  }

  const openHeroForIndex = (index) => {
    const item = filteredTeachingItems[index]
    if (!item) return
    const hasGallery = Array.isArray(item.gallery) && item.gallery.length > 0
    const hasImage = Boolean(item.image)
    const hasGoals = Array.isArray(item.goals) ? item.goals.length > 0 : Boolean(item.goals)
    const hasText = Boolean(item.description) || hasGoals || Boolean(item.aims)
    if (!hasGallery && !hasImage && !hasText) return
    setSelectedIndex(index)
    setHeroLightboxIndex(null)
    setHeroGalleryIndex(0)
    setHeroPage(0)
  }

  const moveHeroGallery = (delta) => {
    if (!heroThumbs.length) return
    setHeroGalleryIndex((prev) => (prev + delta + heroThumbs.length) % heroThumbs.length)
    if (heroLightboxIndex !== null) {
      setHeroLightboxIndex((prev) => (prev + delta + heroThumbs.length) % heroThumbs.length)
    }
    setHeroScale(1)
    setHeroPan({ x: 0, y: 0 })
  }

  const handleCarouselSwipeStart = (event) => {
    if (!isMobile) return
    carouselSwipeStartRef.current = {
      x: event.touches[0].clientX,
      time: Date.now()
    }
    setCarouselSwipeOffset(0)
  }

  const handleCarouselSwipeMove = (event) => {
    if (!isMobile || !carouselSwipeStartRef.current) return
    const deltaX = event.touches[0].clientX - carouselSwipeStartRef.current.x
    setCarouselSwipeOffset(deltaX)

    const now = Date.now()
    const timeSinceStart = now - carouselSwipeStartRef.current.time
    const velocity = Math.abs(deltaX) / timeSinceStart

    if (Math.abs(deltaX) > 50 && velocity > 0.5) {
      if (now - carouselSwipeLastTimeRef.current > 150) {
        carouselSwipeLastTimeRef.current = now
        stepCarousel(deltaX > 0 ? -1 : 1)
        carouselSwipeStartRef.current = {
          x: event.touches[0].clientX,
          time: now
        }
      }
    }
  }

  const handleCarouselSwipeEnd = () => {
    if (!isMobile) return
    carouselSwipeStartRef.current = null
    setCarouselSwipeOffset(0)
    carouselSwipeLastTimeRef.current = 0
  }

  const handleArrowLongPressStart = (direction) => {
    if (isMobile) return

    // Clear any existing intervals
    if (carouselLongPressIntervalRef.current) {
      clearInterval(carouselLongPressIntervalRef.current)
    }

    // Initial click
    stepCarousel(direction)

    // Start long press after 300ms
    carouselLongPressTimeoutRef.current = setTimeout(() => {
      carouselLongPressIntervalRef.current = setInterval(() => {
        stepCarousel(direction)
      }, 200)
    }, 300)
  }

  const handleArrowLongPressEnd = () => {
    if (isMobile) return

    // Clear timeout and interval
    if (carouselLongPressTimeoutRef.current) {
      clearTimeout(carouselLongPressTimeoutRef.current)
      carouselLongPressTimeoutRef.current = null
    }

    if (carouselLongPressIntervalRef.current) {
      clearInterval(carouselLongPressIntervalRef.current)
      carouselLongPressIntervalRef.current = null
    }
  }

  const handleHeroThumbWheel = (event) => {
    if (!heroThumbs.length) return
    event.preventDefault()
    const now = Date.now()
    if (now - heroGalleryWheelRef.current < 220) return
    heroGalleryWheelRef.current = now
    moveHeroGallery(event.deltaY > 0 ? 1 : -1)
  }

  const handleHeroThumbTouchStart = (event) => {
    if (!heroThumbs.length) return
    heroThumbSwipeStartRef.current = event.touches[0].clientX
  }

  const handleHeroThumbTouchEnd = (event) => {
    if (!heroThumbs.length || heroThumbSwipeStartRef.current === null) return
    const delta = event.changedTouches[0].clientX - heroThumbSwipeStartRef.current
    heroThumbSwipeStartRef.current = null
    if (Math.abs(delta) < 40) return
    moveHeroGallery(delta < 0 ? 1 : -1)
  }

  useEffect(() => {
    setHeroScale(1)
    setHeroPan({ x: 0, y: 0 })
  }, [heroGalleryIndex])

  useEffect(() => {
    if (heroScale <= 1.01) {
      setHeroPan({ x: 0, y: 0 })
      setIsPanMode(false)
    } else {
      setIsPanMode(true)
    }
  }, [heroScale])

  useEffect(() => {
    if (!isDragging) return undefined
    const handleMove = (event) => handleHeroDragMove(event)
    const handleEnd = () => handleHeroDragEnd()
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [isDragging, isPanMode, heroScale, heroPan])

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target
      const isEditable = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (isEditable) return
      if ((heroLightboxIndex !== null || selectedIndex !== null) && heroThumbs.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault()
        moveHeroGallery(event.key === 'ArrowRight' ? 1 : -1)
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (selectedIndex === null) {
          openHeroForIndex(activeIndex)
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
  }, [activeIndex, selectedIndex, heroLightboxIndex, filteredTeachingItems.length, heroThumbs.length])

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

  const handleDesktopCarouselTouchStart = (event) => {
    if (isMobile || !isTouchDevice) return
    if (!event.touches || event.touches.length !== 1) return
    const touch = event.touches[0]
    desktopCarouselSwipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleDesktopCarouselTouchEnd = (event) => {
    if (isMobile || !isTouchDevice) return
    const start = desktopCarouselSwipeStartRef.current
    desktopCarouselSwipeStartRef.current = null
    if (!start || !event.changedTouches || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return
    stepCarousel(deltaX < 0 ? 1 : -1)
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        overscrollBehavior: 'contain',
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
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
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
            analyticsText=""
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
            readingModeDisabled={true}
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
              {teachingCategories.slice(0, 4).map((category, idx) => {
                const isActive = category.id === activeCategoryId
                return (
                  <button
                    key={`teaching-index-${category.id}`}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
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

            {hydrated && isNarrowDesktop && (
              <div
                key={`teaching-label-${activeCategoryId}`}
                style={{
                  fontFamily: 'var(--font-karla)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  textTransform: 'lowercase',
                  animation: 'fadeIn 220ms ease'
                }}
              >
                {teachingCategories.find(c => c.id === activeCategoryId)?.label}
              </div>
            )}
          </div>

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
          activeDot="reflect"
          bottomLabel=""
          readingMode={readingMode}
          onPrimaryAction={toggleReadingMode}
          primaryActive={readingMode}
          primaryDisabled={true}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={() => navigateWithFade('/reflect')}
          onNavigate={(key, href) => { navigateWithFade(href) }}
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
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
            gap: '18px',
            fontFamily: 'var(--font-karla)',
            fontSize: '16px'
          }}
        >
          {teachingCategories.map((category) => {
            const isActive = category.id === activeCategoryId
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
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

      {isMobile && (
        <MobileMenuOverlay
          categories={[
            { name: 'make', subcategories: ['spaces', 'things'] },
            { name: 'view', subcategories: ['speculations', 'images'] },
            { name: 'reflect', subcategories: ['research', 'teaching'] },
            { name: 'connect', subcategories: ['cv', 'about me'] }
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
            if (category === 'connect' && (sub === 'cv' || sub === 'about me')) {
              const slug = sub === 'cv' ? 'curriculum-vitae' : 'about-me'
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

      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            left: 140,
            top: 250,
            width: 220,
            zIndex: 40,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            display: isNarrowDesktop ? 'none' : 'block'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '24px' }}>
            {teachingCategories.map((category) => {
              const isActive = category.id === activeCategoryId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: isActive ? 500 : 200,
                    color: '#000',
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    textAlign: 'left'
                  }}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          position: isMobile ? 'relative' : 'fixed',
          left: isMobile ? 'auto' : (isNarrowDesktop ? 'calc(48% - 15px)' : '48%'),
          top: isMobile ? 'auto' : (isNarrowDesktop ? 200 : 220),
          width: isMobile ? '100%' : 640,
          height: isSmallPhone ? 210 : (isMobile ? 280 : 360),
          zIndex: 40,
          transform: isMobile ? 'none' : 'translateX(-50%)',
          margin: isMobile ? `${mobileCascadeOffsetY}px auto 12px` : undefined
        }}
        onWheel={handleCarouselWheel}
        onTouchStart={handleDesktopCarouselTouchStart}
        onTouchEnd={handleDesktopCarouselTouchEnd}
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
              openHeroForIndex(activeIndex)
            }
          }}
          onTouchStart={handleCarouselSwipeStart}
          onTouchMove={handleCarouselSwipeMove}
          onTouchEnd={handleCarouselSwipeEnd}
        >
          {filteredTeachingItems.map((item, index) => {
            const distance = index
            const isActive = activeIndex === index
            const baseScale = Math.max(
              0.7,
              Math.min(carouselSettings.baseMaxScale, 1 - distance * carouselSettings.baseScaleStep)
            )
            const scale = isActive ? carouselSettings.selectedScale : baseScale
            const translateX = dynamicStackOffsetX - distance * dynamicStackGap + (isMobile ? carouselSwipeOffset * 0.5 : 0)
            const opacity = 1
            const zIndex = 200 - distance + (isActive ? 120 : 0)
            const labelFontSize = isMobile ? '9px' : '10px'
            const labelLineHeight = isMobile ? '12px' : '14px'
            const titleFontSize = isMobile ? '16px' : '18px'
            const titleBlockHeight = isMobile ? '58px' : '66px'
            const dividerScaleY = scale ? 1 / scale : 1
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Open ${item.title}`}
                onClick={() => {
                  setActiveIndex(index)
                  if (item.category !== 'lecture') {
                    openHeroForIndex(index)
                  }
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
                  cursor: isActive && item.category !== 'lecture' ? 'pointer' : 'default',
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
                    backgroundColor: '#F2F2F2',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    boxShadow: isActive ? '0 18px 30px rgba(0,0,0,0.12)' : 'none',
                    transition: 'box-shadow 0.4s ease',
                    transform: `rotateY(${carouselSettings.tiltY}deg)`,
                    transformOrigin: 'right center',
                    backfaceVisibility: 'hidden',
                    boxSizing: 'border-box',
                    padding: isMobile ? '18px' : '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    textAlign: 'left',
                    fontFamily: 'var(--font-karla)'
                  }}
                >
                  <div style={{ fontSize: labelFontSize, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', height: labelLineHeight, lineHeight: labelLineHeight }}>
                    {item.category === 'mentor' ? (item.type || item.category) : item.category}
                  </div>
                  <div
                    style={{
                      height: '1px',
                      background: '#000',
                      opacity: 1,
                      margin: '8px 0 12px',
                      transform: `scaleY(${dividerScaleY})`,
                      transformOrigin: 'left center'
                    }}
                  />
                  <div
                    style={{
                      fontSize: titleFontSize,
                      fontWeight: 300,
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      height: titleBlockHeight,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </button>
            )
          })}

      </div>
        <div
          style={isMobile ? {
            display: 'flex',
            justifyContent: 'center',
            gap: `${mobileNavGap}px`,
            margin: '30px auto 0',
            width: '200px',
            position: 'relative'
          } : {
            display: 'flex',
            justifyContent: 'center',
            gap: isNarrowDesktop ? '280px' : '560px',
            marginTop: isNarrowDesktop ? -60 : 12,
            transform: isNarrowDesktop ? 'translateX(110px)' : 'translateX(120px)',
            position: 'relative'
          }}
        >
          {showLectureToast && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#000',
                color: '#FFFDF3',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textTransform: 'lowercase',
                fontFamily: 'var(--font-karla)',
                zIndex: 100,
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              details below
            </div>
          )}
          <button
            type="button"
            onClick={(event) => {
              if (isMobile) {
                stepCarousel(1)
              }
              event.currentTarget.blur()
            }}
            onMouseDown={(event) => {
              event.preventDefault()
              if (!isMobile) {
                handleArrowLongPressStart(1)
              }
            }}
            onMouseUp={() => {
              if (!isMobile) {
                handleArrowLongPressEnd()
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                handleArrowLongPressEnd()
              }
              hideTooltip()
            }}
            aria-label="Left"
            onMouseEnter={(event) => showTooltip('Left', event)}
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
              style={{ width: arrowSize, height: arrowSize, display: 'block', imageRendering: 'auto' }}
            />
          </button>
          <button
            type="button"
            onClick={(event) => {
              if (isMobile) {
                stepCarousel(-1)
              }
              event.currentTarget.blur()
            }}
            onMouseDown={(event) => {
              event.preventDefault()
              if (!isMobile) {
                handleArrowLongPressStart(-1)
              }
            }}
            onMouseUp={() => {
              if (!isMobile) {
                handleArrowLongPressEnd()
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                handleArrowLongPressEnd()
              }
              hideTooltip()
            }}
            aria-label="Right"
            onMouseEnter={(event) => showTooltip('Right', event)}
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
              style={{ width: arrowSize, height: arrowSize, display: 'block', imageRendering: 'auto' }}
            />
          </button>
        </div>
        {isMobile && (
          <div
            ref={mobileMetaRef}
            style={{
              position: 'fixed',
              left: 60,
              right: 70,
              bottom: `${mobileMetaBottomOffset}px`,
              fontFamily: 'var(--font-karla)',
              color: '#000',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                {levelLabel}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {levelValue}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                notes
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  lineHeight: '22px',
                  display: mobileNotesExpanded ? 'block' : '-webkit-box',
                  WebkitLineClamp: mobileNotesExpanded ? 'unset' : (displayItem.category === 'mentor' ? 3 : 4),
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {displayItem.notes}
              </div>
              {displayItem.notes && displayItem.notes.length > 150 && (
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setMobileNotesExpanded(!mobileNotesExpanded)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#000',
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                      fontFamily: 'var(--font-karla)'
                    }}
                  >
                    {mobileNotesExpanded ? '[read less]' : '[read more]'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isMobile && isNarrowDesktop ? (
        <div
          style={{
            position: 'fixed',
            left: sideRailLeft,
            top: '290px',
            transform: 'none',
            width: sideRailWidth,
            fontFamily: 'var(--font-karla)',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            zIndex: 40
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
              {levelLabel}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 200, letterSpacing: '-0.02em', marginTop: 12 }}>
              {levelValue}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
              notes
            </div>
            <div style={{ fontSize: '18px', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: '22px', marginTop: 4 }}>
              {displayItem.notes}
            </div>
          </div>
        </div>
      ) : (
        !isMobile && (
          <div
            style={{
              position: 'fixed',
              left: 140,
              top: 500,
              width: 350,
              fontFamily: 'var(--font-karla)',
              color: '#000',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                {levelLabel}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.02em' }}>
                {levelValue}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0.001em' }}>
                notes
              </div>
              <div style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: '28px' }}>
                {displayItem.notes}
              </div>
            </div>
          </div>
        )
      )}

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
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'flex-start',
              justifyContent: 'center',
              gap: isMobile ? 16 : 28,
              width: '100%',
              maxWidth: isMobile ? '100%' : 900,
              padding: isMobile ? '0 16px' : 0
            }}
          >
            <div
              style={{
                background: '#F2F2F2',
                borderRadius: 18,
                padding: isMobile ? '16px' : '24px',
                width: isMobile ? '100%' : heroCardWidthDesktop,
                maxWidth: isMobile ? '100%' : heroCardWidthDesktop,
                height: heroCardHeight,
                display: 'flex',
                flexDirection: 'column',
                overflowY: useMentorColumns ? 'hidden' : 'auto',
                boxShadow: '0 24px 40px rgba(0,0,0,0.12)',
                fontFamily: 'var(--font-karla)',
                color: '#000'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}
              >
                <div>{heroHeaderLeft}</div>
                {heroLinkUrl ? (
                  <a
                    href={heroLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    style={{ color: '#000', textDecoration: 'none' }}
                  >
                    {heroLinkLabel || 'LINK 1'}
                  </a>
                ) : heroHeaderRight ? (
                  <div>{heroHeaderRight}</div>
                ) : (
                  <div style={{ opacity: 0 }}>.</div>
                )}
              </div>
              <div style={{ height: 1, background: '#000', margin: '10px 0 14px' }} />
              <div
                style={{
                  display: isMobile ? 'flex' : 'grid',
                  flexDirection: isMobile ? 'column' : undefined,
                  gridTemplateColumns: !isMobile ? '1fr 1fr' : undefined,
                  gap: isMobile ? 16 : 24,
                  flex: 1,
                  minHeight: 0,
                  justifyContent: isMobile ? 'flex-end' : undefined
                }}
              >
                {/* Page 0: Description (and seminar topics) */}
                {heroPage === 0 && (
                  <>
                    {heroDescriptionBlocks.length > 0 && (
                      <div
                        style={(isSeminar && seminarTopics.length === 0) || isMentor ? {
                          gridColumn: '1 / -1',
                          display: useMentorColumns ? 'flex' : undefined,
                          flexDirection: useMentorColumns ? 'column' : undefined,
                          minHeight: useMentorColumns ? 0 : undefined
                        } : undefined}
                      >
                      <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                          {descriptionLabel}
                      </div>
                        {isSeminar && seminarTopics.length === 0 && !isMobile ? (
                          <div style={{ marginTop: 8, columnCount: 2, columnGap: 24 }}>
                            {heroDescriptionBlocks.map((block, index) => (
                              <p
                                key={index}
                                style={{
                                  margin: '0 0 10px',
                                  fontSize: '13px',
                                  lineHeight: 1.35,
                                  breakInside: 'avoid'
                                }}
                              >
                                {block}
                              </p>
                            ))}
                          </div>
                        ) : useMentorColumns ? (
                          <div style={{ marginTop: 8, columnCount: 2, columnGap: 24, columnFill: 'auto', width: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            {heroDescriptionBlocks.map((block, index) => (
                              <p
                                key={index}
                                style={{
                                  margin: '0 0 10px',
                                  fontSize: '13px',
                                  lineHeight: 1.35
                                }}
                              >
                                {block}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {heroDescriptionBlocks.map((block, index) => (
                              <p key={index} style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                {block}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {isSeminar && seminarTopics.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                          topics
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {seminarTopics.map((topic, index) => (
                            <div key={`${topic.number}-${index}`} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', columnGap: 8 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>
                                {topic.number}
                              </div>
                              <div style={{ fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                {topic.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* For items without goals/aims, show them on page 0 in the right column */}
                    {!hasGoalsOrAims && (heroGoalsList.length > 0 || heroGoalsTextBlocks.length > 0 || heroAimsBlocks.length > 0) && !isSeminar && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {heroGoalsList.length > 0 && (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                              goals
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {heroGoalsList.map((goal, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', columnGap: 8 }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                                    {String(index + 1).padStart(2, '0')}
                                  </div>
                                  <div style={{ fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                    {goal}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {heroGoalsTextBlocks.length > 0 && (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                              goals
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {heroGoalsTextBlocks.map((block, index) => (
                                <p key={index} style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                  {block}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {heroAimsBlocks.length > 0 && (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                              aims
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {heroAimsBlocks.map((block, index) => (
                                <p key={index} style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                  {block}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Page 1: Goals and Aims (only for items with hasGoalsOrAims) */}
                {heroPage === 1 && hasGoalsOrAims && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, gridColumn: '1 / -1' }}>
                    {heroGoalsList.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                          goals
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {heroGoalsList.map((goal, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', columnGap: 8 }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              <div style={{ fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                                {goal}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {heroGoalsTextBlocks.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                          goals
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {heroGoalsTextBlocks.map((block, index) => (
                            <p key={index} style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                              {block}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {heroAimsBlocks.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'lowercase' }}>
                          aims
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {heroAimsBlocks.map((block, index) => (
                            <p key={index} style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', lineHeight: isMobile ? 1.5 : 1.3 }}>
                              {block}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination dots */}
              {heroTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                  {Array.from({ length: heroTotalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHeroPage(idx)
                      }}
                      aria-label={`Page ${idx + 1}`}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: 'none',
                        background: heroPage === idx ? '#000' : '#ccc',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {isMobile && heroThumbs.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  width: '100%'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 70px)',
                    gap: 8
                  }}
                >
                  {heroThumbs.map((src, index) => {
                    const isActiveThumb = index === heroGalleryIndex
                    return (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setHeroGalleryIndex(index)
                          setHeroLightboxIndex(index)
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          width: 70,
                          height: 54
                        }}
                      >
                        <img
                          src={src}
                          alt={`${selectedItem?.title || 'Teaching project'} thumbnail ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 8,
                            display: 'block',
                            border: isActiveThumb ? '2px solid #000' : '2px solid transparent',
                            boxSizing: 'border-box'
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {!isMobile && heroThumbs.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginTop: 24
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 78px)',
                    gap: 10,
                    alignContent: 'start'
                  }}
                >
                  {heroThumbs.map((src, index) => {
                    const isActiveThumb = index === heroGalleryIndex
                    return (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setHeroGalleryIndex(index)
                          setHeroLightboxIndex(index)
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={src}
                          alt={`${selectedItem?.title || 'Teaching project'} thumbnail ${index + 1}`}
                          style={{
                            width: 78,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 8,
                            display: 'block',
                            border: isActiveThumb ? '2px solid #000' : '2px solid transparent',
                            boxSizing: 'border-box'
                          }}
                        />
                      </button>
                  )
                })}
              </div>
              </div>
            )}
          </div>
          {heroLightboxImage && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Close image"
              onClick={(event) => {
                event.stopPropagation()
                setHeroLightboxIndex(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setHeroLightboxIndex(null)
                }
              }}
              onWheel={handleHeroThumbWheel}
              onTouchStart={handleHeroThumbTouchStart}
              onTouchEnd={handleHeroThumbTouchEnd}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 300,
                background: 'rgba(255, 253, 243, 0.92)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out'
              }}
            >
              {heroThumbs.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: isMobile ? 24 : 40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    pointerEvents: 'auto'
                  }}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      moveHeroGallery(-1)
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src="/teaching/arrow_left_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
                      alt="Previous"
                      style={{ width: 26, height: 26, display: 'block' }}
                    />
                  </button>
                  <div style={{ fontSize: '12px', letterSpacing: '0.04em' }}>
                    {heroGalleryIndex + 1}/{heroThumbs.length}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      moveHeroGallery(1)
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src="/teaching/arrow_right_alt_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
                      alt="Next"
                      style={{ width: 26, height: 26, display: 'block' }}
                    />
                  </button>
                </div>
              )}
              <img
                src={heroLightboxImage}
                alt={`${selectedItem?.title || 'Teaching project'} full`}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={handleHeroDragStart}
                onWheel={handleHeroWheel}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '90vh',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 12,
                  boxShadow: '0 28px 48px rgba(0,0,0,0.2)',
                  transform: `scale(${heroScale}) translate(${heroPan.x / heroScale}px, ${heroPan.y / heroScale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                }}
              />
            </div>
          )}
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
