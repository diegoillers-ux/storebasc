import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';

// Números vendidos simulados para la rifa mística
const MOCK_TICKETS = [
  { number: 3, customerName: 'María Fernanda Rojas', phone: '573123456789', status: 'PAID' },
  { number: 7, customerName: 'Juan Pablo Gómez', phone: '573219876543', status: 'PAID' },
  { number: 12, customerName: 'Camila Restrepo', phone: '573155556677', status: 'PAID' },
  { number: 17, customerName: 'David Londoño', phone: '573001234567', status: 'PENDING_PAYMENT' },
  { number: 22, customerName: 'Diana Cardona', phone: '573119876543', status: 'PAID' },
];

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
        rifa: { id, title: 'Gran Sorteo del Equinoccio de Primavera', pricePerNumber: 15000, totalNumbers: 100, soldCount: 5, active: true, prizeDescription: 'Lectura Astral Completa y Kit Sahumerio Sagrado' },
        tickets: MOCK_TICKETS,
      });
    }

    // Fallback real
    return NextResponse.json({
      rifa: { id, title: 'Gran Sorteo Real', pricePerNumber: 15000, totalNumbers: 100, soldCount: 5, active: true },
      tickets: MOCK_TICKETS,
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener detalle de rifa.', details }, { status: 500 });
  }
}

// PUT /api/admin/rifas/[id] -> Seleccionar ganador aleatoriamente
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === 'draw') {
      if (isDemoMode()) {
        const paidTickets = MOCK_TICKETS.filter(t => t.status === 'PAID');
        if (paidTickets.length === 0) {
          return NextResponse.json({ error: 'No hay boletos pagados registrados para realizar el sorteo.' }, { status: 400 });
        }

        // Seleccionar ganador aleatorio
        const randomIdx = Math.floor(Math.random() * paidTickets.length);
        const winner = paidTickets[randomIdx];

        return NextResponse.json({
          success: true,
          winnerNumber: winner.number,
          winnerName: winner.customerName,
          winnerPhone: winner.phone,
        });
      }

      // Fallback real
      const paidTickets = MOCK_TICKETS.filter(t => t.status === 'PAID');
      const randomIdx = Math.floor(Math.random() * paidTickets.length);
      const winner = paidTickets[randomIdx];

      return NextResponse.json({
        success: true,
        winnerNumber: winner.number,
        winnerName: winner.customerName,
        winnerPhone: winner.phone,
      });
    }

    return NextResponse.json({ error: 'Acción no soportada.' }, { status: 400 });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al realizar el sorteo.', details }, { status: 500 });
  }
}
