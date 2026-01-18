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

const categories = [
  {
    id: 'publications',
    label: 'publications',
    items: [
      {
        id: 'hand-tracking',
        title: 'Evaluating hand-tracking interaction for performing motor-tasks in VR learning environments',
        venue: 'conference',
        year: '2021',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:zYLM7Y9cAGgC',
        abstract:
          'The past few years has witnessed a promising surge in immersive media technologies, however, a widespread adoption is still some years away. Recently, virtual reality (VR) head-mounted displays with inside-out tracking and hand-tracking are becoming popular in various fields. Representing users hands and fingers in VR is crucial for many tasks. This is because hand-tracking enables a more natural, direct, interaction with a virtual environment (VE) which, compared to traditional handheld controllers, improves the VR immersive experience. This paper investigates user-perceived quality of experience for a reach-pick-place task inside VR. It presents a performance assessment methodology based on in-game analytics to evaluate user experience for different VR interaction types. We ran a controlled experiment (N=33) comparing two commodities: controller vs. hand-tracking. Results indicate a significant difference between the two data sets. The performance analytics show lower play-durations and trigger frequencies for the handheld controller compared to hand-tracking. The perceived mental workload for the tasks was also evaluated using Rated Scale Mental Effort (RSME). The reported scores were higher when using hand-tracking. The results help our understanding of the two interaction modalities in terms of their viability for naturalistic experiences akin to real-world scenarios.'
      },
      {
        id: 'White Paper',
        title: 'QUALINET white paper on definitions of immersive media experience (IMEx).',
        venue: 'white paper',
        year: '2020',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:qjMakFHDy7sC',
        abstract:
          'With the coming of age of virtual/augmented reality and interactive media, numerous definitions, frameworks, and models of immersion have emerged across different fields ranging from computer graphics to literary works. Immersion is oftentimes used interchangeably with presence as both concepts are closely related. However, there are noticeable interdisciplinary differences regarding definitions, scope, and constituents that are required to be addressed so that a coherent understanding of the concepts can be achieved. Such consensus is vital for paving the directionality of the future of immersive media experiences (IMEx) and all related matters. The aim of this white paper is to provide a survey of definitions of immersion and presence which leads to a definition of immersive media experience (IMEx). The Quality of Experience (QoE) for immersive media is described by establishing a relationship between the concepts of QoE and IMEx followed by application areas of immersive media experience. Influencing factors on immersive media experience are elaborated as well as the assessment of immersive media experience. Finally, standardization activities related to IMEx are highlighted and the white paper is concluded with an outlook related to future developments.'
      },
      {
        id: 'spatial storytelling',
        title: 'Spatial storytelling: Finding interdisciplinary immersion.',
        venue: 'conference',
        year: '2018',
        researchAssistant: 'Research Assistant',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:u5HHmVD_uO8C',
        abstract:
          'This paper is part of an ongoing transdisciplinary research into immersion. In specific, it focuses on Spatial Storytelling to examine the narrative technique in conjunction with Spatial Presence, a commonly accepted subtype of Presence. How our real-life occupation is a constant narrative making exercise and how storytelling is ingrained in our movement in space. It is argued here that immersion and presence models stand to benefit from spatial theory, particularly, the body of work surrounding spatial practices and narratives. Further, that the incorporation of spatial theory adds to the necessary versatility required in approaching immersion, which has been thus far dominated by positivist empiricism. Contributions of a theorized space are also found missing from interactive storytelling and videogames where subject/object interactivity is seen as mere actions performed inside a given space whereas the paper argues that space is learnt through such involvement.'
      },
      {
        id: 'virtual hands',
        title: 'How good are virtual hands? Influences of input modality on motor tasks in virtual reality.',
        venue: 'journal',
        year: '2023',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:WF5omc3nYNoC',
        abstract:
          'Hand-tracking enables controller-free interaction with virtual environments, which can make virtual reality (VR) experiences more natural and immersive. As naturalness hinges on both technological and human influence factors, fine-tuning the former while assessing the latter can be used to increase overall experience. This paper investigates a reach-grab-place task inside VR using two input modalities (hand-tracking vs. handheld-controller). Subjects (N = 33) compared the two input methods available on a consumer grade VR headset for their effects on objective user performance and subjective experience of the perceived sense of presence, cognitive workload, and ease-of-use. We found that virtual hands (with hand-tracking) did not influence the subjective feelings of perceived presence, naturalness, & engagement; neither did it inspire the overall ease-of-use while performing the task. In fact, subjects completed the task faster and felt a lower mental workload and higher overall usability with handheld-controllers. The result found that in this particular case, hand-tracking did not improve the psychological and emotional determinants of immersive VR experiences. The study helps expand on our understanding of the two input modalities in terms of their viability for naturalistic experiences in VR akin to real-world scenarios.'
      },
      {
        id: 'authenticity-presence',
        title: 'Authenticity and presence: Defining perceived quality in VR experiences.',
        venue: 'journal',
        year: '2024',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:_FxGoFyzp5QC',
        abstract:
          'This work expands the existing understanding of quality assessments of VR experiences. Historically, VR quality has focused on presence and immersion, but current discourse emphasizes plausibility and believability as critical for lifelike, credible VR. However, the two concepts are often conflated, leading to confusion. This paper proposes viewing them as subsets of authenticity and presents a structured hierarchy delineating their differences and connections. Additionally, coherence and congruence are presented as complementary quality functions that integrate internal and external logic. The paper considers quality formation in the experience of authenticity inside VR emphasizing that distinguishing authenticity in terms of precise quality features are essential for accurate assessments. Evaluating quality requires a holistic approach across perceptual, cognitive, and emotional factors. This model provides theoretical grounding for assessing the quality of VR experiences.'
      },
      {
        id: 'holistic-taxonomy',
        title: 'A holistic quality taxonomy for virtual reality experiences.',
        venue: 'journal',
        year: '2024',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:roLk4NBRz8UC',
        abstract:
          'The rapid advancement of virtual reality (VR) technology has brought many immersive experiences, each designed to transport users into captivating virtual worlds. While these experiences aim to provide a sense of presence and engagement, the factors contributing to a truly immersive experience are often complex and multifaceted. Existing scholarship has predominantly focused on specific aspects of user experience, such as psychological factors (e.g., sense of presence), emotional factors (e.g., enjoyment), or design-related factors (e.g., interface usability). This fragmented approach has impeded a comprehensive understanding of the overall quality of VR experiences. To address this, we propose a multidimensional taxonomy encompassing five essential qualities: immersivity, interactivity, explorability, plausibility, and believability. The framework aims to disentangle the complex, interrelated facets shaping VR experiences for a more systematic evaluation. Immersivity refers to the subjective sense of presence and “being there” in a virtual environment. Interactivity denotes the ability to interact with virtual objects, promoting engagement dynamically. Explorability refers to users’ freedom to navigate and discover new elements. Plausibility examines the logical congruence of the virtual environment’s rules and behaviors. Finally, believability relates to the world-building and internal coherence of the VR world. This taxonomy provides a structured approach to look at VR experiences holistically, assessing the interplay of these facets to facilitate a more objective, comprehensive evaluation, capturing the multidimensional nature of VR experiences. In summary, our proposed taxonomy marks an essential step toward systematic VR evaluation, providing guidance for researchers and highlighting factors integral to VR quality.'
      },
         {
        id: 'quality-framework',
        title: 'Towards a quality framework for immersive media experiences: a holistic approach.',
        venue: 'conference',
        year: '2019',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:d1gkVwhDpl0C',
        abstract:
          'Immersive Media Technologies have emerged as popular media form. Their captivating nature makes them a powerful tool for participation and storytelling in a variety of domains attracting multidisciplinary interest. Existing frameworks for user-perceived quality in immersive media experiences are limited due to their exclusion of narrative dimensions. This research expands upon the current system-centered Quality of Experience framework by including Content Influence Factors based on learnings from IDN. Hence proposing a conceptual framework for measuring immersive media experiences, which comprise of four constructs: Form, Content, User, and Context. These components are interrelated through their overlapping dimensions, which is discussed through the course of this paper.'
      },
       {
        id: 'virtual walkthroughs',
        title: 'A subjective and behavioral assessment of affordances in virtual architectural walkthroughs.',
        venue: 'journal',
        year: '2021',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:Y0pCki6q_DkC',
        abstract:
          'Immersive technologies, such as VR, offer first-person experiences using depth perception and spatial awareness that elucidate a sense of space impossible with traditional visualization techniques. This paper looks beyond the visual aspects and towards understanding the experiential aspects of two popular uses of VR in 3D architectural visualization: a “passive walkthrough” and an “interactive walkthrough”. We designed a within-subject experiment to measure the user-perceived quality for both experiences. All participants (N = 34) were exposed to both scenarios and afterwards responded to a post-experience questionnaire; meanwhile, their physical activity and simple active behaviors were also recorded. Results indicate that while the fully immersive-interactive experience rendered a heightened sense of presence in users, overt behaviors (movement and gesture) did not change for users. We discuss the potential use of subjective assessments and user behavior analysis to understand user-perceived experiential quality inside virtual environments, which should be useful in building taxonomies and designing affordances that best fit these environments.'
      },
          {
        id: 'perceived actions',
        title: 'Affects of Perceived-Actions within Virtual Environments on User Behavior on the Outside.',
        venue: 'conference',
        year: '2020',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:2osOgNQ5qMEC',
        abstract:
          '3D visualization has witnessed exponential growth driven by advances in computer-generated imagery that now include immersive technologies enabling first-person experiences with depth perception and spatial awareness. We investigated two popular uses of VR in 3D architectural visualization: a “passive walkthrough” vs. an “interactive walkthrough”. We designed a within-subject experiment to measure the user-perceived quality and conduct a behavior analysis of users in both experiences. All participants (N=34) were exposed to both conditions and afterwards responded to a post-experience questionnaire. We recorded the physical activity of all participants while they were immersed within the virtual environments and each session was logged in a time diary. So far QoE measurements have relied on subjective and objective evaluations. In this paper, we discuss the behavioral analysis of the effects of immersion and interaction on the simple active behaviors (movements + gestures) of the users. We apply quantitative behavioral observation to cross-examine user behavior against their self-reported responses to a “presence” questionnaire. We conclude that there is significant potential for applying cross-disciplinary behavior analysis tools to overall Quality of Experience within virtual environments.'
      },
          {
        id: 'storytelling App',
        title: 'User Evaluation of a Storytelling Application Assisting Visitors in Protected Nature Areas.',
        venue: 'conference',
        year: '2021',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:YsMSGLbcyi4C',
        abstract:
          'Storytelling has been part of human culture throughout history. Stories become profound when they are related to real places. In this paper we look at the use of location-based media and augmented reality to create storytelling experiences to assist visitors in a protected nature area. This was done in collaboration with an adventure tourism company to find alternatives to mountain signposts and take a technological approach promoting self-motivated tourism. Users (N = 30) tested a location-based AR application for mobile devices. Participants were split into two groups to test two variations of the application: a text-only variation was compared to an AR-based variation. Overall user experience for the two variations was evaluated using subjective measures. The results from our study indicate a higher immersion and a sense of flow in the AR-based variation of the application. Similarly, the AR-based variation also elicited higher desirability compared to the text-only variation.'
      },
           {
        id: 'narrative impact',
        title: 'Narrative\'s impact on quality of experience in digital storytelling.',
        venue: 'conference',
        year: '2019',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:9yKSN-GCB0IC',
        abstract:
          'Our ways of telling stories have evolved along with advances in technology. This has led to the emergence of digital storytelling. This project explores narrative influences on Quality of Experience of users in digital stories. This is done by creating and implementing a location driven digital story presented to the user by an augmented reality application on a mobile device. This narrative system has been evaluated by 30 people who have participated in a subjective evaluation. The results show that the narrative setup results in a richer, livelier and more engaging experience.'
      },
      {
        id: 'dissertation',
        title: '(In) Authentic VR. Quality Assessments of Interactivity in Virtual Reality.',
        venue: 'dissertation',
        year: '2024',
        link: 'https://depositonce.tu-berlin.de/items/1ab4b3f9-77e7-4b9f-b857-15cbd4e6714d',
        abstract:
          'Immersive technologies like virtual reality (VR) rapidly transform how we experience media and interact with information. As these emerging mediums reshape notions of space, time, and reality, there is a pressing need to develop rigorous frameworks for understanding the multidimensional facets that collectively define their experiential qualities. This thesis offers timely theoretical explications and empirical insights to advance scholarly comprehension of immersive media experiences (IMEx) in their human-centric complexity. The overarching motivation stems from recognizing that while technological capabilities are integral, they tell only part of the story. To holistically evaluate IMEx, cross-disciplinary perspectives that consider the confluence of system parameters with cognitive, perceptual, and behavioral processes must be adopted. Through conceptual consolidations coupled with systematic mixed-methods studies, the research presented here expands the toolkit for assessing user-centered facets that shape experiential quality. A seminal contribution lies in formulating an overarching taxonomy delineating key aspects, elements, and features that characterize quality within immersive media. This thesis proposes authenticity as a complementary concept to presence and draws attention to their conceptual correlation within a user-centric framework. It is a reflective appraisal of coherence and congruence in their significance towards a virtual experience. A comprehensive taxonomy is then introduced to untangle the complex, interconnected aspects influencing VR experiences and to capture their multidimensional nature for a more systematic assessment. Collectively, this thesis expands and enriches the understanding of IMEx by integrating cross-disciplinary perspectives. The empirical findings offer original evidence, highlighting system potential and experience gaps. In illuminating relationships between technology and behavior, the thesis advocates complementing engineering advancements with deeper insights into human factors for optimizing fully immersive VR experiences. Overall, it provides timely contributions toward comprehensive quality assessment frameworks for emerging mediums that reshape perceptions of how we interact with data, tell stories, and socialize.'
      },
       {
        id: 'mixed reality TV',
        title: 'Validation and assessment of a mixed reality solution for enhanced TV viewer engagement.',
        venue: 'conference',
        year: '2023',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:ufrVoPGSRksC',
        abstract:
          'This paper explores the use of Mixed Reality in live television shows by allowing remote participants to “teleport” into a virtual studio. The solution utilizes background extraction (BE) and super-resolution (SR) modules to extract remote participants from their videos and composite them seamlessly into the studio footage, allowing for participation in live TV programs using standard mobile devices or webcams. This paper aims to investigate the impact of capturing devices and background settings on the output videos from the end user’s point of view. The results of the study are presented and discussed with a focus on the effectiveness of the BE and SR components in response to variations in capturing devices and background settings.'
      },
           {
        id: 'QoE Column 1',
        title: 'QoE column: Solving complex issues through immersive narratives: does QoE play a role?.',
        venue: 'article',
        year: '2021',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:IjCSPb-OGe4C',
        abstract:
          'A transdisciplinary dialogue and innovative research, including technical and artistic research as well as digital humanities are necessary to solve complex issues. We need to support and produce creative practices, and engage in a critical reflection about the social and ethical dimensions of our current technology developments. At the core is an understanding that no single discipline, technology, or field can produce knowledge capable of addressing the complexities and crises of the contemporary world. Moreover, we see the arts and humanities as critical tools for understanding this hyper-complex, mediated, and fragmented global reality. As a use case, we will consider the complexity of extreme weather events, natural disasters and failure of climate change mitigation and adaptation, which are the risks with the highest likelihood of occurrence and largest global impact (World Economic Forum, 2017). Through our project, World of Wild Waters (WoWW), we are using immersive narratives and gamification to create a simpler holistic understanding of cause and effect of natural hazards by creating immersive user experiences based on real data, realistic scenarios and simulations. The objective is to increase societal preparedness for a multitude of stakeholders. Quality of Experience (QoE) modeling and assessment of immersive media experiences are at the heart of the expected impact of the narratives, where we would expect active participation, engagement and change, to play a key role.'
      },
              {
        id: 'QoE Column 2',
        title: 'Immersive media experiences: why finding consensus is important.',
        venue: 'article',
        year: '2022',
        researchAssistant: 'Research Assistant',
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=G4Ao4V8AAAAJ&citation_for_view=G4Ao4V8AAAAJ:UeHWp8X0CEIC',
        abstract:
          'An introduction to the QUALINET White Paper on Definitions of Immersive Media Experience (IMEx).'
      }

    ]
  },
  {
    id: 'studies',
    label: 'studies',
    items: [
      {
        id: 'studies 1',
        title: 'Hand-tracking vs. Controllers in VR interactions',
        venue: 'study',
        year: '2021',
        experiment: 'QU Lab, Berlin',
        details: [
          {
            label: 'Question',
            body: 'How do hand-tracking and handheld-controllers compare for reach-grab-place tasks in VR?',
            bodySpacing: '2px'
          },
          {
            label: 'Finding',
            body:
              'Controllers outperformed hand-tracking on speed, accuracy, mental workload, and usability. Neither modality affected presence or immersion.',
            bodySpacing: '2px'
          },
          {
            label: 'Why',
            body:
              'Mismatch between available gesture (single "pinch") and required grips (six distinct prehension types) created cognitive friction despite hand-tracking being theoretically more natural.',
            bodySpacing: '2px'
          },
          {
            label: 'Methods',
            body: [
              { label: 'Design', text: '' },
              { text: '2x2 within-sujbect study (N=33). \nHand-tracking vs. Controller X Color vs. Grayscale' },
              { label: 'Task', text: 'Reorganize 15 objects requiring six different grip types' },
              { label: 'Measures', text: '' },
              { text: 'Performance log: completion time, grab attempts', indent: '45px' },
              { text: 'Behavioral: Video coding via KINOVEA (vectors, angles, tracking)', indent: '45px' },
              { text: 'Subjective: IPQ (presence), NASA-TLX, AttrakDiff (usability)', indent: '45px' },
              { label: 'Analysis', text: 'Two-way MANOVA with ANOVAs, Intraclass Correlation Coefficient (ICC), Root mean square error (RMSE)' }
            ],
            bodySpacing: '2px'
          },
          {
            label: 'Tools',
            body: [
              { label: 'Hardware', text: 'Oculus Quest 1 (inside-out tracking, 6DOF)' },
              { label: 'Software', text: 'SketchUp Pro, Unreal Engine 4.26, SPSS 28.0, Kinovea 0.9.5' },
              { label: 'Input', text: 'Point/pinch gestures vs. grip button controller' }
            ],
            bodySpacing: '2px'
          }
        ],
        images: [
          '/research/study 1 (1).jpg',
          '/research/study 1 (2).jpg',
          '/research/study 1 (3).jpg',
          '/research/study 1 (4).jpg'
        ]
      },
      {
        id: 'studies 2',
        title: 'Affordance mismatch in VR environments',
        venue: 'SenseIT Lab, NTNU',
        year: '2020',
        experiment: 'Sense IT Lab, NTNU',
        details: [
          {
            label: 'Question',
            body: 'Does adding interactivity (manipulation/effect affordances) to VR architectural walkthroughs improve presence and change user behavior?',
            bodySpacing: '2px'
          },
          {
            label: 'Finding',
            body:
              'Interactive walkthrough increased spatial presence and engagement but did not change overt physical behaviors (movement, gestures). Users relied on familiar digital interactions (point-and-click) rather than spatial behaviors.',
            bodySpacing: '2px'
          },
          {
            label: 'Why',
            body:
              'Metaphorical affordances (VR imitating real objects like door handles) created expectations that could not be physically met, causing users to appropriate controllers in familiar ways rather than using spatial literacy.',
            bodySpacing: '2px'
          },
          {
            label: 'Methods',
            body: [
              { label: 'Design', text: 'Within-subject study (N=34): Passive walkthrough (PW) vs. Interactive walkthrough (IW) in identical virtual apartment' },
             // { label: 'Conditions', text: '' },
              //{ text: 'PW: Navigation only (point-and-teleport)', indent: '45px' },
             // { text: 'IW: Navigation + 2 light toggles + 6 doors + 6 cabinets/drawers', indent: '45px' },
              { label: 'Measures', text: '' },
              { text: 'Subjective: ITC-SOPI (presence, engagement, etc.)', indent: '45px' },
              { text: 'Behavioral: Video coding via BORIS software (states and events)', indent: '45px' },
              { label: 'Analysis', text: 'MANCOVA controlling for active run-time.' }
            ],
            bodySpacing: '2px'
          },
          {
            label: 'Tools',
            body: [
              { label: 'Hardware', text:''},
              { text: 'HTC Vive Pro HMD (6DOF, 1440x1600 per eye, 90Hz, 110deg FoV)  /  Input with HTC Vive handheld controllers', indent: '45px' },
              { text: 'Windows 10 Pro, Intel i7 7700 3.6GHz, 32GB RAM, NVIDIA GTX 1060', indent: '45px' },
              { label: 'Software', text: 'SketchUp Pro / Unreal Engine 4.22 / BORIS 7.9.19 / IBM SPSS' },
              //{ label: 'Input', text: 'HTC Vive handheld controllers' }
            ],
            bodySpacing: '2px'
          }
        ],
        images: [
          '/research/study 2 (1).png',
          '/research/study 2 (2).png',
          '/research/study 2 (3).png'
        ]
      },
      {
        id: 'studies 3',
        title: 'Location-based Storytelling App in a Natural Park',
        venue: 'study',
        year: '2022',
        experiment: 'Rindal field study',
        details: [
          {
            label: 'Question',
            body: 'Does the addition of 3D character available as Augmented Reality (AR) inside a location-based storytelling app improve user experience compared to text-and-narration only delivery in an outdoor environment?',
            bodySpacing: '2px'
          },
          {
            label: 'Finding',
            body:
              'AR version significantly increased immersion and flow, and showed higher desirability and attractiveness. No difference in other aspects like competence, tension, challenge, or negative effects.',
            bodySpacing: '2px'
          },
          {
            label: 'Why',
            body:
              '3D characters made the experience more engaging compared to the text-and-narration version. The story-world was delivered more effectively with the 3D characters appearing through AR in the outdoor environment.',
            bodySpacing: '2px'
          },
          {
            label: 'Methods',
            body: [
              { label: 'Design', text: 'Between-subject field experiment (N=30) comparing two app versions along a 700m nature trail within a protected nature area in the Rindal region. TB (text-and-narration based) vs. AR-based (troll characters with voice-overs)' },
              //{ label: 'Conditions', text: '' },
              //{ text: 'TB (text-and-narration based): Information delivered as notifications (like digital signposts)', indent: '45px' },
              //{ text: 'AR (augmented reality): Virtual troll characters with voice-overs, story narrative integrating geography, flora, and fauna', indent: '45px' },
              { label: 'Measures', text: '' },
              { text: 'Game Experience Questionnaire (GEQ): 9 dimensions including immersion, flow, challenge, etc.', indent: '45px' },
              { text: 'AttrakDiff: Pragmatic quality (PQ), hedonic quality (HQ-I, HQ-S), attractiveness (ATT)', indent: '45px' },
              { label: 'Analysis', text: 'MANOVA with follow-up ANOVAs' }
            ],
            bodySpacing: '2px'
          },
          {
            label: 'Tools',
            body: [
              { label: 'Hardware', },
              { text: 'Apple iPad, 5th gen, 9.7" screen, 2048x1536 resolution, 8MP camera  /  Bad Elf GPS (2.5m accuracy)' },
              { label: 'Software', text: 'Unity (2019.3.4f1), Vuforia Engine (9.7.5) / ZBrush (2021), Maya (2020) / Substance Painter (2020) / Photoshop (2021)' },
              //{ label: 'Location', text: 'Protected nature area in Trollheimen, Norway (wetland trail, 6 GPS coordinates)' },
             // { label: 'Content', text: 'Norwegian folklore about trolls managing nature and seasons, voice-overs in Norwegian, static 3D character models' }
            ],
            bodySpacing: '2px'
          }
        ],
        images: [
          '/research/Study 3 (1).jpg',
          '/research/Study 3 (2).jpg',
          '/research/Study 3 (3).jpg',
          '/research/Study 3 (4).jpg',
          '/research/Study 3 (5).webp'
        ]
      }
    ]
  },
  {
    id: 'projects',
    label: 'projects',
    items: [
      {
        id: 'home-of-the-trolls',
        title: 'Home of the Trolls',
        fundingType: 'RFF Trondelag',
        year: '2023',
        links: [
          { href: 'https://www.regionaleforskningsfond.no/trondelag/om-rff-trondelag/nyheter/2023/har-apna-verdens-forste-forskningsstasjon-for-troll/' },
          { href: 'https://www.homeofthetrolls.no/' }
        ],
        abstract:
          'Funded by RFF Trondelag, Home of the Trolls, was an interactive storytelling experience with the aim to inspire regional tourism by bringing together the love Norwegians share for nature and folklore. It implements virtual elements in augmented reality and geo-positioning technology. The application was developed in collaboration with a local tourism company from Rindal to motivate self-guided, and assisted, tourism in protected nature reserves. NTNU was responsible for developing the first two prototypes and running on-site field evaluations for the application.',
        images: [
          '/research/project 1 (1).webp',
          '/research/project 1 (2).webp',
          '/research/project 1 (3).webp',
          '/research/project 1 (4).avif'
        ]
            },
      {
        id: 'admire',
        title: 'AdMiRe3D',
        fundingType: 'EU Horizon',
        year: '2020',
        links: [
          { href: 'https://admire3d.brainstorm3d.com/' },
          { href: 'https://cordis.europa.eu/project/id/952027' }
        ],
        abstract:
          'AdMiRe was an EU Horizon 2020 funded project under grant agreement No 952027. The project developed, validated and demonstrated innovative solutions based on mixed reality technology. These solutions enabled audiences at home to be incorporated into the live TV program they are watching and to interact with people in the TV studio. This provided content creators with tools that radically improve talent immersion and interaction with computer-generated elements. The NTNU team was responsible for implementing Work Packages 4 and 5 related to the Quality Assesments and Validation of the end-to-end system. Validation and user studies took place at TV centers in three different locations: Trondheim, Dublin, and Bucharest.',
        images: [
          '/research/project 2 (1).webp',
          '/research/project 2 (2).webp',
          '/research/project 2 (3).webp'
        ]
      },
      {
        id: 'easyux',
        title: 'EasyUX',
        fundingType: 'NTNU ELSYS',
        year: '2022',
        //links: [
          //{ href: 'https://admire3d.brainstorm3d.com/' },
          //{ href: 'https://cordis.europa.eu/project/id/952027' }
        //],
        abstract:
          'This project developed the first prototype for a web-based application that aided empirical evaluations and user experience testing. The application served as a researcher-oriented one-stop shop to conduct experiments from a single platform and maintain a database. The tools and measures offered in the first prototype were limited to a : timer, video recorder, game analytics, and multiple subjective questionnaires.',
        images: [
          '/research/project 3 (1).webp',
          '/research/project 3 (2).webp',
          '/research/project 3 (3).webp'
        ]
      },
      {
        id: 'exerVR',
        title: 'exerVR',
        fundingType: 'NTNU - TU Berlin Collaboration',
        year: '2018 - 2021',
        //links: [
          //{ href: 'https://admire3d.brainstorm3d.com/' },
          //{ href: 'https://cordis.europa.eu/project/id/952027' }
        //],
        abstract:
          'This pilot study transformed the training experience for rowers by transporting a stationary rowing machine into a virtual environment. The VR-based canoe received movement data from several sensors installed on the rowing machine and displayed that data in the form of immersive analytics inside the head-mounted display. In addition, metrics on technique are derived from the sensor data as well as physiological data. All this is used to investigate if, and to which extent, VR improves the technical skills of an athlete during the complex sport of rowing. Furthermore, subjective instruments are employed in conjunction to record athlete perceptions about their performance, and how they think this training simulation compares to a standard rowing workout without VR. Consecutive tests within this project indicated improved performance and an enhanced experience for the athletes.',
        images: [
          '/research/project 4 (1).jpg',
          '/research/project 4 (2).jpg',
          '/research/project 4 (3).jpg',
          '/research/project 4 (4).jpg',
          '/research/project 4 (5).jpg'
        ]
      }
    ]
  },
  {
    id: 'proposals',
    label: 'proposals',
    items: [
      {
        id: 'impact',
        title: 'IMPACT',
        fundingType: 'Horizon Europe',
        year: '2018',
        abstract:
          'In a consortium with TU Berlin, I contributed to the IMPACT project that was proposed for the Research and Innovation action (CALL – ICT 25-2018). The project aim was to go beyond current state-of-the-art of multi-user interactive technology by providing a programme for research on increasing motivation for a healthy and active lifestyle with innovative immersive virtual reality technology. IMPACT will integrate personalised motivation and virtual reality by designing feedback mechanisms using various sensor technologies in three distinct areas: Fitness, elder care and environmental social awareness.',
        images: [
          '/research/proposal 1 (1).jpg',
          '/research/proposal 1 (2).jpg'
        ]
      },
      {
        id: 'idn4cci',
        title: 'IDN4CCI',
        fundingType: 'Horizon Europe',
        year: '2021',
        abstract:
          'Working in a consortium of nine partners from around europe, I contributed to this proposal that addressed the Research & Innovation Action CL2-2021-HERITAGE-01-03 in Culture and Creative Industries (CCI). IDN4CCI was to create evidence of and develop solutions to support the innovation potential and competitiveness of the CCIs in Europe. Building computational systems for representations of everyday real-world narratives that may offer competitive perspectives, choices of action, and the possibility to view resulting consequences. This direction corresponded with the state-of-the-art research in Interactive Digital Narratives (IDN) that focused on representing complexity in phenomena such as global climate change and the covid-19.',
        images: [
          '/research/proposal 2 (1).webp',
          '/research/proposal 2 (2).webp',
          '/research/proposal 2 (3).webp',
          '/research/proposal 2 (4).webp'
        ]
      },
      {
        id: 'metastory',
        title: 'METASTORY',
        fundingType: 'MARIE Skłodowska-Curie Actions',
        year: '2024',
        abstract:
          'Contributed as a Creative Consultant to the METASTORIES project, which was proposed to fund 14 Doctoral Candidates (DCs) with state-of-the-art research training in investigating, analysing and designing community storytelling engagement processes, developing novel storytelling tools, and testing narrative co-creation practices that could contribute to transformative resilience. Such an understanding of resilience in which the system ‘bounces forward’, that is, recovery leads also to new possibilities after a crisis. Polycrises are entanglements of multiple, interconnected and overlapping crises.' 
      },
    ]
  }
]

