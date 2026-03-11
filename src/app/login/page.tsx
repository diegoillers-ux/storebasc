'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Calendar, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

import styles from './page.module.css';

function getErrorCopy(errorCode: string | null) {
    if (errorCode === 'AccessDenied') {
        return {
            title: 'Correo sin permisos',
            text: 'El acceso al CRM está restringido a los correos incluidos en ADMIN_EMAILS. Inicia sesión con una cuenta autorizada.',
        };
    }

    if (errorCode === 'Configuration') {
        return {
            title: 'Configuración incompleta',
            text: 'Faltan variables del proveedor de Google o de NextAuth. Revisa GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL y NEXTAUTH_SECRET.',
        };
    }

    if (errorCode) {
        return {
            title: 'No se pudo completar el acceso',
            text: 'Hubo un problema al iniciar sesión. Intenta de nuevo y revisa la configuración del proveedor si el problema persiste.',
        };
    }

    return null;
}

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status, data: session } = useSession();
    const error = searchParams.get('error');
    const errorCopy = useMemo(() => getErrorCopy(error), [error]);

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/admin/reservas');
        }
    }, [router, status]);

    return (
        <main className={styles.page}>
            <section className={styles.panel}>
                <div className={styles.copyColumn}>
                    <span className={styles.eyebrow}>Acceso administrativo protegido</span>
                    <h1 className="gradient-text">Ingreso al CRM</h1>
                    <p className={styles.lead}>
                        El panel administrativo se dejó con acceso real por Google y lista blanca de correos. No hay acceso abierto al público ni bypass temporal en la interfaz.
                    </p>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <ShieldCheck size={18} />
                            <span>Solo ingresan correos autorizados en ADMIN_EMAILS.</span>
                        </div>
                        <div className={styles.featureItem}>
                            <Calendar size={18} />
                            <span>La sesión también habilita el uso seguro del panel y sus APIs administrativas.</span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircle2 size={18} />
                            <span>Si la cuenta ya está aprobada, el acceso redirige al CRM automáticamente.</span>
                        </div>
                    </div>

                    {errorCopy && (
                        <div className={styles.errorBox}>
                            <AlertCircle size={18} />
                            <div>
                                <strong>{errorCopy.title}</strong>
                                <p>{errorCopy.text}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`${styles.actionCard} glass-panel`}>
                    <div className={styles.actionIcon}>
                        <Sparkles size={26} />
                    </div>
                    <h2>Entrar con Google</h2>
                    <p>
                        Usa el correo administrador del negocio. Si no está en la lista autorizada, el sistema bloqueará la entrada al panel.
                    </p>

                    <button
                        className={styles.loginButton}
                        onClick={() => signIn('google', { callbackUrl: '/admin/reservas' })}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Validando sesión...' : 'Continuar con Google'}
                    </button>

                    <div className={styles.statusNote}>
                        <span>Estado actual:</span>
                        <strong>{status === 'authenticated' ? session?.user?.email || 'Autenticado' : 'Sin sesión activa'}</strong>
                    </div>
                </div>
            </section>
        </main>
    );
}

function LoginFallback() {
    return (
        <main className={styles.page}>
            <section className={styles.panel}>
                <div className={styles.copyColumn}>
                    <span className={styles.eyebrow}>Acceso administrativo protegido</span>
                    <h1 className="gradient-text">Ingreso al CRM</h1>
                    <p className={styles.lead}>Preparando la validacion de acceso y cargando el flujo de inicio de sesion.</p>
                </div>

                <div className={`${styles.actionCard} glass-panel`}>
                    <div className={styles.actionIcon}>
                        <Sparkles size={26} />
                    </div>
                    <h2>Cargando acceso</h2>
                    <p>Estamos comprobando el estado de la sesion para mostrarte el formulario correcto.</p>
                </div>
            </section>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginPageContent />
        </Suspense>
    );
}