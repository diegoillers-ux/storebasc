import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export type PaymentMethod = 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'CASH' | 'GATEWAY';
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id?: string;
  customerId: string;
  bookingId: string | null;
  orderId: string | null;
  method: PaymentMethod;
  provider: string | null; // manual | wompi | epayco | payu
  amount: number;
  currency: string; // default "COP"
  status: PaymentStatus;
  reference: string | null; // Referencia de pasarela o identificador único
  receiptUrl: string | null; // URL del comprobante de transferencia
  providerData: any | null; // JSON con la respuesta cruda de la pasarela
  verifiedAt: Date | null;
  verifiedBy: string | null; // ID del administrador que verificó
  createdAt: Date;
  updatedAt: Date;
}

const converter = createConverter<Payment>();

export const paymentRepository = {
  async getById(id: string): Promise<Payment | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .doc(id)
      .withConverter(converter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async getByReference(reference: string): Promise<Payment | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .withConverter(converter)
      .where('reference', '==', reference)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const docRef = getAdminDb().collection(COLLECTIONS.PAYMENTS).doc();
    const newPayment = {
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.withConverter(converter).set(newPayment);
    return { id: docRef.id, ...newPayment };
  },

  async update(id: string, data: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  },

  async list(): Promise<Payment[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .withConverter(converter)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listByStatus(status: PaymentStatus): Promise<Payment[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .withConverter(converter)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listByCustomer(customerId: string): Promise<Payment[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PAYMENTS)
      .withConverter(converter)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
