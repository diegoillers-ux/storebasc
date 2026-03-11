import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { error: 'Pasarela de pago deshabilitada en esta version.' },
        { status: 410 }
    );
}
