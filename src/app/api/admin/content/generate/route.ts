import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  // TODO: Integración real con el modelo de generación de imágenes (Gemini)
  return NextResponse.json({ assets: [] });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { prompt, format } = await req.json();
    if (!prompt || !format) {
      return NextResponse.json({ error: 'Faltan campos prompt o formato.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'La generación de imágenes con IA aún no está conectada. El motor de generación se habilitará próximamente.' },
      { status: 501 }
    );
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al generar asset.', details }, { status: 500 });
  }
}

// PUT /api/admin/content/generate -> Calificar/Valorar el asset (Aprobar o Rechazar)
export async function PUT(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Falta ID de asset o estatus de calificación.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'No hay assets disponibles para calificar: la generación de contenido con IA aún no está conectada.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al calificar asset.', details }, { status: 500 });
  }
}
