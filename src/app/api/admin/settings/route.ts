import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { requireAdminSession } from '@/lib/adminAuth';

type CalendarClient = ReturnType<typeof getGoogleCalendarClient>;

const SETTINGS_EVENT_TITLE = '[ANANDA_SETTINGS]';

const DEFAULT_SETTINGS = {
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    blockedDates: []
};

// ==========================================
// Funciones Internas de Ayuda
// ==========================================
async function getSettingsEvent(calendar: CalendarClient, calendarId: string) {
    const response = await calendar.events.list({
        calendarId,
        q: SETTINGS_EVENT_TITLE,
        timeMin: new Date('2020-01-01T00:00:00Z').toISOString(),
        timeMax: new Date('2021-01-01T00:00:00Z').toISOString(),
        maxResults: 1
    });
    return response.data.items && response.data.items.length > 0 ? response.data.items[0] : null;
}

// ==========================================
// Rutas API Públicas de Next.js
// ==========================================

// Leer Configuración
export async function GET() {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 });

        const settingsEvent = await getSettingsEvent(calendar, calendarId);

        if (settingsEvent && settingsEvent.description) {
            try {
                const settings = JSON.parse(settingsEvent.description);
                return NextResponse.json({ settings });
            } catch (e) {
                console.error("Error parsing settings JSON", e);
            }
        }

        return NextResponse.json({ settings: DEFAULT_SETTINGS });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Error al obtener configuraciones.', details }, { status: 500 });
    }
}

// Guardar Configuración
export async function POST(req: NextRequest) {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        const { settings } = await req.json();

        if (!settings) {
            return NextResponse.json({ error: 'Faltan datos de configuración' }, { status: 400 });
        }

        if (typeof settings.startTime !== 'string' || typeof settings.endTime !== 'string' || settings.startTime >= settings.endTime) {
            return NextResponse.json({ error: 'Rango de horario inválido. La hora de fin debe ser mayor a la de inicio.' }, { status: 400 });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 });

        const settingsString = JSON.stringify(settings, null, 2);
        const existingEvent = await getSettingsEvent(calendar, calendarId);

        if (existingEvent?.id) {
            await calendar.events.patch({
                calendarId,
                eventId: existingEvent.id,
                requestBody: { description: settingsString }
            });
        } else {
            await calendar.events.insert({
                calendarId,
                requestBody: {
                    summary: SETTINGS_EVENT_TITLE,
                    description: settingsString,
                    start: { dateTime: '2020-05-01T09:00:00-05:00' },
                    end: { dateTime: '2020-05-01T10:00:00-05:00' },
                    colorId: '8' // Gris oscuro en Google Calendar
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Configuración guardada en el calendario.' });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Error al guardar configuraciones.', details }, { status: 500 });
    }
}
