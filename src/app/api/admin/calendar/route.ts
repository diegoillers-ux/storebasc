import { NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET() {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuración de calendario faltante' }, { status: 500 });
        }

        // Obtener eventos desde hoy
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const response = await calendar.events.list({
            calendarId,
            timeMin: now.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const allEvents = response.data.items || [];

        // Filtrar para mostrar SOLO los confirmados (los que NO tienen PENDIENTE en el título)
        const confirmedEvents = allEvents.filter(event => !event.summary?.includes('[PENDIENTE]'));

        const formattedEvents = confirmedEvents.map(event => {
            // Extraer email si existe en la descripción
            let email = '';
            if (event.description) {
                const match = event.description.match(/Email:\s*([^\s]+)/);
                if (match && match[1]) email = match[1];
            }

            return {
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                location: event.location || '', // Aquí guardaremos el link del Meet si el admin lo agrega
                description: event.description || '',
                clientEmail: email,
            };
        });

        return NextResponse.json({ events: formattedEvents });

    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching general calendar:', error);
        return NextResponse.json({ error: 'Error al obtener la agenda.', details }, { status: 500 });
    }
}
