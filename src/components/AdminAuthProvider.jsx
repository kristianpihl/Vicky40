import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

const STORAGE_KEY = 'vickie-admin'
const LOGOUT_REASON_KEY = 'vickie-admin-logout-reason'

// --- Auto-logout timers (tweak here) ---
const ADMIN_IDLE_MINUTES = 30 // sign out after this long with no activity
const ADMIN_MAX_HOURS = 12 // sign out this long after logging in, regardless
const IDLE_MS = ADMIN_IDLE_MINUTES * 60 * 1000
const MAX_MS = ADMIN_MAX_HOURS * 60 * 60 * 1000
const CHECK_EVERY_MS = 30 * 1000 // how often we check the timers
const ACTIVITY_THROTTLE_MS = 20 * 1000 // don't rewrite "last active" more often than this

const AUTO_LOGOUT_MESSAGE =
  'You were signed out automatically for security. Please log in again.'

const AdminAuthContext = createContext(null)

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.email && parsed.password) return parsed
    return null
  } catch {
    return null
  }
}

function writeStored(creds) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
  } catch {
    /* ignore */
  }
}

function isExpired(creds) {
  if (!creds) return true
  const now = Date.now()
  if (creds.loginAt && now - creds.loginAt > MAX_MS) return true
  if (creds.lastActiveAt && now - creds.lastActiveAt > IDLE_MS) return true
  return false
}

// Read (and clear) the "you were signed out" message, for the login screen.
export function takeLogoutReason() {
  try {
    const r = sessionStorage.getItem(LOGOUT_REASON_KEY)
    if (r) sessionStorage.removeItem(LOGOUT_REASON_KEY)
    return r || ''
  } catch {
    return ''
  }
}

export function AdminAuthProvider({ children }) {
  const [creds, setCreds] = useState(() => {
    const c = readStored()
    if (c && isExpired(c)) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.setItem(LOGOUT_REASON_KEY, AUTO_LOGOUT_MESSAGE)
      } catch {
        /* ignore */
      }
      return null
    }
    return c
  })
  const lastActivitySaveRef = useRef(0)

  const logout = useCallback((reason) => {
    setCreds(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      if (typeof reason === 'string' && reason) {
        sessionStorage.setItem(LOGOUT_REASON_KEY, reason)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.rpc('admin_login', {
      email,
      pass: password,
    })
    if (error || data !== true) return false
    const now = Date.now()
    const next = { email, password, loginAt: now, lastActiveAt: now }
    lastActivitySaveRef.current = now
    setCreds(next)
    writeStored(next)
    try {
      sessionStorage.removeItem(LOGOUT_REASON_KEY)
    } catch {
      /* ignore */
    }
    return true
  }, [])

  const authed = !!(creds && creds.email && creds.password)

  // While logged in: track activity, and sign out on the idle / absolute timers.
  useEffect(() => {
    if (!authed) return

    const markActive = () => {
      const now = Date.now()
      if (now - lastActivitySaveRef.current < ACTIVITY_THROTTLE_MS) return
      const cur = readStored()
      if (!cur) return
      lastActivitySaveRef.current = now
      writeStored({ ...cur, lastActiveAt: now })
    }

    const check = () => {
      const cur = readStored()
      if (isExpired(cur)) {
        logout(cur ? AUTO_LOGOUT_MESSAGE : undefined)
      }
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'visibilitychange']
    events.forEach((e) =>
      window.addEventListener(e, markActive, { passive: true }),
    )
    window.addEventListener('focus', check)
    const id = setInterval(check, CHECK_EVERY_MS)
    check() // e.g. after the laptop was asleep for a while

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive))
      window.removeEventListener('focus', check)
      clearInterval(id)
    }
  }, [authed, logout])

  const value = {
    isAuthed: authed,
    email: creds?.email || null,
    password: creds?.password || null,
    login,
    logout,
  }
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}

// Wrap an admin page: sends visitors without a session back to the login.
export function RequireAdmin({ children }) {
  const { isAuthed } = useAdminAuth()
  if (!isAuthed) return <Navigate to="/admin" replace />
  return children
}
