'use client';

import { formatDate } from '@/lib/utils';
import { Search, HelpCircle, MessageSquare } from 'lucide-react';

export function AdminTopBar() {
  const today = formatDate(new Date(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 z-10">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 w-96 relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
        <input
          type="text"
          placeholder="Buscar reservas, pagos o clientes..."
          className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:bg-white transition-all text-gray-700 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Right: Date and WhatsApp Shortcut */}
      <div className="flex items-center gap-6">
        <p className="text-xs font-semibold text-gray-400 capitalize select-none hidden md:block">
          {today}
        </p>

        <div className="h-4 w-px bg-gray-200 hidden md:block" />

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Central ↗</span>
          </a>

          <button
            title="Ayuda técnica"
            className="p-2 text-gray-400 hover:text-violet-600 rounded-xl hover:bg-[#FAF8FF] transition-all"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
