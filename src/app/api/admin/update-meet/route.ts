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
        const { eventId, meetLink, generateMeet, clientEmail, clientName, serviceName, dateStr } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Falta el ID del evento.' }, { status: 400 });
        }

        if (!meetLink && !generateMeet) {
            return NextResponse.json({ error: 'Debes enviar un enlace o solicitar generacion automatica.' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const calendar = getGoogleCalendarClientFromAccessToken(session?.accessToken);
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion faltante' }, { status: 500 });
        }

        let finalMeetLink = meetLink || '';

        if (generateMeet) {
            try {
                const generated = await calendar.events.patch({
                    calendarId,
                    eventId,
                    conferenceDataVersion: 1,
                    requestBody: {
                        conferenceData: {
                            createRequest: {
                                requestId: `ananda-gen-${eventId}-${Date.now()}`,
                                conferenceSolutionKey: { type: 'hangoutsMeet' },
                            },
                        },
                    },
                });

                finalMeetLink = extractMeetLink(generated.data as CalendarEvent);
            } catch (meetError: unknown) {
                const details = meetError instanceof Error ? meetError.message : 'Unknown error';
                return NextResponse.json(
                    {
                        error: 'No se pudo generar Meet automaticamente con la configuracion actual.',
                        details,
                        hint: 'Puedes pegar un enlace manual o usar credenciales OAuth del dueño del calendario.',
                    },
                    { status: 422 }
                );
            }
        }

        if (!finalMeetLink) {
            return NextResponse.json({ error: 'No fue posible obtener un enlace de Meet.' }, { status: 500 });
        }

        await calendar.events.patch({
            calendarId,
            eventId,
            requestBody: { location: finalMeetLink },
        });

        if (clientEmail && clientName && serviceName && dateStr) {
            try {
                sendConfirmationEmail(clientEmail, clientName, serviceName, dateStr, finalMeetLink).catch(console.error);
            } catch (mailError) {
                console.error('Error launching confirmation email:', mailError);
            }
        }

        return NextResponse.json({
            success: true,
            meetingLink: finalMeetLink,
            message: 'Enlace de Meet guardado y enviado al cliente.',
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error updating meet link:', error);
        return NextResponse.json({ error: 'Error al actualizar enlace.', details }, { status: 500 });
    }
}
