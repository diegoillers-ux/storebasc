import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isDemoMode } from '@/lib/demoMode';

export async function requireAdminSession() {
    if (isDemoMode()) {
        return null;
    }

    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!session.user.isAdmin) {
        return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 });
    }

    return null;
}
