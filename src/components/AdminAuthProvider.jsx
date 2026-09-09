import { createContext, useContext, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

const STORAGE_KEY = 'vickie-admin'

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

export function AdminAuthProvider({ children }) {
  // Username (an email) + password are kept in memory (and sessionStorage for
  // the tab) because each admin request has to send them to Supabase.
  const [creds, setCreds] = useState(readStored)

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.rpc('admin_login', {
      email,
      pass: password,
    })
    if (error || data !== true) return false
    const next = { email, password }
    setCreds(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    return true
  }, [])

  const logout = useCallback(() => {
    setCreds(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = {
    isAuthed: !!(creds && creds.email && creds.password),
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
