import { getAdminSupabase } from '../server';

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

function mapServiceFromDb(input: unknown): Service {
  const row = input as { id: string; name: string; slug: string; description: string | null; duration: number | string; price: number | string; currency: string; modality: string; preparation: string | null; active: boolean; featured: boolean; image_url: string | null; created_at: string; updated_at: string };
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || null,
    duration: Number(row.duration || 60),
    price: Number(row.price || 0),
    currency: row.currency || 'COP',
    modality: row.modality || 'whatsapp',
    preparation: row.preparation || null,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    imageUrl: row.image_url || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const serviceRepository = {
  async getById(id: string): Promise<Service | null> {
    const { data, error } = await getAdminSupabase()
      .from('services')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapServiceFromDb(data);
  },

  async getBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await getAdminSupabase()
      .from('services')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapServiceFromDb(data);
  },

  async create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const id = service.slug || `srv_${Date.now()}`;
    const payload = {
      id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: service.price,
      currency: service.currency || 'COP',
      modality: service.modality || 'whatsapp',
      preparation: service.preparation || null,
      active: service.active ?? true,
      featured: service.featured ?? false,
      image_url: service.imageUrl || null,
    };

    const { data, error } = await getAdminSupabase()
      .from('services')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create service in Supabase: ${error.message}`);
    }

    return mapServiceFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.duration !== undefined) payload.duration = data.duration;
    if (data.price !== undefined) payload.price = data.price;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.modality !== undefined) payload.modality = data.modality;
    if (data.preparation !== undefined) payload.preparation = data.preparation;
    if (data.active !== undefined) payload.active = data.active;
    if (data.featured !== undefined) payload.featured = data.featured;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;

    const { error } = await getAdminSupabase()
      .from('services')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update service ${id}: ${error.message}`);
  },

  async delete(id: string): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete service ${id}: ${error.message}`);
  },

  async list(onlyActive = false): Promise<Service[]> {
    let query = getAdminSupabase().from('services').select('*');
    if (onlyActive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapServiceFromDb);
  },
};
