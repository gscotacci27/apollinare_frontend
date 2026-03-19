export const EmailSkeleton = () => {
  return (
    <div className="p-4 border-b border-slate-100 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-slate-200 rounded w-28" />
            <div className="h-3 bg-slate-200 rounded w-14" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-44" />
          <div className="h-5 bg-slate-100 rounded-full w-20" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  )
}
