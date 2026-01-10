'use client'

const NAV_STACK_KEY = 'navStack'
const HOME_LAYOUT_KEY = 'homeLayout'

const normalizePath = (path) => {
  if (!path) return '/'
  const withoutQuery = path.split(/[?#]/)[0] || '/'
  const cleaned = withoutQuery.replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
}

export const loadHomeLayout = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(HOME_LAYOUT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('Failed to load home layout from sessionStorage', err)
    return null
  }
}

export const persistHomeLayout = (layout) => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(HOME_LAYOUT_KEY, JSON.stringify(layout))
  } catch (err) {
    console.warn('Failed to persist home layout to sessionStorage', err)
  }
}

export const clearHomeLayout = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(HOME_LAYOUT_KEY)
  } catch (err) {
    console.warn('Failed to clear home layout', err)
  }
}

export const pushNavStack = (path) => {
  if (typeof window === 'undefined') return
  try {
    const stack = JSON.parse(window.sessionStorage.getItem(NAV_STACK_KEY) || '[]')
    const next = normalizePath(path)
    if (!stack.length || normalizePath(stack[stack.length - 1]) !== next) {
      stack.push(next)
      if (stack.length > 50) stack.shift()
      window.sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack))
    }
  } catch (err) {
    console.warn('Failed to push nav stack', err)
  }
}

export const popNavStack = () => {
  if (typeof window === 'undefined') return '/'
  try {
    let stack = JSON.parse(window.sessionStorage.getItem(NAV_STACK_KEY) || '[]')
    const current = normalizePath(window.location.pathname + window.location.search)
    while (stack.length && normalizePath(stack[stack.length - 1]) === current) {
      stack.pop()
    }
    const target = normalizePath(stack.pop()) || '/'
    window.sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack))
    return target
  } catch (err) {
    console.warn('Failed to pop nav stack', err)
    return '/'
  }
}

export const getNavStackLength = () => {
  if (typeof window === 'undefined') return 0
  try {
    const stack = JSON.parse(window.sessionStorage.getItem(NAV_STACK_KEY) || '[]')
    return Array.isArray(stack) ? stack.length : 0
  } catch (err) {
    console.warn('Failed to read nav stack length', err)
    return 0
  }
}
