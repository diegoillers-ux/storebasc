import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  bgColor?: string
  className?: string
}

export function Badge({ children, color, bgColor, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        color ?? 'text-gray-600',
        bgColor ?? 'bg-gray-100',
        className
      )}
    >
      {children}
    </span>
  )
}
