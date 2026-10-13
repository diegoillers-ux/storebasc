'use client';

import React from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Reportes Financieros</h1>
        <p className="text-xs text-gray-500 mt-0.5">Control de caja consolidado, distribución de ingresos e informes de venta</p>
      </div>

      {/* Main Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ingreso Total Histórico</span>
            <div className="p-2 rounded-2xl bg-teal-50 text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-950">—</p>
            <p className="text-xs text-gray-400 mt-1">Sumatoria de transacciones aprobadas</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta de Ventas del Mes</span>
            <div className="p-2 rounded-2xl bg-violet-50 text-violet-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-950">—</p>
            <p className="text-xs text-gray-400 mt-1">Avance frente a la meta definida</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ticket Promedio por Consultante</span>
            <div className="p-2 rounded-2xl bg-gold-50 text-gold-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-950">—</p>
            <p className="text-xs text-gray-400 mt-1">Calculado sobre reservas y carritos</p>
          </div>
        </div>
      </div>

      {/* Grid: Payment channels vs categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Distribution of methods */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
          <h3 className="font-bold text-gray-950 text-base mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span>Medios de Pago Utilizados</span>
          </h3>

          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Sin datos suficientes</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              La distribución por medio de pago (Nequi, Daviplata, tarjeta) se generará cuando existan pagos aprobados registrados.
            </p>
          </div>
        </div>

        {/* Division services vs products */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
          <h3 className="font-bold text-gray-950 text-base mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            <span>Distribución de Ingresos</span>
          </h3>

          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-gray-500">Sin datos suficientes</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              El desglose entre sesiones y lecturas, productos físicos y rifas se calculará automáticamente con las ventas aprobadas.
            </p>
          </div>
        </div>

      </div>

      {/* Recent logs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
        <h3 className="font-bold text-gray-950 text-base mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span>Ventas Recientes Auditadas</span>
        </h3>

        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-gray-500">Aún no hay ventas registradas</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Las transacciones aprobadas aparecerán aquí con su concepto, método de pago, monto y fecha.
          </p>
        </div>
      </div>
    </div>
  );
}
