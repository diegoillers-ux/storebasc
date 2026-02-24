import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'CRON_SECRET no configurado en produccion.' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'No autorizado / Unauthorized' }, { status: 401 });
    }

    try {
        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion calendario faltante' }, { status: 500 });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const response = await calendar.events.list({
            calendarId,
            timeMin: startOfDay.toISOString(),
            maxResults: 100,
            singleEvents: true,
            q: '[PENDIENTE]',
        });

        const pendingEvents = response.data.items || [];
        let deletedCount = 0;
        const now = Date.now();

        for (const event of pendingEvents) {
            if (!event.created || !event.id) continue;

            const createdTime = new Date(event.created).getTime();
            const diffMinutes = (now - createdTime) / (1000 * 60);

            if (diffMinutes > 30) {
                await calendar.events.delete({
                    calendarId,
                    eventId: event.id,
                });
                deletedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron Job: ${deletedCount} cupos expirados fueron liberados.`,
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error en Cron de Limpieza:', error);
        return NextResponse.json({ error: 'Fallo al limpiar citas', details }, { status: 500 });
    }
}