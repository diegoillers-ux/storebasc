import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { customerRepository } from '@/lib/supabase/repositories/customers';

const MOCK_CUSTOMERS = [
  { id: 'cust-1', name: 'María Fernanda Rojas', email: 'maria.rojas@gmail.com', phone: '573123456789', notes: 'Fecha nacimiento: 14 de marzo 1992, 08:30 AM, Cali. Sol en Piscis, Luna en Cáncer. Le interesa profundizar sobre tránsitos de Saturno.', createdAt: new Date().toISOString() },
  { id: 'cust-2', name: 'Juan Pablo Gómez', email: 'juan.gomez@hotmail.com', phone: '573219876543', notes: 'Lectura de Tarot rápida realizada. Preguntó por temas laborales.', createdAt: new Date().toISOString() },
  { id: 'cust-3', name: 'Camila Restrepo', email: 'camila.res@yahoo.com', phone: '573155556677', notes: 'Sinastría de pareja realizada. Consultante recurrente.', createdAt: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get('q') || '';
      const filtered = query
        ? MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
        : MOCK_CUSTOMERS;
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
