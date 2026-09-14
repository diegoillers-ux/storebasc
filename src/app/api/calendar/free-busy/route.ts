import { NextRequest, NextResponse } from 'next/server';
import { getRequestIp, isRateLimited } from '@/lib/rateLimit';
import { isDemoMode } from '@/lib/demoMode';
import { GoogleCalendarProvider } from '@/lib/calendar/google';
import { serviceRepository } from '@/lib/supabase/repositories/services';

export async function GET(req: NextRequest) {
    try {
        const ip = getRequestIp(req.headers.get('x-forwarded-for'), req.headers.get('x-real-ip'), req.headers.get('cf-connecting-ip'));
        if (isRateLimited(`freebusy:${ip}`, 120, 60_000)) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Falta parametro de fecha.' }, { status: 400 });
        }

        if (isDemoMode()) {
            return NextResponse.json({ busy: [], availableSlots: ['09:00', '10:30', '14:00', '15:30', '17:00'] });
        }

        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion de calendario faltante.' }, { status: 500 });
        }

        const serviceId = searchParams.get('serviceId');
        const service = serviceId ? await serviceRepository.getById(serviceId) : null;
        const durationMinutes = service?.duration || 60;
        const timeMin = new Date(`${dateStr}T00:00:00-05:00`);
        const timeMax = new Date(`${dateStr}T23:59:59-05:00`);

        if (Number.isNaN(timeMin.getTime()) || Number.isNaN(timeMax.getTime())) {
            return NextResponse.json({ error: 'Fecha inválida.' }, { status: 400 });
        }

        const availability = await new GoogleCalendarProvider().getAvailability({
            serviceId: serviceId || '',
            from: timeMin,
            to: timeMax,
            durationMinutes,
        });
        const availableSlots = availability
            .filter((slot) => slot.available)
            .map((slot) => slot.start.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Bogota',
            }));

        return NextResponse.json({ busy: [], availableSlots });
    } catch (error) {
        console.error('Error fetching free-busy data:', error);
        return NextResponse.json({ error: 'Error al consultar disponibilidad del calendario.' }, { status: 500 });
    }
}

