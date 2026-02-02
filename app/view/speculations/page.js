'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'
import { MobileChrome } from '../../components/MobileChrome'
import { clearHomeLayout, getNavStackLength, popNavStack, pushNavStack } from '../../components/navState'
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

const BREAKPOINTS = {
  sm: 640,
  md: 900,
  lg: 1200,
  xl: 1400
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
          {categories.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveMenuCategory(cat.name)
                  onNavigate(cat.name, cat.name)
                }}
                style={{
                  alignSelf: 'flex-end',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  color: activeMenuCategory === cat.name ? '#FDABD3' : '#000',
                  filter: activeMenuCategory === cat.name ? glowFilter : 'none',
                  textAlign: 'right',
                  transform: 'translateY(7px)'
                }}
              >
                {cat.name}
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
                {cat.subcategories.map((sub) => (
                  <button
                    key={`${cat.name}-${sub}`}
                    type="button"
                    onClick={() => {
                      setActiveMenuCategory(cat.name)
                      onNavigate(sub, cat.name)
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

const imageEntries = [
   {
    id: 'metastory',
    file: '/speculations/metastory.jpg',
    subtitle: '2024 _ 2025',
    description: 'METASTORIES was a proposal seeking EU MSCA Doctoral Network funding for research training in investigating, analysing and designing community storytelling engagement processes, developing novel storytelling tools, and testing co-creation practices that contribute to transformative resilience to polycrises.',
    notes: 'This logo board for METASTORIES presents nine adaptive iterations of a shared identity system, each tailored to distinct communicative contexts. The cube structure anchors the design in modular storytelling — a metaphor for narrative as architecture — while the planar typographic fragments suggest both disassembly and recomposition. Variations in color, texture, and orientation reflect the project’s commitment to contextual responsiveness: each version speaks to a different audience, platform, or phase of engagement. Together, the grid becomes a visual manifesto for co-creative resilience — stories as tools, spaces, and strategies for navigating polycrises through design-led transformation.',
    imgWidth: '90%',
    maxH: '600px',
    padding: '14px',
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-20px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '-30px', subtitleOffsetY: '590px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '-30px', descriptionOffsetY: '-40px', descriptionMaxWidth: '500px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '-30px', notesOffsetY: '-40px', notesMaxWidth: '300px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
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
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '3fr 3fr', textMarginTop: '0px', textMarginLeft: '-900px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 1, subtitleOffsetX: '110px', subtitleOffsetY: '415px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '100px', descriptionOffsetY: '230px', descriptionMaxWidth: '500px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 1, notesOffsetX: '110px', notesOffsetY: '-10px', notesMaxWidth: '400px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
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
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '3fr 3fr', textMarginTop: '120px', textMarginLeft: '-500px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '900px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '100px', subtitleOffsetY: '220px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '100px', descriptionOffsetY: '-84px', descriptionMaxWidth: '500px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 1, notesOffsetX: '340px', notesOffsetY: '-280px', notesMaxWidth: '350px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
    },  
   
  {
    id: 'theyseeus',
     imgWidthMobile: '85%',
     maxHMobile: '400px',
     imgHeightMobile: 'auto',
     objectFitMobile: 'contain',
    images: [
      { src: '/speculations/theyseeus 01.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '95%', maxH: '400px'},
      { src: '/speculations/theyseeus 02.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '100%', maxH: '500px'},
      { pair: [
        { src: '/speculations/theyseeus 04.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '95%', maxH: '500px' },
        { src: '/speculations/theyseeus 05.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '95%', maxH: '500px' }
      ] },
      { src: '/speculations/theyseeus 06.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '100%', maxH: '500px' }
    ],
    subtitle: '2021',
    description: 'They See Us is a visual identity built around visibility, heritage, and the quiet confidence of diasporic food culture. The name plays on “Desi Us,” folding self-identification and external perception into a single phrase — a reminder that food is both personal expression and public encounter.',
    notes: 'The identity system uses bold, conversational typography and vibrant, market-inspired imagery to echo the energy of street food while foregrounding the brand’s cultural roots. Graphic elements such as the outlined bag motif and color-blocked posters create a sense of movement and immediacy, mirroring the spontaneity of a food stall environment. Each piece in the campaign balances approachability with attitude: warm, direct, and unmistakably present.',
    imgWidth: '80%',
    maxH: '350px',
    padding: '0px',
    imageOverflow: 'visible',
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '0px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '1000px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '12px', subtitleOffsetY: '410px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '15px', descriptionOffsetY: '-75px', descriptionMaxWidth: '550px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '310px', notesOffsetY: '-540px', notesMaxWidth: '250px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
    },

      {
    id: 'artec',
    displayId: 'ARTEC',
     imgWidthMobile: '90%',
     maxHMobile: '420px',
     imgHeightMobile: 'auto',
     objectFitMobile: 'contain',
    images: [
      { src: '/speculations/Poster 01.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '480px'},
      { src: '/speculations/Poster 02.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '480px' },
      { src: '/speculations/Poster 03.webp', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '480px' }
      ],
    subtitle: '2018 _ 2021',
    description: 'NTNU ARTEC, was a transdisciplinary entity that supporting research and artistic excellence through collaborations in the fields of art(s), humanities, and technology. It was formed by a heterogeneous group of researchers and artists working at different fields and departments at NTNU.',
    notes: 'These posters are a few examples of the work I did as a creative facilitator, where I supported the program’s interdisciplinary work by shaping how its ideas were communicated and experienced. Designing posters, managing the website, and producing event literature formed a cohesive visual and editorial layer that connected researchers, artists, and the public. The paraphernalia was to enable engagement and clarify complex themes, helping cultivate a recognizable, accessible identity for ARTEC’s diverse activities.',
    imgWidth: '80%',
    maxH: '580px',
    padding: '0px',
    imageOverflow: 'visible',
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '2.5fr 1fr', textMarginTop: '0px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '1000px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 1, subtitleOffsetX: '-330px', subtitleOffsetY: '1160px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 1, descriptionOffsetX: '-330px', descriptionOffsetY: '175px', descriptionMaxWidth: '520px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '-345px', notesOffsetY: '175px', notesMaxWidth: '250px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)' 
    },

          {
    id: 'lud',
    displayId: '(IF) PLAY 01',
     imgWidthMobile: '90%',
     maxHMobile: '420px',
     imgHeightMobile: 'auto',
     objectFitMobile: 'contain',
    images: [
      { src: '/speculations/lud (1).jpg', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '520px'},
      { src: '/speculations/lud (2).jpg', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '520px' },
      { src: '/speculations/lud (3).jpg', imgOffsetX: '0px', imgOffsetY: '0px', imgWidth: '120%', maxH: '520px' }
      ],
    subtitle: '2007 _ 2008',
    description: 'LUDEX, was conceived as a computational game that generates digital metropolises through spatial "fluxion". The project was submitted as a bachelor thesis. This Situationist-inspired system maps architectural categories onto a toggleable board to transform site-specific boundaries.',
    notes: 'At its technical core is LUDEX, an interactive architectural game designed to generate digital metropolises through the constant transformation of spatial boundaries, or "fluxion". Using the National College of Arts as a case study, the system categorizes architectural programs into six distinct studies—including anti-Euclidian architecture and psychogeography—which are mapped onto a LUDEX BOARD as toggleable, geometric divisions. These computational "slices" are then extruded into mega-structural wireframes and complex 3D forms, shifting the user\'s role from a spectator to an active "player-architect".',
    imgWidth: '80%',
    maxH: '580px',
    padding: '0px',
    imageOverflow: 'visible',
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '2.5fr 1fr', textMarginTop: '0px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '1000px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 1, subtitleOffsetX: '-330px', subtitleOffsetY: '1160px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 1, descriptionOffsetX: '-330px', descriptionOffsetY: '175px', descriptionMaxWidth: '520px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '-345px', notesOffsetY: '175px', notesMaxWidth: '300px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'
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
    imgOffsetX: '0px',
    imgOffsetY: '0px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-60px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '990px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '-650px', subtitleOffsetY: '880px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '-650px', descriptionOffsetY: '850px', descriptionMaxWidth: '500px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '-260px', notesOffsetY: '840px', notesMaxWidth: '310px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
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
    imgOffsetX: '0px',
    imgOffsetY: '-10px',
    textColumns: 2, textGridTemplate: '1.5fr 4fr', textMarginTop: '-10px', textMarginLeft: '-400px', textAlignSelf: 'stretch', textOffsetX: '0px', textOffsetY: '0px',
    textMaxWidth: '720px',  
    textColumnGap: '28px',
    textRowGap: '16px',
      
    subtitleColumn: 2, subtitleOffsetX: '230px', subtitleOffsetY: '438px', subtitleTextAlign: 'left', subtitleMarginTop: '0px', subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px',
    subtitleFontSize: { xl: '20px', lg: '14px' }, subtitleFontWeight: 400, subtitleLineHeight: { xl: '26px', lg: '19px' }, subtitleMarginBottom: '4px', subtitleMarginBottomTwoCol: '10px', subtitleColor: '#fff', subtitleTextTransform: 'capitalize', subtitleFontFamily: 'var(--font-karla)',

    descriptionColumn: 2, descriptionOffsetX: '230px', descriptionOffsetY: '380px', descriptionMaxWidth: '300px', descriptionTextAlign: 'left', descriptionMarginTop: '0px', descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px',
    descriptionFontSize: { xl: '28px', lg: '18px' }, descriptionFontWeight: 200, descriptionLineHeight: { xl: '26px', lg: '20px' }, descriptionMarginBottom: '12px', descriptionMarginBottomTwoCol: '0px', descriptionColor: '#f1f1f1', descriptionFontFamily: 'var(--font-karla)',

    notesColumn: 2, notesOffsetX: '230px', notesOffsetY: '342px', notesMaxWidth: '250px', notesTextAlign: 'left', notesMarginTop: '0px', notesMarginBottom: '0px', notesMarginBottomTwoCol: '0px',
    notesFontSize: { xl: '14px', lg: '12px' }, notesFontWeight: 400, notesLineHeight: { xl: '15px', lg: '13px' }, notesColor: '#d8d8d8', notesFontFamily: 'var(--font-karla)'  
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
  const [cardIndex, setCardIndex] = useState(0)
  const [imageIndices, setImageIndices] = useState(() =>
    Object.fromEntries(imageEntries.map((entry) => [entry.id, 0]))
  )
  const [mobileTextTab, setMobileTextTab] = useState('description')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const expandTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const cardSwipeStartRef = useRef(null)
  const textSwipeStartRef = useRef(null)
  const desktopSwipeStartRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const isMobileLayout = isMobile || viewportWidth <= 820
  const [desktopOverlayAwake, setDesktopOverlayAwake] = useState(false)
  const itemRefs = useRef({})
  const contentRefs = useRef({})
  const overlayTimerRef = useRef(null)
  const rafRef = useRef(0)
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

  const handleCardWheel = (e) => {
    if (isMobileLayout) return
    e.preventDefault()
    const delta = e.deltaY
    if (delta > 0) {
      setCardIndex((prev) => (prev + 1) % imageEntries.length)
    } else if (delta < 0) {
      setCardIndex((prev) => (prev - 1 + imageEntries.length) % imageEntries.length)
    }
  }

  const wakeOverlay = (autoHideMs = 2000) => {
    if (isMobileLayout) return
    setDesktopOverlayAwake(true)
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = setTimeout(() => setDesktopOverlayAwake(false), autoHideMs)
  }

  const hideOverlay = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current)
      overlayTimerRef.current = null
    }
    setDesktopOverlayAwake(false)
  }

  const handleBack = () => {
    const prev = getNavStackLength() > 0 ? popNavStack() : null
    if (prev) {
      window.location.href = prev
      return
    }
    navigateWithFade('/view')
  }

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageOpacity(1), 30)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    const id = imageEntries[cardIndex]?.id
    if (id && id !== activeProjectId) {
      setActiveProjectId(id)
    }
  }, [cardIndex])

  useEffect(() => {
    if (!activeProjectId) return
    const idx = imageEntries.findIndex((entry) => entry.id === activeProjectId)
    if (idx >= 0 && idx !== cardIndex) {
      setCardIndex(idx)
    }
  }, [activeProjectId])

  useEffect(() => {
    setMobileTextTab('description')
  }, [cardIndex])

  useEffect(() => {
    setCanGoBack(getNavStackLength() > 0)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleResize = () => setViewportWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => () => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
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
    { name: 'connect', subcategories: ['cv', 'about me'] },
  ]), [])

  const handleScrollKey = (e) => {
    if (!scrollAreaRef.current) return
    const delta = e.key === 'ArrowDown' ? 60 : e.key === 'ArrowUp' ? -60 : 0
    if (delta !== 0) {
      e.preventDefault()
      scrollAreaRef.current.scrollBy({ top: delta, behavior: 'smooth' })
    }
  }

  const handleMobileTouchStart = (event) => {
    if (!isMobileLayout) return
    if (!event.touches || event.touches.length !== 1) return
    const touch = event.touches[0]
    cardSwipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleMobileTouchEnd = (event) => {
    if (!isMobileLayout) return
    const start = cardSwipeStartRef.current
    cardSwipeStartRef.current = null
    if (!start || !event.changedTouches || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaY) < 50 || Math.abs(deltaY) <= Math.abs(deltaX)) return
    if (deltaY < 0) {
      setCardIndex((prev) => (prev + 1) % imageEntries.length)
    } else {
      setCardIndex((prev) => (prev - 1 + imageEntries.length) % imageEntries.length)
    }
  }

  const handleTextTouchStart = (event) => {
    event.stopPropagation()
    if (!event.touches || event.touches.length !== 1) return
    const touch = event.touches[0]
    textSwipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTextTouchEnd = (event, canToggle) => {
    event.stopPropagation()
    const start = textSwipeStartRef.current
    textSwipeStartRef.current = null
    if (!start || !event.changedTouches || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaY) >= 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        setCardIndex((prev) => (prev + 1) % imageEntries.length)
      } else {
        setCardIndex((prev) => (prev - 1 + imageEntries.length) % imageEntries.length)
      }
      return
    }
    if (!canToggle || Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return
    if (deltaX < 0) {
      setMobileTextTab('notes')
    } else {
      setMobileTextTab('description')
    }
  }

  const handleDesktopTouchStart = (event) => {
    if (isMobileLayout || !isTouchDevice) return
    if (!event.touches || event.touches.length !== 1) return
    const touch = event.touches[0]
    desktopSwipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleDesktopTouchEnd = (event) => {
    if (isMobileLayout || !isTouchDevice) return
    const start = desktopSwipeStartRef.current
    desktopSwipeStartRef.current = null
    if (!start || !event.changedTouches || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaY) < 50) return
    if (deltaY < 0) {
      setCardIndex((prev) => (prev + 1) % imageEntries.length)
    } else {
      setCardIndex((prev) => (prev - 1 + imageEntries.length) % imageEntries.length)
    }
  }

  const activeEntry = imageEntries[cardIndex] || imageEntries[0] || null
  const activeLabel = activeEntry
    ? activeEntry.id === 'idn4cci' || activeEntry.id === 'in2media'
      ? 'IDN4CCI and IN2MEDIA'
      : (activeEntry.displayId ?? activeEntry.id)
    : 'VIEW'
  const canToggleNotes = Boolean(activeEntry && activeEntry.description && activeEntry.notes)
  const cardDotSize = 8
  const cardDotGap = 10
  const cardDotInset = 12
  const cardDotTop = 10
  const cardDotClusterTop = cardDotTop + cardDotSize + cardDotGap + 4
  const cardDotPositions = [
    { top: cardDotTop, left: cardDotInset },
    { top: cardDotTop, left: cardDotInset + cardDotSize + cardDotGap },
    { top: cardDotTop, right: cardDotInset },
    { top: cardDotTop, right: cardDotInset + cardDotSize + cardDotGap },
    { top: cardDotClusterTop, right: cardDotInset },
    { bottom: cardDotInset + cardDotSize + cardDotGap, right: cardDotInset },
    { bottom: cardDotInset, right: cardDotInset }
  ]
  const mobileTextBody = activeEntry
    ? (mobileTextTab === 'notes' && activeEntry.notes ? activeEntry.notes : activeEntry.description || activeEntry.notes || '')
    : ''
  const handleMobileImageClick = (event) => {
    if (!activeEntry) return
    if (event?.target && event.target.closest && event.target.closest('button')) return
    const imageList = Array.isArray(activeEntry.images) && activeEntry.images.length
      ? activeEntry.images
      : Array.isArray(activeEntry.files) && activeEntry.files.length
        ? activeEntry.files
        : Array.isArray(activeEntry.file)
          ? activeEntry.file
          : activeEntry.file
            ? [activeEntry.file]
            : []
    const displayLength = imageList.length || 1
    if (displayLength <= 1) return
    setImageIndices((prev) => ({
      ...prev,
      [activeEntry.id]: ((prev[activeEntry.id] ?? 0) + 1) % displayLength
    }))
  }
  const handleMobileTextClick = (event) => {
    if (!canToggleNotes) return
    if (event?.target && event.target.closest && event.target.closest('button')) return
    setMobileTextTab((prev) => (prev === 'notes' ? 'description' : 'notes'))
  }

  if (!hasMounted) return null

  return (
      <div
        style={{
          '--page-bg': '#FFFDF3',
          backgroundColor: '#FFFDF3',
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
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

      {!isMobile && (
        <>
          <TopBarTransform
            hoveredElement={hoveredElement}
            setHoveredElement={setHoveredElement}
            readingMode={readingMode}
            analyticsText={activeLabel.toUpperCase()}
            glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))"
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            activePage="view"
            onNavigate={(category) => navigateWithFade(`/${category}`)}
          />

          <LeftPanelTransform
            readingMode={readingMode}
            toggleReadingMode={() => setReadingMode((prev) => !prev)}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            label="SPECULATIONS"
            labelTop={225}
            onBack={handleBack}
            onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
            readingModeDisabled={true}
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
                navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              } else if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
                navigateWithFade(`/view/${sub}`)
              } else {
                navigateWithFade(`/${category}`)
              }
            }}
          />
        </>
      )}

      {isMobile && (
        <MobileChrome
          title="speculations"
          subnav={[]}
          activeDot="view"
          activeSubnav="speculations"
          bottomLabel=""
          readingMode={readingMode}
          onPrimaryAction={() => setReadingMode((prev) => !prev)}
          primaryActive={readingMode}
          primaryDisabled={true}
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={handleBack}
          backDisabled={!canGoBack}
          onNavigate={(key, href) => navigateWithFade(href)}
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          menuExpanded={mobileMenuOpen}
          accentHueExpr="calc(var(--glow-rotation) + var(--glow-offset))"
        />
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
              navigateWithFade(sub === 'things' ? '/make/things' : '/make/spaces')
              return
            }
            if (category === 'view' && (sub === 'speculations' || sub === 'images')) {
              navigateWithFade(`/view/${sub}`)
              return
            }
            if (category === 'reflect' && (sub === 'research' || sub === 'teaching')) {
              navigateWithFade(`/reflect/${sub}`)
              return
            }
            if (category === 'connect' && (sub === 'cv' || sub === 'about me')) {
              const slug = sub === 'cv' ? 'curriculum-vitae' : 'about-me'
              navigateWithFade(`/connect/${slug}`)
              return
            }
            navigateWithFade(`/${category}`)
          }}
          glowFilter="hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))"
          activeMenuCategory={activeMenuCategory}
          setActiveMenuCategory={setActiveMenuCategory}
        />
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
          data-scroll-pane
        >
          {tooltip.text}
        </div>
      )}

      <div style={{ padding: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 80px) 16px calc(env(safe-area-inset-bottom, 0px) + 80px) 16px' : '130px 240px 420px 150px' }}>
        <div
          style={{
            background: '#0f0f0f',
            borderRadius: isMobile ? '16px' : '12px',
            padding: isMobile ? '28px 24px 40px' : '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '48px',
            minHeight: isMobile ? '480px' : '520px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            maxHeight: isMobile
              ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 160px)'
              : viewportWidth > 820 && viewportWidth < 1400
                ? '64vh'
                : '76vh',
            height: isMobile
              ? 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 160px)'
              : viewportWidth > 820 && viewportWidth < 1400
                ? '64vh'
                : '76vh',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? 'calc(100% - 10px)' : 'auto',
            margin: isMobile ? '0 auto' : '0',
            overflow: isMobile ? 'hidden' : 'auto',
            outline: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            boxSizing: 'border-box'
          }}
          onTouchStart={handleMobileTouchStart}
          onTouchEnd={handleMobileTouchEnd}
        >
          {isMobile ? (
            <div
              style={{
                display: 'grid',
                gridTemplateRows: '65% 35%',
                rowGap: '0px',
                height: '100%',
                maxHeight: '100%'
              }}
            >
              <div
                ref={scrollAreaRef}
                data-scroll-pane
                tabIndex={0}
                style={{
                  height: '100%',
                  maxHeight: '100%',
                  overflowY: 'hidden',
                  padding: '4px 2px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '0',
                  boxSizing: 'border-box'
                }}
              >
                {activeEntry && (
                  <div
                    key={activeEntry.id}
                    ref={(el) => {
                      if (el) itemRefs.current[activeEntry.id] = el
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0px',
                      color: '#f5f5f5',
                      height: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    {(() => {
                      const imageList = Array.isArray(activeEntry.images) && activeEntry.images.length
                        ? activeEntry.images
                        : Array.isArray(activeEntry.files) && activeEntry.files.length
                          ? activeEntry.files
                          : Array.isArray(activeEntry.file)
                            ? activeEntry.file
                            : activeEntry.file
                              ? [activeEntry.file]
                              : []
                      if (!contentRefs.current[activeEntry.id]) {
                        contentRefs.current[activeEntry.id] = { images: [], texts: [] }
                      }
                      const registerContentRef = (collection, index) => (el) => {
                        if (!el) return
                        const bucket = contentRefs.current[activeEntry.id]
                        if (!bucket) return
                        bucket[collection][index] = el
                      }
                      const displayLength = imageList.length || 1
                      const currentIndex = (imageIndices[activeEntry.id] ?? 0) % displayLength
                      const slot = imageList[currentIndex]
                      const renderImg = (img, idxOverride) => {
                        if (!img) return null
                        const imageData = typeof img === 'string' ? { src: img } : img
                        const resolveMobile = (value, fallback) => {
                          const resolved = resolveResponsive(value, viewportWidth)
                          return resolved ?? fallback
                        }
                        const normalizeLength = (value, fallback) => {
                          const resolved = resolveMobile(value, fallback)
                          return typeof resolved === 'number' ? `${resolved}px` : resolved
                        }
                        const imgWidth = normalizeLength(
                          imageData.imgWidthMobile ?? activeEntry.imgWidthMobile ?? imageData.imgWidth ?? activeEntry.imgWidth,
                          '100%'
                        )
                        const imgMaxH = normalizeLength(
                          imageData.maxHMobile ?? activeEntry.maxHMobile ?? imageData.maxH ?? activeEntry.maxH,
                          '100%'
                        )
                        const imgHeight = normalizeLength(
                          imageData.imgHeightMobile ?? activeEntry.imgHeightMobile ?? imageData.imgHeight ?? activeEntry.imgHeight,
                          'auto'
                        )
                        const imgObjectFit = resolveMobile(
                          imageData.objectFitMobile ?? activeEntry.objectFitMobile ?? imageData.objectFit ?? activeEntry.objectFit,
                          'contain'
                        )
                        return (
                          <img
                            key={`${activeEntry.id}-${idxOverride ?? currentIndex}`}
                            ref={registerContentRef('images', idxOverride ?? currentIndex)}
                            src={imageData.src}
                            alt={imageData.alt || `${activeEntry.id} ${(idxOverride ?? currentIndex) + 1}`}
                            style={{
                              width: imgWidth,
                              maxHeight: typeof imgMaxH === 'number' ? `${imgMaxH}px` : imgMaxH,
                              height: imgHeight,
                              objectFit: imgObjectFit,
                              display: 'block'
                            }}
                          />
                        )
                      }
                      return (
                        <>
                          <div
                            onClick={handleMobileImageClick}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              flex: '1 1 auto',
                              minHeight: 0,
                              height: '100%',
                              maxHeight: '100%',
                              cursor: displayLength > 1 ? 'pointer' : 'default'
                            }}
                          >
                            {slot && slot.pair ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center', width: '100%' }}>
                                {slot.pair.map((img, idx) => renderImg(img, idx))}
                              </div>
                            ) : (
                              renderImg(slot, currentIndex)
                            )}
                          </div>                        </>
                      )
                    })()}
                    <div style={{ height: '1px', width: '100%', background: 'rgba(255,255,255,0.14)' }} />
                  </div>
                )}
              </div>
              <div
                style={{
                  height: '100%',
                  maxHeight: '100%',
                  paddingTop: '8px',
                  overflowY: 'hidden',
                  color: '#f1f1f1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  minHeight: '0',
                  boxSizing: 'border-box'
                }}
                onTouchStart={handleTextTouchStart}
                onTouchEnd={(event) => handleTextTouchEnd(event, canToggleNotes)}
              >
                {activeEntry && (
                  <>
                    {activeEntry.subtitle && (
                      <div style={{
                        fontSize: resolveResponsive({ base: '14px', sm: '12px' }, viewportWidth),
                        fontWeight: 500,
                        color: '#fff',
                        lineHeight: resolveResponsive({ base: '20px', sm: '16px' }, viewportWidth)
                      }}>
                        {activeEntry.subtitle}
                      </div>
                    )}
                    {mobileTextBody && (
                      <div
                        onClick={handleMobileTextClick}
                        style={{
                          fontSize: mobileTextTab === 'notes' && activeEntry.notes
                            ? resolveResponsive({ base: '12px', sm: '10px' }, viewportWidth)
                            : resolveResponsive({ base: '18px', sm: '15px', md: '16px' }, viewportWidth),
                          fontWeight: 200,
                          lineHeight: mobileTextTab === 'notes' && activeEntry.notes
                            ? resolveResponsive({ base: '14px', sm: '12px' }, viewportWidth)
                            : resolveResponsive({ base: '20px', sm: '17px', md: '18px' }, viewportWidth),
                          color: '#f1f1f1',
                          cursor: canToggleNotes ? 'pointer' : 'default'
                        }}
                      >
                        {mobileTextBody}
                      </div>
                    )}
                  </>
                )}
              </div>
              {canToggleNotes && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    zIndex: 6
                  }}
                >
                  {['description', 'notes'].map((tab) => (
                    <button
                      key={`mobile-text-${tab}`}
                      type="button"
                      onClick={() => setMobileTextTab(tab)}
                      aria-label={tab}
                      style={{
                        width: '28px',
                        height: '4px',
                        borderRadius: '999px',
                        border: 'none',
                        background: mobileTextTab === tab ? '#fff' : 'rgba(255,255,255,0.25)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 6
                }}
              >
                {imageEntries.map((entry, idx) => {
                  const position = cardDotPositions[idx] || {
                    top: cardDotTop,
                    left: cardDotInset + idx * (cardDotSize + cardDotGap)
                  }
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setCardIndex(idx)}
                      aria-label={`Card ${idx + 1}`}
                      style={{
                        position: 'absolute',
                        width: `${cardDotSize}px`,
                        height: `${cardDotSize}px`,
                        borderRadius: '50%',
                        border: 'none',
                        background: idx === cardIndex ? '#fff' : '#555',
                        opacity: idx === cardIndex ? 1 : 0.6,
                        cursor: 'pointer',
                        padding: 0,
                        pointerEvents: 'auto',
                        ...position
                      }}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <div
              tabIndex={0}
              ref={scrollAreaRef}
              data-scroll-pane
              onMouseEnter={() => scrollAreaRef.current && scrollAreaRef.current.focus()}
              onWheel={isTouchDevice ? undefined : handleCardWheel}
              onTouchStart={handleDesktopTouchStart}
              onTouchEnd={handleDesktopTouchEnd}
              style={{
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '48px',
                outline: 'none'
              }}
            >
              {activeEntry && (() => {
                const entry = activeEntry
                const resolve = (value, fallback) => {
                  const resolved = resolveResponsive(value, viewportWidth)
                  return resolved ?? fallback
                }
                const resolveLength = (value, fallback) => {
                  const resolved = resolve(value, fallback)
                  return typeof resolved === 'number' ? `${resolved}px` : resolved
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
                      minHeight: '560px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 0.9fr',
                      gap: '24px',
                      alignItems: 'center',
                      ...(viewportWidth > 820 && viewportWidth < 1400 && { transform: 'translateY(-80px)' })
                    }}
                  >
                    {/* Left column: single image with arrows */}
                    <div
                      onMouseEnter={() => wakeOverlay()}
                      onMouseLeave={hideOverlay}
                      onFocus={() => wakeOverlay()}
                      onPointerDown={(e) => { if (e.pointerType !== 'mouse') wakeOverlay() }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '650px',
                        height: '100%',
                        width: '103.5%'
                      }}
                    >
                      {(() => {
                        // Normalize image list, respecting inline pair entries for "theyseeus"
                        const normalizedList =
                          entry.id === 'theyseeus'
                            ? imageList
                            : imageList

                        const displayLength = normalizedList.length || 1
                        const currentIndex = (imageIndices[entry.id] ?? 0) % displayLength
                        const slot = normalizedList[currentIndex]
                        const imgDataRaw = slot && slot.pair ? slot.pair[0] : slot
                        const imgData = imgDataRaw ? (typeof imgDataRaw === 'string' ? { src: imgDataRaw } : imgDataRaw) : null
                        if (!imgData) return null

                        const halfSize = entry.id === 'kreativ' || entry.id === 'niyf'
                        const explicitWidth =
                          entry.id === 'theyseeus' && currentIndex === 0
                            ? imgData.imgWidth ?? '100%'
                            : undefined
                        const imgWidthValue = explicitWidth ?? (halfSize ? '50%' : '100%')
                        const imgMaxHValue = imgData.maxH ?? entry.maxH ?? (halfSize ? '260px' : '520px')
                        const imageOffsetX = resolveLength(imgData.imgOffsetX ?? imgData.offsetX ?? entry.imgOffsetX, '0px')
                        const imageOffsetY = resolveLength(imgData.imgOffsetY ?? imgData.offsetY ?? entry.imgOffsetY, '0px')
                        const imageTransform =
                          imageOffsetX !== '0px' || imageOffsetY !== '0px'
                            ? `translate(${imageOffsetX}, ${imageOffsetY})`
                            : undefined
                        const renderImg = (img, idxOverride) => {
                          const w = resolveLength(
                            img.imgWidth ?? entry.imgWidth ?? (halfSize ? '50%' : '100%'),
                            halfSize ? '50%' : '100%'
                          )
                          const h = resolveLength(
                            img.maxH ?? entry.maxH ?? (halfSize ? '260px' : '520px'),
                            halfSize ? '260px' : '520px'
                          )
                          const offX = resolveLength(img.imgOffsetX ?? img.offsetX ?? entry.imgOffsetX, '0px')
                          const offY = resolveLength(img.imgOffsetY ?? img.offsetY ?? entry.imgOffsetY, '0px')
                          const tx = offX !== '0px' || offY !== '0px' ? `translate(${offX}, ${offY})` : undefined
                          return (
                            <img
                              key={`${entry.id}-${idxOverride ?? currentIndex}`}
                              ref={registerContentRef('images', idxOverride ?? currentIndex)}
                              src={img.src}
                              alt={img.alt || `${entry.id} ${(idxOverride ?? currentIndex) + 1}`}
                              style={{
                                width: w,
                                maxWidth: w,
                                maxHeight: h,
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: '12px',
                                transform: tx
                              }}
                            />
                          )
                        }

                        const imgElement = renderImg(imgData)
                        const isPair = slot && slot.pair
                        return (
                          <>
                            {isPair ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center', justifyItems: 'center' }}>
                                {slot.pair.map((img, idx) => renderImg(img, idx))}
                              </div>
                            ) : entry.id === 'theyseeus' ? (
                              <div style={{ borderRadius: '12px', overflow: 'hidden', display: 'inline-block' }}>{imgElement}</div>
                            ) : (
                              imgElement
                            )}
                            {!isMobileLayout && displayLength > 1 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  right: '12px',
                                  transform: 'translateY(-50%)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: 'rgba(15,15,15,0.24)',
                                  padding: '8px 6px',
                                  borderRadius: '10px',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                  opacity: desktopOverlayAwake ? 0.85 : 0.3,
                                  transition: 'opacity 180ms ease'
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageIndices((prev) => ({
                                      ...prev,
                                      [entry.id]: (currentIndex - 1 + displayLength) % displayLength
                                    }))
                                  }
                                  style={{
                                    border: '1px solid #666',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    background: '#0f0f0f',
                                    color: '#fff',
                                    display: 'grid',
                                    placeItems: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {'<'}
                                </button>
                                <div style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>
                                  {currentIndex + 1} / {displayLength}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageIndices((prev) => ({
                                      ...prev,
                                      [entry.id]: (currentIndex + 1) % displayLength
                                    }))
                                  }
                                  style={{
                                    border: '1px solid #666',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    background: '#0f0f0f',
                                    color: '#fff',
                                    display: 'grid',
                                    placeItems: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {'>'}
                                </button>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Right column: two rows (subtitle+description, then notes) */}
                    <div
                      style={{
                        color: '#f1f1f1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        height: '100%',
                        maxWidth: resolveLength(entry.textMaxWidth, '520px', '100%'),
                        position: 'relative',
                        padding: '8px',
                        transform: 'translateX(10px)'
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          maxWidth: resolveLength(entry.descriptionMaxWidth, '700px', '700px')
                        }}
                      >
                        {entry.subtitle && (
                          <div
                            ref={registerContentRef('texts', 0)}
                            style={{
                              fontSize: resolve(entry.subtitleFontSize, '20px'),
                              fontWeight: resolve(entry.subtitleFontWeight, 400),
                              lineHeight: resolve(entry.subtitleLineHeight, '26px'),
                              color: resolve(entry.subtitleColor, '#fff'),
                              textTransform: resolve(entry.subtitleTextTransform, 'capitalize'),
                              fontFamily: resolve(entry.subtitleFontFamily, undefined),
                              textAlign: resolve(entry.subtitleTextAlign, undefined),
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
                              marginTop: '8px',
                              maxWidth: resolveLength(entry.descriptionMaxWidth, undefined, '100%'),
                              fontFamily: resolve(entry.descriptionFontFamily, undefined),
                              textAlign: resolve(entry.descriptionTextAlign, undefined),
                              overflowWrap: 'anywhere'
                            }}
                          >
                            {entry.description}
                          </div>
                        )}
                      </div>
                      {entry.notes && (
                        <div
                          ref={registerContentRef('texts', 2)}
                          style={{
                            position: 'relative',
                            fontSize: resolve(entry.notesFontSize, '14px'),
                            fontWeight: resolve(entry.notesFontWeight, 400),
                            lineHeight: resolve(entry.notesLineHeight, '16px'),
                            maxWidth: resolve(entry.notesMaxWidth, '260px'),
                            color: resolve(entry.notesColor, '#d8d8d8'),
                            marginTop: '24px',
                            marginBottom: resolveLength(entry.notesMarginBottom, '0px', '0px'),
                            fontFamily: resolve(entry.notesFontFamily, undefined),
                            textAlign: resolve(entry.notesTextAlign, 'left'),
                            overflowWrap: 'anywhere'
                          }}
                        >
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '8px',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 5
                }}
              >
                {imageEntries.map((entry, idx) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setCardIndex(idx)}
                    aria-label={`Card ${idx + 1}`}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: 'none',
                      background: idx === cardIndex ? '#fff' : '#555',
                      opacity: idx === cardIndex ? 1 : 0.6,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
