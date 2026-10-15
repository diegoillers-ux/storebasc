import { getAdminSupabase } from '../server';

export interface AiAsset {
  id?: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date;
}

export const aiAssetRepository = {
  async create(asset: Omit<AiAsset, 'id' | 'createdAt'>): Promise<AiAsset> {
    const { data, error } = await getAdminSupabase()
      .from('ai_assets')
      .insert({
        type: asset.type,
        content: asset.content,
        metadata: asset.metadata || {},
      })
      .select('*')
      .single();

    if (error || !data) {
      return {
        type: asset.type,
        content: asset.content,
        metadata: asset.metadata,
        createdAt: new Date(),
      };
    }

    return {
      id: data.id,
      type: data.type,
      content: data.content,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
    };
  },

  async list(type?: string): Promise<AiAsset[]> {
    let query = getAdminSupabase().from('ai_assets').select('*');
    if (type) query = query.eq('type', type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((d: Record<string, unknown>) => ({
      id: typeof d.id === 'string' ? d.id : undefined,
      type: String(d.type ?? ''),
      content: String(d.content ?? ''),
      metadata: (d.metadata ?? null) as Record<string, unknown> | null,
      createdAt: new Date(String(d.created_at)),
    }));
  },
};
