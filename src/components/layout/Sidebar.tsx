import { NavLink } from 'react-router-dom'
import { MessageSquare, Mail, LogOut, ClipboardList } from 'lucide-react'
import { useEmails } from '@/hooks/useEmails'
import { useAuth } from '@/contexts/AuthContext'

export const Sidebar = () => {
  const { data: emails } = useEmails()
  const { user, logout } = useAuth()
  const pendingCount = emails?.length ?? 0

  return (
    <aside className="w-56 shrink-0 bg-slate-950 flex flex-col h-full border-r border-slate-800">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <span className="text-white font-semibold text-sm tracking-wide">Reply Scheduler</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink
          to="/chatbot"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="flex-1">Chatbot</span>
          <span className="text-xs font-medium bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
            Soon
          </span>
        </NavLink>

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
          <span className="flex-1">Pending Emails</span>
          {pendingCount > 0 && (
            <span className="text-xs font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full min-w-5 text-center">
              {pendingCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/gestionale"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-white/5 text-white border-l-2 border-indigo-500 pl-[10px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          <span className="flex-1">Gestionale</span>
        </NavLink>
      </nav>

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
