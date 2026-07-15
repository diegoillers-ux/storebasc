import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const converter = createConverter<AdminUser>();

export const adminUserRepository = {
  async getByEmail(email: string): Promise<AdminUser | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ADMIN_USERS)
      .withConverter(converter)
      .where('email', '==', email)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async getById(id: string): Promise<AdminUser | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ADMIN_USERS)
      .doc(id)
      .withConverter(converter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async create(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const docRef = getAdminDb().collection(COLLECTIONS.ADMIN_USERS).doc();
    const newUser = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.withConverter(converter).set(newUser);
    return { id: docRef.id, ...newUser };
  },

  async update(id: string, data: Partial<Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.ADMIN_USERS)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  },

  async delete(id: string): Promise<void> {
    await getAdminDb().collection(COLLECTIONS.ADMIN_USERS).doc(id).delete();
  },

  async list(): Promise<AdminUser[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ADMIN_USERS)
      .withConverter(converter)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
