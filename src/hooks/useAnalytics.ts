import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

// Generate / retrieve session ID
function getSessionId(): string {
  let sid = localStorage.getItem('abadal_session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('abadal_session_id', sid)
  }
  return sid
}

function getDeviceType(): 'MOBILE' | 'DESKTOP' | 'TABLET' {
  const ua = navigator.userAgent
  if (/Mobi|Android|iPhone/i.test(ua)) return 'MOBILE'
  if (/Tablet|iPad/i.test(ua)) return 'TABLET'
  return 'DESKTOP'
}

interface EventInput {
  eventType: 'PAGE_VIEW' | 'BOOK_CLICK' | 'WHATSAPP_CLICK' | 'AMAZON_CLICK' | 'ADD_TO_CART' | 'CHECKOUT_STARTED' | 'CHECKOUT_ABANDONED' | 'ORDER_PLACED'
  productId?: string
  metadata?: any
}

const queue: any[] = []
let flushTimer: any = null

function enqueue(event: any) {
  queue.push(event)
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 5000)
  }
  if (queue.length >= 10) flush()
}

function flush() {
  if (queue.length === 0) return
  const events = queue.splice(0, queue.length)
  analyticsApi.trackEvent(events)
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
}

// Flush on page unload via beacon
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flush)
  window.addEventListener('pagehide', flush)
}

export function trackEvent(input: EventInput) {
  const userId = useAuthStore.getState().user?.id
  enqueue({
    ...input,
    sessionId: getSessionId(),
    userId: userId || null,
    pageUrl: window.location.pathname,
    referrer: document.referrer || null,
    deviceType: getDeviceType(),
  })
}

// Hook: track page views automatically
export function usePageViewTracking() {
  const location = useLocation()
  const last = useRef<string>('')
  useEffect(() => {
    if (last.current !== location.pathname) {
      last.current = location.pathname
      trackEvent({ eventType: 'PAGE_VIEW' })
    }
  }, [location.pathname])
}

// Hook: heartbeat for live visitors
export function useHeartbeat() {
  useEffect(() => {
    const ping = () => {
      enqueue({
        eventType: 'PAGE_VIEW',
        sessionId: getSessionId(),
        userId: useAuthStore.getState().user?.id || null,
        pageUrl: '__heartbeat',
        deviceType: getDeviceType(),
      })
    }
    const id = setInterval(ping, 60_000) // every 60s
    return () => clearInterval(id)
  }, [])
}
