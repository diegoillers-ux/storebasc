'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  User,
  Calendar,
  Image as ImageIcon,
  Save,
  Check,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Payment {
  id: string;
  customerId: string;
  bookingId: string | null;
  orderId: string | null;
  method: 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'CASH' | 'GATEWAY';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  reference: string | null;
  receiptUrl: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function PagosPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('SUBMITTED'); // default review pending

  // Detail & Drawer state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [verifyReference, setVerifyReference] = useState<string>('');
  
  // Image Viewer Modal state
  const [isImgViewerOpen, setIsImgViewerOpen] = useState<boolean>(false);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resPayments = await fetch('/api/admin/payments');
      const dataPayments = await resPayments.json();
      if (dataPayments.payments) setPayments(dataPayments.payments);

      const resCustomers = await fetch('/api/admin/customers');
      const dataCustomers = await resCustomers.json();
      if (dataCustomers.customers) setCustomers(dataCustomers.customers);
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron recuperar los pagos.');
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

  const handleVerifyPayment = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedPayment) return;

    try {
      const res = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reference: verifyReference || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice(
          'success',
          status === 'APPROVED' ? 'Pago Aprobado' : 'Pago Rechazado',
          status === 'APPROVED' 
            ? 'La reserva o pedido asociado ha sido verificado.'
            : 'El pago ha sido cancelado y marcado como rechazado.'
        );
        setSelectedPayment(null);
        setVerifyReference('');
        fetchData();
      } else {
        showNotice('error', 'Error de actualización', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo registrar la verificación de pago.');
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente Desconocido';
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Verificación de Pagos</h1>
        <p className="text-xs text-gray-500 mt-0.5">Consiliación manual de transferencias (Nequi, Daviplata, Bancolombia) y comprobantes</p>
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

      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'SUBMITTED', label: 'Pendientes por Verificar' },
          { key: 'APPROVED', label: 'Aprobados / Conciliados' },
          { key: 'REJECTED', label: 'Rechazados' },
          { key: 'ALL', label: 'Ver Todos' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilterStatus(tab.key);
              setSelectedPayment(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              filterStatus === tab.key
                ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                : 'bg-white border-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Payments list and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Payments List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <LoadingState message="Cargando transferencias..." />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden divide-y divide-gray-50">
              {filteredPayments.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">
                  No hay transferencias registradas con este filtro.
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setVerifyReference(payment.reference || '');
                    }}
                    className={`p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                      selectedPayment?.id === payment.id ? 'bg-violet-50/50' : 'hover:bg-gray-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100/50 flex items-center justify-center text-violet-600 shrink-0 select-none">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-950 text-sm leading-none">
                          {getCustomerName(payment.customerId)}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1.5">
                          Método: <span className="font-bold text-violet-600 uppercase">{payment.method}</span> • Concepto:{' '}
                          <span className="font-medium text-gray-700">{payment.bookingId ? 'Sesión Astral' : 'Producto Físico'}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Registrado el {new Date(payment.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-gray-950">
                        ${payment.amount.toLocaleString('es-CO')} COP
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Payment Detail & Receipt Drawer */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:sticky lg:top-8 min-h-[400px]">
          {selectedPayment ? (
            <div className="space-y-6">
              {/* Drawer Title */}
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-500" />
                  <h2 className="font-bold text-gray-950 text-base">Detalle de Pago</h2>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">ID: {selectedPayment.id}</p>
              </div>

              {/* Amount and Method Summary */}
              <div className="p-4 bg-[#FAF8FF] border border-gray-100/30 rounded-2xl text-center space-y-1">
                <p className="text-xs text-gray-400 font-semibold leading-none uppercase">Total Reportado</p>
                <p className="text-2xl font-black text-gray-950">${selectedPayment.amount.toLocaleString('es-CO')} COP</p>
                <span className="inline-block text-[10px] font-bold bg-violet-100/50 text-violet-700 border border-violet-200/50 px-2 py-0.5 rounded-full uppercase mt-1">
                  Vía {selectedPayment.method}
                </span>
              </div>

              {/* Customer summary */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  <span>Cliente: <span className="font-bold text-gray-900">{getCustomerName(selectedPayment.customerId)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  <span>Fecha: <span>{new Date(selectedPayment.createdAt).toLocaleString('es-CO')}</span></span>
                </div>
              </div>

              {/* Receipt Voucher Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comprobante de Transferencia</h3>
                {selectedPayment.receiptUrl ? (
                  <div
                    onClick={() => setIsImgViewerOpen(true)}
                    className="relative border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 h-44 flex items-center justify-center cursor-zoom-in group shadow-sm"
                  >
                    <img
                      src={selectedPayment.receiptUrl}
                      alt="Recibo de pago"
                      className="h-full w-full object-contain p-2 group-hover:scale-[1.02] transition-all"
                    />
                    <div className="absolute inset-0 bg-[#1A0F3D]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      Ampliar Recibo
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-2xl h-24 flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-1 bg-[#FAF8FF]">
                    <ImageIcon className="w-6 h-6 opacity-40 text-violet-500" />
                    <p className="text-[10px] font-bold">No se cargó captura</p>
                  </div>
                )}
              </div>

              {/* Audit Reference Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Código / Referencia Bancaria</label>
                <input
                  type="text"
                  value={verifyReference}
                  onChange={(e) => setVerifyReference(e.target.value)}
                  placeholder="Ej. Ref # 1205934"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 shadow-sm"
                />
              </div>

              {/* Verification Action Buttons */}
              {selectedPayment.status === 'SUBMITTED' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleVerifyPayment('APPROVED')}
                    className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar</span>
                  </button>
                  <button
                    onClick={() => handleVerifyPayment('REJECTED')}
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-coral-50 text-coral-600 border border-coral-100 py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full text-gray-400 space-y-3 select-none">
              <CreditCard className="w-8 h-8 opacity-40 text-violet-500 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-gray-500">Ningún Pago Seleccionado</p>
                <p className="text-[10px] text-gray-400 mt-1">Elige una transferencia de la lista de pendientes para auditar la captura de pantalla y aprobar.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ─── MODAL: AMPLIAR COMPROBANTE ─── */}
      {isImgViewerOpen && selectedPayment && selectedPayment.receiptUrl && (
        <div className="fixed inset-0 bg-[#1A0F3D]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="relative bg-white rounded-3xl p-3 max-w-lg w-full max-h-[85vh] shadow-premium border border-gray-100 overflow-hidden flex flex-col">
            <button
              onClick={() => setIsImgViewerOpen(false)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-600 p-2 rounded-full shadow-md z-10 transition-colors"
              title="Cerrar vista"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-2 bg-gray-50 rounded-2xl">
              <img
                src={selectedPayment.receiptUrl}
                alt="Comprobante completo"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="p-4 text-center text-xs font-bold text-gray-600">
              {getCustomerName(selectedPayment.customerId)} - ${selectedPayment.amount.toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
