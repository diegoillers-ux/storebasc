import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { serviceRepository } from '@/lib/supabase/repositories/services';

const MOCK_SERVICES = [
  { id: 'serv-1', name: 'Lectura de Carta Natal Completa', slug: 'carta-natal', price: 150000, duration: 60, durationMinutes: 60, category: 'Esoterismo', active: true, description: 'Lectura astrológica detallada cruzando planetas, casas y tránsitos mayores.', featured: true, imageUrl: null },
  { id: 'serv-2', name: 'Lectura de Tarot Express', slug: 'tarot-express', price: 50000, duration: 30, durationMinutes: 30, category: 'Tarot', active: true, description: 'Sesión rápida enfocada en una pregunta concreta (trabajo, amor o salud).', featured: false, imageUrl: null },
  { id: 'serv-3', name: 'Sinastría de Pareja', slug: 'sinastria', price: 200000, duration: 90, durationMinutes: 90, category: 'Esoterismo', active: true, description: 'Estudio comparativo de dos cartas astrales para entender dinámicas de relación.', featured: false, imageUrl: null },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ services: MOCK_SERVICES });
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
