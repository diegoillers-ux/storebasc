import { NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { demoListConfirmedEvents } from '@/lib/demoStore';

export async function GET() {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        if (isDemoMode()) {
            const events = demoListConfirmedEvents().map((event) => {
                let email = '';
                const match = (event.description || '').match(/Email:\s*([^\s]+)/);
                if (match?.[1]) email = match[1];

                return {
                    id: event.id,
                    summary: event.summary,
                    start: event.start,
                    end: event.end,
                    location: event.location || '',
                    description: event.description || '',
                    clientEmail: email,
                };
            });
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

        const formattedEvents = confirmedEvents.map((event) => {
            let email = '';
            if (event.description) {
                const match = event.description.match(/Email:\s*([^\s]+)/);
                if (match?.[1]) email = match[1];
            }

            return {
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                location: event.location || '',
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

