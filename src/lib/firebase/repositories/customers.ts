import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  source: string | null; // instagram, facebook, referido, etc.
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const converter = createConverter<Customer>();

export const customerRepository = {
  async getById(id: string): Promise<Customer | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(id)
      .withConverter(converter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async getByPhone(phone: string): Promise<Customer[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .withConverter(converter)
      .where('phone', '==', phone)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async getByEmail(email: string): Promise<Customer[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .withConverter(converter)
      .where('email', '==', email)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const docRef = getAdminDb().collection(COLLECTIONS.CUSTOMERS).doc();
    const newCustomer = {
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.withConverter(converter).set(newCustomer);
    return { id: docRef.id, ...newCustomer };
  },

  async update(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  },

  async delete(id: string): Promise<void> {
    await getAdminDb().collection(COLLECTIONS.CUSTOMERS).doc(id).delete();
  },

  async list(): Promise<Customer[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .withConverter(converter)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async search(queryText: string): Promise<Customer[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.CUSTOMERS)
      .withConverter(converter)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();
    
    const lowerQuery = queryText.toLowerCase();
    return snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.phone.includes(lowerQuery) ||
          (c.email && c.email.toLowerCase().includes(lowerQuery))
      );
  },
};
