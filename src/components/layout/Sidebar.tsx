import { NavLink } from 'react-router-dom'
import { MessageSquare, Mail, LogOut, ClipboardList, MapPin, Moon, Sun, Palette, LayoutDashboard, BarChart2, Settings } from 'lucide-react'
import { useEmails } from '@/hooks/useEmails'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, type Theme } from '@/contexts/ThemeContext'

const THEME_META: Record<Theme, { icon: React.ReactNode; label: string; next: string }> = {
  dark:  { icon: <Moon className="w-3.5 h-3.5" />,    label: 'Scuro',    next: '→ Chiaro' },
  light: { icon: <Sun className="w-3.5 h-3.5" />,     label: 'Chiaro',   next: '→ Colorato' },
  warm:  { icon: <Palette className="w-3.5 h-3.5" />, label: 'Colorato', next: '→ Scuro' },
}

export const Sidebar = () => {
  const { data: emails } = useEmails()
  const { user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const pendingCount = emails?.length ?? 0

  return (
    <aside className="w-56 shrink-0 bg-slate-950 flex flex-col h-full border-r border-slate-800">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <span className="text-white font-semibold text-sm tracking-wide">Apollinare</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="flex-1">Dashboard</span>
        </NavLink>

        <div className="h-px bg-slate-800 mx-1 my-2" />

        <NavLink
          to="/emails"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span className="flex-1">Email</span>
          {pendingCount > 0 && (
            <span className="text-xs font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full min-w-5 text-center">
              {pendingCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/gestionale"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          <span className="flex-1">Eventi</span>
        </NavLink>

        <NavLink
          to="/gestionale/location"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="flex-1">Location</span>
        </NavLink>

        <div className="h-px bg-slate-800 mx-1 my-2" />

        {/* Chatbot */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 cursor-default">
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="flex-1">Chatbot</span>
          <span className="text-xs font-medium bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded-full">Soon</span>
        </div>

        {/* Reportistica */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 cursor-default">
          <BarChart2 className="w-4 h-4 shrink-0" />
          <span className="flex-1">Reportistica</span>
          <span className="text-xs font-medium bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded-full">Soon</span>
        </div>

        {/* Impostazioni */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 cursor-default">
          <Settings className="w-4 h-4 shrink-0" />
          <span className="flex-1">Impostazioni</span>
          <span className="text-xs font-medium bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded-full">Soon</span>
        </div>
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={cycleTheme}
          title={`Tema attuale: ${THEME_META[theme].label} — clicca per ${THEME_META[theme].next}`}
          className="flex w-full items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          {THEME_META[theme].icon}
          <span className="flex-1 text-left">{THEME_META[theme].label}</span>
          <span className="text-slate-600 text-[10px]">{THEME_META[theme].next}</span>
        </button>
      </div>

      {/* User + logout */}
      <div className="px-3 py-3 border-t border-slate-800 space-y-2">
        {user && (
          <div className="flex items-center gap-2 px-1">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-6 h-6 rounded-full shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600 shrink-0" />
            )}
            <span className="text-xs text-slate-400 truncate flex-1">{user.name}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Esci
        </button>
      </div>
    </aside>
  )
}
