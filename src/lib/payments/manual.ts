import type { PaymentProvider, CreatePaymentInput, PaymentSession, PaymentEvent, WebhookOptions } from './index'

export class ManualProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    // Pago manual: no se redirige a pasarela externa.
    // Se retorna una sesión local para que el cliente suba comprobante.
    return {
      sessionId: `manual_${input.referenceId}_${Date.now()}`,
      provider: 'manual',
    }
  }

  async verifyWebhook(payload: string, signature?: string, options?: WebhookOptions): Promise<PaymentEvent> {
    // El pago manual se verifica desde el CRM, no por webhook.
    throw new Error('ManualProvider no recibe webhooks. La verificación es manual desde el panel.')
  }
}
