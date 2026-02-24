'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../page.module.css';

import { getServiceById } from '@/lib/data';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params?.serviceId as string;
    const service = getServiceById(serviceId);

    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!service) {
        return <div className={styles.container}>Servicio no encontrado</div>;
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleFinish = () => {
        setFinishing(true);
        // Limpiamos los datos de sesión temporales por seguridad
        sessionStorage.removeItem('booking_name');
        sessionStorage.removeItem('booking_email');
        sessionStorage.removeItem('booking_date');
        sessionStorage.removeItem('booking_time');

        // Simular pequeño retraso antes de enviarlo a Home o Confirmación
        setTimeout(() => {
            router.push('/?success=true');
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>

                {/* Progress Indicator */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>1. Tus Datos</div>
                    <div className={styles.progressLine} style={{ opacity: 0.5 }}></div>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>2. Agendar</div>
                    <div className={styles.progressLine} style={{ opacity: 1, backgroundColor: 'var(--primary)' }}></div>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>3. Pago Seguro</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Tu cupo está pre-reservado</h1>
                <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
                    Para confirmar definitivamente tu {service.title}, realiza la transferencia por el valor exacto en los próximos <strong>{formatTime(timeLeft)}</strong> minutos.
                </p>

                <div style={{ padding: '2rem', background: 'rgba(213, 189, 169, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Total a Transferir</h2>
                    <p className={styles.price} style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{service.price}</p>

                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Opciones de Transferencia:</p>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#E8CAED' }}>Nequi:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>300 000 0000</span>
                        </div>
                        <div>
                            <strong style={{ color: '#E8CAED' }}>Bancolombia (Ahorros):</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>000-000000-00</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleFinish}
                        className={styles.submitBtn}
                        disabled={finishing}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        {finishing ? (
                            'Confirmando...'
                        ) : (
                            <>
                                <span>✅</span> Ya realicé la transferencia
                            </>
                        )}
                    </button>
                    <p style={{ display: 'flex', gap: '0.5rem', opacity: 0.6, fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', lineHeight: '1.4' }}>
                        Al confirmar, nuestro sistema verificará tu pago y te enviaremos el enlace de Google Meet al correo proporcionado.
                    </p>
                </div>
            </div>
        </div>
    );
}
