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
  const date = params.scheduledAt.toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `¡Hola ${params.customerName}! 🌟 Tu reserva para *${params.serviceName}* ha sido confirmada para el *${date}*. Ref: #${params.bookingId.slice(-6).toUpperCase()}. Coordinaremos y entregaremos tu lectura por este medio. 🙏✨`
}

export function buildBookingReminderMessage(params: {
  customerName: string
  serviceName: string
  scheduledAt: Date
}): string {
  const date = params.scheduledAt.toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
  return `Hola ${params.customerName}, te recuerdo que tu lectura de *${params.serviceName}* está programada para ${date}. Te atenderé por este chat. 🌟`
}

export function buildReadingDeliveryMessage(customerName: string, serviceName: string): string {
  return `Hola ${customerName}, ya tengo lista tu lectura de *${serviceName}*. Te la enviaré por este chat. Cuando la recibas, cuéntame si tienes alguna pregunta. 🙏✨`
}