const detailBodySpacing = '1px'

const normalizeLinks = (item) => {
  if (!item) return []
  if (Array.isArray(item.links)) {
    return item.links
      .map((link, index) => {
        const href = typeof link === 'string' ? link : link.href
        return href ? { label: `${index + 1}`, href } : null
      })
      .filter(Boolean)
  }
  if (item.link) return [{ label: '1', href: item.link }]
  return []
}

const formatVenueYear = (venue, year) => {
  if (venue && year) return `${venue} _ ${year}`
  return venue || year || ''
}

const formatFundingYear = (fundingType, year) => {
  if (fundingType && year) return `${fundingType} _ ${year}`
  return fundingType || year || ''
}

const metaForItem = (categoryId, item) => {
  if (!item) return { left: '', right: '' }
  if (categoryId === 'publications') {
    return {
      left: formatVenueYear(item.venue, item.year),
      right: normalizeLinks(item)
    }
  }
  if (categoryId === 'studies') {
    return {
      left: item.experiment || item.title || 'Experiment',
      right: item.year || ''
    }
  }
  if (categoryId === 'projects') {
    return {
      left: formatFundingYear(item.fundingType, item.year),
      right: normalizeLinks(item)
    }
  }
  if (categoryId === 'proposals') {
    return {
      left: item.description || item.fundingType || '',
      right: item.year || ''
    }
  }
  return { left: '', right: '' }
}

