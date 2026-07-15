/**
 * Capa adaptadora de pagos — intercambiable sin modificar lógica de reservas u órdenes
 * Proveedor activo: process.env.PAYMENT_PROVIDER (manual | wompi | epayco | payu)
 */

export interface CreatePaymentInput {
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

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentSession>
  verifyWebhook(payload: string, signature?: string): Promise<PaymentEvent>
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const provider = process.env.PAYMENT_PROVIDER ?? 'manual'
  switch (provider) {
    case 'wompi':
      const { WompiProvider } = await import('./wompi')
      return new WompiProvider()
    case 'manual':
    default:
      const { ManualProvider } = await import('./manual')
      return new ManualProvider()
  }
}
