import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

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
  type: string; // STATUS_CHANGE | NOTE | REMINDER_SENT | WHATSAPP_SENT
  description: string;
  createdAt: Date;
}

const bookingConverter = createConverter<Booking>();
const eventConverter = createConverter<BookingEvent>();

export const bookingRepository = {
  async getById(id: string): Promise<Booking | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKINGS)
      .doc(id)
      .withConverter(bookingConverter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const docRef = getAdminDb().collection(COLLECTIONS.BOOKINGS).doc();
    const newBooking = {
      ...booking,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.withConverter(bookingConverter).set(newBooking);

    // Registrar evento de creación inicial
    await this.addEvent(docRef.id, {
      type: 'STATUS_CHANGE',
      description: `Reserva creada con estado ${booking.status}`,
    });

    return { id: docRef.id, ...newBooking };
  },

  async update(id: string, data: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.BOOKINGS)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });

    if (data.status) {
      await this.addEvent(id, {
        type: 'STATUS_CHANGE',
        description: `Estado actualizado a ${data.status}`,
      });
    }
  },

  async delete(id: string): Promise<void> {
    const batch = getAdminDb().batch();
    const eventsSnapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKING_EVENTS)
      .where('bookingId', '==', id)
      .get();
    
    for (const doc of eventsSnapshot.docs) {
      batch.delete(doc.ref);
    }
    
    batch.delete(getAdminDb().collection(COLLECTIONS.BOOKINGS).doc(id));
    await batch.commit();
  },

  async list(): Promise<Booking[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKINGS)
      .withConverter(bookingConverter)
      .orderBy('scheduledAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listByCustomer(customerId: string): Promise<Booking[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKINGS)
      .withConverter(bookingConverter)
      .where('customerId', '==', customerId)
      .orderBy('scheduledAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listByDateRange(start: Date, end: Date): Promise<Booking[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKINGS)
      .withConverter(bookingConverter)
      .where('scheduledAt', '>=', start)
      .where('scheduledAt', '<=', end)
      .orderBy('scheduledAt', 'asc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  // Eventos de bitácora
  async addEvent(bookingId: string, event: Omit<BookingEvent, 'id' | 'bookingId' | 'createdAt'>): Promise<BookingEvent> {
    const docRef = getAdminDb().collection(COLLECTIONS.BOOKING_EVENTS).doc();
    const newEvent = {
      ...event,
      bookingId,
      createdAt: new Date(),
    };
    await docRef.withConverter(eventConverter).set(newEvent);
    return { id: docRef.id, ...newEvent };
  },

  async listEvents(bookingId: string): Promise<BookingEvent[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BOOKING_EVENTS)
      .withConverter(eventConverter)
      .where('bookingId', '==', bookingId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
