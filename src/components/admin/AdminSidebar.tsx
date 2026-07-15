'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Package,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard },
  { href: '/admin/agenda', label: 'Agenda', icon: Calendar },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/catalogo', label: 'Catálogo', icon: Package },
  { href: '/admin/contenido', label: 'Contenido IA', icon: Sparkles },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1A0F3D] text-white flex flex-col h-full shrink-0 border-r border-[#2D1B69]/30 relative z-20">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-sm font-semibold shadow-premium select-none">
          ✦
        </div>
        <div>
          <p className="text-[10px] font-semibold text-violet-300 uppercase tracking-widest leading-none">Panel de</p>
          <p className="text-base font-bold tracking-wide mt-1 leading-none">Espíritu Ananda</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          // Si estamos en /admin exacto o la ruta anidada coincide
          const active = item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative',
                active
                  ? 'bg-violet-600/25 text-violet-100 shadow-sm'
                  : 'text-violet-200/70 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Active left indicator bar */}
              {active && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-violet-500" />
              )}
              
              <Icon 
                className={cn(
                  'w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-violet-400' : 'text-violet-300/50 group-hover:text-violet-300'
                )} 
              />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Action */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-[#140b30]/50">
        <div className="px-3 py-2 flex items-center gap-3 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-violet-900/40 border border-violet-700/30 flex items-center justify-center text-xs font-semibold text-violet-200">
            EA
          </div>
          <div>
            <p className="text-xs text-violet-300/60 leading-none">Rol: Administrador</p>
            <p className="text-sm font-medium text-white mt-1 leading-none">Espíritu Ananda</p>
          </div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-coral-600 hover:bg-coral-600/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
