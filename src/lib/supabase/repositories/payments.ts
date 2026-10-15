import { getAdminSupabase } from '../server';

export type PaymentMethod = 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'CASH' | 'GATEWAY';
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id?: string;
  customerId: string;
  bookingId: string | null;
  orderId: string | null;
  method: PaymentMethod;
  provider: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string | null;
  receiptUrl: string | null;
  providerData: unknown | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapPaymentFromDb(input: unknown): Payment {
  const row = input as { id: string; customer_id: string | null; booking_id: string | null; order_id: string | null; method: string; provider: string | null; amount: number | string; currency: string; status: string; reference: string | null; voucher_url: string | null; receipt_url: string | null; provider_data: unknown; verified_at: string | null; verified_by: string | null; created_at: string; updated_at: string | null };
  return {
    id: row.id,
    customerId: row.customer_id || '',
    bookingId: row.booking_id || null,
    orderId: row.order_id || null,
    method: row.method as PaymentMethod,
    provider: row.provider || null,
    amount: Number(row.amount || 0),
    currency: row.currency || 'COP',
    status: row.status as PaymentStatus,
    reference: row.reference || null,
    receiptUrl: row.voucher_url || row.receipt_url || null,
    providerData: row.provider_data || null,
    verifiedAt: row.verified_at ? new Date(row.verified_at) : null,
    verifiedBy: row.verified_by || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at || row.created_at),
  };
}

export const paymentRepository = {
  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await getAdminSupabase()
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapPaymentFromDb(data);
  },

  async getByReference(reference: string): Promise<Payment | null> {
    const { data, error } = await getAdminSupabase()
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (error || !data) return null;
    return mapPaymentFromDb(data);
  },

  async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      id,
      customer_id: payment.customerId,
      booking_id: payment.bookingId,
      order_id: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      provider: payment.provider,
      reference: payment.reference,
      provider_data: payment.providerData,
      status: payment.status,
      voucher_url: payment.receiptUrl,
      verified_at: payment.verifiedAt ? payment.verifiedAt.toISOString() : null,
      verified_by: payment.verifiedBy,
    };

    const { data, error } = await getAdminSupabase()
      .from('payments')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create payment in Supabase: ${error.message}`);

    return mapPaymentFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.customerId !== undefined) payload.customer_id = data.customerId;
    if (data.status !== undefined) payload.status = data.status;
    if (data.provider !== undefined) payload.provider = data.provider;
    if (data.reference !== undefined) payload.reference = data.reference;
    if (data.providerData !== undefined) payload.provider_data = data.providerData;
    if (data.receiptUrl !== undefined) payload.voucher_url = data.receiptUrl;
    if (data.verifiedAt !== undefined) payload.verified_at = data.verifiedAt ? data.verifiedAt.toISOString() : null;
    if (data.verifiedBy !== undefined) payload.verified_by = data.verifiedBy;

    const { error } = await getAdminSupabase()
      .from('payments')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update payment ${id}: ${error.message}`);
  },

  async list(): Promise<Payment[]> {
    const { data, error } = await getAdminSupabase()
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapPaymentFromDb);
  },

  async listByStatus(status: PaymentStatus): Promise<Payment[]> {
    const { data, error } = await getAdminSupabase()
      .from('payments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapPaymentFromDb);
  },

  async listByCustomer(customerId: string): Promise<Payment[]> {
    const { data, error } = await getAdminSupabase()
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapPaymentFromDb);
  },
};
