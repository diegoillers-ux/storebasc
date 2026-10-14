import { getAdminSupabase } from '../server';

const MAX_OTP_ATTEMPTS = 5;
const OTP_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const otpAttempts = new Map<string, { count: number; resetAt: number }>();

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email: string | null;
  cedula?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  source?: string | null;
  otpCode?: string | null;
  otpExpiresAt?: Date | null;
  isVerified?: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapCustomerFromDb(row: Record<string, unknown>): Customer {
  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    name: String(row.name ?? ''),
    phone: typeof row.phone === 'string' ? row.phone : '',
    email: typeof row.email === 'string' ? row.email : null,
    cedula: typeof row.cedula === 'string' ? row.cedula : null,
    birthDate: typeof row.birth_date === 'string' ? row.birth_date : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    source: typeof row.source === 'string' ? row.source : null,
    otpCode: typeof row.otp_code === 'string' ? row.otp_code : null,
    otpExpiresAt: row.otp_expires_at ? new Date(String(row.otp_expires_at)) : null,
    isVerified: Boolean(row.is_verified),
    active: Boolean(row.active),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
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
      .eq('phone', phone.trim());

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },

  async getByEmail(email: string): Promise<Customer[]> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },

  async getByCedula(cedula: string): Promise<Customer | null> {
    const { data, error } = await getAdminSupabase()
      .from('customers')
      .select('*')
      .eq('cedula', cedula.trim())
      .maybeSingle();

    if (error || !data) return null;
    return mapCustomerFromDb(data);
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const payload = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email ? customer.email.trim().toLowerCase() : null,
      cedula: customer.cedula ? customer.cedula.trim() : null,
      birth_date: customer.birthDate || null,
      notes: customer.notes,
      source: customer.source,
      otp_code: customer.otpCode || null,
      otp_expires_at: customer.otpExpiresAt ? customer.otpExpiresAt.toISOString() : null,
      is_verified: customer.isVerified ?? false,
      active: customer.active ?? true,
    };

    const { data, error } = await getAdminSupabase()
      .from('customers')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505' && customer.email) {
        const existing = await this.getByEmail(customer.email);
        if (existing.length > 0) return existing[0];
      }
      throw new Error(`Failed to create customer in Supabase: ${error.message}`);
    }

    return mapCustomerFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email ? data.email.trim().toLowerCase() : null;
    if (data.cedula !== undefined) payload.cedula = data.cedula ? data.cedula.trim() : null;
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate || null;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.source !== undefined) payload.source = data.source;
    if (data.otpCode !== undefined) payload.otp_code = data.otpCode;
    if (data.otpExpiresAt !== undefined) payload.otp_expires_at = data.otpExpiresAt ? data.otpExpiresAt.toISOString() : null;
    if (data.isVerified !== undefined) payload.is_verified = data.isVerified;
    if (data.active !== undefined) payload.active = data.active;

    const { error } = await getAdminSupabase()
      .from('customers')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update customer ${id}: ${error.message}`);
  },

  async setOtp(email: string, otpCode: string): Promise<void> {
    const existing = await this.getByEmail(email);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de validez

    if (existing.length > 0) {
      otpAttempts.delete(email.trim().toLowerCase());
      await this.update(existing[0].id!, {
        otpCode,
        otpExpiresAt: expiresAt,
      });
    }
  },

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const existing = await this.getByEmail(email);
    if (existing.length === 0) return false;

    const customer = existing[0];
    if (!customer.otpCode) return false;

    // Expiración efectiva del código
    if (customer.otpExpiresAt && Date.now() > customer.otpExpiresAt.getTime()) {
      await this.update(customer.id!, { otpCode: null, otpExpiresAt: null });
      return false;
    }

    // Límite de intentos fallidos (in-memory; se reinicia al generar un nuevo OTP)
    const key = email.trim().toLowerCase();
    const now = Date.now();
    const bucket = otpAttempts.get(key);
    if (bucket && now < bucket.resetAt && bucket.count >= MAX_OTP_ATTEMPTS) {
      await this.update(customer.id!, { otpCode: null, otpExpiresAt: null });
      return false;
    }
    if (!bucket || now > bucket.resetAt) {
      otpAttempts.set(key, { count: 1, resetAt: now + OTP_ATTEMPT_WINDOW_MS });
    } else {
      bucket.count += 1;
    }

    if (customer.otpCode.trim() === code.trim()) {
      otpAttempts.delete(key);
      await this.update(customer.id!, {
        isVerified: true,
        active: true,
        otpCode: null,
        otpExpiresAt: null,
      });
      return true;
    }

    return false;
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
      .or(`name.ilike.%${lowerQuery}%,email.ilike.%${lowerQuery}%,phone.ilike.%${lowerQuery}%,cedula.ilike.%${lowerQuery}%`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) return [];
    return data.map(mapCustomerFromDb);
  },
};
