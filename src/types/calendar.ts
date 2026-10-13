export interface TimeSlot {
  start: string // ISO 8601
  end: string
  available: boolean
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  attendees?: { email: string; name?: string }[]
  htmlLink?: string
}

export interface CreateCalendarEventInput {
  summary: string
  description?: string
  startAt: Date
  endAt: Date
  attendeeEmail?: string
  attendeeName?: string
}
