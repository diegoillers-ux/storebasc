import type { CalendarProvider, AvailabilityInput, TimeSlot, CreateCalendarEventInput, UpdateCalendarEventInput } from './index'

export class GoogleCalendarProvider implements CalendarProvider {
  private calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'

  private async getAuth() {
    // TODO: Implementar con googleapis usando Service Account o OAuth
    // Conservar integración existente del proyecto V1
    throw new Error('GoogleCalendarProvider: configurar autenticación')
  }

  async getAvailability(input: AvailabilityInput): Promise<TimeSlot[]> {
    // Consultar freebusy API + slots de disponibilidad definidos en BD
    // Retornar slots libres dentro del rango solicitado
    throw new Error('Implementación pendiente')
  }

  async createEvent(input: CreateCalendarEventInput): Promise<{ eventId: string; htmlLink?: string }> {
    throw new Error('Implementación pendiente')
  }

  async updateEvent(input: UpdateCalendarEventInput): Promise<void> {
    throw new Error('Implementación pendiente')
  }

  async cancelEvent(eventId: string): Promise<void> {
    throw new Error('Implementación pendiente')
  }
}
