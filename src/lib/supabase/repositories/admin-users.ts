import { getAdminSupabase } from '../server';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapAdminUserFromDb(row: any): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AdminUser['role'],
    active: Boolean(row.active),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const adminUserRepository = {
  async getByEmail(email: string): Promise<AdminUser | null> {
    const { data, error } = await getAdminSupabase()
      .from('admin_users')
      .select('*')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return mapAdminUserFromDb(data);
  },

  async getById(id: string): Promise<AdminUser | null> {
    const { data, error } = await getAdminSupabase()
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapAdminUserFromDb(data);
  },

  async create(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const payload = {
      email: user.email.toLowerCase().trim(),
      name: user.name,
      role: user.role || 'ADMIN',
      active: user.active ?? true,
    };

    const { data, error } = await getAdminSupabase()
      .from('admin_users')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create admin user in Supabase: ${error.message}`);

    return mapAdminUserFromDb(data);
  },

  async update(id: string, data: Partial<Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (data.email !== undefined) payload.email = data.email.toLowerCase().trim();
    if (data.name !== undefined) payload.name = data.name;
    if (data.role !== undefined) payload.role = data.role;
    if (data.active !== undefined) payload.active = data.active;

    const { error } = await getAdminSupabase()
      .from('admin_users')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update admin user ${id}: ${error.message}`);
  },

  async delete(id: string): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete admin user ${id}: ${error.message}`);
  },

  async list(): Promise<AdminUser[]> {
    const { data, error } = await getAdminSupabase()
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapAdminUserFromDb);
  },
};
