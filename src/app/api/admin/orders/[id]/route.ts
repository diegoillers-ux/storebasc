import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { orderRepository } from '@/lib/supabase/repositories/orders';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    
    if (isDemoMode()) {
      return NextResponse.json({
        order: { id, status: 'PAID', total: 65000, delivery: 'shipping', address: 'Calle 10 # 5-20, Cali' },
        items: [{ productId: 'demo-1', quantity: 1, unitPrice: 65000, total: 65000 }],
      });
    }

    const order = await orderRepository.getById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    const items = await orderRepository.listItems(id);
    return NextResponse.json({ order, items });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener detalle del pedido.', details }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Falta estado de actualización.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Estado del pedido demo actualizado.' });
    }

    await orderRepository.updateStatus(id, status, null);
    return NextResponse.json({ success: true, message: 'Estado del pedido actualizado.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al actualizar estado del pedido.', details }, { status: 500 });
  }
}
