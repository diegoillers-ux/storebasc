import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export interface Availability {
  id?: string;
  dayOfWeek: number | null; // 0 = Domingo, 6 = Sábado; null para fecha específica
  specificDate: Date | null;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotMinutes: number; // Duración de los slots por defecto
  active: boolean;
}

export interface BlockedSlot {
  id?: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
}

const availabilityConverter = createConverter<Availability>();
const blockedConverter = createConverter<BlockedSlot>();

export const availabilityRepository = {
  async listWeekly(): Promise<Availability[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.AVAILABILITY)
      .withConverter(availabilityConverter)
      .where('active', '==', true)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async saveWeekly(availabilities: Omit<Availability, 'id'>[]): Promise<void> {
    const batch = getAdminDb().batch();
    const current = await getAdminDb().collection(COLLECTIONS.AVAILABILITY).get();
    
    // Limpiar configuraciones anteriores
    for (const doc of current.docs) {
      batch.delete(doc.ref);
    }
    
    // Guardar nuevas configuraciones
    for (const item of availabilities) {
      const docRef = getAdminDb().collection(COLLECTIONS.AVAILABILITY).doc();
      batch.set(docRef.withConverter(availabilityConverter), item as any);
    }
    
    await batch.commit();
  },

  async listBlocked(startAt: Date, endAt: Date): Promise<BlockedSlot[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.BLOCKED_SLOTS)
      .withConverter(blockedConverter)
      .where('startAt', '>=', startAt)
      .where('startAt', '<=', endAt)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async blockSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const docRef = getAdminDb().collection(COLLECTIONS.BLOCKED_SLOTS).doc();
    const newSlot = {
      ...slot,
      createdAt: new Date(),
    };
    await docRef.withConverter(blockedConverter).set(newSlot);
    return { id: docRef.id, ...newSlot };
  },

  async unblockSlot(id: string): Promise<void> {
    await getAdminDb().collection(COLLECTIONS.BLOCKED_SLOTS).doc(id).delete();
  },
};
