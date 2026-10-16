/**
 * Semántica de webhooks de pago: qué reintenta el proveedor y qué no.
 * Puro y testeado en `tests/webhook-payments.test.ts`.
 *
 * - Fallo permanente (firma inválida, payload sin ID): responder 200 para
 *   frenar reintentos inútiles; nunca se volverá válido.
 * - Fallo transitorio (BD caída, API del proveedor): responder 500 para que
 *   el proveedor reintente.
 * - Clave duplicada (23505): entrega duplicada ya registrada → idempotente.
 */

/** Error de validación permanente: no reintentar. */
export class WebhookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookValidationError';
  }
}

/** Códigos PG de escritura duplicada (única / exclusión). */
export function isDuplicateKeyError(code: string | undefined): boolean {
  return code === '23505' || code === '23P01';
}

export type WebhookOutcome = 'idempotent' | 'permanent' | 'transient';

/** Clasifica un error de procesamiento para elegir el HTTP de respuesta. */
export function classifyWebhookError(error: unknown): WebhookOutcome {
  if (error instanceof WebhookValidationError) return 'permanent';
  const code = (error as { code?: string } | null)?.code;
  if (isDuplicateKeyError(code)) return 'idempotent';
  return 'transient';
}
