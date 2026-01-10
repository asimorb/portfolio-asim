'use client'

import { useEffect } from 'react'

export default function SpeculationsRedirect() {
  useEffect(() => {
    window.location.replace('/view/speculations')
  }, [])
  return null
}
