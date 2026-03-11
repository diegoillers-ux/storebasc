import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdminEmail } from '@/lib/auth';
import { isDemoMode } from '@/lib/demoMode';

export async function requireAdminSession() {
    if (isDemoMode()) {
        return null;
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!isAdminEmail(email)) {
        return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 });
    }

    return null;
}
