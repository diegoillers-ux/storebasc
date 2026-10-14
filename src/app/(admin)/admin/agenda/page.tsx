'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  Users,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Booking {
  id?: string;
  customerId: string;
  serviceId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  whatsappLink: string | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
}

export default function AgendaPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals status
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Create state
  const [newBooking, setNewBooking] = useState({
    customerId: '',
    serviceId: '',
    scheduledAt: '',
    notes: '',
  });

  // Reschedule state
  const [newScheduleTime, setNewScheduleTime] = useState<string>('');

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resBookings = await fetch('/api/admin/bookings');
      const dataBookings = await resBookings.json();
      if (dataBookings.bookings) setBookings(dataBookings.bookings);

      const resCustomers = await fetch('/api/admin/customers');
      const dataCustomers = await resCustomers.json();
      if (dataCustomers.customers) setCustomers(dataCustomers.customers);

      const resServices = await fetch('/api/admin/services');
      const dataServices = await resServices.json();
      if (dataServices.services) setServices(dataServices.services);
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron recuperar los registros.');
    } finally {
      setLoading(false);
    }
  };

  // Crear Reserva
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customerId || !newBooking.serviceId || !newBooking.scheduledAt) return;

    const selectedService = services.find(s => s.id === newBooking.serviceId);
    if (!selectedService) return;

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBooking,
          durationMinutes: selectedService.durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Reserva creada', 'La reserva manual ha sido registrada en el panel.');
        setIsCreateModalOpen(false);
        setNewBooking({ customerId: '', serviceId: '', scheduledAt: '', notes: '' });
        fetchData();
      } else {
        showNotice('error', 'Error al crear', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo agendar la sesión.');
    }
  };

  // Confirmar Reserva (Aprobar Pago)
  const handleConfirmBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Cita Confirmada', 'Se ha sincronizado con Google Calendar y enviado notificación.');
        fetchData();
      } else {
        showNotice('error', 'Error al confirmar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo confirmar la reserva.');
    }
  };

  // Cancelar Reserva
  const handleCancelBooking = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva y eliminarla del calendario?')) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Reserva Cancelada', 'El bloque horario ha sido liberado.');
        fetchData();
      } else {
        showNotice('error', 'Error al cancelar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo cancelar la reserva.');
    }
  };

  // Reprogramar Reserva
  const handleRescheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !newScheduleTime) return;

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: newScheduleTime }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Reserva Reprogramada', 'Se actualizó la hora en el Google Calendar.');
        setIsRescheduleModalOpen(false);
        setSelectedBookingId(null);
        setNewScheduleTime('');
        fetchData();
      } else {
        showNotice('error', 'Error al reprogramar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo reprogramar la reserva.');
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente Desconocido';
  };

  const getServiceName = (id: string) => {
    return services.find(s => s.id === id)?.name || 'Servicio Desconocido';
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  if (loading) {
    return <LoadingState message="Cargando agenda de sesiones..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Agenda de Sesiones</h1>
          <p className="text-xs text-gray-500 mt-0.5">Control de reservas espirituales y sincronización con Google Calendar</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Reserva Manual</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <FeedbackAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                statusFilter === status
                  ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                  : 'bg-white border-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              {status === 'ALL' && 'Todos'}
              {status === 'PENDING_PAYMENT' && 'P. Pendiente'}
              {status === 'PAYMENT_SUBMITTED' && 'Comprobante Subido'}
              {status === 'CONFIRMED' && 'Confirmados'}
              {status === 'CANCELLED' && 'Cancelados'}
              {status === 'COMPLETED' && 'Completados'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Layout */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden divide-y divide-gray-50">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No hay citas registradas con este filtro.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center bg-[#FAF8FF] border border-gray-100/50 p-3 rounded-2xl w-20 shrink-0 text-center select-none">
                  <Clock className="w-4 h-4 text-violet-500 mb-1" />
                  <span className="text-[10px] font-bold text-gray-400 leading-none">HORA</span>
                  <span className="text-xs font-extrabold text-gray-900 mt-1">
                    {new Date(booking.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-950 text-base leading-none">
                    {getCustomerName(booking.customerId)}
                  </h3>
                  <p className="text-sm font-semibold text-violet-600 mt-1">
                    {getServiceName(booking.serviceId)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Agendada: {new Date(booking.scheduledAt).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {booking.notes && (
                    <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg max-w-lg">
                      Nota: {booking.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-teal-50 text-teal-600 border border-teal-100'
                    : booking.status === 'PAYMENT_SUBMITTED'
                    ? 'bg-gold-50 text-gold-500 border border-gold-100'
                    : booking.status === 'CANCELLED'
                    ? 'bg-coral-50 text-coral-600 border border-coral-100'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                  {booking.status === 'CONFIRMED' && 'Confirmado'}
                  {booking.status === 'PAYMENT_SUBMITTED' && 'Comprobante Subido'}
                  {booking.status === 'PENDING_PAYMENT' && 'Pago Pendiente'}
                  {booking.status === 'CANCELLED' && 'Cancelado'}
                  {booking.status === 'COMPLETED' && 'Completado'}
                </span>

                {/* Confirm option */}
                {booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleConfirmBooking(booking.id!)}
                    className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmar</span>
                  </button>
                )}

                {/* Reprogram option */}
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(booking.id!);
                      setNewScheduleTime(booking.scheduledAt.substring(0, 16));
                      setIsRescheduleModalOpen(true);
                    }}
                    className="flex items-center gap-1 bg-white hover:bg-violet-50 text-violet-700 border border-violet-100 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reprogramar</span>
                  </button>
                )}

                {/* Cancel option */}
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id!)}
                    className="p-2 text-gray-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-all"
                    title="Cancelar Cita"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* WhatsApp Chat link */}
                {booking.whatsappLink && (
                  <a
                    href={booking.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all"
                    title="Iniciar sesión en WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── MODAL: NUEVA RESERVA MANUAL ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">Crear Reserva Manual</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Seleccionar Cliente</label>
                <select
                  required
                  value={newBooking.customerId}
                  onChange={(e) => setNewBooking({ ...newBooking, customerId: e.target.value })}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                >
                  <option value="">-- Elige un consultante --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Seleccionar Servicio</label>
                <select
                  required
                  value={newBooking.serviceId}
                  onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                >
                  <option value="">-- Selecciona el servicio astral --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={newBooking.scheduledAt}
                  onChange={(e) => setNewBooking({ ...newBooking, scheduledAt: e.target.value })}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas adicionales</label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="Detalles específicos para la sesión o notas de pago..."
                  rows={3}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Agendar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: REPROGRAMAR CITA ─── */}
      {isRescheduleModalOpen && selectedBookingId && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">Reprogramar Cita</h3>
              <button
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setSelectedBookingId(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
            
            <form onSubmit={handleRescheduleBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nueva Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambio</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
