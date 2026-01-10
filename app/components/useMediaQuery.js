'use client'

import { useEffect, useState } from 'react'

const getMatch = (query) => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(getMatch(query))

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = () => setMatches(media.matches)

    handler()

    if (media.addEventListener) {
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }

    media.addListener(handler)
    return () => media.removeListener(handler)
  }, [query])

  return matches
}
