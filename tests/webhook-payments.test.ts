import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WebhookValidationError,
  classifyWebhookError,
  isDuplicateKeyError,
} from '../src/lib/payments/webhook'
import { MercadoPagoProvider } from '../src/lib/payments/mercadopago'

test('isDuplicateKeyError solo acepta colisión de escritura', () => {
  assert.equal(isDuplicateKeyError('23505'), true)
  assert.equal(isDuplicateKeyError('23P01'), true)
  assert.equal(isDuplicateKeyError('42P17'), false)
  assert.equal(isDuplicateKeyError(undefined), false)
})

test('classifyWebhookError: validación y duplicado no son transitorios', () => {
  assert.equal(classifyWebhookError(new WebhookValidationError('firma')), 'permanent')
  assert.equal(classifyWebhookError({ code: '23505' }), 'idempotent')
  assert.equal(classifyWebhookError(new Error('ECONNREFUSED')), 'transient')
  assert.equal(classifyWebhookError({ code: 'XX000' }), 'transient')
})

test('verifyWebhook sin ID de pago es error permanente (sin red)', async () => {
  const provider = new MercadoPagoProvider()
  await assert.rejects(
    provider.verifyWebhook('{}', undefined, {}),
    (err: unknown) => err instanceof WebhookValidationError,
  )
})

test('verifyWebhook con firma inválida es error permanente (sin red)', async () => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'test-secret'
  const provider = new MercadoPagoProvider()
  try {
    await assert.rejects(
      provider.verifyWebhook(JSON.stringify({ data: { id: '123' } }), 'ts=1,v1=deadbeef', { dataId: '123' }),
      (err: unknown) => err instanceof WebhookValidationError,
    )
  } finally {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET
  }
})
