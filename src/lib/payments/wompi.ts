import type { PaymentProvider, CreatePaymentInput, PaymentSession, PaymentEvent } from './index'
import crypto from 'crypto'

export class WompiProvider implements PaymentProvider {
  private publicKey = process.env.WOMPI_PUBLIC_KEY ?? ''
  private privateKey = process.env.WOMPI_PRIVATE_KEY ?? ''
  private webhookSecret = process.env.WOMPI_WEBHOOK_SECRET ?? ''

  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    // TODO: Implementar creación de transacción Wompi
    // https://docs.wompi.co/docs/colombia/widget-checkout-web
    throw new Error('WompiProvider: implementación pendiente')
  }

  async verifyWebhook(payload: string, signature?: string): Promise<PaymentEvent> {
    if (!signature) throw new Error('Firma de webhook requerida')
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')
    if (hash !== signature) throw new Error('Firma de webhook inválida')
    const data = JSON.parse(payload)
    return {
      referenceId: data.data?.transaction?.reference ?? '',
      status: data.data?.transaction?.status === 'APPROVED' ? 'approved' : 'rejected',
      provider: 'wompi',
      providerReference: data.data?.transaction?.id,
      amount: data.data?.transaction?.amount_in_cents / 100,
      currency: data.data?.transaction?.currency,
      raw: data,
    }
  }
}
