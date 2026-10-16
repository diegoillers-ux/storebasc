import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BOGOTA_OFFSET_MINUTES,
  bogotaWallToUtc,
  filterOverlappingBookings,
  getBogotaWeekday,
  getBogotaWallParts,
  rangesOverlap,
  widenRangeStart,
} from '../src/lib/calendar/overlaps'

const ACTIVE = ['PENDING_PAYMENT', 'CONFIRMED'] as const

function booking(status: string, startIso: string, durationMinutes: number) {
  return { status, scheduledAt: new Date(startIso), durationMinutes }
}

test('rangesOverlap detecta solape parcial por ambos lados', () => {
  assert.equal(rangesOverlap(0, 10, 5, 15), true)
  assert.equal(rangesOverlap(5, 15, 0, 10), true)
})

test('rangesOverlap detecta envolvente y contenido', () => {
  assert.equal(rangesOverlap(0, 20, 5, 15), true)
  assert.equal(rangesOverlap(5, 15, 0, 20), true)
})

test('rangesOverlap: adyacencia exacta no es solape', () => {
  assert.equal(rangesOverlap(0, 10, 10, 20), false)
  assert.equal(rangesOverlap(10, 20, 0, 10), false)
})

test('filterOverlappingBookings encuentra reserva iniciada antes del rango', () => {
  const long = booking('CONFIRMED', '2026-10-20T14:00:00-05:00', 120)
  const found = filterOverlappingBookings(
    [long],
    ACTIVE,
    new Date('2026-10-20T15:00:00-05:00').getTime(),
    new Date('2026-10-20T16:00:00-05:00').getTime(),
  )
  assert.equal(found.length, 1)
})

test('filterOverlappingBookings ignora estados inactivos y adyacentes', () => {
  const cancelled = booking('CANCELLED', '2026-10-20T15:00:00-05:00', 60)
  const adjacent = booking('CONFIRMED', '2026-10-20T14:00:00-05:00', 60)
  const found = filterOverlappingBookings(
    [cancelled, adjacent],
    ACTIVE,
    new Date('2026-10-20T15:00:00-05:00').getTime(),
    new Date('2026-10-20T16:00:00-05:00').getTime(),
  )
  assert.equal(found.length, 0)
})

test('mismo instante en UTC y Bogotá solapa', () => {
  const utc = booking('CONFIRMED', '2026-10-20T15:00:00.000Z', 60)
  const found = filterOverlappingBookings(
    [utc],
    ACTIVE,
    new Date('2026-10-20T10:00:00-05:00').getTime(),
    new Date('2026-10-20T11:00:00-05:00').getTime(),
  )
  assert.equal(found.length, 1)
})

test('Bogotá es UTC-5 fijo sin horario de verano', () => {
  assert.equal(BOGOTA_OFFSET_MINUTES, 300)
  const slot = bogotaWallToUtc(2026, 10, 20, 9, 0)
  assert.equal(slot.toISOString(), '2026-10-20T14:00:00.000Z')
})

test('día de semana y partes muro usan Bogotá aunque el servidor esté en UTC', () => {
  // 2026-10-20T02:00Z son las 21:00 del lunes 19 en Bogotá
  const instant = new Date('2026-10-20T02:00:00.000Z')
  assert.equal(getBogotaWeekday(instant), 1)
  assert.deepEqual(getBogotaWallParts(instant), { year: 2026, month: 10, day: 19 })
})

test('widenRangeStart amplía 24h la ventana de búsqueda', () => {
  const start = new Date('2026-10-20T15:00:00-05:00')
  const widened = widenRangeStart(start)
  assert.equal(widened.getTime(), start.getTime() - 24 * 3_600_000)
  assert.equal(widened.toISOString(), '2026-10-19T20:00:00.000Z')
})
