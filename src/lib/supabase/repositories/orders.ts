import { getAdminSupabase } from '../server';

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
  shipping: number;
  total: number;
  currency: string;
  delivery: string;
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
  type: string;
  description: string;
  createdAt: Date;
}

function mapOrderFromDb(input: unknown): Order {
  const row = input as { id: string; customer_id: string; admin_id: string | null; status: string; subtotal: number | string; shipping: number | string; total: number | string; currency: string; delivery: unknown; address: string | null; notes: string | null; created_at: string; updated_at: string };
  return {
    id: row.id,
    customerId: row.customer_id,
    adminId: row.admin_id || null,
    status: row.status as OrderStatus,
    subtotal: Number(row.subtotal || 0),
    shipping: Number(row.shipping || 0),
    total: Number(row.total || 0),
    currency: row.currency || 'COP',
    delivery: typeof row.delivery === 'string' ? row.delivery : JSON.stringify(row.delivery || 'shipping'),
    address: row.address || null,
    notes: row.notes || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const orderRepository = {
  async getById(id: string): Promise<Order | null> {
    const { data, error } = await getAdminSupabase()
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapOrderFromDb(data);
  },

  async create(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    items: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<Order> {
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const itemsPayload = items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));

    const payload = {
      id,
      customer_id: order.customerId,
      admin_id: order.adminId,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      delivery: { type: order.delivery },
      address: order.address,
      items: itemsPayload,
    };

    const { data, error } = await getAdminSupabase()
      .from('orders')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create order in Supabase: ${error.message}`);

    await this.addEvent(data.id, {
      type: 'STATUS_CHANGE',
      description: `Pedido creado con estado ${order.status}`,
    });

    return mapOrderFromDb(data);
  },

  async updateStatus(id: string, status: OrderStatus, adminId: string | null = null): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('orders')
      .update({
        status,
        admin_id: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to update order status ${id}: ${error.message}`);

    await this.addEvent(id, {
      type: 'STATUS_CHANGE',
      description: `Estado del pedido actualizado a ${status}`,
    });
  },

  async list(): Promise<Order[]> {
    const { data, error } = await getAdminSupabase()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapOrderFromDb);
  },

  async listItems(orderId: string): Promise<OrderItem[]> {
    const order = await this.getById(orderId);
    if (!order) return [];
    const rawItems = (order as Order & { items?: unknown }).items || [];
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((it: { productId: string; quantity: number; unitPrice: number; total: number }, index: number) => ({
      id: `item_${index}`,
      orderId,
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));
  },

  async listByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await getAdminSupabase()
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapOrderFromDb);
  },

  async addEvent(orderId: string, event: Omit<OrderEvent, 'id' | 'orderId' | 'createdAt'>): Promise<OrderEvent> {
    return {
      id: `evt_${Date.now()}`,
      orderId,
      type: event.type,
      description: event.description,
      createdAt: new Date(),
    };
  },

  async listEvents(orderId: string): Promise<OrderEvent[]> {
    return [];
  },
};
