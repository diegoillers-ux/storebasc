import { NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { isDemoMode } from '@/lib/demoMode';
import { demoGetSettings } from '@/lib/demoStore';

const SETTINGS_EVENT_TITLE = '[APP_SETTINGS]';

const DEFAULT_SETTINGS = {
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    blockedDates: [],
};

async function getSettingsEvent(calendar: ReturnType<typeof getGoogleCalendarClient>, calendarId: string) {
    const response = await calendar.events.list({
        calendarId,
        q: SETTINGS_EVENT_TITLE,
        timeMin: new Date('2020-01-01T00:00:00Z').toISOString(),
        timeMax: new Date('2021-01-01T00:00:00Z').toISOString(),
        maxResults: 1,
    });

    return response.data.items && response.data.items.length > 0 ? response.data.items[0] : null;
}

export async function GET() {
    try {
        if (isDemoMode()) {
            return NextResponse.json({ settings: demoGetSettings() });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ settings: DEFAULT_SETTINGS });
        }

        const settingsEvent = await getSettingsEvent(calendar, calendarId);
        if (settingsEvent?.description) {
            try {
                const settings = JSON.parse(settingsEvent.description);
                return NextResponse.json({ settings });
            } catch {
                return NextResponse.json({ settings: DEFAULT_SETTINGS });
            }
        }

        return NextResponse.json({ settings: DEFAULT_SETTINGS });
    } catch {
        return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
}

