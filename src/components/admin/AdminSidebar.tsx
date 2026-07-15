'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Inicio', icon: '✦' },
  { href: '/admin/agenda', label: 'Agenda', icon: '◈' },
  { href: '/admin/clientes', label: 'Clientes', icon: '◉' },
  { href: '/admin/ventas', label: 'Ventas', icon: '◎' },
  { href: '/admin/pagos', label: 'Pagos', icon: '◆' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '◇' },
  { href: '/admin/catalogo', label: 'Catálogo', icon: '⬡' },
  { href: '/admin/contenido', label: 'Contenido IA', icon: '✧' },
  { href: '/admin/reportes', label: 'Reportes', icon: '◈' },
  { href: '/admin/configuracion', label: 'Configuración', icon: '⚙' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#2D1B69] text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-sm font-light text-violet-300">Panel de</p>
        <p className="text-lg font-bold tracking-wide">Espíritu Ananda</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-500/30 text-white'
                  : 'text-violet-200 hover:bg-white/5 hover:text-white'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Perfil */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-violet-300">Administración</p>
        <p className="text-sm font-medium">Espíritu Ananda</p>
      </div>
    </aside>
  )
}
