import { getGoogleCalendarClient } from '../googleCalendar';
import { availabilityRepository } from '@/lib/supabase/repositories/availability';
import type { CalendarProvider, AvailabilityInput, TimeSlot, CreateCalendarEventInput, UpdateCalendarEventInput } from './index';

export class GoogleCalendarProvider implements CalendarProvider {
  private calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID ?? 'primary';

  async getAvailability(input: AvailabilityInput): Promise<TimeSlot[]> {
    try {
      const { from, to, durationMinutes } = input;
      
      // 1. Obtener configuraciones de horario laboral de Supabase
      const weeklyAvails = await availabilityRepository.listWeekly();
      const blockedSlots = await availabilityRepository.listBlocked(from, to);

      // 2. Consultar slots ocupados (Freebusy) desde Google Calendar
      const calendar = getGoogleCalendarClient();
      const freebusyRes = await calendar.freebusy.query({
        requestBody: {
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          timeZone: 'America/Bogota',
          items: [{ id: this.calendarId }],
        },
      });

      const googleBusyEvents = freebusyRes.data.calendars?.[this.calendarId]?.busy || [];

      // 3. Generar franjas horarias (slots) de trabajo
      const slots: TimeSlot[] = [];
      const currentDate = new Date(from);

      while (currentDate <= to) {
        const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
        
        // Buscar si existe disponibilidad configurada para este día de la semana
        const dayConfig = weeklyAvails.find((av) => av.dayOfWeek === dayOfWeek && av.active);
        
        if (dayConfig) {
          // Parsear inicio y fin (ej. "09:00" y "18:00")
          const [startHour, startMin] = dayConfig.startTime.split(':').map(Number);
          const [endHour, endMin] = dayConfig.endTime.split(':').map(Number);

          const slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMin, 0, 0);

          const slotEndBoundary = new Date(currentDate);
          slotEndBoundary.setHours(endHour, endMin, 0, 0);

          // Generar slots consecutivos de acuerdo a la duración del servicio
          while (slotStart.getTime() + durationMinutes * 60_000 <= slotEndBoundary.getTime()) {
            const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);
            
            // Verificar si el slot está bloqueado
            const isBlocked = blockedSlots.some((blocked) => {
              const bStart = new Date(blocked.startAt).getTime();
              const bEnd = new Date(blocked.endAt).getTime();
              const sStart = slotStart.getTime();
              const sEnd = slotEnd.getTime();
              return sStart < bEnd && sEnd > bStart;
            });

            // Verificar si el slot está ocupado en Google Calendar
            const isGoogleBusy = googleBusyEvents.some((busy) => {
              const busyStart = new Date(busy.start || '').getTime();
              const busyEnd = new Date(busy.end || '').getTime();
              const sStart = slotStart.getTime();
              const sEnd = slotEnd.getTime();
              return sStart < busyEnd && sEnd > busyStart;
            });

            // Si está libre en ambas fuentes, se marca disponible
            slots.push({
              start: new Date(slotStart),
              end: new Date(slotEnd),
              available: !isBlocked && !isGoogleBusy,
            });

            // Avanzar al siguiente slot
            slotStart.setTime(slotStart.getTime() + durationMinutes * 60_000);
          }
        }

        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return slots;
    } catch (error) {
      console.error('Error calculating availability:', error);
      return [];
    }
  }

  async createEvent(input: CreateCalendarEventInput): Promise<{ eventId: string; htmlLink?: string }> {
    const calendar = getGoogleCalendarClient();
    const response = await calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: {
          dateTime: input.startAt.toISOString(),
          timeZone: 'America/Bogota',
        },
        end: {
          dateTime: input.endAt.toISOString(),
          timeZone: 'America/Bogota',
        },
        attendees: input.attendeeEmail
          ? [{ email: input.attendeeEmail, displayName: input.attendeeName || undefined }]
          : [],
      },
    });

    return {
      eventId: response.data.id || '',
      htmlLink: response.data.htmlLink || undefined,
    };
  }

  async updateEvent(input: UpdateCalendarEventInput): Promise<void> {
    const calendar = getGoogleCalendarClient();
    const requestBody: any = {};
    
    if (input.summary) requestBody.summary = input.summary;
    if (input.description !== undefined) requestBody.description = input.description;
    if (input.location !== undefined) requestBody.location = input.location;
    
    if (input.startAt) {
      requestBody.start = {
        dateTime: input.startAt.toISOString(),
        timeZone: 'America/Bogota',
      };
    }
    if (input.endAt) {
      requestBody.end = {
        dateTime: input.endAt.toISOString(),
        timeZone: 'America/Bogota',
      };
    }
    if (input.attendeeEmail) {
      requestBody.attendees = [{ email: input.attendeeEmail, displayName: input.attendeeName || undefined }];
    }

    await calendar.events.patch({
      calendarId: this.calendarId,
      eventId: input.eventId,
      requestBody,
    });
  }

  async cancelEvent(eventId: string): Promise<void> {
    const calendar = getGoogleCalendarClient();
    await calendar.events.delete({
      calendarId: this.calendarId,
      eventId,
    });
  }
}
