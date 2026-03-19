import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { googleLogout } from '@react-oauth/google'

const ALLOWED_EMAILS = new Set([
  'info@apollinarecatering.it',
  'apollinare.test@gmail.com',
])
const STORAGE_KEY = 'apollinare_user'

interface User {
  email: string
  name: string
  picture: string
}

interface AuthContextValue {
  user: User | null
  login: (credential: string) => boolean
  logout: () => void
}

function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback((credential: string): boolean => {
    const payload = decodeJwt(credential)
    const email = payload.email as string

    if (!ALLOWED_EMAILS.has(email)) return false

    const u: User = {
      email,
      name: (payload.name as string) ?? email,
      picture: (payload.picture as string) ?? '',
    }
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    return true
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
