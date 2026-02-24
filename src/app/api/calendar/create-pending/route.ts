import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { sendPendingReservationEmail } from '@/lib/mailer';
import { getRequestIp, isRateLimited } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = getRequestIp(req.headers.get('x-forwarded-for'));
        if (isRateLimited(`createpending:${ip}`, 20, 60_000)) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 });
        }

        const body = await req.json();
        const { title, description, startDateTime, endDateTime } = body;

        if (!title || !startDateTime || !endDateTime) {
            return NextResponse.json({ error: 'Faltan parametros de evento.' }, { status: 400 });
        }

        const calendar = getGoogleCalendarClient();
        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;

        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion calendario faltante.' }, { status: 500 });
        }

        const normalizedStart = new Date(startDateTime).toISOString();
        const normalizedEnd = new Date(endDateTime).toISOString();

        const overlapCheck = await calendar.events.list({
            calendarId,
            timeMin: normalizedStart,
            timeMax: normalizedEnd,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 10,
        });

        const hasOverlap = (overlapCheck.data.items || []).some((existing) => existing.status !== 'cancelled');
        if (hasOverlap) {
            return NextResponse.json({ error: 'Ese horario ya fue tomado. Elige otro.' }, { status: 409 });
        }

        const slotKey = `${normalizedStart}|${normalizedEnd}`;
        const slotEventId = createHash('sha1').update(slotKey).digest('hex');

        const event = {
            id: slotEventId,
            summary: `[PENDIENTE] ${title}`,
            description: `${description || ''}\n\n---\n*Cita pendiente de pago. Si no se aprueba en el panel admin, se eliminara automaticamente.*`,
            start: {
                dateTime: normalizedStart,
                timeZone: 'America/Bogota',
            },
            end: {
                dateTime: normalizedEnd,
                timeZone: 'America/Bogota',
            },
            colorId: '5',
            reminders: {
                useDefault: false,
            },
        };

        let response;
        try {
            response = await calendar.events.insert({
                calendarId,
                requestBody: event,
            });
        } catch (insertError: unknown) {
            const maybeCode = (insertError as { code?: number })?.code;
            if (maybeCode === 409) {
                return NextResponse.json({ error: 'Ese horario ya fue tomado por otra persona. Elige otro.' }, { status: 409 });
            }
            throw insertError;
        }

        try {
            let extractedEmail = '';
            if (description) {
                const emailMatch = description.match(/Email:\s*([^\s]+)/);
                if (emailMatch?.[1]) {
                    extractedEmail = emailMatch[1].trim();
                }
            }

            const parts = title.split(' - ');
            const serviceName = parts[0]?.trim() || 'Sesion holistica';
            const clientName = parts[1]?.trim() || 'Cliente';

            const dateStr = new Date(startDateTime).toLocaleString('es-CO', {
                timeZone: 'America/Bogota',
                dateStyle: 'full',
                timeStyle: 'short',
            });

            if (extractedEmail) {
                sendPendingReservationEmail(extractedEmail, clientName, serviceName, dateStr).catch(console.error);
            }
        } catch (mailError) {
            console.error('Error in mailer route:', mailError);
        }

        return NextResponse.json({
            success: true,
            eventId: response.data.id,
            message: 'Evento pendiente creado exitosamente',
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error creating pending event:', error);
        return NextResponse.json({ error: 'Error agregando el evento en calendario.', details }, { status: 500 });
    }
}