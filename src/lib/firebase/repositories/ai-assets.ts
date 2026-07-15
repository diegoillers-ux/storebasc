import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export type AssetStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface AiAsset {
  id?: string;
  serviceId: string | null;
  productId: string | null;
  format: string; // story | post | banner | card
  prompt: string;
  imageUrl: string;
  status: AssetStatus;
  approvedAt: Date | null;
  approvedBy: string | null; // ID del administrador que aprobó
  createdAt: Date;
}

const converter = createConverter<AiAsset>();

export const aiAssetRepository = {
  async getById(id: string): Promise<AiAsset | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.AI_ASSETS)
      .doc(id)
      .withConverter(converter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async create(asset: Omit<AiAsset, 'id' | 'createdAt'>): Promise<AiAsset> {
    const docRef = getAdminDb().collection(COLLECTIONS.AI_ASSETS).doc();
    const newAsset = {
      ...asset,
      createdAt: new Date(),
    };
    await docRef.withConverter(converter).set(newAsset);
    return { id: docRef.id, ...newAsset };
  },

  async updateStatus(id: string, status: AssetStatus, approvedBy: string | null = null): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.AI_ASSETS)
      .doc(id)
      .update({
        status,
        approvedBy,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      });
  },

  async list(status?: AssetStatus): Promise<AiAsset[]> {
    let queryRef = getAdminDb().collection(COLLECTIONS.AI_ASSETS).withConverter(converter);
    if (status) {
      queryRef = queryRef.where('status', '==', status) as any;
    }
    const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
