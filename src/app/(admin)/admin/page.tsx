'use client';

import React from 'react';
import {
  Calendar,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-sans">Panel de Ananda</h1>
        <p className="text-gray-500 text-sm">Tu operación centralizada para Espíritu Ananda ✨</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sesiones hoy"
          value="—"
          sub="Las citas confirmadas del día se reflejarán aquí"
          icon={Calendar}
          colorClass="text-violet-600 bg-violet-50"
        />
        <MetricCard
          title="Pagos por verificar"
          value="—"
          sub="Comprobantes enviados por los consultantes"
          icon={AlertCircle}
          colorClass="text-coral-600 bg-coral-50"
        />
        <MetricCard
          title="Ingresos del mes"
          value="—"
          sub="Total aprobado del mes en curso"
          icon={TrendingUp}
          colorClass="text-teal-600 bg-teal-50"
        />
        <MetricCard
          title="Clientes nuevos"
          value="—"
          sub="Consultantes registrados esta semana"
          icon={Users}
          colorClass="text-gold-500 bg-gold-50"
        />
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Agenda de hoy */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 transition-all duration-300 hover:shadow-premium-hover">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sesiones de Hoy</h2>
                <p className="text-xs text-gray-400">Próximos encuentros espirituales agendados</p>
              </div>
              <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full">
                0 Sesiones
              </span>
            </div>

            <div className="py-10 text-center">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-500 mt-3">No hay sesiones para hoy</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Cuando los consultantes confirmen sus citas (por Mercado Pago o pago manual verificado), las sesiones del día aparecerán en esta lista.
              </p>
              <a
                href="/admin/agenda"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                <span>Ver agenda completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Pagos por verificar */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 transition-all duration-300 hover:shadow-premium-hover">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Comprobantes por Verificar</h2>
                <p className="text-xs text-gray-400">Validación manual de transferencias reportadas</p>
              </div>
              <span className="text-xs font-semibold bg-coral-50 text-coral-600 px-3 py-1.5 rounded-full">
                0 Pendientes
              </span>
            </div>

            <div className="py-10 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-500 mt-3">No hay comprobantes pendientes</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Los comprobantes de pago manual (Nequi, Daviplata o transferencia) que envíen los consultantes se listarán aquí para su validación.
              </p>
              <a
                href="/admin/pagos"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                <span>Ir a pagos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Side Column (1/3 width) */}
        <div className="space-y-8">
          
          {/* Acceso a módulos */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Módulos del Panel</h2>
            <div className="grid grid-cols-1 gap-3">
              <ModuleLink href="/admin/agenda" label="Agenda de citas" icon={Calendar} />
              <ModuleLink href="/admin/clientes" label="Clientes y consultantes" icon={Users} />
              <ModuleLink href="/admin/pagos" label="Pagos y comprobantes" icon={AlertCircle} />
              <ModuleLink href="/admin/pedidos" label="Pedidos de tienda" icon={ShoppingBag} />
              <ModuleLink href="/admin/catalogo" label="Catálogo y productos" icon={ShoppingBag} />
            </div>
          </div>

          {/* Estado de Inventario / Crítico */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Alertas de Inventario</h2>
            </div>
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-gray-500">Sin alertas por el momento</p>
              <p className="text-xs text-gray-400 mt-1">
                Los productos agotados o con stock bajo se mostrarán aquí.
              </p>
            </div>
            <div className="mt-2 pt-4 border-t border-gray-50">
              <a href="/admin/catalogo" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1.5 justify-end">
                <span>Gestionar catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Sub-Componentes Visuales Locales ───

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 flex flex-col justify-between h-40 transition-all duration-300 hover:shadow-premium-hover hover:scale-[1.01]">
      <div className="flex justify-between items-start">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <div className={`p-2.5 rounded-2xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-950 tracking-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
      </div>
    </div>
  );
}

function ModuleLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border shadow-sm bg-[#FAF8FF] text-gray-700 border-gray-100 hover:bg-violet-50/50 hover:border-violet-100 hover:text-violet-700"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4.5 h-4.5" />
        <span>{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 opacity-60" />
    </a>
  );
}
