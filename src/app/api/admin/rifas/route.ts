import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  // TODO: Integración real con Supabase para colección de rifas
  return NextResponse.json({ rifas: [] });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, pricePerNumber, totalNumbers } = body;

    if (!title || !pricePerNumber || !totalNumbers) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'El módulo de rifas aún no está conectado a la base de datos. La creación de sorteos se habilitará próximamente.' },
      { status: 501 }
    );
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al crear rifa.', details }, { status: 500 });
  }
}
