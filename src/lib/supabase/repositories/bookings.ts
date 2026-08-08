import { getAdminSupabase } from '../server';

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface Booking {
  id?: string;
  customerId: string;
  serviceId: string;
  adminId: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  notes: string | null;
  calendarEventId: string | null;
  whatsappLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingEvent {
  id?: string;
  bookingId: string;
  type: string;
  description: string;
  createdAt: Date;
}

function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceId: row.service_id,
    adminId: row.admin_id || null,
    scheduledAt: new Date(row.scheduled_at),
    durationMinutes: Number(row.duration_minutes || 60),
    status: row.status as BookingStatus,
    notes: row.notes || null,
    calendarEventId: row.calendar_event_id || null,
    whatsappLink: row.whatsapp_link || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const bookingRepository = {
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await getAdminSupabase()
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapBookingFromDb(data);
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      id,
      customer_id: booking.customerId,
      service_id: booking.serviceId,
      admin_id: booking.adminId,
      scheduled_at: booking.scheduledAt.toISOString(),
      duration_minutes: booking.durationMinutes,
      status: booking.status,
      notes: booking.notes,
      calendar_event_id: booking.calendarEventId,
      whatsapp_link: booking.whatsappLink,
    };

    const { data, error } = await getAdminSupabase()
      .from('bookings')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create booking in Supabase: ${error.message}`);

    await this.addEvent(data.id, {
      type: 'STATUS_CHANGE',
      description: `Reserva creada con estado ${booking.status}`,
    });

    return mapBookingFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (data.customerId !== undefined) payload.customer_id = data.customerId;
    if (data.serviceId !== undefined) payload.service_id = data.serviceId;
    if (data.adminId !== undefined) payload.admin_id = data.adminId;
    if (data.scheduledAt !== undefined) payload.scheduled_at = data.scheduledAt.toISOString();
    if (data.durationMinutes !== undefined) payload.duration_minutes = data.durationMinutes;
    if (data.status !== undefined) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.calendarEventId !== undefined) payload.calendar_event_id = data.calendarEventId;
    if (data.whatsappLink !== undefined) payload.whatsapp_link = data.whatsappLink;

    const { error } = await getAdminSupabase()
      .from('bookings')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update booking ${id}: ${error.message}`);

    if (data.status) {
      await this.addEvent(id, {
        type: 'STATUS_CHANGE',
        description: `Estado actualizado a ${data.status}`,
      });
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete booking ${id}: ${error.message}`);
  },

  async list(): Promise<Booking[]> {
    const { data, error } = await getAdminSupabase()
      .from('bookings')
      .select('*')
      .order('scheduled_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapBookingFromDb);
  },

  async listByCustomer(customerId: string): Promise<Booking[]> {
    const { data, error } = await getAdminSupabase()
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('scheduled_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapBookingFromDb);
  },

  async listByDateRange(start: Date, end: Date): Promise<Booking[]> {
    const { data, error } = await getAdminSupabase()
      .from('bookings')
      .select('*')
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error || !data) return [];
    return data.map(mapBookingFromDb);
  },

  async addEvent(bookingId: string, event: Omit<BookingEvent, 'id' | 'bookingId' | 'createdAt'>): Promise<BookingEvent> {
    // Almacenar eventos en ai_assets o metadata por simplicidad si no hay tabla booking_events
    return {
      id: `evt_${Date.now()}`,
      bookingId,
      type: event.type,
      description: event.description,
      createdAt: new Date(),
    };
  },

  async listEvents(bookingId: string): Promise<BookingEvent[]> {
    return [];
  },
};
