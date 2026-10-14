import {
  buildWhatsAppLink,
  buildBookingConfirmationMessage,
  buildBookingReminderMessage,
  buildReadingDeliveryMessage,
} from '@/types/whatsapp'

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

export function getCustomerWhatsAppLink(phone: string, message: string): string {
  return buildWhatsAppLink({ phone, message })
}

export function getBookingConfirmationCustomerLink(params: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: Date
  bookingId: string
}): string {
  return getCustomerWhatsAppLink(params.phone, buildBookingConfirmationMessage(params))
}

export function getBookingReminderLink(params: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: Date
}): string {
  return getCustomerWhatsAppLink(params.phone, buildBookingReminderMessage(params))
}

export function getReadingDeliveryLink(phone: string, customerName: string, serviceName: string): string {
  return getCustomerWhatsAppLink(phone, buildReadingDeliveryMessage(customerName, serviceName))
}
