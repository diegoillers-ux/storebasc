import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { paymentRepository } from '@/lib/supabase/repositories/payments';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ payments: [] });
    }

    const payments = await paymentRepository.list();
    return NextResponse.json({ payments });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener pagos.', details }, { status: 500 });
  }
}
