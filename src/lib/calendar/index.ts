/**
 * Capa de abstracción para Google Calendar
 * Usa Service Account para acceso server-side sin interacción del usuario
 */

export interface AvailabilityInput {
  serviceId: string
  from: Date
  to: Date
  durationMinutes: number
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}

export interface CreateCalendarEventInput {
  summary: string
  description?: string
  startAt: Date
  endAt: Date
  attendeeEmail?: string
  attendeeName?: string
  location?: string
}

export interface UpdateCalendarEventInput extends Partial<CreateCalendarEventInput> {
  eventId: string
}

export interface CalendarProvider {
  getAvailability(input: AvailabilityInput): Promise<TimeSlot[]>
  createEvent(input: CreateCalendarEventInput): Promise<{ eventId: string; htmlLink?: string }>
  updateEvent(input: UpdateCalendarEventInput): Promise<void>
  cancelEvent(eventId: string): Promise<void>
}

export async function getCalendarProvider(): Promise<CalendarProvider> {
  const { GoogleCalendarProvider } = await import('./google')
  return new GoogleCalendarProvider()
}
