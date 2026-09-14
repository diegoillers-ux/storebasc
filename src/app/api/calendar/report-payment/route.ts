import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCalendarClient } from '@/lib/googleCalendar';
import { sendAdminPaymentProofEmail } from '@/lib/mailer';
import { getRequestIp, isRateLimited } from '@/lib/rateLimit';
import { put, getDownloadUrl } from '@vercel/blob';
import { isDemoMode } from '@/lib/demoMode';
import { demoGetEventById, demoUpdateEvent } from '@/lib/demoStore';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const MAX_PROOF_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const ip = getRequestIp(req.headers.get('x-forwarded-for'), req.headers.get('x-real-ip'), req.headers.get('cf-connecting-ip'));
        if (isRateLimited(`reportpayment:${ip}`, 20, 60_000)) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 });
        }

        const formData = await req.formData();
        const eventId = String(formData.get('eventId') || '').trim();
        const clientName = String(formData.get('clientName') || '').trim();
        const clientEmail = String(formData.get('clientEmail') || '').trim();
        const serviceName = String(formData.get('serviceName') || '').trim();
        const dateTime = String(formData.get('dateTime') || '').trim();
        const paymentNote = String(formData.get('paymentNote') || '').trim();
        const reservationCode = String(formData.get('reservationCode') || '').trim();
        const saleType = String(formData.get('saleType') || 'service').trim() as 'service' | 'product' | 'raffle';
        const proof = formData.get('proof');

        if (!eventId || !clientName || !clientEmail || !serviceName || !dateTime) {
            return NextResponse.json({ error: 'Faltan datos para reportar el pago.' }, { status: 400 });
        }

        if (!(proof instanceof File)) {
            return NextResponse.json({ error: 'Debes adjuntar un comprobante.' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(proof.type)) {
            return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG o PDF.' }, { status: 400 });
        }

        if (proof.size > MAX_PROOF_SIZE_BYTES) {
            return NextResponse.json({ error: 'El comprobante supera 2MB.' }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await proof.arrayBuffer());
        let proofUrl = '';

        if (isDemoMode()) {
            proofUrl = `data:${proof.type};base64,${fileBuffer.toString('base64')}`;
            const currentEvent = demoGetEventById(eventId);
            if (!currentEvent) {
                return NextResponse.json({ error: 'Reserva demo no encontrada.' }, { status: 404 });
            }

            const currentDescription = currentEvent.description || '';
            const paymentBlock = [
                '[PAGO_REPORTADO]',
                `Cliente: ${clientName}`,
                `Email: ${clientEmail}`,
                `Fecha Reporte: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`,
                `Codigo de reserva: ${reservationCode || 'NO_DISPONIBLE'}`,
                `Nota: ${paymentNote || 'Sin nota adicional'}`,
                `Comprobante: ${proof.name} (${Math.round(proof.size / 1024)} KB)`,
                `Comprobante URL: ${proofUrl}`,
            ].join('\n');

            const cleanDescription = currentDescription.replace(/\n\n\[PAGO_REPORTADO\][\s\S]*$/m, '').trim();
            demoUpdateEvent(eventId, { description: `${cleanDescription}\n\n${paymentBlock}`.trim() });
        } else {
            const calendarId = process.env.NEXT_PUBLIC_CALENDAR_ID;
            if (!calendarId) {
                return NextResponse.json({ error: 'Configuracion de calendario faltante.' }, { status: 500 });
            }

            const calendar = getGoogleCalendarClient();
            const event = await calendar.events.get({ calendarId, eventId });
            const currentDescription = event.data.description || '';

            try {
                const safeName = proof.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const blobPath = `proofs/${eventId}/${Date.now()}-${safeName}`;
                const uploaded = await put(blobPath, fileBuffer, {
                    access: 'private',
                    contentType: proof.type,
                });
                proofUrl = getDownloadUrl(uploaded.url);
            } catch (blobError) {
                console.error('Blob upload failed, keeping email attachment fallback:', blobError);
            }

            const paymentBlock = [
                '[PAGO_REPORTADO]',
                `Cliente: ${clientName}`,
                `Email: ${clientEmail}`,
                `Fecha Reporte: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`,
                `Codigo de reserva: ${reservationCode || 'NO_DISPONIBLE'}`,
                `Nota: ${paymentNote || 'Sin nota adicional'}`,
                `Comprobante: ${proof.name} (${Math.round(proof.size / 1024)} KB)`,
                `Comprobante URL: ${proofUrl || 'NO_DISPONIBLE'}`,
            ].join('\n');

            const cleanDescription = currentDescription.replace(/\n\n\[PAGO_REPORTADO\][\s\S]*$/m, '').trim();
            const newDescription = `${cleanDescription}\n\n${paymentBlock}`.trim();

            await calendar.events.patch({
                calendarId,
                eventId,
                requestBody: { description: newDescription },
            });
        }

        if (!isDemoMode()) {
            await sendAdminPaymentProofEmail({
                eventId,
                reservationCode,
                clientName,
                clientEmail,
                serviceName,
                dateTime,
                paymentNote,
                filename: proof.name,
                contentType: proof.type,
                content: fileBuffer,
                saleType,
            });
        }

        return NextResponse.json({
            success: true,
            proofUrl: proofUrl || null,
            message: 'Comprobante enviado. Tu reserva queda en validacion.',
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error reporting payment proof:', error);
        return NextResponse.json({ error: 'Error al reportar pago.', details }, { status: 500 });
    }
}