export default function ReflectResearchPage() {
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
  const [glowDelaySeconds, setGlowDelaySeconds] = useState(0)
  const [activeCategoryId, setActiveCategoryId] = useState('publications')
  const [activeIndexByCategory, setActiveIndexByCategory] = useState(() => (
    Object.fromEntries(categories.map((category) => [category.id, 0]))
  ))
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedImage, setExpandedImage] = useState(null)
  const mobileTextCardRef = useRef(null)
  const mobileImagesRef = useRef(null)
  const mobileNavRef = useRef(null)
  const [mobileCardMaxHeight, setMobileCardMaxHeight] = useState(null)
  const [mobileNavTop, setMobileNavTop] = useState(null)
  const swipeStartRef = useRef(null)
  const mobileMenuTimerRef = useRef(null)
  useEffect(() => setHydrated(true), [])
  useEffect(() => {
    const { delaySeconds } = syncGlowOffset()
    setGlowDelaySeconds(delaySeconds)
  }, [])
  const navigateWithFade = (path, { preserveHomeLayout = true } = {}) => {
    const target = path.startsWith('/') ? path : `/${path}`
    setMobileMenuOpen(false)
    if (typeof window !== 'undefined') {
      if (target === '/' && !preserveHomeLayout) {
        clearHomeLayout()
      }
    }
    window.location.href = target
  }
  const handleBack = () => {
    navigateWithFade('/reflect')
  }

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

  const glowFilter = 'hue-rotate(calc(var(--glow-rotation) + var(--glow-offset)))'

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

  const activeCategory = categories.find((category) => category.id === activeCategoryId) || categories[0]
  const activeIndex = activeIndexByCategory[activeCategory.id] || 0
  const activeItem = activeCategory.items[activeIndex]
  const metaItems = metaForItem(activeCategory.id, activeItem)
  const showExpanded = isMobile || isExpanded
  const hasImages = showExpanded && Array.isArray(activeItem?.images) && activeItem.images.length > 0
  const totalItems = activeCategory.items.length
  const currentItemIndex = activeIndex + 1
  const mobileImagesGap = hasImages ? 14 : 0
  const mobileNavGap = hasImages ? 10 : 14
  const mobileThumbHeight = isMobile ? 82 : 110
  const inlineStudyLabels = new Set(['Design', 'Task', 'Hardware', 'Software', 'Input'])
  const renderLinkCluster = (links) => {
    if (!links?.length) return ''
    return (
      <span>
        LINK{' '}
        {links.map((link, linkIndex) => (
          <a
            key={`link-${link.label}`}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: '#000', marginLeft: linkIndex === 0 ? '0' : '6px' }}
          >
            {link.label}
          </a>
        ))}
      </span>
    )
  }
  const renderStudyBody = (detail) => (
    <div style={{ marginTop: detail.bodySpacing ?? detailBodySpacing, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {detail.body.map((line, index) => {
        if (typeof line === 'string') {
          return <div key={`${detail.label}-${index}`}>{line}</div>
        }
        const label = line.label ? String(line.label) : ''
        const text = line.text ? String(line.text) : ''
        const trimmedText = text.trim()
        const isSubheading = label && !trimmedText

        if (isSubheading) {
          return (
            <div
              key={`${detail.label}-${index}`}
              style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              {label}
            </div>
          )
        }

        if (label && inlineStudyLabels.has(label)) {
          return (
            <div key={`${detail.label}-${index}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>{label}</span>
              <span>{trimmedText}</span>
            </div>
          )
        }

        let bulletLabel = label
        let bulletText = trimmedText
        if (!label && trimmedText.includes(':')) {
          const [lead, rest] = trimmedText.split(/:(.+)/)
          bulletLabel = lead
          bulletText = rest ? rest.trim() : ''
        }

        return (
          <div key={`${detail.label}-${index}`} style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <span style={{ fontSize: '10px', lineHeight: '20px' }}>•</span>
            <span>
              {bulletLabel ? <span style={{ fontWeight: 600 }}>{bulletLabel}{bulletText ? ':' : ''} </span> : null}
              {bulletText}
            </span>
          </div>
        )
      })}
    </div>
  )

  const selectCategory = (id) => {
    setActiveCategoryId(id)
  }

  const moveItem = (delta) => {
    setActiveIndexByCategory((prev) => {
      const total = activeCategory.items.length
      const current = prev[activeCategory.id] || 0
      const nextIndex = (current + delta + total) % total
      return { ...prev, [activeCategory.id]: nextIndex }
    })
  }

  const moveToCategoryStart = (categoryId) => {
    setActiveCategoryId(categoryId)
    setActiveIndexByCategory((prev) => ({ ...prev, [categoryId]: 0 }))
  }

  const handleSwipeNext = () => {
    const total = activeCategory.items.length
    if (activeIndex < total - 1) {
      moveItem(1)
      return
    }
    const currentCategoryIndex = categories.findIndex((category) => category.id === activeCategoryId)
    if (currentCategoryIndex !== -1 && currentCategoryIndex < categories.length - 1) {
      const nextCategoryId = categories[currentCategoryIndex + 1].id
      moveToCategoryStart(nextCategoryId)
    }
  }

  const handleSwipePrev = () => {
    if (activeIndex > 0) {
      moveItem(-1)
      return
    }
    const currentCategoryIndex = categories.findIndex((category) => category.id === activeCategoryId)
    const previousCategoryIndex = currentCategoryIndex > 0 ? currentCategoryIndex - 1 : categories.length - 1
    const previousCategoryId = categories[previousCategoryIndex]?.id
    if (!previousCategoryId) return
    const previousCategoryItems = categories[previousCategoryIndex].items || []
    const lastIndex = Math.max(0, previousCategoryItems.length - 1)
    setActiveCategoryId(previousCategoryId)
    setActiveIndexByCategory((prev) => ({ ...prev, [previousCategoryId]: lastIndex }))
  }

  const handleSwipeStart = (event) => {
    if (!isMobile) return
    if (!event.touches || event.touches.length !== 1) return
    const touch = event.touches[0]
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleSwipeEnd = (event) => {
    if (!isMobile || !swipeStartRef.current) return
    if (!event.changedTouches || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - swipeStartRef.current.x
    const dy = touch.clientY - swipeStartRef.current.y
    swipeStartRef.current = null
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) {
      handleSwipeNext()
    } else {
      handleSwipePrev()
    }
  }

  useEffect(() => {
    if (!isMobile) {
      setMobileCardMaxHeight(null)
      return undefined
    }
    const updateCardHeight = () => {
      if (!mobileTextCardRef.current) return
      const cardRect = mobileTextCardRef.current.getBoundingClientRect()
      const imagesHeight = mobileImagesRef.current
        ? mobileImagesRef.current.getBoundingClientRect().height
        : 0
      const navHeight = mobileNavRef.current
        ? mobileNavRef.current.getBoundingClientRect().height
        : 0
      const bottomLine = document.querySelector('[data-mobile-chrome-bottom-line]')
      const bottomBoundary = bottomLine ? bottomLine.getBoundingClientRect().top : window.innerHeight - 96
      const available = bottomBoundary - cardRect.top - imagesHeight - navHeight - mobileImagesGap - mobileNavGap - 6
      const nextHeight = Math.max(160, Math.floor(available))
      setMobileCardMaxHeight(nextHeight)
      if (navHeight) {
        const nextNavTop = Math.max(0, Math.floor(bottomBoundary - navHeight - 6))
        setMobileNavTop(nextNavTop)
      }
    }
    const frame = requestAnimationFrame(updateCardHeight)
    window.addEventListener('resize', updateCardHeight)
    const timer = setTimeout(updateCardHeight, 200)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateCardHeight)
      clearTimeout(timer)
    }
  }, [isMobile, activeCategoryId, activeIndex, hasImages, mobileImagesGap, mobileNavGap])

  return (
    <div
      style={{
        backgroundColor: '#FFFDF3',
        position: 'fixed',
        inset: 0,
        overflow: isMobile ? 'hidden' : 'auto',
        overflowX: 'hidden',
        animation: 'glowHue 60s linear infinite',
        animationDelay: `-${glowDelaySeconds}s`,
        opacity: pageOpacity,
        transition: 'opacity 0.6s ease',
        padding: isMobile ? '120px 20px 160px' : 0
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
            label="RESEARCH"
            labelTop={175}
            onBack={handleBack}
            onShuffle={() => navigateWithFade('/', { preserveHomeLayout: false })}
          />

          <div
            style={{
              position: 'fixed',
              top: 40,
              left: 100,
              zIndex: 6,
              display: 'flex',
              gap: '14px',
              fontFamily: 'var(--font-karla)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {categories.slice(0, 4).map((category, idx) => {
              const isActive = category.id === activeCategoryId
              return (
                <button
                  key={`research-index-${category.id}`}
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
            activeSubcategory="research"
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
          onSecondaryAction={() => navigateWithFade('/', { preserveHomeLayout: false })}
          secondaryIcon="shuffle"
          onBack={handleBack}
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
          position: 'relative',
          zIndex: 1,
          padding: isMobile ? '0' : '140px 240px 120px 140px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '180px minmax(420px, 1fr)',
          gap: isMobile ? '24px' : '100px',
          alignItems: 'start'
        }}
      >
        <div style={{ position: 'relative', width: isMobile ? '100%' : '180px' }}>
          <div
            style={{
              position: isMobile ? 'fixed' : 'fixed',
              left: isMobile ? 20 : '140px',
              right: isMobile ? 20 : 'auto',
              top: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 60px)' : '380px',
              zIndex: isMobile ? 82 : 'auto',
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? '18px' : '8px',
              fontFamily: 'var(--font-karla)',
              fontSize: isMobile ? '16px' : '24px',
              color: '#000'
            }}
          >
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId
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

        <div style={{ position: 'relative', maxWidth: isMobile ? '100%' : '720px', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', fontFamily: 'var(--font-karla)', color: '#000', marginTop: isMobile ? '8px' : '60px', marginLeft: isMobile ? 0 : '250px' }}>
          {!isMobile && activeCategory.id === 'studies' && hasImages && showExpanded && (
            <div
              style={{
                position: 'absolute',
                left: '-250px',
                top: '500px',
                display: 'grid',
                gridTemplateColumns: '66px 66px',
                gridTemplateRows: '66px 66px',
                gap: '6px'
              }}
            >
              {activeItem.images.slice(0, 4).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setExpandedImage(src)}
                  aria-label="Enlarge image"
                  style={{
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'zoom-in',
                    width: '66px',
                    height: '66px'
                  }}
                >
                  <img
                    src={src}
                    alt={`${activeItem?.title || 'Research item'} image`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      display: 'block'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
                <div
                  ref={mobileTextCardRef}
                  style={{
                    background: isMobile ? '#F2F2F2' : 'transparent',
                    borderRadius: isMobile ? '16px' : 0,
                    padding: isMobile ? '16px 14px' : 0,
                    boxSizing: 'border-box',
                    width: '100%',
                    maxWidth: '100%',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    maxHeight: isMobile && mobileCardMaxHeight ? `${mobileCardMaxHeight}px` : 'none',
                    overflowY: isMobile ? 'auto' : 'visible',
                    paddingRight: isMobile ? '10px' : undefined
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
                    letterSpacing: '0.08em',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>{metaItems.left}</div>
                  <div style={{ textAlign: 'right' }}>
                    {Array.isArray(metaItems.right) ? renderLinkCluster(metaItems.right) : metaItems.right}
                  </div>
                </div>

                <div style={{ height: '1px', background: '#000', opacity: 0.35 }} />
                <div style={{ marginTop: '16px', fontSize: '28px', fontWeight: 300, lineHeight: 1.3 }}>
                  {activeItem?.title}
                </div>
                {showExpanded ? (
                  <div style={{ marginTop: '18px', fontSize: '13px', lineHeight: 1.55, maxWidth: activeCategory.id === 'studies' && !isMobile ? 'none' : '600px' }}>
                    {activeItem?.details?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {activeItem.details.map((detail) => (
                          <div key={detail.label}>
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em'
                              }}
                            >
                              {detail.label}
                            </div>
                            {Array.isArray(detail.body)
                              ? (activeCategory.id === 'studies' ? renderStudyBody(detail) : (
                                <div style={{ marginTop: detail.bodySpacing ?? detailBodySpacing, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {detail.body.map((line, index) => {
                                    if (typeof line === 'string') {
                                      return <div key={`${detail.label}-${index}`}>{line}</div>
                                    }
                                    const labelWeight = line.weight ?? 600
                                    const lineStyle = line.indent ? { marginLeft: line.indent } : undefined
                                    return (
                                      <div key={`${detail.label}-${index}`} style={{ display: 'flex', gap: '6px', ...lineStyle }}>
                                        {line.label ? (
                                          <span style={{ fontWeight: labelWeight }}>{line.label}{line.text ? ':' : ''}</span>
                                        ) : null}
                                        {line.text ? <span>{line.text}</span> : null}
                                      </div>
                                    )
                                  })}
                                </div>
                              ))
                              : (
                                <div style={{ marginTop: detail.bodySpacing ?? detailBodySpacing }}>{detail.body}</div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ whiteSpace: 'pre-line' }}>{activeItem?.abstract}</div>
                    )}
                  </div>
                ) : null}
                {!isMobile && (
                  <div style={{ position: 'relative', marginTop: '18px' }}>
                    <div style={{ height: '1px', background: '#000', opacity: 0.35 }} />
                    <button
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '-20px',
                        background: 'transparent',
                        border: 'none',
                        fontFamily: 'var(--font-karla)',
                        fontSize: '12px', fontWeight: 500,
                        textTransform: 'lowercase',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
                    >
                      {isExpanded ? 'less' : 'more'}
                    </button>
                  </div>
                )}
              </div>

              {hasImages && (isMobile || !(activeCategory.id === 'studies' && showExpanded)) && (
                <div
                  ref={mobileImagesRef}
                  style={{
                    marginTop: `${mobileImagesGap}px`,
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(90px, 1fr))' : 'repeat(auto-fill, 110px)',
                    gap: '10px',
                    maxWidth: '100%',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {activeItem.images.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setExpandedImage(src)}
                      aria-label="Enlarge image"
                      style={{
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'zoom-in',
                        width: '110px',
                        height: '110px'
                      }}
                    >
                      <img
                        src={src}
                        alt={`${activeItem?.title || 'Research item'} image`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          display: 'block'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

              <div
                ref={mobileNavRef}
                style={isMobile ? {
                position: 'fixed',
                left: 20,
                right: 20,
                top: mobileNavTop ?? 'auto',
                zIndex: 82,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                columnGap: '12px',
                opacity: mobileNavTop === null ? 0 : 1
              } : {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: `${mobileNavGap}px`
              }}
            >
              <button
                type="button"
                onClick={handleSwipePrev}
                aria-label="Previous item"
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
              <div style={{ fontSize: '14px', fontWeight: 500, justifySelf: 'center' }}>
                {currentItemIndex} / {totalItems}
              </div>
              <button
                type="button"
                onClick={handleSwipeNext}
                aria-label="Next item"
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
      </div>

      {readingMode && !isMobile && (
        <>
          <div
            className="fixed left-30 top-110 max-w-sm"
            style={{
              zIndex: 40,
              fontFamily: 'var(--font-karla)',
              fontSize: '36px',
              fontWeight: 200,
              lineHeight: '38px',
              maxWidth: '380px',
              color: '#000'
            }}
          >
            Research highlights shift between publications, studies, projects, and proposals.
          </div>
          <div
            className="fixed"
            style={{
              zIndex: 40,
              fontFamily: 'var(--font-karla)',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '16px',
              color: '#000',
              top: 120,
              right: 300,
              maxWidth: 250
            }}
          >
            Use the arrows to browse items inside each category. Select more to expand the abstract and less to
            collapse the view.
          </div>
        </>
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
            Research highlights shift between publications, studies, projects, and proposals.
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', lineHeight: '16px' }}>
            Use the arrows to browse items, then select more to expand the abstract and less to collapse the view.
          </div>
        </div>
      )}

      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          role="button"
          tabIndex={0}
          aria-label="Close image"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            cursor: 'zoom-out'
          }}
        >
          <img
            src={expandedImage}
            alt="Expanded research"
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              background: '#fffdf3',
              border: '1px solid rgba(0,0,0,0.2)'
            }}
          />
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
