interface EmptyStateProps {
  title: string
  description?: string
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="8" y="16" width="48" height="36" rx="4" fill="#E2E8F0" />
        <path d="M8 22l24 14 24-14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="46" r="11" fill="#D1FAE5" />
        <path
          d="M43 46l3 3 6-6"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
  )
}
