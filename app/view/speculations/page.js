'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'

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

const BREAKPOINTS = {
  sm: 640,
  md: 900,
  lg: 1200
}
const BASE_LAYOUT_WIDTH = 1440

const resolveResponsive = (value, width) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const { base, sm, md, lg, xl } = value
  if (width && sm != null && width <= BREAKPOINTS.sm) return sm
  if (width && md != null && width <= BREAKPOINTS.md) return md
  if (width && lg != null && width <= BREAKPOINTS.lg) return lg
  if (width && xl != null && width > BREAKPOINTS.lg) return xl
  return base ?? sm ?? md ?? lg ?? xl
}

const imageEntries = [
   {
    id: 'metastory',
    file: '/speculations/metastory.jpg',
    subtitle: '2024 _ 2025',
    description: 'METASTORIES was a proposal seeking EU MSCA Doctoral Network funding for research training in investigating, analysing and designing community storytelling engagement processes, developing novel storytelling tools, and testing and evaluating narrative co-creation practices that contribute to transformative resilience to polycrises.',
    notes: 'This logo board for METASTORIES presents nine adaptive iterations of a shared identity system, each tailored to distinct communicative contexts. The cube structure anchors the design in modular storytelling — a metaphor for narrative as architecture — while the planar typographic fragments suggest both disassembly and recomposition. Variations in color, texture, and orientation reflect the project’s commitment to contextual responsiveness: each version speaks to a different audience, platform, or phase of engagement. Together, the grid becomes a visual manifesto for co-creative resilience — stories as tools, spaces, and strategies for navigating polycrises through design-led transformation.',
    imgWidth: '90%',
    maxH: '600px',
    padding: '14px',
    imgOffsetX: '-100px',
    imgOffsetY: '30px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-20px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '-30px', subtitleOffsetY: '590px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '-30px', descriptionOffsetY: '-40px', descriptionMaxWidth: '990px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 2, notesOffsetX: '-30px', notesOffsetY: '-40px', notesMaxWidth: '250px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
    },
   {
    id: 'kreativ',
    file: '/speculations/kreativ.webp',
    subtitle: '2021',
    description: 'Norges teknisk-naturvitenskapelige universitet has key Strategic Research Areas that contribute to solving the complex challenges of our time. This logo was developed as part of a proposal for a new strategic area: NTNU KREATIV.',
    notes: 'The logo explores the intersection of creativity and complexity within strategic research. On the left, a capsule form rises with textured contours — a topography of ideas — suggesting emergent knowledge shaped by terrain and transformation. On the right, a circular field of tessellated triangles is disrupted by a fluid white stream, symbolizing creative flow cutting through structured systems. The mirrored vertical text “NTNU KREATIV” anchors both forms, reinforcing duality and dialogue. Together, the composition evokes a research landscape where design, innovation, and critical inquiry converge to address societal challenges through imaginative, cross-sector collaboration.',
    imgWidth: '90%',
    maxH: '280px',
    padding: '14px',
    imgOffsetX: '780px',
    imgOffsetY: '105px',
    textColumns: 2, textGridTemplate: '3fr 3fr', textMarginTop: '0px', textMarginLeft: '-900px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 1, subtitleOffsetX: '110px', subtitleOffsetY: '415px', subtitleTextAlign: 'right', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '100px', descriptionOffsetY: '230px', descriptionMaxWidth: '990px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 1, notesOffsetX: '110px', notesOffsetY: '-10px', notesMaxWidth: '500px', notesTextAlign: 'right', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
    },
    {
    id: 'niyf',
    file: '/speculations/niyf.webp',
    subtitle: '2023 _ 2024',
    description: 'Nature in Your Face (NIYF) was a research project intended for transformative societal change in a co-constructive manner together with citizens and stakeholders from the civil, public, and private sectors.',
    notes: 'The NIYF identity translates disruptive climate communication into a bold visual language. Four gradient circles suggest multiple viewpoints, while looping white lines weave them into a dense network of relations. Against a black field, the composition confronts the viewer with intensity and immediacy, balancing provocation with cohesion. Typography anchors the design, making the message direct yet open to interpretation — a visual metaphor for collective engagement and transformative dialogue.',
    imgWidth: '90%',
    maxH: '280px',
    padding: '14px',
    imgOffsetX: '-90px',
    imgOffsetY: '-90px',
    textColumns: 2, textGridTemplate: '3fr 3fr', textMarginTop: '120px', textMarginLeft: '-500px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '100px', subtitleOffsetY: '220px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '100px', descriptionOffsetY: '-84px', descriptionMaxWidth: '990px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 1, notesOffsetX: '340px', notesOffsetY: '-280px', notesMaxWidth: '210px', notesTextAlign: 'right', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
    },  
   
  {
    id: 'theyseeus',
    images: [
      { src: '/speculations/theyseeus 01.webp', imgOffsetX: '665px', imgOffsetY: '380px', imgWidth: '140%', maxH: '900px'},
      { src: '/speculations/theyseeus 02.webp', imgOffsetX: '145px', imgOffsetY: '438px' },
      { src: '/speculations/theyseeus 04.webp', imgOffsetX: '145px', imgOffsetY: '-280px' },
      { src: '/speculations/theyseeus 05.webp', imgOffsetX: '-140px', imgOffsetY: '-642px' },
      { src: '/speculations/theyseeus 06.webp', imgOffsetX: '-140px', imgOffsetY: '-648px' }
    ],
    subtitle: '2021',
    description: 'They See Us is a visual identity built around visibility, heritage, and the quiet confidence of diasporic food culture. The name plays on “Desi Us,” folding self‑identification and external perception into a single phrase — a reminder that food is both personal expression and public encounter.',
    notes: 'The identity system uses bold, conversational typography and vibrant, market‑inspired imagery to echo the energy of street food while foregrounding the brand’s cultural roots. Graphic elements such as the outlined bag motif and color‑blocked posters create a sense of movement and immediacy, mirroring the spontaneity of a food stall environment. Each piece in the campaign balances approachability with attitude: warm, direct, and unmistakably present.',
    imgWidth: '80%',
    maxH: '350px',
    padding: '0px',
    imageOverflow: 'visible',
    imgOffsetX: '-30px',
    imgOffsetY: '-350px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '0px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '1000px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '12px', subtitleOffsetY: '410px', subtitleTextAlign: 'right', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '15px', descriptionOffsetY: '-75px', descriptionMaxWidth: '990px', descriptionTextAlign: 'right', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 2, notesOffsetX: '310px', notesOffsetY: '-540px', notesMaxWidth: '410px', notesTextAlign: 'right', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
    },

      {
    id: 'artec',
    displayId: 'ARTEC',
    images: [
      { src: '/speculations/Poster 01.webp', imgOffsetX: '759px', imgOffsetY: '802px'}, //imgWidth: '140%', maxH: '300px'},
      { src: '/speculations/Poster 02.webp', imgOffsetX: '-70px', imgOffsetY: '210px' },
      { src: '/speculations/Poster 03.webp', imgOffsetX: '345px', imgOffsetY: '-382px' },
      ],
    subtitle: '2018 _ 2021',
    description: 'NTNU ARTEC, was a transdisciplinary entity that supporting research and artistic excellence through collaborations in the fields of art(s), humanities, and technology. It was formed by a heterogeneous group of researchers and artists working at different fields and departments at NTNU.',
    notes: 'These posters are a few examples of the work I did as a creative facilitator, where I supported the program’s interdisciplinary work by shaping how its ideas were communicated and experienced. Designing posters, managing the website, and producing event literature formed a cohesive visual and editorial layer that connected researchers, artists, and the public. The paraphernalia was to enable engagement and clarify complex themes, helping cultivate a recognizable, accessible identity for ARTEC’s diverse activities.',
    imgWidth: '80%',
    maxH: '580px',
    padding: '0px',
    imageOverflow: 'visible',
    imgOffsetX: '-40px',
    imgOffsetY: '-430px',
    textColumns: 2, textGridTemplate: '2.5fr 1fr', textMarginTop: '0px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '1000px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 1, subtitleOffsetX: '-330px', subtitleOffsetY: '1160px', subtitleTextAlign: 'right', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 1, descriptionOffsetX: '-330px', descriptionOffsetY: '175px', descriptionMaxWidth: '990px', descriptionTextAlign: 'right', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 2, notesOffsetX: '-345px', notesOffsetY: '175px', notesMaxWidth: '910px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
    },

    {
    id: 'idn4cci',
    file: '/speculations/idn.webp', 
    subtitle: '2021 _ 2023',
    description: 'The logo was designed for a proposed project addressing EU Research & Innovation Action in Culture and Creative Industries to embrace intersectional technologies. This Project developed solutions in the cultural and creative industries to provide new tools for navigating complex real-world scenarios.',
    notes: 'The logo channels the energy of cultural innovation through a bold typographic gesture. Framed by exclamation marks, the acronym asserts urgency and presence, while the central “4” subtly anchors the design in the fourth industrial revolution, serving as a nod to intersectional technologies. The red-white-blue gradient evokes both unity and plurality, referencing European identity while leaving room for diverse interpretations. This visual system reflects the project’s ambition: to create collaborative tools and spaces that navigate complexity, foster competitiveness, and reimagine heritage through design-led transformation.',
    imgWidth: '88%',
    maxH: '250px',
    padding: '14px',
    imgOffsetX: '-200px',
    imgOffsetY: '950px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-60px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '990px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '-650px', subtitleOffsetY: '880px', subtitleTextAlign: 'right', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '-650px', descriptionOffsetY: '850px', descriptionMaxWidth: '990px', descriptionTextAlign: 'right', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 2, notesOffsetX: '-260px', notesOffsetY: '840px', notesMaxWidth: '310px', notesTextAlign: 'right', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
         },
  {
    id: 'in2media',
    file: '/speculations/in2.webp',
    subtitle: '2020',
    description: 'The IN2MEDIA logo was designed for the NGINO Consortium to secure the NextGenerationEU funding.',
    notes: 'The IN2Media logo fuses bold typographic clarity with a vibrant, fluid gradient form. Structured rectangles ground the name, while the abstract color shape conveys adaptability and creative energy. The circular frame balances openness with cohesion, reflecting media as both connective and transformative.',
    imgWidth: '88%',
    maxH: '250px',
    padding: '14px',
    imgOffsetX: '840px',
    imgOffsetY: '450px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-10px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '720px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '230px', subtitleOffsetY: '438px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', 
    subtitleFontSize: '20px', subtitleFontWeight: 400, subtitleLineHeight: '26px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',
      
    descriptionColumn: 2, descriptionOffsetX: '230px', descriptionOffsetY: '380px', descriptionMaxWidth: '790px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', 
    descriptionFontSize: '28px', descriptionFontWeight: 200, descriptionLineHeight: '26px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',
      
    notesColumn: 2, notesOffsetX: '230px', notesOffsetY: '342px', notesMaxWidth: '210px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: '14px', notesFontWeight: 400, notesLineHeight: '15px', notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
         }
  ]

