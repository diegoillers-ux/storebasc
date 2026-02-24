import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { getRequestIp, isRateLimited } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
    try {
        const ip = getRequestIp(req.headers.get('x-forwarded-for'));
        if (isRateLimited(`freebusy:${ip}`, 120, 60_000)) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Falta parámetro de fecha.' }, { status: 400 });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuración de calendario faltante.' }, { status: 500 });
        }

        // Calcular inicio y fin del día para consultar espacios ocupados
        const timeMin = new Date(`${dateStr}T00:00:00-05:00`).toISOString();
        const timeMax = new Date(`${dateStr}T23:59:59-05:00`).toISOString();

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                timeZone: 'America/Bogota',
                items: [{ id: calendarId }],
            },
        });

        const busySlots = response.data.calendars?.[calendarId]?.busy || [];

        return NextResponse.json({ busy: busySlots });
    } catch (error) {
        console.error('Error fetching free-busy data:', error);
        return NextResponse.json({ error: 'Error al consultar disponibilidad del calendario.' }, { status: 500 });
    }
}
