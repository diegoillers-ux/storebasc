import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClientFromAccessToken } from '@/lib/googleCalendar';
import { sendConfirmationEmail } from '@/lib/mailer';
import { requireAdminSession } from '@/lib/adminAuth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type CalendarEvent = {
    hangoutLink?: string | null;
    location?: string | null;
    conferenceData?: {
        entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }> | null;
    } | null;
};

function extractMeetLink(event: CalendarEvent) {
    const video = event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;
    return event.hangoutLink || video || event.location || '';
}

export async function POST(req: NextRequest) {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        const { eventId } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Falta el ID del evento.' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const calendar = getGoogleCalendarClientFromAccessToken(session?.accessToken);
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion de calendario faltante' }, { status: 500 });
        }

        const event = await calendar.events.get({ calendarId, eventId });
        const currentEvent = event.data;

        if (!currentEvent.summary?.includes('[PENDIENTE]')) {
            return NextResponse.json({ error: 'El evento ya fue aprobado o es invalido.' }, { status: 400 });
        }

        let extractedEmail = '';
        if (currentEvent.description) {
            const emailMatch = currentEvent.description.match(/Email:\s*([^\s]+)/);
            if (emailMatch?.[1]) {
                extractedEmail = emailMatch[1];
            }
        }

        const newSummary = currentEvent.summary.replace('[PENDIENTE] ', '').replace('[PENDIENTE]', '').trim();
        const cleanDescription = currentEvent.description?.split('\n\n---')[0] || '';

        const updated = await calendar.events.patch({
            calendarId,
            eventId,
            requestBody: {
                summary: newSummary,
                description: cleanDescription,
                colorId: '9',
            },
        });

        let meetingLink = extractMeetLink(updated.data as CalendarEvent);
        let meetWarning = '';

        if (!meetingLink) {
            try {
                const withMeet = await calendar.events.patch({
                    calendarId,
                    eventId,
                    conferenceDataVersion: 1,
                    requestBody: {
                        conferenceData: {
                            createRequest: {
                                requestId: `ananda-${eventId}-${Date.now()}`,
                                conferenceSolutionKey: { type: 'hangoutsMeet' },
                            },
                        },
                    },
                });
                meetingLink = extractMeetLink(withMeet.data as CalendarEvent);
            } catch (meetError) {
                console.error('Meet generation failed, approval kept:', meetError);
                meetWarning = 'La cita fue aprobada, pero no se pudo generar Meet automaticamente.';
            }
        }

        if (meetingLink && updated.data.location !== meetingLink) {
            await calendar.events.patch({
                calendarId,
                eventId,
                requestBody: { location: meetingLink },
            });
        }

        try {
            if (extractedEmail) {
                const parts = newSummary.split(' - ');
                const serviceName = parts[0]?.trim() || 'Sesion Holistica';
                const clientName = parts[1]?.trim() || 'Cliente';

                const dateStr = new Date(
                    currentEvent.start?.dateTime || currentEvent.start?.date || new Date()
                ).toLocaleString('es-CO', {
                    timeZone: 'America/Bogota',
                    dateStyle: 'full',
                    timeStyle: 'short',
                });

                sendConfirmationEmail(extractedEmail, clientName, serviceName, dateStr, meetingLink).catch(console.error);
            }
        } catch (mailError) {
            console.error('Error sending confirmation email:', mailError);
        }

        return NextResponse.json({
            success: true,
            meetingLink,
            warning: meetWarning,
            message: meetingLink
                ? 'Cita confirmada, enlace de Meet generado y correo enviado.'
                : 'Cita confirmada correctamente.',
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error approving event:', error);
        return NextResponse.json({ error: 'Error al actualizar el calendario.', details }, { status: 500 });
    }
}
