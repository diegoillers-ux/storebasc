import assert from 'node:assert/strict'
import test from 'node:test'
import { generateAvailableDays } from '../src/lib/calendar/available-days'

test('uses the Bogotá business date when the server clock is on the next UTC day', () => {
  const days = generateAvailableDays(new Date('2026-10-15T02:00:00.000Z'))

  assert.equal(days[0]?.dateStr, '2026-10-15')
  assert.equal(days[0]?.dayName, 'jue')
})

test('skips Sundays in the generated two-week window', () => {
  const days = generateAvailableDays(new Date('2026-10-16T17:00:00.000Z'))

  assert.ok(days.every((day) => day.dayName !== 'dom'))
})
