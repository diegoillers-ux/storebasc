import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { customerRepository } from '@/lib/firebase/repositories/customers';

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
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
      cleanPhone = '57' + cleanPhone; // Código de país Colombia por defecto
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
