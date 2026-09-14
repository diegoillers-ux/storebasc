export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'

export interface BookingStatusConfig {
  label: string
  color: string
  bgColor: string
  description: string
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, BookingStatusConfig> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-500', bgColor: 'bg-gray-100', description: 'Reserva iniciada, sin confirmar' },
  PENDING_PAYMENT: { label: 'Pago pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Esperando pago del cliente' },
  PAYMENT_SUBMITTED: { label: 'Comprobante enviado', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Cliente envió comprobante, pendiente verificación' },
  CONFIRMED: { label: 'Confirmada', color: 'text-violet-600', bgColor: 'bg-violet-50', description: 'Pago verificado, sesión agendada' },
  RESCHEDULED: { label: 'Reprogramada', color: 'text-indigo-600', bgColor: 'bg-indigo-50', description: 'Fecha cambiada por acuerdo' },
  CANCELLED: { label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Reserva cancelada' },
  COMPLETED: { label: 'Realizada', color: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Sesión completada exitosamente' },
  NO_SHOW: { label: 'No asistió', color: 'text-gray-600', bgColor: 'bg-gray-100', description: 'Cliente no se presentó' },
}
