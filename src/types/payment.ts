export type PaymentMethod = 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'CASH' | 'GATEWAY'
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia bancaria',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  CASH: 'Efectivo',
  GATEWAY: 'Pasarela de pago',
}

export const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  SUBMITTED: { label: 'Por verificar', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  APPROVED: { label: 'Aprobado', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  REJECTED: { label: 'Rechazado', color: 'text-red-600', bgColor: 'bg-red-50' },
  REFUNDED: { label: 'Reembolsado', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  CANCELLED: { label: 'Cancelado', color: 'text-gray-500', bgColor: 'bg-gray-100' },
}
