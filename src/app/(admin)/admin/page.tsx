'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  CreditCard,
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
          value="4"
          sub="2 por WhatsApp, 2 presenciales"
          icon={Calendar}
          colorClass="text-violet-600 bg-violet-50"
        />
        <MetricCard
          title="Pagos por verificar"
          value="3"
          sub="Pendientes de validación"
          icon={AlertCircle}
          colorClass="text-coral-600 bg-coral-50"
        />
        <MetricCard
          title="Ingresos del mes"
          value="$2.450.000 COP"
          sub="+15% comparado con el mes anterior"
          icon={TrendingUp}
          colorClass="text-teal-600 bg-teal-50"
        />
        <MetricCard
          title="Clientes nuevos"
          value="24"
          sub="Registrados esta semana"
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
                4 Sesiones
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              <BookingRow
                time="09:00 AM"
                client="María Fernanda Rojas"
                service="Lectura Astral Completa"
                modality="WhatsApp"
                phone="573123456789"
                status="CONFIRMED"
              />
              <BookingRow
                time="11:30 AM"
                client="Juan Pablo Gómez"
                service="Lectura de Tarot Express"
                modality="WhatsApp"
                phone="573219876543"
                status="CONFIRMED"
              />
              <BookingRow
                time="03:00 PM"
                client="Camila Restrepo"
                service="Compatibilidad Astral (Sinastría)"
                modality="Presencial"
                phone="573155556677"
                status="CONFIRMED"
              />
              <BookingRow
                time="05:30 PM"
                client="Diana Marcela Ortiz"
                service="Tránsitos Planetarios Anuales"
                modality="WhatsApp"
                phone="573004449988"
                status="PAYMENT_SUBMITTED"
              />
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
                3 Pendientes
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              <PaymentToVerifyRow
                client="Andrés Felipe Silva"
                concept="Sesión Premium Astral"
                method="Nequi"
                amount="$116.000 COP"
                date="Hace 10 min"
              />
              <PaymentToVerifyRow
                client="Verónica Medina"
                concept="Sorteo Astral Anual (Números 22, 44)"
                method="Daviplata"
                amount="$50.000 COP"
                date="Hace 2 horas"
              />
              <PaymentToVerifyRow
                client="Carlos Mario Restrepo"
                concept="Producto: Kit de Purificación"
                method="Transferencia Bancolombia"
                amount="$65.000 COP"
                date="Ayer"
              />
            </div>
          </div>

        </div>

        {/* Side Column (1/3 width) */}
        <div className="space-y-8">
          
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 gap-3">
              <QuickActionButton label="Nueva Reserva" icon={Calendar} onClick={() => {}} />
              <QuickActionButton label="Registrar Cliente" icon={Users} onClick={() => {}} />
              <QuickActionButton label="Nuevo Pedido" icon={ShoppingBag} onClick={() => {}} />
              <QuickActionButton label="Registrar Pago" icon={CreditCard} onClick={() => {}} />
              <QuickActionButton label="Generar Asset con IA" icon={Sparkles} highlight onClick={() => {}} />
            </div>
          </div>

          {/* Estado de Inventario / Crítico */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Alertas de Inventario</h2>
            </div>
            <div className="space-y-3">
              <InventoryAlertItem product="Velas Consagradas Lavanda" stock={2} />
              <InventoryAlertItem product="Sahumerio Sagrado de Copal" stock={0} />
              <InventoryAlertItem product="Sales de Baño Purificadoras" stock={5} />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50">
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

function BookingRow({
  time,
  client,
  service,
  modality,
  phone,
  status,
}: {
  time: string;
  client: string;
  service: string;
  modality: string;
  phone: string;
  status: string;
}) {
  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1.5 rounded-xl shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-950">{client}</p>
          <p className="text-xs text-gray-500 mt-0.5">{service} • <span className="italic">{modality}</span></p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          status === 'CONFIRMED' 
            ? 'bg-teal-50 text-teal-600 border border-teal-100'
            : 'bg-gold-50 text-gold-500 border border-gold-100'
        }`}>
          {status === 'CONFIRMED' ? 'Confirmado' : 'Pago por Verificar'}
        </span>
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
          title="Contactar por WhatsApp"
        >
          <MessageSquare className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function PaymentToVerifyRow({
  client,
  concept,
  method,
  amount,
  date,
}: {
  client: string;
  concept: string;
  method: string;
  amount: string;
  date: string;
}) {
  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-sm text-gray-950">{client}</p>
        <p className="text-xs text-gray-500 mt-0.5">{concept} • <span className="font-medium text-violet-600">{method}</span></p>
        <p className="text-[10px] text-gray-400 mt-1">{date}</p>
      </div>

      <div className="flex items-center gap-3 justify-between sm:justify-end">
        <span className="font-bold text-sm text-gray-950">{amount}</span>
        <div className="flex gap-2">
          <button className="text-xs font-semibold bg-[#2D1B69] hover:bg-[#1A0F3D] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm">
            Verificar
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  highlight,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border shadow-sm ${
        highlight
          ? 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700'
          : 'bg-[#FAF8FF] text-gray-700 border-gray-100 hover:bg-violet-50/50 hover:border-violet-100 hover:text-violet-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4.5 h-4.5" />
        <span>{label}</span>
      </div>
      <Plus className="w-4 h-4 opacity-60" />
    </button>
  );
}

function InventoryAlertItem({ product, stock }: { product: string; stock: number }) {
  const isOutOfStock = stock === 0;

  return (
    <div className="flex items-center justify-between py-2 text-xs">
      <span className="font-medium text-gray-700 truncate mr-3">{product}</span>
      <span className={`px-2 py-0.5 font-bold rounded-full shrink-0 ${
        isOutOfStock 
          ? 'bg-coral-50 text-coral-600 border border-coral-100'
          : 'bg-gold-50 text-gold-500 border border-gold-100'
      }`}>
        {isOutOfStock ? 'Agotado' : `${stock} unidades`}
      </span>
    </div>
  );
}
