import { NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { demoListPendingEvents } from '@/lib/demoStore';
import { mapCalendarEventToSale } from '@/lib/sales';

export async function GET() {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        if (isDemoMode()) {
            const events = demoListPendingEvents().map((event) => mapCalendarEventToSale({
                id: event.id,
                summary: event.summary,
                description: event.description || '',
                start: event.start,
                end: event.end,
                status: 'confirmed',
            }));
            return NextResponse.json({ events });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion calendario faltante.' }, { status: 500 });
        }

        const response = await calendar.events.list({
            calendarId,
            timeMin: new Date().toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
            q: '[PENDIENTE]',
        });

        const pendingEvents = response.data.items || [];
        const formattedEvents = pendingEvents.map((event) => mapCalendarEventToSale({
            id: event.id,
            summary: event.summary,
            description: event.description || '',
            start: event.start,
            end: event.end,
            status: event.status,
            created: event.created,
            location: event.location,
        }));

        return NextResponse.json({ events: formattedEvents });
    } catch (error) {
        console.error('Error fetching pending events:', error);
        return NextResponse.json({ error: 'Error al consultar citas pendientes.' }, { status: 500 });
    }
}

