import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { productRepository, type Product } from '@/lib/supabase/repositories/products';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Producto demo actualizado.' });
    }

    const { name, slug, price, stock, sku, category, imageUrl, active, featured, description } = body;
    const updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (sku !== undefined) updateData.sku = sku;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (active !== undefined) updateData.active = active;
    if (featured !== undefined) updateData.featured = featured;
    if (description !== undefined) updateData.description = description;

    await productRepository.update(id, updateData);
    return NextResponse.json({ success: true, message: 'Producto actualizado.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al actualizar producto.', details }, { status: 500 });
  }
}

// POST /api/admin/products/[id] -> Ajustar inventario transaccionalmente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { change, reason } = await req.json();

    if (change === undefined || !reason) {
      return NextResponse.json({ error: 'Falta cambio en stock o motivo.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Stock demo ajustado.' });
    }

    await productRepository.adjustStock(id, Number(change), reason);
    return NextResponse.json({ success: true, message: 'Inventario ajustado correctamente.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al ajustar stock.', details }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Producto demo eliminado.' });
    }

    await productRepository.delete(id);
    return NextResponse.json({ success: true, message: 'Producto eliminado.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al eliminar producto.', details }, { status: 500 });
  }
}
