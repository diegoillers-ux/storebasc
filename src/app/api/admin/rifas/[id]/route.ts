import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;

    // TODO: Integración real con Supabase para detalle de rifa y boletos
    return NextResponse.json({
      rifa: { id },
      tickets: [],
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
    await params;
    const body = await req.json();
    const { action } = body;

    if (action === 'draw') {
      return NextResponse.json(
        { error: 'El sorteo no puede ejecutarse: el módulo de rifas aún no está conectado a la base de datos.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Acción no soportada.' }, { status: 400 });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al realizar el sorteo.', details }, { status: 500 });
  }
}
