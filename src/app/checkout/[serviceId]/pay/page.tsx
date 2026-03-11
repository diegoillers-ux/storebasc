'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { getServiceById } from '@/lib/data';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params?.serviceId as string;
    const service = getServiceById(serviceId);

    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [finishing, setFinishing] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [reservationCode, setReservationCode] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setReservationCode(sessionStorage.getItem('booking_reference') || '');
    }, []);

    if (!service) {
        return <div className={styles.container}>Servicio no encontrado</div>;
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const clearBookingSession = () => {
        sessionStorage.removeItem('booking_name');
        sessionStorage.removeItem('booking_email');
        sessionStorage.removeItem('booking_context');
        sessionStorage.removeItem('booking_date');
        sessionStorage.removeItem('booking_time');
        sessionStorage.removeItem('booking_event_id');
        sessionStorage.removeItem('booking_reference');
    };

    const handleFinish = async () => {
        if (!proofFile) {
            alert('Debes adjuntar el comprobante de pago.');
            return;
        }

        if (!ACCEPTED_TYPES.includes(proofFile.type)) {
            alert('Formato no permitido. Usa JPG, PNG o PDF.');
            return;
        }

        if (proofFile.size > MAX_FILE_SIZE_BYTES) {
            alert('El archivo supera 2MB. Sube un comprobante mas liviano.');
            return;
        }

        const eventId = sessionStorage.getItem('booking_event_id');
        const clientName = sessionStorage.getItem('booking_name') || 'Cliente';
        const clientEmail = sessionStorage.getItem('booking_email') || '';
        const bookingDate = sessionStorage.getItem('booking_date') || '';
        const bookingTime = sessionStorage.getItem('booking_time') || '';
        const dateTime = `${bookingDate} ${bookingTime}`.trim();

        if (!eventId || !clientEmail || !bookingDate || !bookingTime) {
            alert('Faltan datos de reserva. Vuelve a seleccionar horario.');
            router.push(`/checkout/${serviceId}/schedule`);
            return;
        }

        setFinishing(true);
        try {
            const formData = new FormData();
            formData.append('eventId', eventId);
            formData.append('clientName', clientName);
            formData.append('clientEmail', clientEmail);
            formData.append('serviceName', service.title);
            formData.append('dateTime', dateTime);
            formData.append('paymentNote', paymentNote);
            formData.append('reservationCode', reservationCode);
            formData.append('proof', proofFile);

            const response = await fetch('/api/calendar/report-payment', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data?.error || 'No se pudo reportar el pago.');
                return;
            }

            clearBookingSession();
            alert('Pago reportado. Revisaremos tu comprobante y te contactaremos por correo.');
            router.push('/?success=true');
        } catch (error) {
            console.error(error);
            alert('Error de conexion al enviar comprobante.');
        } finally {
            setFinishing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center', maxWidth: '640px', width: '100%' }}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>
                        1. Tus Datos
                    </div>
                    <div className={styles.progressLine} style={{ opacity: 0.5 }}></div>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>
                        2. Agendar
                    </div>
                    <div className={styles.progressLine} style={{ opacity: 1, backgroundColor: 'var(--primary)' }}></div>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>
                        3. Pago
                    </div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Tu cupo esta pre-reservado</h1>
                <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
                    Para confirmar tu <strong>{service.title}</strong>, realiza la transferencia en los proximos{' '}
                    <strong>{formatTime(timeLeft)}</strong> minutos y adjunta el comprobante.
                </p>

                <div
                    style={{
                        padding: '2rem',
                        background: 'rgba(213, 189, 169, 0.1)',
                        border: '1px solid var(--primary)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                    }}
                >
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Total a Transferir</h2>
                    <p className={styles.price} style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                        {service.price}
                    </p>

                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Opciones de Transferencia:</p>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#E8CAED' }}>Cuenta 1:</strong>{' '}
                            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>000 000 0000</span>
                        </div>
                        <div>
                            <strong style={{ color: '#E8CAED' }}>Cuenta 2:</strong>{' '}
                            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>000-000000-00</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--primary)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.45 }}>
                        <strong>Codigo de reserva:</strong>{' '}
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{reservationCode || 'PENDIENTE'}</span>
                    </p>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.86rem', opacity: 0.8 }}>
                        Por favor envia tu transaccion junto con este codigo en observaciones.
                    </p>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>
                        Adjuntar comprobante (JPG, PNG, PDF - max 2MB)
                    </label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        style={{ width: '100%', marginBottom: '0.8rem' }}
                    />
                    <textarea
                        placeholder="Nota opcional para la administradora (banco, hora de pago, etc.)"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        rows={3}
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)',
                            padding: '0.8rem',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleFinish}
                        className={styles.submitBtn}
                        disabled={finishing}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {finishing ? 'Enviando comprobante...' : 'Ya realice la transferencia'}
                    </button>
                    <p style={{ display: 'flex', gap: '0.5rem', opacity: 0.6, fontSize: '0.8rem', marginTop: '0.2rem', textAlign: 'center', lineHeight: '1.4' }}>
                        Tu comprobante sera revisado manualmente en el portal admin para aprobar la reserva.
                    </p>
                </div>
            </div>
        </div>
    );
}
