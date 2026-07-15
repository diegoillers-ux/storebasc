import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export type OrderStatus =
  | 'NEW'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id?: string;
  customerId: string;
  adminId: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping: number; // Costo de envío
  total: number;
  currency: string; // default "COP"
  delivery: string; // "pickup" | "shipping" | "local"
  address: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderEvent {
  id?: string;
  orderId: string;
  type: string; // e.g. "STATUS_CHANGE" | "NOTE"
  description: string;
  createdAt: Date;
}

const orderConverter = createConverter<Order>();
const itemConverter = createConverter<OrderItem>();
const eventConverter = createConverter<OrderEvent>();

export const orderRepository = {
  async getById(id: string): Promise<Order | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ORDERS)
      .doc(id)
      .withConverter(orderConverter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async create(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    items: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<Order> {
    const orderRef = getAdminDb().collection(COLLECTIONS.ORDERS).doc();
    const newOrder = {
      ...order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Crear la orden e insertar los ítems como subcolección dentro de una transacción
    await getAdminDb().runTransaction(async (transaction) => {
      transaction.set(orderRef, newOrder);

      for (const item of items) {
        const itemRef = getAdminDb()
          .collection(COLLECTIONS.ORDERS)
          .doc(orderRef.id)
          .collection('items')
          .doc();
        
        transaction.set(itemRef, {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        });
      }
    });

    // Registrar evento de creación inicial
    await this.addEvent(orderRef.id, {
      type: 'STATUS_CHANGE',
      description: `Pedido creado con estado ${order.status}`,
    });

    return { id: orderRef.id, ...newOrder };
  },

  async updateStatus(id: string, status: OrderStatus, adminId: string | null = null): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.ORDERS)
      .doc(id)
      .update({
        status,
        adminId,
        updatedAt: new Date(),
      });

    await this.addEvent(id, {
      type: 'STATUS_CHANGE',
      description: `Estado del pedido actualizado a ${status}`,
    });
  },

  async list(): Promise<Order[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ORDERS)
      .withConverter(orderConverter)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listItems(orderId: string): Promise<OrderItem[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ORDERS)
      .doc(orderId)
      .collection('items')
      .withConverter(itemConverter)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async listByCustomer(customerId: string): Promise<Order[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ORDERS)
      .withConverter(orderConverter)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },

  // Eventos de pedido
  async addEvent(orderId: string, event: Omit<OrderEvent, 'id' | 'orderId' | 'createdAt'>): Promise<OrderEvent> {
    const docRef = getAdminDb().collection(COLLECTIONS.ORDER_EVENTS).doc();
    const newEvent = {
      ...event,
      orderId,
      createdAt: new Date(),
    };
    await docRef.withConverter(eventConverter).set(newEvent);
    return { id: docRef.id, ...newEvent };
  },

  async listEvents(orderId: string): Promise<OrderEvent[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.ORDER_EVENTS)
      .withConverter(eventConverter)
      .where('orderId', '==', orderId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
