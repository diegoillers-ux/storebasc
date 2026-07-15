'use client'

import { formatDate } from '@/lib/utils'

export function AdminTopBar() {
  const today = formatDate(new Date(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
      <p className="text-sm text-gray-400 capitalize">{today}</p>
      <div className="flex items-center gap-3">
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-100 transition-colors"
        >
          WhatsApp ↗
        </a>
      </div>
    </header>
  )
}
