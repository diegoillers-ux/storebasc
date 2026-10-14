'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Mail,
  User,
  Calendar,
  ChevronRight,
  Save,
  Check,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';
import { getCustomerWhatsAppLink } from '@/lib/whatsapp';

interface Customer {
  id?: string;
  name: string;
  email: string | null;
  phone: string;
  cedula?: string | null;
  birthDate?: string | null;
  source?: string | null;
  isVerified?: boolean;
  notes: string | null;
  createdAt: string;
}

interface CustomerDetail {
  bookings: Array<{
    id?: string;
    serviceName: string;
    scheduledAt: string;
    status: string;
  }>;
  orders: Array<{
    id?: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    id?: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
}

export default function CustomersPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Drawer / Detail state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditNotesMode, setIsEditNotesMode] = useState<boolean>(false);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const showNotice = useCallback((type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const url = searchQuery ? `/api/admin/customers?q=${encodeURIComponent(searchQuery)}` : '/api/admin/customers';
      const res = await fetch(url);
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron recuperar los clientes.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showNotice]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchCustomers(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchCustomers]);

  // Crear cliente
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Cliente registrado', 'El cliente ha sido registrado correctamente.');
        setIsCreateModalOpen(false);
        setNewCustomer({ name: '', email: '', phone: '', notes: '' });
        fetchCustomers();
      } else {
        showNotice('error', 'Error al registrar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo crear el registro.');
    }
  };

  // Guardar notas del cliente en detalle
  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/admin/customers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedCustomer, notes: editedNotes }),
      });

      const data = await res.json();
      if (!data.success) {
        showNotice('error', 'Error al guardar', data.error);
        return;
      }

      setSelectedCustomer({ ...selectedCustomer, notes: editedNotes });
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, notes: editedNotes } : c));
      setIsEditNotesMode(false);
      showNotice('success', 'Notas guardadas', 'La bitácora del cliente ha sido actualizada.');
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron guardar las notas.');
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditedNotes(customer.notes || '');
    setIsEditNotesMode(false);
    setCustomerDetail(null);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`);
      const data = await res.json();
      if (res.ok) setCustomerDetail(data);
      else showNotice('error', 'Error al cargar ficha', data.error);
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo cargar el historial del cliente.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">CRM de Clientes</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de consultantes y bitácora de sesiones espirituales</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cliente</span>
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

      {/* Main Grid: List and Drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: List (2/3 width or full if none selected) */}
        <div className={`space-y-4 lg:col-span-2`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar clientes por nombre, teléfono o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-300 transition-all text-gray-700 placeholder-gray-400 shadow-sm"
            />
          </div>

          {loading ? (
            <LoadingState message="Buscando clientes..." />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden divide-y divide-gray-50">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">
                  No se encontraron clientes registrados.
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => {
                       void handleSelectCustomer(customer);
                    }}
                    className={`p-5 flex items-center justify-between cursor-pointer transition-all ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-violet-50/50'
                        : 'hover:bg-gray-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100/50 flex items-center justify-center text-violet-600 font-bold select-none text-sm">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-950 text-sm leading-none">{customer.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{customer.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <a
                         href={getCustomerWhatsAppLink(customer.phone, `Hola ${customer.name}, te escribo de Espíritu Ananda. ¿Cómo estás? 🌟`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Evitar abrir el panel de detalles
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/50 hover:bg-emerald-100 transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Customer detail panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:sticky lg:top-8 min-h-[400px]">
          {selectedCustomer ? (
            <div className="space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-3xl bg-violet-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-gray-950 text-base leading-none">{selectedCustomer.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">Registrado el {new Date(selectedCustomer.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
              </div>

              {/* Quick Contacts */}
               <div className="space-y-3 bg-[#FAF8FF] p-4 rounded-2xl border border-gray-100/30">
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <MessageSquare className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Mail className="w-4 h-4 text-violet-500" />
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.cedula && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <User className="w-4 h-4 text-violet-500" />
                    <span>Cédula: <span className="font-semibold">{selectedCustomer.cedula}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-600 text-[9px] flex items-center justify-center font-bold">i</span>
                  <span>Origen: <span className="font-semibold">{selectedCustomer.source || 'No registrado'}</span></span>
                </div>
                {selectedCustomer.birthDate && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    <span>Fecha de nacimiento: <span className="font-semibold">{selectedCustomer.birthDate}</span></span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-violet-50 p-3 text-center">
                  <p className="text-lg font-bold text-violet-700">{customerDetail?.bookings.length ?? '-'}</p>
                  <p className="text-[10px] text-violet-600">Reservas</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center">
                  <p className="text-lg font-bold text-amber-700">{customerDetail?.orders.length ?? '-'}</p>
                  <p className="text-[10px] text-amber-600">Pedidos</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{customerDetail?.payments.length ?? '-'}</p>
                  <p className="text-[10px] text-emerald-600">Pagos</p>
                </div>
              </div>

              {detailLoading ? (
                <p className="text-xs text-gray-400">Cargando historial...</p>
              ) : customerDetail && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial operativo</h3>
                  <div className="space-y-2">
                    {customerDetail.bookings.map((booking) => (
                      <div key={booking.id} className="rounded-xl bg-violet-50/60 p-3 text-xs">
                        <div className="flex justify-between gap-2 font-semibold text-gray-800">
                          <span>{booking.serviceName}</span>
                          <span className="text-violet-600">{booking.status}</span>
                        </div>
                        <p className="text-gray-500 mt-1">{new Date(booking.scheduledAt).toLocaleString('es-CO')}</p>
                      </div>
                    ))}
                    {customerDetail.orders.map((order) => (
                      <div key={order.id} className="rounded-xl bg-amber-50/60 p-3 text-xs">
                        <div className="flex justify-between gap-2 font-semibold text-gray-800">
                          <span>Pedido #{order.id?.slice(-6).toUpperCase()}</span>
                          <span>${order.total.toLocaleString('es-CO')}</span>
                        </div>
                        <p className="text-gray-500 mt-1">{order.status} · {new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                    ))}
                    {customerDetail.payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl bg-emerald-50/60 p-3 text-xs">
                        <div className="flex justify-between gap-2 font-semibold text-gray-800">
                          <span>Pago {payment.method}</span>
                          <span>${payment.amount.toLocaleString('es-CO')}</span>
                        </div>
                        <p className="text-gray-500 mt-1">{payment.status} · {new Date(payment.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                    ))}
                    {customerDetail.bookings.length === 0 && customerDetail.orders.length === 0 && customerDetail.payments.length === 0 && (
                      <p className="text-xs text-gray-400">Todavía no hay movimientos asociados.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Consultation Notes / Astral Bio */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bitácora & Notas Astral</h3>
                  <button
                    onClick={() => {
                      if (isEditNotesMode) {
                        handleSaveNotes();
                      } else {
                        setIsEditNotesMode(true);
                      }
                    }}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    {isEditNotesMode ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </>
                    ) : (
                      <span>Editar</span>
                    )}
                  </button>
                </div>

                {isEditNotesMode ? (
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={8}
                    placeholder="Escribe datos de nacimiento (fecha, hora, lugar), tránsitos relevantes, cartas asignadas o notas..."
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl p-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                ) : (
                  <div className="bg-[#FAF8FF] rounded-2xl p-4 border border-gray-100/30 min-h-[120px] text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedCustomer.notes || 'No hay notas redactadas aún. Haz clic en "Editar" para registrar datos natales o apuntes de consultas.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full text-gray-400 space-y-3 select-none">
              <User className="w-8 h-8 opacity-40 text-violet-500" />
              <div>
                <p className="text-xs font-bold text-gray-500">Ningún Cliente Seleccionado</p>
                <p className="text-[10px] text-gray-400 mt-1">Haz clic en un cliente de la lista para cargar su bitácora, notas y detalles de sesión.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: NUEVO CLIENTE ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">Registrar Nuevo Cliente</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Ej. Carolina Mendoza"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teléfono (WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Ej. 3124567890 o 573124567890"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas Iniciales</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Datos natales o comentarios de registro..."
                  rows={3}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Registrar Cliente</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
