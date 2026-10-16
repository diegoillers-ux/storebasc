import { test, expect, type APIRequestContext } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * E2E sandbox Mercado Pago (TEST, sin dinero real).
 * Usa las credenciales locales (.env) sin mostrarlas: solo se registran
 * presencia/ausencia y los IDs públicos devueltos por la API.
 * Se omite si no hay ACCESS_TOKEN de prueba configurado.
 */

function readLocalEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const file of ['.env.local', '.env']) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (match) env[match[1]] = match[2];
    }
  }
  return env;
}

function hasSandboxToken(env: Record<string, string>): boolean {
  const token = env.MERCADOPAGO_ACCESS_TOKEN || '';
  return token.startsWith('TEST-') && !token.includes('0000000000000000');
}

function sandboxReady(): boolean {
  if (process.env.MP_SANDBOX_E2E !== '1') {
    test.skip(true, 'Sandbox MP no habilitado (MP_SANDBOX_E2E=1 para ejecutar)');
    return false;
  }
  if (!hasSandboxToken(readLocalEnv())) {
    test.skip(true, 'Sin ACCESS_TOKEN sandbox de prueba en .env');
    return false;
  }
  return true;
}

async function postJson(request: APIRequestContext, url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await request.post(url, {
    data: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
  return { status: response.status(), json: (await response.json().catch(() => null)) as Record<string, unknown> | null };
}

test('sandbox: preferencia real vía nuestro checkout', async ({ request }) => {
  if (!sandboxReady()) return;
  const ref = `E2E-SANDBOX-${Date.now()}`;
  const { status, json } = await postJson(request, '/api/checkout/preference', {
    type: 'booking',
    referenceId: ref,
    amount: 1000,
    description: 'Prueba sandbox automatizada (sin cargo)',
    customerEmail: 'test_user_sandbox@example.com',
  });
  expect(status, `preferencia sandbox ${JSON.stringify(json)}`).toBe(200);
  expect(json?.success).toBe(true);
  expect(String(json?.initPoint || '')).toContain('mercadopago');
});

test('sandbox: notificación sin ID frena reintentos (200 permanente)', async ({ request }) => {
  if (!sandboxReady()) return;
  const { status, json } = await postJson(request, '/api/webhooks/mercadopago?type=payment', { id: null });
  expect(status).toBe(200);
  expect(json?.received).toBe(false);
});

test('sandbox: HMAC válido con pago inexistente es transitorio (500)', async ({ request }) => {
  if (!sandboxReady()) return;
  const env = readLocalEnv();
  const secret = env.MERCADOPAGO_WEBHOOK_SECRET || '';
  test.skip(!secret, 'Sin WEBHOOK_SECRET local: no se puede firmar la prueba');
  const dataId = '99999999999';
  const ts = String(Math.floor(Date.now() / 1000));
  const requestId = `e2e-${Date.now()}`;
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const { status } = await postJson(
    request,
    `/api/webhooks/mercadopago?type=payment&data.id=${dataId}`,
    JSON.stringify({ action: 'payment.created', data: { id: dataId } }),
    { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId },
  );
  // El pago no existe en sandbox: la API de MP falla y el webhook pide reintento.
  expect(status).toBe(500);
});
