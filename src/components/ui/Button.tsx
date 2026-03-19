import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  color?: 'indigo' | 'green' | 'red' | 'slate'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', color = 'indigo', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
          size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2',
          variant === 'solid' && color === 'green' && 'bg-emerald-600 text-white hover:bg-emerald-700',
          variant === 'solid' && color === 'indigo' && 'bg-indigo-600 text-white hover:bg-indigo-700',
          variant === 'solid' && color === 'red' && 'bg-red-600 text-white hover:bg-red-700',
          variant === 'outline' && color === 'red' && 'border border-red-300 text-red-600 hover:bg-red-50',
          variant === 'outline' && color === 'slate' && 'border border-slate-300 text-slate-600 hover:bg-slate-50',
          variant === 'ghost' && 'text-slate-500 hover:bg-slate-100',
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
