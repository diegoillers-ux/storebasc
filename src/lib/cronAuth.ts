import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET || '';

  // En producción el secreto es obligatorio: sin CRON_SECRET el endpoint falla cerrado.
  if (process.env.NODE_ENV === 'production' && !expected) {
    return false;
  }

  if (!expected) {
    return true; // Solo en desarrollo local sin CRON_SECRET
  }

  const provided = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
