interface TopBarProps {
  title: string
  count?: number
}

export const TopBar = ({ title, count }: TopBarProps) => {
  return (
    <header className="h-12 border-b border-slate-200 bg-white flex items-center px-6 gap-3 shrink-0">
      <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
      {count !== undefined && count > 0 && (
        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          {count} pending
        </span>
      )}
    </header>
  )
}
