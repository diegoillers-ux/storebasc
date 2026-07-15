import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { orderRepository } from '@/lib/firebase/repositories/orders';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const orders = await orderRepository.list();
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener pedidos.', details }, { status: 500 });
  }
}
