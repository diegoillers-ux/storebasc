import { NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { demoListConfirmedEvents } from '@/lib/demoStore';
import { mapCalendarEventToSale } from '@/lib/sales';

export async function GET() {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        if (isDemoMode()) {
            const events = demoListConfirmedEvents()
                .map((event) => mapCalendarEventToSale({
                    id: event.id,
                    summary: event.summary,
                    start: event.start,
                    end: event.end,
                    location: event.location || '',
                    description: event.description || '',
                }))
                .filter((event) => event.requiresScheduling);
            return NextResponse.json({ events });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion de calendario faltante' }, { status: 500 });
        }

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
        const confirmedEvents = allEvents.filter((event) => !event.summary?.includes('[PENDIENTE]'));

        const formattedEvents = confirmedEvents
            .map((event) => mapCalendarEventToSale({
                id: event.id,
                summary: event.summary,
                start: event.start,
                end: event.end,
                location: event.location || '',
                description: event.description || '',
                created: event.created,
                status: event.status,
            }))
            .filter((event) => event.requiresScheduling);

        return NextResponse.json({ events: formattedEvents });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching general calendar:', error);
        return NextResponse.json({ error: 'Error al obtener la agenda.', details }, { status: 500 });
    }
}

