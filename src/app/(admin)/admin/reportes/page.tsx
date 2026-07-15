'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';

export default function ReportesPage() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simular carga de métricas complejas agregadas
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingState message="Agregando y consolidando transacciones contables..." />;
  }

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
            <p className="text-2xl font-black text-gray-950">$15.420.000 COP</p>
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
            <p className="text-2xl font-black text-gray-950">$4.500.000 COP</p>
            <p className="text-xs text-gray-400 mt-1">Progreso actual: 54% completado</p>
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
            <p className="text-2xl font-black text-gray-950">$98.500 COP</p>
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

          <div className="space-y-4">
            <ProgressRow label="Nequi" percentage={45} value="$6.939.000 COP" color="bg-violet-600" />
            <ProgressRow label="Daviplata" percentage={25} value="$3.855.000 COP" color="bg-gold-500" />
            <ProgressRow label="Pasarelas de Pago" percentage={20} value="$3.084.000 COP" color="bg-teal-600" />
            <ProgressRow label="Efectivo / Caja física" percentage={10} value="$1.542.000 COP" color="bg-gray-400" />
          </div>
        </div>

        {/* Division services vs products */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
          <h3 className="font-bold text-gray-950 text-base mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            <span>Distribución de Ingresos</span>
          </h3>

          <div className="space-y-4">
            <ProgressRow label="Sesiones y Lecturas Astrales" percentage={65} value="$10.023.000 COP" color="bg-violet-600" />
            <ProgressRow label="Productos Físicos (Sahumerios, Cristales, Velas)" percentage={25} value="$3.855.000 COP" color="bg-teal-600" />
            <ProgressRow label="Sorteos / Rifas Astrales" percentage={10} value="$1.542.000 COP" color="bg-gold-500" />
          </div>
        </div>

      </div>

      {/* Recents logs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
        <h3 className="font-bold text-gray-950 text-base mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span>Ventas Recientes Auditadas</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase select-none">
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-gray-950">Lectura Astral Completa - María Rojas</td>
                <td className="py-3.5 px-4"><span className="font-bold text-violet-600">NEQUI</span></td>
                <td className="py-3.5 px-4 text-right font-bold">$120.000 COP</td>
                <td className="py-3.5 px-4 text-right text-gray-400">Hoy 09:12 AM</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-gray-950">Vela Consagrada de Lavanda + Sahumerio</td>
                <td className="py-3.5 px-4"><span className="font-bold text-violet-600">DAVIPLATA</span></td>
                <td className="py-3.5 px-4 text-right font-bold">$65.000 COP</td>
                <td className="py-3.5 px-4 text-right text-gray-400">Ayer 18:24 PM</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-gray-950">Lectura de Tarot Express - Juan Gómez</td>
                <td className="py-3.5 px-4"><span className="font-bold text-violet-600">NEQUI</span></td>
                <td className="py-3.5 px-4 text-right font-bold">$50.000 COP</td>
                <td className="py-3.5 px-4 text-right text-gray-400">Hace 2 días</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  percentage,
  value,
  color,
}: {
  label: string;
  percentage: number;
  value: string;
  color: string;
}) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between font-semibold">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
