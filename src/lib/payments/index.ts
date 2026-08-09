/**
 * Capa adaptadora de pagos — intercambiable sin modificar lógica de reservas u órdenes
 * Proveedor activo: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER o process.env.PAYMENT_PROVIDER ('manual' | 'mercadopago')
 */

export interface CreatePaymentInput {
  type?: 'booking' | 'order'
  amount: number
  currency: string
  referenceId: string // bookingId u orderId
  customerEmail?: string
  customerName?: string
  description: string
  redirectUrl: string
}

export interface PaymentSession {
  sessionId: string
  redirectUrl?: string // solo pasarela
  provider: string
  expiresAt?: Date
}

export interface PaymentEvent {
  referenceId: string
  status: 'approved' | 'rejected' | 'pending'
  provider: string
  providerReference?: string
  amount: number
  currency: string
  raw: unknown
}

export interface WebhookOptions {
  requestId?: string
  dataId?: string
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentSession>
  verifyWebhook(payload: string, signature?: string, options?: WebhookOptions): Promise<PaymentEvent>
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? process.env.PAYMENT_PROVIDER ?? 'manual'
  switch (provider.toLowerCase()) {
    case 'mercadopago':
      const { MercadoPagoProvider } = await import('./mercadopago')
      return new MercadoPagoProvider()
    case 'manual':
    default:
      const { ManualProvider } = await import('./manual')
      return new ManualProvider()
  }
}
