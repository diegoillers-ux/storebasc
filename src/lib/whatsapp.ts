import { buildWhatsAppLink, buildBookingConfirmationMessage } from '@/types/whatsapp'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export function getBusinessWhatsAppLink(message: string): string {
  return buildWhatsAppLink({ phone: WHATSAPP_NUMBER, message })
}

export function getBookingConfirmationLink(params: {
  customerName: string
  serviceName: string
  scheduledAt: Date
  bookingId: string
}): string {
  const message = buildBookingConfirmationMessage(params)
  return buildWhatsAppLink({ phone: WHATSAPP_NUMBER, message })
}

export function getGeneralContactLink(): string {
  return buildWhatsAppLink({
    phone: WHATSAPP_NUMBER,
    message: '¡Hola! Me gustaría conocer más sobre los servicios de Espíritu Ananda 🌟',
  })
}

export function getServiceInquiryLink(serviceName: string): string {
  return buildWhatsAppLink({
    phone: WHATSAPP_NUMBER,
    message: `¡Hola! Me interesa el servicio de *${serviceName}*. ¿Podrías darme más información? 🙏`,
  })
}
