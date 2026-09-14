import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { serviceRepository } from '@/lib/supabase/repositories/services';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ services: [] });
    }

    const services = await serviceRepository.list(false); // Listar todos, incluyendo inactivos
    return NextResponse.json({ services });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener servicios.', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, slug, price, durationMinutes, description, active, imageUrl } = body;

    if (!name || !slug || price === undefined || !durationMinutes) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'Servicio simulado creado.',
        service: { id: 'demo-' + Math.random(), ...body },
      });
    }

    const newService = await serviceRepository.create({
      name,
      slug,
      price: Number(price),
      duration: Number(durationMinutes),
      currency: 'COP',
      modality: 'whatsapp',
      preparation: null,
      featured: false,
      description: description || null,
      active: active !== undefined ? active : true,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al crear servicio.', details }, { status: 500 });
  }
}
