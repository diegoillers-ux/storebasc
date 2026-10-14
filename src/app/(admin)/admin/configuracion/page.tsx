'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Save,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  Mail,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Service {
  id?: string;
  name: string;
  slug: string;
  price: number;
  durationMinutes: number;
  description: string | null;
  active: boolean;
  imageUrl: string | null;
}

interface WeeklyAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  active: boolean;
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'availability' | 'smtp'>('services');
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<Service[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyAvailability[]>([]);
  
  // SMTP templates state
  const [smtpConfig, setSmtpConfig] = useState({
    bookingSubject: '¡Tu Sesión Astral en Espíritu Ananda está Confirmada!',
    bookingBody: 'Hola {cliente},\n\nTu sesión de {servicio} ha sido confirmada de forma exitosa.\nFecha y Hora: {fecha}.\nNos conectaremos vía WhatsApp al número {telefono}.\n\nBendiciones,\nEspíritu Ananda',
    orderSubject: 'Confirmación de Compra - Espíritu Ananda',
    orderBody: 'Hola {cliente},\n\nHemos recibido el pago de tu pedido de productos físicos.\nDetalle de compra por valor de {total}.\nTu paquete está en preparación.\n\nBendiciones,\nEspíritu Ananda',
  });
  
  // Modals status
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resServices = await fetch('/api/admin/services');
      const dataServices = await resServices.json();
      if (dataServices.services) setServices(dataServices.services);

      const resSettings = await fetch('/api/admin/settings');
      const dataSettings = await resSettings.json();
      if (dataSettings.settings) {
        // Ordenar de Lunes (1) a Domingo (0)
        const sortedHours = [...dataSettings.settings].sort((a, b) => {
          const valA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
          const valB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
          return valA - valB;
        });
        setWeeklyHours(sortedHours);
      }
    } catch {
      showNotice('error', 'Error de conexión', 'No se pudieron recuperar las configuraciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      fetchData();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // ─── Servicios CRUD ───

  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setCurrentService(service);
    } else {
      setCurrentService({
        name: '',
        slug: '',
        price: 80000,
        durationMinutes: 60,
        description: '',
        active: true,
        imageUrl: '',
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || !currentService.name || !currentService.slug) return;

    try {
      const method = currentService.id ? 'PUT' : 'POST';
      const url = currentService.id ? `/api/admin/services/${currentService.id}` : '/api/admin/services';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentService),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Servicio guardado', 'El catálogo ha sido actualizado correctamente.');
        setIsServiceModalOpen(false);
        fetchData();
      } else {
        showNotice('error', 'Error al guardar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo guardar el servicio.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio del catálogo?')) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Servicio eliminado', 'El servicio fue retirado del catálogo.');
        fetchData();
      } else {
        showNotice('error', 'Error al eliminar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo eliminar el servicio.');
    }
  };

  const handleToggleServiceActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, active: !service.active }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(services.map(s => s.id === service.id ? { ...s, active: !s.active } : s));
        showNotice('success', 'Estatus modificado', 'Estado del servicio actualizado.');
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo modificar el estatus.');
    }
  };

  // ─── Disponibilidad CRUD ───

  const handleWeeklyHourChange = (index: number, field: keyof WeeklyAvailability, value: any) => {
    const updated = [...weeklyHours];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyHours(updated);
  };

  const handleSaveWeeklyHours = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: weeklyHours }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Horarios guardados', 'Tu configuración semanal ha sido guardada correctamente.');
      } else {
        showNotice('error', 'Error al guardar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo guardar la configuración.');
    }
  };

  const handleSaveSmtpTemplates = () => {
    showNotice('error', 'Función en desarrollo', 'La edición de plantillas aún no se persiste; por ahora se envían las plantillas estándar del sistema.');
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day];
  };

  if (loading) {
    return <LoadingState message="Cargando catálogo y parámetros de disponibilidad..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Configuración</h1>
          <p className="text-xs text-gray-500 mt-0.5">Parámetros operativos y catálogo de Espíritu Ananda</p>
        </div>
      </div>

      {/* Alerts */}
      {alert && (
        <FeedbackAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Catálogo de Servicios
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'availability'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Horario y Disponibilidad
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'smtp'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Plantillas de Correo (SMTP)
        </button>
      </div>

      {/* ─── TAB: SERVICIOS ─── */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Servicios Activos</h2>
            <button
              onClick={() => handleOpenServiceModal()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-3xl p-6 shadow-premium border transition-all duration-300 flex flex-col justify-between ${
                  service.active ? 'border-gray-100 hover:shadow-premium-hover' : 'border-dashed border-gray-300 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-950 text-base">{service.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">/{service.slug}</p>
                    </div>
                    <button
                      onClick={() => handleToggleServiceActive(service)}
                      title={service.active ? 'Desactivar servicio' : 'Activar servicio'}
                      className="text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {service.active ? (
                        <ToggleRight className="w-9 h-9 text-violet-600" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-gray-300" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 leading-relaxed truncate-2 h-9 mb-4">
                    {service.description || 'Sin descripción redactada.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-violet-500" />
                      {service.durationMinutes} min
                    </span>
                    <span className="text-gray-900">${service.price.toLocaleString('es-CO')} COP</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenServiceModal(service)}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-[#FAF8FF] rounded-lg transition-all"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id!)}
                      className="p-2 text-gray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: DISPONIBILIDAD ─── */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Horarios Laborales</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configura qué días y en qué horas estás libre para recibir citas.</p>
          </div>

          <div className="space-y-4">
            {weeklyHours.map((hour, idx) => (
              <div key={hour.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    checked={hour.active}
                    onChange={(e) => handleWeeklyHourChange(idx, 'active', e.target.checked)}
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                  />
                  <span className={`text-sm font-semibold ${hour.active ? 'text-gray-950' : 'text-gray-400'}`}>
                    {getDayName(hour.dayOfWeek)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="time"
                    value={hour.startTime}
                    disabled={!hour.active}
                    onChange={(e) => handleWeeklyHourChange(idx, 'startTime', e.target.value)}
                    className="w-full bg-[#FAF8FF] disabled:bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                  <span className="text-gray-400 text-xs">a</span>
                  <input
                    type="time"
                    value={hour.endTime}
                    disabled={!hour.active}
                    onChange={(e) => handleWeeklyHourChange(idx, 'endTime', e.target.value)}
                    className="w-full bg-[#FAF8FF] disabled:bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveWeeklyHours}
              className="flex items-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Horarios</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB: CONFIGURACIÓN SMTP ─── */}
      {activeTab === 'smtp' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Plantillas de Notificaciones SMTP</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configura y redacta los correos electrónicos que tus clientes reciben automáticamente.</p>
          </div>

          <div className="space-y-6">
            {/* Template: Booking Confirmation */}
            <div className="space-y-4 p-5 bg-[#FAF8FF] border border-gray-100 rounded-2xl">
              <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider">Confirmación de Sesiones Astrales</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Asunto del Correo</label>
                <input
                  type="text"
                  value={smtpConfig.bookingSubject}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, bookingSubject: e.target.value })}
                  className="w-full bg-white border border-gray-150 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cuerpo del Correo (HTML/Texto)</label>
                <textarea
                  rows={6}
                  value={smtpConfig.bookingBody}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, bookingBody: e.target.value })}
                  className="w-full bg-white border border-gray-150 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 font-mono leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Etiquetas utilizables: <span className="font-mono text-violet-600">{`{cliente}, {servicio}, {fecha}, {telefono}`}</span></p>
              </div>
            </div>

            {/* Template: Product Purchase */}
            <div className="space-y-4 p-5 bg-[#FAF8FF] border border-gray-100 rounded-2xl">
              <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wider">Confirmación de Pedidos Físicos (E-commerce)</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Asunto del Correo</label>
                <input
                  type="text"
                  value={smtpConfig.orderSubject}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, orderSubject: e.target.value })}
                  className="w-full bg-white border border-gray-150 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cuerpo del Correo (HTML/Texto)</label>
                <textarea
                  rows={6}
                  value={smtpConfig.orderBody}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, orderBody: e.target.value })}
                  className="w-full bg-white border border-gray-150 rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 font-mono leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Etiquetas utilizables: <span className="font-mono text-violet-600">{`{cliente}, {total}`}</span></p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveSmtpTemplates}
              className="flex items-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Plantillas</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREAR/EDITAR SERVICIO ─── */}
      {isServiceModalOpen && currentService && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">
                {currentService.id ? 'Editar Servicio' : 'Nuevo Catálogo de Servicio'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
            
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={currentService.name}
                  onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                  placeholder="Ej. Lectura Astral Completa"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug (Identificador URL)</label>
                <input
                  type="text"
                  required
                  value={currentService.slug}
                  onChange={(e) => setCurrentService({ ...currentService, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ej. lectura-astral"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Precio (COP)</label>
                  <input
                    type="number"
                    required
                    value={currentService.price}
                    onChange={(e) => setCurrentService({ ...currentService, price: Number(e.target.value) })}
                    placeholder="80000"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duración (Minutos)</label>
                  <input
                    type="number"
                    required
                    value={currentService.durationMinutes}
                    onChange={(e) => setCurrentService({ ...currentService, durationMinutes: Number(e.target.value) })}
                    placeholder="60"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción</label>
                <textarea
                  value={currentService.description || ''}
                  onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                  placeholder="Detalles sobre qué incluye la sesión espiritual..."
                  rows={3}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
