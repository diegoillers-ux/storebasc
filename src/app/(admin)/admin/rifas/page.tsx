'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  User,
  Phone,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Rifa {
  id: string;
  title: string;
  pricePerNumber: number;
  totalNumbers: number;
  soldCount: number;
  active: boolean;
  prizeDescription: string | null;
  winnerNumber?: number;
  winnerName?: string;
  createdAt: string;
}

interface Ticket {
  number: number;
  customerName: string;
  phone: string;
  status: 'PAID' | 'PENDING_PAYMENT';
}

export default function RifasPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);

  // Winner result state
  const [drawing, setDrawing] = useState<boolean>(false);
  const [winnerResult, setWinnerResult] = useState<{ number: number; name: string; phone: string } | null>(null);

  // New Rifa state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newRifa, setNewRifa] = useState({
    title: '',
    pricePerNumber: 10000,
    totalNumbers: 100,
    prizeDescription: '',
  });

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rifas');
      const data = await res.json();
      if (data.rifas) {
        setRifas(data.rifas);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron recuperar las rifas.');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchTickets = async (rifaId: string) => {
    setLoadingTickets(true);
    setWinnerResult(null);
    try {
      const res = await fetch(`/api/admin/rifas/${rifaId}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch {
      showNotice('error', 'Error de conexión', 'No se pudieron cargar los números vendidos.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCreateRifa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRifa.title || !newRifa.pricePerNumber || !newRifa.totalNumbers) return;

    try {
      const res = await fetch('/api/admin/rifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRifa),
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Rifa creada', 'El nuevo sorteo ha sido abierto al público.');
        setIsCreateModalOpen(false);
        setNewRifa({ title: '', pricePerNumber: 10000, totalNumbers: 100, prizeDescription: '' });
        fetchRifas();
      } else {
        showNotice('error', 'Error al crear', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo crear el sorteo.');
    }
  };

  const handleDrawWinner = async () => {
    if (!selectedRifa) return;
    
    setDrawing(true);
    setWinnerResult(null);

    try {
      const res = await fetch(`/api/admin/rifas/${selectedRifa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draw' }),
      });
      const data = await res.json();

      if (data.success) {
        setWinnerResult({
          number: data.winnerNumber,
          name: data.winnerName,
          phone: data.winnerPhone,
        });

        // Actualizar estado localmente
        setRifas(rifas.map(r => r.id === selectedRifa.id ? { ...r, active: false, winnerNumber: data.winnerNumber, winnerName: data.winnerName } : r));
        setSelectedRifa({ ...selectedRifa, active: false, winnerNumber: data.winnerNumber, winnerName: data.winnerName });
      } else {
        showNotice('error', 'Sorteo fallido', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo seleccionar el boleto ganador.');
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Gestión de Sorteos y Rifas</h1>
          <p className="text-xs text-gray-500 mt-0.5">Administra campañas de rifas astrales y selecciona ganadores de forma aleatoria</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Sorteo</span>
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

      {/* Main Grid: list and drawers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Active/Closed Raffles list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <LoadingState message="Cargando sorteos..." />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden divide-y divide-gray-50">
              {rifas.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">
                  No hay sorteos creados.
                </div>
              ) : (
                rifas.map((rifa) => (
                  <div
                    key={rifa.id}
                    onClick={() => {
                      setSelectedRifa(rifa);
                      fetchTickets(rifa.id);
                    }}
                    className={`p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                      selectedRifa?.id === rifa.id ? 'bg-violet-50/50' : 'hover:bg-gray-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 select-none">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-950 text-sm leading-tight">
                          {rifa.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1.5">
                          Números vendidos: <span className="font-bold text-gray-700">{rifa.soldCount} boletos</span> • Costo:{' '}
                          <span className="font-medium text-gray-700">${rifa.pricePerNumber.toLocaleString('es-CO')} COP</span>
                        </p>
                        {rifa.winnerName && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">
                            Ganador: Número {rifa.winnerNumber} ({rifa.winnerName})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        rifa.active
                          ? 'bg-teal-50 text-teal-600 border border-teal-100'
                          : 'bg-gray-50 text-gray-500 border border-gray-100'
                      }`}>
                        {rifa.active ? 'Activo' : 'Cerrado'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Raffle detailed drawer */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:sticky lg:top-8 min-h-[400px]">
          {selectedRifa ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-bold text-gray-950 text-base leading-tight">{selectedRifa.title}</h2>
                {selectedRifa.prizeDescription && (
                  <p className="text-xs text-gray-500 mt-2 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100/50">
                    Premio: {selectedRifa.prizeDescription}
                  </p>
                )}
              </div>

              {/* Draw Actions */}
              {selectedRifa.active ? (
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones del Sorteo</h3>
                  
                  {drawing ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8FF] border border-violet-100 rounded-2xl text-center space-y-2">
                      <Sparkles className="w-6 h-6 text-violet-500 animate-spin" />
                      <p className="text-xs font-bold text-violet-900">Calculando destino astral...</p>
                      <p className="text-[10px] text-gray-400">Seleccionando boleto ganador entre números pagados...</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleDrawWinner}
                      className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Elegir Ganador Aleatorio</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-teal-900 text-xs space-y-1.5">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>Sorteo Finalizado</span>
                  </p>
                  <p className="opacity-90">
                    Boleto Ganador: <span className="font-extrabold">Número {selectedRifa.winnerNumber}</span>
                  </p>
                  <p className="opacity-90">
                    Afortunado/a: <span className="font-bold">{selectedRifa.winnerName}</span>
                  </p>
                </div>
              )}

              {/* Celebrating Winner card */}
              {winnerResult && (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-3 animate-fade-in">
                  <Sparkles className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm">¡Ganador Seleccionado!</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">NÚMERO GANADOR: {winnerResult.number}</p>
                    <p className="text-xs font-extrabold text-gray-900 mt-2">{winnerResult.name}</p>
                  </div>
                  <a
                    href={`https://wa.me/${winnerResult.phone}?text=Felicidades%20has%20ganado%20el%20sorteo!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Sold numbers checklist */}
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boletos Vendidos</h3>
                {loadingTickets ? (
                  <div className="py-6 text-center text-xs text-gray-400 animate-pulse">Cargando boletos...</div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto pr-1">
                    {tickets.map((t, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-900 text-[10px] shrink-0">
                            {t.number}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 leading-none">{t.customerName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{t.phone}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          t.status === 'PAID'
                            ? 'bg-teal-50 text-teal-600 border border-teal-100'
                            : 'bg-gold-50 text-gold-500 border border-gold-100'
                        }`}>
                          {t.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full text-gray-400 space-y-3 select-none">
              <Award className="w-8 h-8 opacity-40 text-violet-500 animate-spin" />
              <div>
                <p className="text-xs font-bold text-gray-500">Ningún Sorteo Seleccionado</p>
                <p className="text-[10px] text-gray-400 mt-1">Elige una rifa del listado para gestionar sus números vendidos y seleccionar al ganador.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: CREAR SORTEO ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">Crear Nuevo Sorteo</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateRifa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del Sorteo / Campaña</label>
                <input
                  type="text"
                  required
                  value={newRifa.title}
                  onChange={(e) => setNewRifa({ ...newRifa, title: e.target.value })}
                  placeholder="Ej. Rifa Astral del Solsticio de Invierno"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Costo por Número (COP)</label>
                  <input
                    type="number"
                    required
                    value={newRifa.pricePerNumber}
                    onChange={(e) => setNewRifa({ ...newRifa, pricePerNumber: Number(e.target.value) })}
                    placeholder="10000"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Total de Boletos</label>
                  <input
                    type="number"
                    required
                    value={newRifa.totalNumbers}
                    onChange={(e) => setNewRifa({ ...newRifa, totalNumbers: Number(e.target.value) })}
                    placeholder="100"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción del Premio</label>
                <textarea
                  value={newRifa.prizeDescription}
                  onChange={(e) => setNewRifa({ ...newRifa, prizeDescription: e.target.value })}
                  placeholder="Ej. Lectura de Carta Astral personalizada y kit de cuarzo rosa con sahumerio de copal..."
                  rows={3}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Abrir Sorteo</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
