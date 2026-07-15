import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';

// Colección simulada de rifas/sorteos astrales
const MOCK_RIFAS = [
  { id: 'rifa-1', title: 'Gran Sorteo del Equinoccio de Primavera', pricePerNumber: 15000, totalNumbers: 100, soldCount: 42, active: true, prizeDescription: 'Lectura Astral Completa y Kit Sahumerio Sagrado', createdAt: new Date().toISOString() },
  { id: 'rifa-2', title: 'Rifa Especial Luna Llena en Escorpio', pricePerNumber: 10000, totalNumbers: 50, soldCount: 50, active: false, winnerNumber: 17, winnerName: 'María Fernanda Rojas', prizeDescription: 'Lectura de Tarot Express presencial', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  if (isDemoMode()) {
    return NextResponse.json({ rifas: MOCK_RIFAS });
  }

  // TODO: Integración real con Firestore para colección de rifas
  return NextResponse.json({ rifas: MOCK_RIFAS });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, pricePerNumber, totalNumbers, prizeDescription } = body;

    if (!title || !pricePerNumber || !totalNumbers) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (isDemoMode()) {
      const newRifa = {
        id: 'rifa-' + Math.random(),
        title,
        pricePerNumber: Number(pricePerNumber),
        totalNumbers: Number(totalNumbers),
        soldCount: 0,
        active: true,
        prizeDescription: prizeDescription || null,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, rifa: newRifa });
    }

    // Fallback real
    return NextResponse.json({
      success: true,
      rifa: {
        id: 'rifa-real-' + Math.random(),
        ...body,
        soldCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al crear rifa.', details }, { status: 500 });
  }
}
