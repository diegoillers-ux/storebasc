import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { orderRepository } from '@/lib/supabase/repositories/orders';

const MOCK_ORDERS = [
  { id: 'ord-1', customerId: 'cust-1', status: 'PAID', subtotal: 35000, shipping: 10000, total: 45000, delivery: 'shipping', address: 'Calle 100 # 15-30, Bogotá D.C.', notes: 'Por favor empacar para regalo con cinta morada.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ord-2', customerId: 'cust-2', status: 'NEW', subtotal: 80000, shipping: 0, total: 80000, delivery: 'pickup', address: null, notes: 'Recojo el sábado por la tarde, gracias.', createdAt: new Date().toISOString() },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ orders: MOCK_ORDERS });
    }

    const orders = await orderRepository.list();
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener pedidos.', details }, { status: 500 });
  }
}
