import type { PaymentProvider, CreatePaymentInput, PaymentSession, PaymentEvent, WebhookOptions } from './index'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import crypto from 'crypto'

export class MercadoPagoProvider implements PaymentProvider {
  private accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? ''
  private webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ''

  private getClient() {
    if (!this.accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurada')
    }
    return new MercadoPagoConfig({ accessToken: this.accessToken })
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    const client = this.getClient()
    const preference = new Preference(client)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const notificationUrl = `${appUrl}/api/webhooks/mercadopago`
    const targetType = input.type || 'booking'

    let baseUrl = input.redirectUrl || `${appUrl}/checkout`
    if (baseUrl.startsWith('/')) {
      baseUrl = `${appUrl}${baseUrl}`
    }

    const separator = baseUrl.includes('?') ? '&' : '?'
    const successUrl = `${baseUrl}${separator}type=${targetType}&status=approved&ref=${input.referenceId}`
    const failureUrl = `${baseUrl}${separator}type=${targetType}&status=failure&ref=${input.referenceId}`
    const pendingUrl = `${baseUrl}${separator}type=${targetType}&status=pending&ref=${input.referenceId}`

    const body: any = {
      items: [
        {
          id: input.referenceId,
          title: input.description || 'Compra en Espíritu Ananda',
          quantity: 1,
          unit_price: Number(input.amount),
          currency_id: input.currency || 'COP',
        },
      ],
      external_reference: input.referenceId,
      notification_url: notificationUrl,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
    }

    // Mercado Pago exige que back_urls.success sea HTTPS para enviar auto_return
    if (successUrl.startsWith('https://')) {
      body.auto_return = 'approved'
    }

    if (input.customerEmail) {
      body.payer = {
        email: input.customerEmail,
        name: input.customerName || undefined,
      }
    }

    const response = await preference.create({ body })

    const redirectUrl = response.init_point || response.sandbox_init_point || ''

    return {
      sessionId: response.id || input.referenceId,
      redirectUrl,
      provider: 'mercadopago',
    }
  }

  async verifyWebhook(payload: string, signature?: string, options?: WebhookOptions): Promise<PaymentEvent> {
    let paymentId = options?.dataId || ''
    if (!paymentId) {
      try {
        const data = JSON.parse(payload)
        paymentId = String(data.data?.id || data.id || data['data.id'] || '')
      } catch {
        try {
          const searchParams = new URLSearchParams(payload)
          paymentId = searchParams.get('data.id') || searchParams.get('id') || ''
        } catch {
          // query
        }
      }
    }

    if (!paymentId) {
      throw new Error('ID de pago no provisto en la notificación de Mercado Pago')
    }

    if (!this.webhookSecret && process.env.NODE_ENV === 'production') {
      throw new Error('MERCADOPAGO_WEBHOOK_SECRET es obligatorio en producción: webhook rechazado.')
    }

    if (this.webhookSecret) {
      this.validateSignature(paymentId, signature, options?.requestId, options?.dataId)
    }

    const client = this.getClient()
    const paymentClient = new Payment(client)
    const paymentData = await paymentClient.get({ id: paymentId })

    const statusMap: Record<string, 'approved' | 'rejected' | 'pending'> = {
      approved: 'approved',
      rejected: 'rejected',
      cancelled: 'rejected',
      refunded: 'rejected',
      charged_back: 'rejected',
      in_process: 'pending',
      pending: 'pending',
    }

    const status = statusMap[paymentData.status || ''] || 'pending'

    return {
      referenceId: paymentData.external_reference || '',
      status,
      provider: 'mercadopago',
      providerReference: String(paymentData.id),
      amount: Number(paymentData.transaction_amount || 0),
      currency: paymentData.currency_id || 'COP',
      raw: paymentData,
    }
  }

  private validateSignature(paymentId: string, xSignature?: string, xRequestId?: string, dataId?: string) {
    if (!this.webhookSecret) return
    if (!xSignature) {
      throw new Error('Firma x-signature requerida pero no provista')
    }

    let ts = ''
    let v1 = ''
    for (const part of xSignature.split(',')) {
      const eq = part.indexOf('=')
      if (eq === -1) continue
      const key = part.slice(0, eq).trim()
      const val = part.slice(eq + 1).trim()
      if (key === 'ts') ts = val
      if (key === 'v1') v1 = val
    }

    if (!ts || !v1) {
      throw new Error('Formato de firma x-signature inválido')
    }

    const cleanDataId = (dataId || paymentId).toLowerCase()
    const parts: string[] = []
    if (cleanDataId) parts.push(`id:${cleanDataId}`)
    if (xRequestId) parts.push(`request-id:${xRequestId}`)
    parts.push(`ts:${ts}`)
    const manifest = parts.join(';') + ';'

    const hmac = crypto.createHmac('sha256', this.webhookSecret).update(manifest).digest('hex')

    if (hmac !== v1) {
      const altManifest = `id:${paymentId};request-timestamp:${ts};`
      const altHmac = crypto.createHmac('sha256', this.webhookSecret).update(altManifest).digest('hex')
      if (altHmac !== v1) {
        throw new Error('Firma de Webhook de Mercado Pago no válida (HMAC mismatch)')
      }
    }
  }
}
