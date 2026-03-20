import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'warm'

const THEMES: Theme[] = ['dark', 'light', 'warm']
const STORAGE_KEY = 'apollinare-theme'

interface ThemeContextValue {
  theme: Theme
  cycleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    return saved && THEMES.includes(saved) ? saved : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const cycleTheme = () =>
    setThemeState((prev) => THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length])

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
