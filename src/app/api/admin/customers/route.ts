import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { customerRepository } from '@/lib/supabase/repositories/customers';

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get('q') || '';
      const filtered = query ? [] : [];
      return NextResponse.json({ customers: filtered });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    let customers;
    if (query) {
      customers = await customerRepository.search(query);
    } else {
      customers = await customerRepository.list();
    }

    return NextResponse.json({ customers });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener clientes.', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, email, phone, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nombre y teléfono son requeridos.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'Cliente demo creado.',
        customer: { id: 'demo-' + Math.random(), ...body },
      });
    }

    // Normalizar número telefónico
    let cleanPhone = phone.trim().replace(/\+/g, '').replace(/\s/g, '');
    if (!cleanPhone.startsWith('57') && cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    }

    const newCustomer = await customerRepository.create({
      name,
      email: email || null,
      phone: cleanPhone,
      notes: notes || null,
      active: true,
      source: 'manual',
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al registrar cliente.', details }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, name, email, phone, notes, cedula, birthDate, source } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) {
      let cleanPhone = String(phone).trim().replace(/\+/g, '').replace(/\s/g, '');
      if (!cleanPhone.startsWith('57') && cleanPhone.length === 10) {
        cleanPhone = '57' + cleanPhone;
      }
      updates.phone = cleanPhone;
    }
    if (notes !== undefined) updates.notes = notes;
    if (cedula !== undefined) updates.cedula = cedula;
    if (birthDate !== undefined) updates.birthDate = birthDate;
    if (source !== undefined) updates.source = source;

    const existing = await customerRepository.getById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }

    await customerRepository.update(id, updates as any);
    const updated = await customerRepository.getById(id);

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al actualizar cliente.', details }, { status: 500 });
  }
}
