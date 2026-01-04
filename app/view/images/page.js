'use client'

import { useEffect, useRef, useState } from 'react'
import { LeftPanelTransform, RightPanelTransform, TopBarTransform } from '../../components/TransformChrome'

const imageSources = [
  '/images/371749358_289630013671292_2466097030904749651_n.webp',
  '/images/384981770_683683060352234_4413244782872588118_n.jpg',
  '/images/386292964_211715758447778_4532789484214094034_n.webp',
  '/images/387654589_1361403971136519_1082641810216163238_n.webp',
  '/images/387754971_1000701577832543_5268939056513724910_n.webp',
  '/images/399490738_1470490823743584_6967024710797015065_n.jpg',
  '/images/403978265_1403645840222055_7301381008313233776_n.jpg',
  '/images/404582861_876608080658889_4286479186717736489_n.jpg',
  '/images/407675213_942251743897642_5391338937419072859_n.jpg',
  '/images/416496739_7041753155871030_3286598510485716221_n.webp',
  '/images/418842124_1457260744857570_3401058850013091319_n.webp',
  '/images/419517085_364339482873116_6107935631066582795_n.webp',
  '/images/420180970_913660306797241_5897154935938359175_n.webp',
  '/images/443006287_1645457809589572_8784217467058990149_n.webp',
  '/images/447085157_1154743122397708_4327173821893398855_n.webp',
  '/images/464565856_908997670728349_2979984302467886725_n.webp',
  '/images/465040286_1915107298983578_1303289975305086555_n.webp',
  '/images/465055897_475308264878760_1166239381267672832_n.webp',
  '/images/465893200_1368136494367016_1134532012312402509_n.webp',
  '/images/INSTA __002.jpg',
  '/images/INSTA __006.jpg',
  '/images/INSTA __007.jpg',
  '/images/INSTA __008.jpg',
  '/images/INSTA __011.jpg',
  '/images/INSTA __014.jpg',
  '/images/INSTA __016.jpg',
  '/images/INSTA __017.jpg',
  '/images/INSTA __018.jpg',
  '/images/INSTA __020.jpg',
  '/images/INSTA __021.jpg',
  '/images/INSTA __022.jpg',
  '/images/INSTA __023.jpg',
  '/images/INSTA __024.jpg',
  '/images/INSTA __025.jpg',
  '/images/INSTA __026.jpg',
  '/images/INSTA __028.jpg',
  '/images/INSTA __029.jpg',
  '/images/INSTA __030.jpg',
  '/images/INSTA __031.jpg',
  '/images/INSTA __032.jpg',
  '/images/INSTA __033.jpg',
  '/images/INSTA __034.jpg',
  '/images/INSTA __035.jpg',
  '/images/INSTA __038.jpg',
  '/images/INSTA __039.jpg',
  '/images/INSTA __04.jpg',
  '/images/INSTA __040.jpg',
  '/images/INSTA __042.jpg',
  '/images/INSTA __043.jpg',
  '/images/INSTA __044.jpg',
  '/images/INSTA __045.jpg',
  '/images/INSTA __046.jpg',
  '/images/INSTA __047.jpg',
  '/images/INSTA __048.jpg',
  '/images/INSTA __051.jpg',
  '/images/INSTA __052.jpg',
  '/images/INSTA __053.jpg',
  '/images/INSTA __054.jpg',
  '/images/INSTA __056.jpg',
  '/images/INSTA __057.jpg',
  '/images/INSTA __059.jpg',
  '/images/INSTA __060.jpg',
  '/images/INSTA __061.jpg',
  '/images/INSTA __063.jpg',
  '/images/INSTA __065.jpg',
  '/images/INSTA __066.jpg',
  '/images/INSTA __067.jpg',
  '/images/INSTA __068.jpg',
  '/images/INSTA __069.jpg',
  '/images/INSTA __070.jpg',
  '/images/INSTA __071.jpg',
  '/images/INSTA __072.jpg',
  '/images/INSTA __073.jpg',
  '/images/INSTA __074.jpg',
  '/images/INSTA __076.jpg',
  '/images/INSTA __077.jpg',
  '/images/INSTA __081.jpg',
  '/images/INSTA __082.jpg',
  '/images/INSTA __083.jpg',
  '/images/INSTA __085.jpg',
  '/images/INSTA __087.jpg',
  '/images/INSTA __088.jpg',
  '/images/INSTA __089.jpg',
  '/images/INSTA __090.jpg',
  '/images/INSTA __091.jpg',
  '/images/INSTA __092.jpg',
  '/images/INSTA __093.jpg',
  '/images/INSTA __094.jpg',
  '/images/INSTA __095.jpg',
  '/images/INSTA __096.jpg',
  '/images/INSTA __097.jpg',
  '/images/INSTA __099.jpg',
  '/images/INSTA __100.jpg',
  '/images/INSTA __102.jpg',
  '/images/INSTA __103.jpg',
  '/images/INSTA __105.jpg',
  '/images/INSTA __106.jpg',
  '/images/INSTA __107.jpg',
  '/images/INSTA __109.jpg',
  '/images/INSTA __110.jpg',
  '/images/INSTA __23.jpg',
  '/images/INSTA __24.jpg',
  '/images/INSTA __25.jpg',
  '/images/INSTA __26.jpg',
  '/images/INSTA __27.jpg',
  '/images/INSTA __29.jpg',
  '/images/INSTA __30.jpg',
  '/images/INSTA __31.jpg',
  '/images/INSTA __32.jpg',
  '/images/INSTA __33.jpg',
  '/images/INSTA __34.jpg',
  '/images/INSTA __35.jpg',
  '/images/INSTA __37.jpg',
  '/images/INSTA __38.jpg',
  '/images/INSTA __39.jpg',
  '/images/INSTA __40.jpg',
  '/images/INSTA __41.jpg',
  '/images/INSTA __42.jpg',
  '/images/INSTA __44.jpg',
  '/images/INSTA __48.jpg',
  '/images/INSTA __51.jpg',
  '/images/INSTA __54.jpg',
  '/images/INSTA __56.jpg',
  '/images/INSTA __59.jpg',
  '/images/INSTA __60.jpg',
  '/images/INSTA __61.jpg',
]

