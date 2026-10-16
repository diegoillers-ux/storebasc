/**
 * Ayudas puras para disponibilidad: solapes y hora de Bogotá.
 * Sin E/S: todo lo verificable vive en `tests/overlaps.test.ts`.
 *
 * Bogotá (America/Bogota) es UTC-5 fijo todo el año (Colombia no observa
 * horario de verano), por lo que la conversión muro <-> instante es una
 * resta/suma exacta de 300 minutos.
 */

export const BOGOTA_OFFSET_MINUTES = 300;

/** Ventana retrospectiva al buscar reservas que puedan solapar un rango. */
export const OVERLAP_LOOKBACK_HOURS = 24;

export function rangesOverlap(aStartMs: number, aEndMs: number, bStartMs: number, bEndMs: number): boolean {
  return aStartMs < bEndMs && bStartMs < aEndMs;
}

export function bookingEndMs(scheduledAt: Date, durationMinutes: number): number {
  return scheduledAt.getTime() + durationMinutes * 60_000;
}

/** Convierte fecha/hora muro de Bogotá (1-12 mes) a instante UTC. */
export function bogotaWallToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) + BOGOTA_OFFSET_MINUTES * 60_000);
}

/** Día de semana 0-6 (0 = domingo) del calendario de Bogotá para un instante. */
export function getBogotaWeekday(date: Date): number {
  return new Date(date.getTime() - BOGOTA_OFFSET_MINUTES * 60_000).getUTCDay();
}

/** Partes muro de Bogotá (mes 1-12) para un instante. */
export function getBogotaWallParts(date: Date): { year: number; month: number; day: number } {
  const shifted = new Date(date.getTime() - BOGOTA_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export interface OverlapCandidate {
  status: string;
  scheduledAt: Date;
  durationMinutes: number;
}

/** Filtra reservas activas cuyo intervalo solapa [startMs, endMs). */
export function filterOverlappingBookings<T extends OverlapCandidate>(
  bookings: T[],
  activeStatuses: readonly string[],
  startMs: number,
  endMs: number,
): T[] {
  return bookings.filter((booking) => {
    if (!activeStatuses.includes(booking.status)) return false;
    const bookingStart = booking.scheduledAt.getTime();
    return rangesOverlap(bookingStart, bookingEndMs(booking.scheduledAt, booking.durationMinutes), startMs, endMs);
  });
}

/** Inicio ampliado para consultas: cubre reservas iniciadas antes del rango. */
export function widenRangeStart(start: Date): Date {
  return new Date(start.getTime() - OVERLAP_LOOKBACK_HOURS * 3_600_000);
}
