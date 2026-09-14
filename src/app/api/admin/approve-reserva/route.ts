import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { sendApprovedSaleEmail } from '@/lib/mailer';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { demoGetEventById, demoUpdateEvent } from '@/lib/demoStore';
import { extractSaleMetadata, inferSaleType } from '@/lib/sales';

export async function POST(req: NextRequest) {
    const authError = await requireAdminSession();
    if (authError) return authError;

    try {
        const { eventId } = await req.json();
        if (!eventId) {
            return NextResponse.json({ error: 'Falta el ID del evento.' }, { status: 400 });
        }

        if (isDemoMode()) {
            const event = demoGetEventById(eventId);
            if (!event) {
                return NextResponse.json({ error: 'Reserva demo no encontrada.' }, { status: 404 });
            }

            if (!event.summary.includes('[PENDIENTE]')) {
                return NextResponse.json({ error: 'La reserva ya fue aprobada.' }, { status: 400 });
            }

            const newSummary = event.summary.replace('[PENDIENTE] ', '').replace('[PENDIENTE]', '').trim();
            const cleanDescription = (event.description || '').split('\n\n---')[0] || '';

            demoUpdateEvent(eventId, {
                status: 'confirmed',
                summary: newSummary,
                description: cleanDescription,
            });

            return NextResponse.json({
                success: true,
                message: 'Cita demo confirmada correctamente.',
            });
        }

        const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;
        if (!calendarId) {
            return NextResponse.json({ error: 'Configuracion de calendario faltante' }, { status: 500 });
        }

        const calendar = getGoogleCalendarClient();
        const event = await calendar.events.get({ calendarId, eventId });
        const currentEvent = event.data;

        if (!currentEvent.summary?.includes('[PENDIENTE]')) {
            return NextResponse.json({ error: 'El evento ya fue aprobado o es invalido.' }, { status: 400 });
        }

        let extractedEmail = '';
        if (currentEvent.description) {
            const emailMatch = currentEvent.description.match(/Email:\s*([^\s]+)/);
            if (emailMatch?.[1]) extractedEmail = emailMatch[1];
        }

        const metadata = extractSaleMetadata(currentEvent.description || '');
        const saleType = inferSaleType(currentEvent.summary || '', metadata);

        const newSummary = currentEvent.summary.replace('[PENDIENTE] ', '').replace('[PENDIENTE]', '').trim();
        const cleanDescription = currentEvent.description?.split('\n\n---')[0] || '';

        await calendar.events.patch({
            calendarId,
            eventId,
            requestBody: {
                summary: newSummary,
                description: cleanDescription,
                colorId: '9',
            },
        });

        try {
            if (extractedEmail) {
                const serviceName = metadata?.itemTitle || newSummary.split(' - ')[0]?.trim() || 'Venta';
                const clientName = metadata?.clientName || newSummary.split(' - ')[1]?.trim() || 'Cliente';
                const dateStr = new Date(currentEvent.start?.dateTime || currentEvent.start?.date || new Date()).toLocaleString('es-CO', {
                    timeZone: 'America/Bogota',
                    dateStyle: 'full',
                    timeStyle: 'short',
                });

                sendApprovedSaleEmail({
                    toEmail: extractedEmail,
                    clientName,
                    itemName: serviceName,
                    dateTime: metadata?.scheduledDateLabel || dateStr,
                    saleType,
                }).catch(console.error);
            }
        } catch (mailError) {
            console.error('Error sending confirmation email:', mailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Cita confirmada correctamente.',
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error approving event:', error);
        return NextResponse.json({ error: 'Error al actualizar el calendario.', details }, { status: 500 });
    }
}

