import { getAdminSupabase } from '../server';

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  sku: string | null;
  category: string | null;
  imageUrl: string | null;
  images: string[];
  active: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id?: string;
  productId: string;
  change: number;
  reason: string;
  orderId: string | null;
  createdAt: Date;
}

type DbRow = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function mapProductFromDb(row: DbRow): Product {
  return {
    id: asString(row.id) || undefined,
    name: asString(row.name),
    slug: asString(row.slug),
    description: typeof row.description === 'string' ? row.description : null,
    price: Number(row.price || 0),
    currency: asString(row.currency, 'COP'),
    stock: Number(row.stock || 0),
    sku: typeof row.sku === 'string' ? row.sku : null,
    category: typeof row.category === 'string' ? row.category : null,
    imageUrl: typeof row.image_url === 'string' ? row.image_url : null,
    images: Array.isArray(row.images) ? row.images.filter((i): i is string => typeof i === 'string') : [],
    active: typeof row.active === 'boolean' ? row.active : false,
    featured: typeof row.featured === 'boolean' ? row.featured : false,
    createdAt: new Date(asString(row.created_at)),
    updatedAt: new Date(asString(row.updated_at ?? row.created_at)),
  };
}

export const productRepository = {
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await getAdminSupabase()
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapProductFromDb(data);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await getAdminSupabase()
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapProductFromDb(data);
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = product.slug || `prod_${Date.now()}`;
    const payload = {
      id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      currency: product.currency || 'COP',
      stock: product.stock,
      sku: product.sku,
      category: product.category,
      image_url: product.imageUrl,
      images: product.images || [],
      active: product.active ?? true,
      featured: product.featured ?? false,
    };

    const { data, error } = await getAdminSupabase()
      .from('products')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create product in Supabase: ${error.message}`);
    }

    if (product.stock > 0) {
      await this.addStockMovement(data.id, {
        change: product.stock,
        reason: 'inicial',
        orderId: null,
      });
    }

    return mapProductFromDb(data);
  },

  async update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.price !== undefined) payload.price = data.price;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.stock !== undefined) payload.stock = data.stock;
    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.category !== undefined) payload.category = data.category;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.images !== undefined) payload.images = data.images;
    if (data.active !== undefined) payload.active = data.active;
    if (data.featured !== undefined) payload.featured = data.featured;

    const { error } = await getAdminSupabase()
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update product ${id}: ${error.message}`);
  },

  async delete(id: string): Promise<void> {
    const { error } = await getAdminSupabase()
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete product ${id}: ${error.message}`);
  },

  async list(options?: boolean | { activeOnly?: boolean; category?: string; featuredOnly?: boolean }): Promise<Product[]> {
    let query = getAdminSupabase().from('products').select('*');

    const activeOnly = typeof options === 'boolean' ? options : options?.activeOnly;
    const featuredOnly = typeof options === 'object' ? options?.featuredOnly : false;
    const category = typeof options === 'object' ? options?.category : undefined;

    if (activeOnly) {
      query = query.eq('active', true);
    }
    if (featuredOnly) {
      query = query.eq('featured', true);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapProductFromDb);
  },

  async adjustStock(id: string, change: number, reason: string, orderId: string | null = null): Promise<Product> {
    // Descuento atómico vía RPC (misma transacción: bloqueo + piso + kárdex).
    // Sin esto, dos aprobaciones concurrentes podían sobrevender.
    const { data, error } = await getAdminSupabase().rpc('adjust_product_stock', {
      p_product_id: id,
      p_change: change,
      p_reason: reason,
      p_order_id: orderId,
    });

    if (error) throw new Error(`Failed to adjust stock for ${id}: ${error.message}`);
    if (typeof data !== 'number') throw new Error(`Respuesta inesperada al ajustar stock de ${id}`);

    const product = await this.getById(id);
    if (!product) throw new Error(`Producto ${id} no encontrado tras ajuste`);
    return product;
  },

  async addStockMovement(productId: string, movement: Omit<StockMovement, 'id' | 'productId' | 'createdAt'>): Promise<StockMovement> {
    const { data, error } = await getAdminSupabase()
      .from('stock_movements')
      .insert({
        product_id: productId,
        change: movement.change,
        reason: movement.reason,
        order_id: movement.orderId,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to add stock movement: ${error.message}`);

    return {
      id: data.id,
      productId: data.product_id,
      change: data.change,
      reason: data.reason,
      orderId: data.order_id || null,
      createdAt: new Date(data.created_at),
    };
  },

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    const { data, error } = await getAdminSupabase()
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((m: DbRow) => ({
      id: asString(m.id) || undefined,
      productId: asString(m.product_id),
      change: Number(m.change || 0),
      reason: asString(m.reason),
      orderId: typeof m.order_id === 'string' ? m.order_id : null,
      createdAt: new Date(asString(m.created_at)),
    }));
  },
};
