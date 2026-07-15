import { getAdminDb } from '../admin';
import { COLLECTIONS } from '../collections';
import { createConverter } from '../converters';

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // en COP
  currency: string; // default "COP"
  stock: number;
  sku: string | null;
  category: string | null;
  imageUrl: string | null;
  images: string[]; // URLs adicionales
  active: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id?: string;
  productId: string;
  change: number; // positivo para entrada, negativo para salida
  reason: string; // "venta" | "ajuste" | "devolucion" | "inicial"
  orderId: string | null;
  createdAt: Date;
}

const productConverter = createConverter<Product>();
const movementConverter = createConverter<StockMovement>();

export const productRepository = {
  async getById(id: string): Promise<Product | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PRODUCTS)
      .doc(id)
      .withConverter(productConverter)
      .get();
    return snapshot.exists ? snapshot.data() || null : null;
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.PRODUCTS)
      .withConverter(productConverter)
      .where('slug', '==', slug)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const docRef = getAdminDb().collection(COLLECTIONS.PRODUCTS).doc();
    const newProduct = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.withConverter(productConverter).set(newProduct);

    // Si tiene stock inicial mayor a 0, registrar movimiento
    if (product.stock > 0) {
      await this.addStockMovement(docRef.id, {
        change: product.stock,
        reason: 'inicial',
        orderId: null,
      });
    }

    return { id: docRef.id, ...newProduct };
  },

  async update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await getAdminDb()
      .collection(COLLECTIONS.PRODUCTS)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  },

  async delete(id: string): Promise<void> {
    const batch = getAdminDb().batch();
    const movementsSnapshot = await getAdminDb()
      .collection(COLLECTIONS.STOCK_MOVEMENTS)
      .where('productId', '==', id)
      .get();

    for (const doc of movementsSnapshot.docs) {
      batch.delete(doc.ref);
    }

    batch.delete(getAdminDb().collection(COLLECTIONS.PRODUCTS).doc(id));
    await batch.commit();
  },

  async adjustStock(id: string, change: number, reason: string, orderId: string | null = null): Promise<void> {
    await getAdminDb().runTransaction(async (transaction) => {
      const docRef = getAdminDb().collection(COLLECTIONS.PRODUCTS).doc(id).withConverter(productConverter);
      const snapshot = await transaction.get(docRef);

      if (!snapshot.exists) {
        throw new Error('Producto no encontrado para ajuste de stock.');
      }

      const product = snapshot.data()!;
      const newStock = product.stock + change;

      if (newStock < 0) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}`);
      }

      // Actualizar stock del producto
      transaction.update(docRef, {
        stock: newStock,
        updatedAt: new Date(),
      });

      // Crear registro de movimiento
      const movementRef = getAdminDb().collection(COLLECTIONS.STOCK_MOVEMENTS).doc();
      const newMovement = {
        productId: id,
        change,
        reason,
        orderId,
        createdAt: new Date(),
      };
      transaction.set(movementRef, newMovement);
    });
  },

  async list(onlyActive = false): Promise<Product[]> {
    let queryRef = getAdminDb().collection(COLLECTIONS.PRODUCTS).withConverter(productConverter);
    if (onlyActive) {
      queryRef = queryRef.where('active', '==', true) as any;
    }
    const snapshot = await queryRef.get();
    return snapshot.docs.map((doc) => doc.data());
  },

  // Movimientos de Stock
  async addStockMovement(
    productId: string,
    movement: Omit<StockMovement, 'id' | 'productId' | 'createdAt'>
  ): Promise<StockMovement> {
    const docRef = getAdminDb().collection(COLLECTIONS.STOCK_MOVEMENTS).doc();
    const newMovement = {
      ...movement,
      productId,
      createdAt: new Date(),
    };
    await docRef.withConverter(movementConverter).set(newMovement);
    return { id: docRef.id, ...newMovement };
  },

  async listStockMovements(productId: string): Promise<StockMovement[]> {
    const snapshot = await getAdminDb()
      .collection(COLLECTIONS.STOCK_MOVEMENTS)
      .withConverter(movementConverter)
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data());
  },
};
