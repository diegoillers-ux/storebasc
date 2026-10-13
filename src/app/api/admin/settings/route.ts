import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { availabilityRepository } from '@/lib/supabase/repositories/availability';

// Horarios de inicio por defecto
const DEFAULT_WEEKLY_SETTINGS = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotMinutes: 60, active: true, specificDate: null }, // Lunes
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotMinutes: 60, active: true, specificDate: null }, // Martes
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', slotMinutes: 60, active: true, specificDate: null }, // Miércoles
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', slotMinutes: 60, active: true, specificDate: null }, // Jueves
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', slotMinutes: 60, active: true, specificDate: null }, // Viernes
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotMinutes: 60, active: false, specificDate: null }, // Sábado
  { dayOfWeek: 0, startTime: '09:00', endTime: '14:00', slotMinutes: 60, active: false, specificDate: null }, // Domingo
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ settings: DEFAULT_WEEKLY_SETTINGS });
    }

    const weeklyData = await availabilityRepository.listWeekly();
    
    // Si la base de datos está vacía, devolver valores por defecto
    if (weeklyData.length === 0) {
      return NextResponse.json({ settings: DEFAULT_WEEKLY_SETTINGS });
    }

    return NextResponse.json({ settings: weeklyData });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener configuraciones.', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { settings } = await req.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Faltan datos de configuracion validos.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Configuracion demo simulada.' });
    }

    // Validar el formato
    for (const item of settings) {
      if (item.dayOfWeek === undefined || !item.startTime || !item.endTime) {
        return NextResponse.json({ error: 'Formato de dia laboral invalido.' }, { status: 400 });
      }
    }

    await availabilityRepository.saveWeekly(settings);
    return NextResponse.json({ success: true, message: 'Configuracion de disponibilidad guardada.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al guardar configuraciones.', details }, { status: 500 });
  }
}
