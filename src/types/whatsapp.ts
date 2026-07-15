/**
 * Genera un enlace wa.me directo con mensaje prellenado
 */
export function buildWhatsAppLink({
  phone,
  message,
}: {
  phone: string
  message: string
}): string {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function buildBookingConfirmationMessage(params: {
  customerName: string
  serviceName: string
  scheduledAt: Date
  bookingId: string
}): string {
  const date = params.scheduledAt.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `¡Hola ${params.customerName}! 🌟 Tu reserva para *${params.serviceName}* ha sido confirmada para el *${date}*. Ref: #${params.bookingId.slice(-6).toUpperCase()}. Pronto me comunico contigo por aquí para coordinar los detalles. 🙏✨`
}