const toLabel = (src) => {
  const file = src.split('/').pop() || ''
  return file.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ')
}

const safeInsets = { top: 90, right: 180, bottom: 0, left: 90 }

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getBoundsForItem = (w, h, itemWidth, itemHeight) => {
  const minX = safeInsets.left
  const maxX = Math.max(minX, w - safeInsets.right - itemWidth)
  const minY = safeInsets.top
  const maxY = Math.max(minY, h - safeInsets.bottom - itemHeight)
  return { minX, maxX, minY, maxY }
}

const randomPos = (w, h, itemWidth, itemHeight) => {
  const bounds = getBoundsForItem(w, h, itemWidth, itemHeight)
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
  }
}

export default function ViewImages() {
  const [items, setItems] = useState([])
  const [zCounter, setZCounter] = useState(10)
  const [overlay, setOverlay] = useState(null)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [readingMode, setReadingMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)
  const draggingRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragFrameRef = useRef(null)
  const dragPendingRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const { clientWidth: w, clientHeight: h } = containerRef.current
    const seeded = imageSources.map((src, idx) => {
      const size = (220 + Math.random() * 160) * 0.35 * 1.25
      const height = size
      const pos = randomPos(w, h, size, height)
      const bounds = getBoundsForItem(w, h, size, height)
      const x = clamp(pos.x, bounds.minX, bounds.maxX)
      const y = clamp(pos.y, bounds.minY, bounds.maxY)
      return {
        id: `img-${idx + 1}`,
        src,
        alt: toLabel(src),
        aspectRatio: 1,
        x,
        y,
        width: size,
        z: idx + 1
      }
    })
    setItems(seeded)
    setZCounter(seeded.length + 5)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadImages = async () => {
      const entries = await Promise.all(imageSources.map(async (src) => {
        if (typeof createImageBitmap === 'function') {
          try {
            const response = await fetch(src)
            if (!response.ok) throw new Error('Failed to load image')
            const blob = await response.blob()
            const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' })
            const ratio = bitmap.width && bitmap.height ? bitmap.width / bitmap.height : 1
            if (typeof bitmap.close === 'function') bitmap.close()
            return { src, ratio }
          } catch (error) {
            // Fall through to Image() loader
          }
        }
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1
            resolve({ src, ratio })
          }
          img.onerror = () => resolve({ src, ratio: 1 })
          img.src = src
        })
      }))
      if (cancelled) return
      const ratioMap = new Map(entries.map((entry) => [entry.src, entry.ratio]))
      setItems((prev) => prev.map((it) => {
        const ratio = ratioMap.get(it.src)
        if (!ratio) return it
        const safeRatio = ratio || 1
        if (!containerRef.current) {
          return { ...it, aspectRatio: safeRatio }
        }
        const bounds = containerRef.current.getBoundingClientRect()
        const height = it.width / safeRatio
        const clampBounds = getBoundsForItem(bounds.width, bounds.height, it.width, height)
        return {
          ...it,
          aspectRatio: safeRatio,
          x: clamp(it.x, clampBounds.minX, clampBounds.maxX),
          y: clamp(it.y, clampBounds.minY, clampBounds.maxY)
        }
      }))
    }
    loadImages()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!overlay) return
    const match = items.find((it) => it.id === overlay.id)
    if (match && (match.aspectRatio !== overlay.aspectRatio || match.src !== overlay.src)) {
      setOverlay(match)
    }
  }, [items, overlay])

  const bringToFront = (id) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, z: zCounter } : it)))
    setZCounter((z) => z + 1)
  }

  const handleMouseDown = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    bringToFront(id)
    const rect = e.currentTarget.getBoundingClientRect()
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    draggingRef.current = id
  }

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return
    dragPendingRef.current = { x: e.clientX, y: e.clientY }
    if (dragFrameRef.current) return
    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null
      if (!draggingRef.current || !dragPendingRef.current || !containerRef.current) return
      const id = draggingRef.current
      const bounds = containerRef.current.getBoundingClientRect()
      const x = dragPendingRef.current.x - bounds.left - offsetRef.current.x
      const y = dragPendingRef.current.y - bounds.top - offsetRef.current.y
      setItems((prev) => {
        const idx = prev.findIndex((it) => it.id === id)
        if (idx === -1) return prev
        const target = prev[idx]
        const height = target.width / (target.aspectRatio || 1)
        const clampBounds = getBoundsForItem(bounds.width, bounds.height, target.width, height)
        const nextX = clamp(x, clampBounds.minX, clampBounds.maxX)
        const nextY = clamp(y, clampBounds.minY, clampBounds.maxY)
        if (nextX === target.x && nextY === target.y) return prev
        const next = prev.slice()
        next[idx] = { ...target, x: nextX, y: nextY }
        return next
      })
    })
  }

  const handleMouseUp = () => {
    draggingRef.current = null
    dragPendingRef.current = null
  }

  const handleDoubleClick = (item) => {
    bringToFront(item.id)
    setOverlay(item)
    requestAnimationFrame(() => setOverlayVisible(true))
  }

  const closeOverlay = () => {
    setOverlayVisible(false)
    setTimeout(() => setOverlay(null), 280)
  }

  const showTooltip = (text, event, placement = 'top') => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (placement === 'right') {
      setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2, placement })
    } else {
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 10, placement })
    }
  }
  const hideTooltip = () => setTooltip(null)

  const categories = [
    { name: 'view', subcategories: ['speculations', 'images'] },
    { name: 'make', subcategories: ['spaces', 'things'] },
    { name: 'reflect', subcategories: ['research', 'teaching'] },
    { name: 'connect', subcategories: ['curriculum vitae', 'about me'] }
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FFFDF3',
        overflow: 'hidden',
        fontFamily: 'var(--font-karla)'
      }}
    >
      <TopBarTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        readingMode={readingMode}
        analyticsText="IMAGES OVERVIEW"
        glowFilter="none"
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        activePage="view"
      />

      <LeftPanelTransform
        readingMode={readingMode}
        toggleReadingMode={() => setReadingMode((prev) => !prev)}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        label="IMAGES"
        labelTop={135}
      />

      <RightPanelTransform
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        expandedCategory={expandedCategory}
        setExpandedCategory={setExpandedCategory}
        readingMode={readingMode}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        glowFilter="none"
        activePage="view"
        activeSubcategory="images"
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
        >
          {tooltip.text}
        </div>
      )}

      {items.map((item) => {
        const height = item.width / (item.aspectRatio || 1)
        return (
          <div
            key={item.id}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onDoubleClick={() => handleDoubleClick(item)}
            onClick={(e) => { e.stopPropagation(); bringToFront(item.id) }}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              width: item.width,
              height,
              background: '#fffdf3',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              cursor: 'grab',
              zIndex: item.z,
              userSelect: 'none',
              transition: 'box-shadow 0.2s ease',
              overflow: 'hidden'
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              draggable={false}
              style={{
                width: '100%',
                height,
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        )
      })}

      {overlay && (
        <div
          onClick={closeOverlay}
          style={{
            position: 'fixed',
            inset: 0,
            background: overlayVisible ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'background 260ms ease'
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              background: '#fffdf3',
              borderRadius: '10px',
              border: '2px solid rgba(0,0,0,0.25)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              opacity: overlayVisible ? 1 : 0,
              transform: overlayVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 260ms ease, transform 260ms ease',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={overlay.src}
              alt={overlay.alt}
              draggable={false}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '80vw',
                maxHeight: '80vh',
                display: 'block',
                background: '#fffdf3'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
