import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export interface Service {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number; // en minutos
  price: number; // en COP
  currency: string; // default "COP"
  modality: string; // e.g., "whatsapp" | "presencial" | "video"
  preparation: string | null; // instrucciones previas
  active: boolean;
  featured: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const converter = createConverter<Service>();

export const serviceRepository = {
  async getById(id: string): Promise<Service | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.SERVICES)
      .doc(id)
      .withConverter(converter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async getBySlug(slug: string): Promise<Service | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.SERVICES)
      .withConverter(converter)
      .where('slug', '==', slug)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const docRef = getAdminDb().collection(COLLECTIONS.SERVICES).doc();
    const newService = {
      ...service,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.withConverter(converter).set(newService);
    return { id: docRef.id, ...newService };
  },

  async update(id: string, data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.SERVICES)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  },

  async delete(id: string): Promise<void> {
    await getAdminDb().collection(COLLECTIONS.SERVICES).doc(id).delete();
  },

  async list(onlyActive = false): Promise<Service[]> {
    let queryRef = getAdminDb().collection(COLLECTIONS.SERVICES).withConverter(converter);
    if (onlyActive) {
      queryRef = queryRef.where('active', '==', true) as any;
    }
    const snapshot = await queryRef.get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
