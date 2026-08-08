import { getAdminSupabase } from '../server';

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  source: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapCustomerFromDb(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || null,
    notes: row.notes || null,
    source: row.source || null,
    active: Boolean(row.active),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const customerRepository = {
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapCustomerFromDb(data);
  },

  async getByPhone(phone: string): Promise<Customer[]> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .eq('phone', phone);

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },

  async getByEmail(email: string): Promise<Customer[]> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .eq('email', email);

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const payload = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes,
      source: customer.source,
      active: customer.active ?? true,
    };

    const { data, error } = await getAdminSupabase()
      .from('customers')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      // Si falla por email único duplicado, intentamos buscarlo
      if (error.code === '23505' && customer.email) {
        const existing = await this.getByEmail(customer.email);
        if (existing.length > 0) return existing[0];
      }
      throw new Error(`Failed to create customer in Supabase: ${error.message}`);
    }

    return mapCustomerFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.source !== undefined) payload.source = data.source;
    if (data.active !== undefined) payload.active = data.active;

    const { error } = await getAdminSupabase()
      .from('customers')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update customer ${id}: ${error.message}`);
  },

  async delete(id: string): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete customer ${id}: ${error.message}`);
  },

  async list(): Promise<Customer[]> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },

  async search(queryText: string): Promise<Customer[]> {
    const lowerQuery = queryText.toLowerCase();
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .or(`name.ilike.%${lowerQuery}%,email.ilike.%${lowerQuery}%,phone.ilike.%${lowerQuery}%`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },
};
