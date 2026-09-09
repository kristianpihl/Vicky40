import { createContext, useContext, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

const STORAGE_KEY = 'vickie-admin'

const AdminAuthContext = createContext(null)

function readStored() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }) {
  // We keep the typed password in memory (and sessionStorage for the tab)
  // because each admin request has to send it to Supabase.
  const [password, setPassword] = useState(readStored)

  const login = useCallback(async (pass) => {
    const { data, error } = await supabase.rpc('admin_login', { pass })
    if (error || data !== true) return false
    setPassword(pass)
    try {
      sessionStorage.setItem(STORAGE_KEY, pass)
    } catch {
      /* ignore */
    }
    return true
  }, [])

  const logout = useCallback(() => {
    setPassword(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = { isAuthed: !!password, password, login, logout }
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
