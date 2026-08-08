import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { paymentRepository } from '@/lib/supabase/repositories/payments';

const MOCK_PAYMENTS = [
  { id: 'pay-1', customerId: 'cust-1', bookingId: 'book-1', orderId: null, method: 'NEQUI', amount: 150000, currency: 'COP', status: 'APPROVED', reference: 'MOCK-REF-101', receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', verifiedAt: new Date().toISOString(), verifiedBy: 'admin', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'pay-2', customerId: 'cust-2', bookingId: 'book-2', orderId: null, method: 'DAVIPLATA', amount: 50000, currency: 'COP', status: 'SUBMITTED', reference: null, receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', verifiedAt: null, verifiedBy: null, createdAt: new Date().toISOString() },
  { id: 'pay-3', customerId: 'cust-3', bookingId: null, orderId: 'ord-1', method: 'TRANSFER', amount: 45000, currency: 'COP', status: 'APPROVED', reference: 'REF-BANC-552', receiptUrl: null, verifiedAt: new Date().toISOString(), verifiedBy: 'admin', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ payments: MOCK_PAYMENTS });
    }

    const payments = await paymentRepository.list();
    return NextResponse.json({ payments });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener pagos.', details }, { status: 500 });
  }
}
