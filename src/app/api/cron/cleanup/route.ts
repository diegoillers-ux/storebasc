import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cronAuth';
import { bookingRepository } from '@/lib/supabase/repositories/bookings';

export async function GET(req: NextRequest) {
    if (!isAuthorizedCronRequest(req)) {
        return NextResponse.json({ error: 'No autorizado / Unauthorized' }, { status: 401 });
    }

    try {
        const expirationTime = new Date(Date.now() - 30 * 60 * 1000);
        const bookings = await bookingRepository.list();
        const expiredBookings = bookings.filter((booking) =>
            booking.status === 'PENDING_PAYMENT' && booking.createdAt < expirationTime
        );

        let cancelledCount = 0;
        const now = Date.now();

        for (const booking of expiredBookings) {
            await bookingRepository.update(booking.id!, { status: 'CANCELLED' });
            cancelledCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Cron Job: ${cancelledCount} reservas expiradas fueron liberadas.`,
            checkedAt: new Date(now).toISOString(),
        });
    } catch (error: unknown) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error en Cron de Limpieza:', error);
        return NextResponse.json({ error: 'Fallo al limpiar citas', details }, { status: 500 });
    }
}
