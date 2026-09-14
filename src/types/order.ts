export type OrderStatus =
  | 'NEW'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'Nuevo', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  PAYMENT_PENDING: { label: 'Pago pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  PAYMENT_SUBMITTED: { label: 'Comprobante enviado', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  PAID: { label: 'Pagado', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  PREPARING: { label: 'Preparando', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  READY: { label: 'Listo para recoger', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  SHIPPED: { label: 'Enviado', color: 'text-sky-600', bgColor: 'bg-sky-50' },
  DELIVERED: { label: 'Entregado', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50' },
  REFUNDED: { label: 'Reembolsado', color: 'text-pink-600', bgColor: 'bg-pink-50' },
}
