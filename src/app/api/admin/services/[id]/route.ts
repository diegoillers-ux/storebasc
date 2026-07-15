import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { serviceRepository } from '@/lib/firebase/repositories/services';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Servicio demo actualizado.' });
    }

    const { name, slug, price, durationMinutes, description, active, imageUrl } = body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (price !== undefined) updateData.price = Number(price);
    if (durationMinutes !== undefined) updateData.duration = Number(durationMinutes);
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await serviceRepository.update(id, updateData);
    return NextResponse.json({ success: true, message: 'Servicio actualizado.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al actualizar servicio.', details }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Servicio demo eliminado.' });
    }

    await serviceRepository.delete(id);
    return NextResponse.json({ success: true, message: 'Servicio eliminado.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al eliminar servicio.', details }, { status: 500 });
  }
}