export default function SpeculationsPage() {
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [pageOpacity, setPageOpacity] = useState(0)
  const [glowDelaySeconds] = useState(() => syncGlowOffset().delaySeconds)
  const [hasMounted, setHasMounted] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(() => imageEntries[0]?.id || '')
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const itemRefs = useRef({})
  const contentRefs = useRef({})
  const rafRef = useRef(0)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleResize = () => setViewportWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!hasMounted) return undefined
    const container = scrollAreaRef.current
    if (!container) return undefined

    const updateActiveProject = () => {
      const containerRect = container.getBoundingClientRect()
      let bestId = ''
      let bestVisibleArea = 0

      const computeVisibleArea = (rect) => {
        const visibleLeft = Math.max(rect.left, containerRect.left)
        const visibleRight = Math.min(rect.right, containerRect.right)
        const visibleTop = Math.max(rect.top, containerRect.top)
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
        const visibleWidth = Math.max(0, visibleRight - visibleLeft)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        return visibleWidth * visibleHeight
      }

      imageEntries.forEach((entry) => {
        const wrapper = itemRefs.current[entry.id]
        if (!wrapper) return
        const wrapperRect = wrapper.getBoundingClientRect()
        const wrapperVisibleArea = computeVisibleArea(wrapperRect)
        if (wrapperVisibleArea <= 0) return

        const refs = contentRefs.current[entry.id]
        if (!refs) return
        const elements = []
        if (Array.isArray(refs.images)) elements.push(...refs.images)
        if (Array.isArray(refs.texts)) elements.push(...refs.texts)

        let visibleArea = 0

        elements.forEach((el) => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          visibleArea += computeVisibleArea(rect)
        })

        const totalVisibleArea = elements.length ? visibleArea : wrapperVisibleArea
        if (totalVisibleArea > bestVisibleArea) {
          bestVisibleArea = totalVisibleArea
          bestId = entry.id
        }
      })

      if (bestId) {
        setActiveProjectId((prev) => (prev === bestId ? prev : bestId))
      }
    }

    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        updateActiveProject()
      })
    }

    updateActiveProject()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [hasMounted])

  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    if (hoveredElement && ['make', 'view', 'reflect', 'connect'].includes(hoveredElement)) {
      expandTimerRef.current = setTimeout(() => setExpandedCategory(hoveredElement), 300)
    } else if (expandedCategory) {
      collapseTimerRef.current = setTimeout(() => setExpandedCategory(null), 500)
    }
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [hoveredElement, expandedCategory])

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

  const categories = useMemo(() => ([
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] },
  ]), [])

  const handleScrollKey = (e) => {
    if (!scrollAreaRef.current) return
    const delta = e.key === 'ArrowDown' ? 60 : e.key === 'ArrowUp' ? -60 : 0
    if (delta !== 0) {
      e.preventDefault()
      scrollAreaRef.current.scrollBy({ top: delta, behavior: 'smooth' })
    }
  }

  const activeEntry = imageEntries.find((entry) => entry.id === activeProjectId)
  const activeLabel = activeEntry
    ? activeEntry.id === 'idn4cci' || activeEntry.id === 'in2media'
      ? 'IDN4CCI and IN2MEDIA'
      : (activeEntry.displayId ?? activeEntry.id)
    : 'VIEW'

  if (!hasMounted) return null

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
        fontFamily: 'var(--font-karla)'
      }}
      className="glow-hue-driver"
    >
      <style jsx global>{`
        :root { --glow-offset: 0deg; }
        @property --glow-rotation { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
        @keyframes glowHue { 0% { --glow-rotation: 0deg; } 100% { --glow-rotation: 360deg; } }
        /* hide scrollbars inside the black pane */
        [data-scroll-pane] {
          scrollbar-width: none;
        }
        [data-scroll-pane]::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <TopBarTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        readingMode={readingMode}
        analyticsText={activeLabel.toUpperCase()}
        glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))"
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        activePage="view"
      />

      <LeftPanelTransform
        readingMode={readingMode}
        toggleReadingMode={() => setReadingMode((prev) => !prev)}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        label="SPECULATIONS"
        labelTop={225}
      />

      <RightPanelTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        expandedCategory={expandedCategory}
        setExpandedCategory={setExpandedCategory}
        readingMode={readingMode}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))"
        activePage="view"
        activeSubcategory="speculations"
        categories={categories}
        onNavigate={(sub, category) => {
          if (category === 'make' && (sub === 'spaces' || sub === 'things')) {
            window.location.href = sub === 'things' ? '/make/things' : '/make/spaces'
          } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
            window.location.href = `/view/${sub}`
          } else {
            window.location.href = `/${category}`
          }
        }}
      />

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
          data-scroll-pane
        >
          {tooltip.text}
        </div>
      )}

      <div style={{ padding: '130px 240px 420px 150px' }}>
        <div
          style={{
            background: '#0f0f0f',
            borderRadius: '12px',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px',
            minHeight: '520px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            maxHeight: '76vh',
            overflowY: 'auto',
            outline: 'none',
            scrollbarWidth: 'none'
          }}
          tabIndex={0}
          ref={scrollAreaRef}
          data-scroll-pane
          onMouseEnter={() => scrollAreaRef.current && scrollAreaRef.current.focus()}
          onMouseMove={(e) => {
            if (!scrollAreaRef.current) return
            const rect = scrollAreaRef.current.getBoundingClientRect()
            const edgeZone = Math.min(80, rect.height / 4)
            const offsetY = e.clientY - rect.top
            if (offsetY < edgeZone) {
              const intensity = 1 - offsetY / edgeZone
              scrollAreaRef.current.scrollBy({ top: -12 * intensity, behavior: 'auto' })
            } else if (offsetY > rect.height - edgeZone) {
              const intensity = 1 - (rect.height - offsetY) / edgeZone
              scrollAreaRef.current.scrollBy({ top: 12 * intensity, behavior: 'auto' })
            }
          }}
          onKeyDown={handleScrollKey}
        >
          {imageEntries.map((entry, idx) => {
            const resolve = (value, fallback) => {
              const resolved = resolveResponsive(value, viewportWidth)
              return resolved ?? fallback
            }
            const isResponsiveValue = (value) => value && typeof value === 'object' && !Array.isArray(value)
            const isCompact = viewportWidth && viewportWidth <= BREAKPOINTS.md
            const scaleMode = resolve(entry.scaleMode, 'proportional')
            const useProportionalScale = scaleMode === 'proportional'
            const scaleBaseWidth = resolve(entry.scaleBaseWidth, BASE_LAYOUT_WIDTH)
            const scaleMin = resolve(entry.scaleMin, 0.5)
            const scaleMax = resolve(entry.scaleMax, 1)
            const rawScale = viewportWidth && scaleBaseWidth ? viewportWidth / scaleBaseWidth : 1
            const scaleValue = useProportionalScale
              ? Math.min(scaleMax, Math.max(scaleMin, rawScale))
              : 1
            const layoutScale = useProportionalScale
              ? 1
              : viewportWidth
                ? Math.min(1, viewportWidth / BASE_LAYOUT_WIDTH)
                : 1
            const resolveLayout = (value, fallback, compactFallback) => {
              if (!useProportionalScale && isCompact && !isResponsiveValue(value) && compactFallback !== undefined) {
                return compactFallback
              }
              return resolve(value, fallback)
            }
            const resolveLength = (value, fallback, compactFallback) => {
              const resolved = resolveLayout(value, fallback, compactFallback)
              const normalized = typeof resolved === 'number' ? `${resolved}px` : resolved
              if (!isResponsiveValue(value) && layoutScale < 1 && typeof normalized === 'string' && normalized.endsWith('px')) {
                const parsed = Number.parseFloat(normalized)
                if (!Number.isNaN(parsed)) return `${Math.round(parsed * layoutScale)}px`
              }
              return normalized
            }
            const textColumnsValue = resolveLayout(entry.textColumns, 1, 1)
            const isTwoCol = Number(textColumnsValue) === 2
            const toGridColumn = (value, fallback) => {
              if (!isTwoCol) return undefined
              const resolved = resolve(value, fallback)
              if (resolved === 'full') return '1 / -1'
              if (resolved === '2 / 2' || resolved === '1 / 2' || resolved === '2 / 3' || resolved === '1 / 3') return resolved
              if (resolved === 2 || resolved === '2') return '2 / 3'
              if (resolved === 1 || resolved === '1') return '1 / 2'
              return fallback || '1 / 2'
            }
            const subtitleGridColumn = toGridColumn(entry.subtitleColumn, '1 / -1')
            const descriptionGridColumn = toGridColumn(entry.descriptionColumn, resolve(entry.descriptionGridColumn, '1 / 2'))
            const notesGridColumn = toGridColumn(entry.notesColumn, resolve(entry.notesGridColumn, '2 / 3'))
            const offsetTransform = (x, y) => {
              const resolvedX = resolveLength(x, '0px', '0px')
              const resolvedY = resolveLength(y, '0px', '0px')
              return resolvedX !== '0px' || resolvedY !== '0px'
                ? `translate(${resolvedX}, ${resolvedY})`
                : undefined
            }
            const imageList = Array.isArray(entry.images) && entry.images.length
              ? entry.images
              : Array.isArray(entry.files) && entry.files.length
                ? entry.files
                : Array.isArray(entry.file)
                  ? entry.file
                  : entry.file
                    ? [entry.file]
                    : []
            if (!contentRefs.current[entry.id]) {
              contentRefs.current[entry.id] = { images: [], texts: [] }
            }
            const registerContentRef = (collection, index) => (el) => {
              if (!el) return
              const bucket = contentRefs.current[entry.id]
              if (!bucket) return
              bucket[collection][index] = el
            }
            return (
              <div
                key={entry.id}
                ref={(el) => {
                  if (el) itemRefs.current[entry.id] = el
                }}
                style={{
                  position: 'relative',
                  color: '#f5f5f5',
                  minHeight: '420px',
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 0.9fr',
                  alignItems: 'center',
                  gap: '24px',
                  transform: useProportionalScale ? `scale(${scaleValue})` : undefined,
                  transformOrigin: resolve(entry.scaleOrigin, 'top left')
                }}
              >
                <div
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    overflow: resolve(entry.imageOverflow, 'hidden'),
                    boxShadow: 'none',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: resolve(entry.imageDirection, 'column'),
                    gap: resolveLength(entry.imageGap, '12px'),
                    alignItems: resolve(entry.imageAlignItems, 'center'),
                    justifyContent: resolve(entry.imageJustifyContent, 'center'),
                    transform: offsetTransform(entry.imgOffsetX, entry.imgOffsetY)
                  }}
                >
                  {imageList.map((image, imageIndex) => {
                    const imageData = typeof image === 'string' ? { src: image } : image
                    const imageOffsetX = imageData.imgOffsetX ?? imageData.offsetX
                    const imageOffsetY = imageData.imgOffsetY ?? imageData.offsetY
                    const imgWidth = resolveLength(imageData.imgWidth ?? entry.imgWidth, '100%')
                    const imgMaxH = resolveLength(imageData.maxH ?? entry.maxH, '100%')
                    const imgHeight = resolveLength(imageData.imgHeight ?? entry.imgHeight, '100%')
                    const imgObjectFit = resolve(imageData.objectFit ?? entry.objectFit, 'contain')
                    const imageTransform = offsetTransform(imageOffsetX, imageOffsetY)
                    return (
                      <img
                        key={`${entry.id}-${imageIndex}`}
                        ref={registerContentRef('images', imageIndex)}
                        src={imageData.src}
                        alt={imageData.alt || `${entry.id} ${imageIndex + 1}`}
                        style={{
                          width: imgWidth,
                          maxHeight: imgMaxH,
                          height: imgHeight,
                          objectFit: imgObjectFit,
                          display: 'block',
                          transform: imageTransform
                        }}
                      />
                    )
                  })}
                </div>
                <div
                  style={{
                    maxWidth: resolveLength(entry.textMaxWidth, '520px', '100%'),
                    color: '#f1f1f1',
                    marginTop: resolveLength(entry.textMarginTop, '0px', '0px'),
                    marginLeft: resolveLength(entry.textMarginLeft, '0px', '0px'),
                    alignSelf: resolveLayout(entry.textAlignSelf, 'stretch'),
                    transform: offsetTransform(entry.textOffsetX, entry.textOffsetY),
                    display: isTwoCol ? 'grid' : 'block',
                    gridTemplateColumns: isTwoCol ? resolveLayout(entry.textGridTemplate, '1fr 1fr') : undefined,
                    columnGap: isTwoCol ? resolveLength(entry.textColumnGap, '24px') : undefined,
                    rowGap: isTwoCol ? resolveLength(entry.textRowGap, '12px') : undefined,
                    minWidth: 0
                  }}
                >
                  {entry.subtitle && (
                    <div
                      ref={registerContentRef('texts', 0)}
                      style={{
                        fontSize: resolve(entry.subtitleFontSize, '20px'),
                        fontWeight: resolve(entry.subtitleFontWeight, 400),
                        marginBottom: isTwoCol
                          ? resolveLength(entry.subtitleMarginBottomTwoCol, resolve(entry.subtitleMarginBottom, '10px'))
                          : resolveLength(entry.subtitleMarginBottom, '14px'),
                        marginTop: resolveLength(entry.subtitleMarginTop, '0px'),
                        lineHeight: resolve(entry.subtitleLineHeight, '26px'),
                        color: resolve(entry.subtitleColor, '#fff'),
                        textTransform: resolve(entry.subtitleTextTransform, 'capitalize'),
                        gridColumn: subtitleGridColumn,
                        fontFamily: resolve(entry.subtitleFontFamily, undefined),
                        textAlign: resolve(entry.subtitleTextAlign, undefined),
                        transform: offsetTransform(entry.subtitleOffsetX, entry.subtitleOffsetY),
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {entry.subtitle}
                    </div>
                  )}
                  {entry.description && (
                    <div
                      ref={registerContentRef('texts', 1)}
                      style={{
                      fontSize: resolve(entry.descriptionFontSize, '30px'),
                      fontWeight: resolve(entry.descriptionFontWeight, 200),
                      lineHeight: resolve(entry.descriptionLineHeight, '30px'),
                      color: resolve(entry.descriptionColor, '#f1f1f1'),
                      marginBottom: isTwoCol
                        ? resolveLength(entry.descriptionMarginBottomTwoCol, resolve(entry.descriptionMarginBottom, '0px'))
                        : resolveLength(entry.descriptionMarginBottom, '12px'),
                      marginTop: resolveLength(entry.descriptionMarginTop, '0px'),
                      maxWidth: resolveLength(entry.descriptionMaxWidth, undefined, '100%'),
                      gridColumn: descriptionGridColumn,
                      fontFamily: resolve(entry.descriptionFontFamily, undefined),
                      textAlign: resolve(entry.descriptionTextAlign, undefined),
                      transform: offsetTransform(entry.descriptionOffsetX, entry.descriptionOffsetY),
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {entry.description}
                  </div>
                  )}
                  {entry.notes && (
                    <div
                      ref={registerContentRef('texts', 2)}
                      style={{
                        fontSize: resolve(entry.notesFontSize, '14px'),
                        fontWeight: resolve(entry.notesFontWeight, 400),
                      lineHeight: resolve(entry.notesLineHeight, '14px'),
                      maxWidth: resolveLength(entry.notesMaxWidth, '180px', '100%'),
                      color: resolve(entry.notesColor, '#d8d8d8'),
                      marginTop: resolveLength(entry.notesMarginTop, '0px'),
                      marginBottom: resolveLength(entry.notesMarginBottom, '0px'),
                      gridColumn: notesGridColumn,
                      fontFamily: resolve(entry.notesFontFamily, undefined),
                      textAlign: resolve(entry.notesTextAlign, undefined),
                      transform: offsetTransform(entry.notesOffsetX, entry.notesOffsetY),
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {entry.notes}
                  </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
