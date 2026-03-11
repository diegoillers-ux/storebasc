'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../[serviceId]/page.module.css';

type RaffleOrder = {
    eventId?: string;
    reservationCode?: string;
    raffleId: string;
    raffleTitle: string;
    selectedNumber: string;
    price: string;
    priceNumber: number;
    name: string;
    email: string;
    whatsapp: string;
};

export default function RafflePayPage() {
    const router = useRouter();
    const [order, setOrder] = useState<RaffleOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [note, setNote] = useState('');
    const [reservationCode, setReservationCode] = useState('');

    useEffect(() => {
        const savedOrder = sessionStorage.getItem('raffle_order');
        if (!savedOrder) {
            router.push('/');
            return;
        }

        const parsedOrder = JSON.parse(savedOrder) as RaffleOrder;
        setOrder(parsedOrder);

        const ensurePendingSale = async () => {
            if (parsedOrder.eventId && parsedOrder.reservationCode) {
                setReservationCode(parsedOrder.reservationCode);
                setInitializing(false);
                return;
            }

            try {
                const response = await fetch('/api/calendar/create-pending', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: `RIFA: ${parsedOrder.raffleTitle} - ${parsedOrder.name}`,
                        description: [
                            `Compra del numero ${parsedOrder.selectedNumber} para ${parsedOrder.raffleTitle}.`,
                            `Email: ${parsedOrder.email}`,
                            `WhatsApp: ${parsedOrder.whatsapp}`,
                        ].join('\n'),
                        metadata: {
                            saleType: 'raffle',
                            itemId: parsedOrder.raffleId,
                            itemTitle: parsedOrder.raffleTitle,
                            amountLabel: parsedOrder.price,
                            amountNumber: parsedOrder.priceNumber,
                            clientName: parsedOrder.name,
                            clientEmail: parsedOrder.email,
                            clientPhone: parsedOrder.whatsapp,
                            selectedNumber: parsedOrder.selectedNumber,
                            requiresScheduling: false,
                            scheduledDateLabel: 'Compra de rifa sin agenda',
                        },
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error || 'No se pudo preparar la compra.');
                }

                const nextOrder = {
                    ...parsedOrder,
                    eventId: data.eventId,
                    reservationCode: data.reservationCode,
                };

                sessionStorage.setItem('raffle_order', JSON.stringify(nextOrder));
                setOrder(nextOrder);
                setReservationCode(data.reservationCode || '');
            } catch (error) {
                console.error(error);
                alert('No se pudo preparar tu compra de rifa. Intenta de nuevo.');
                router.push(`/checkout/raffle?raffleId=${parsedOrder.raffleId}&number=${parsedOrder.selectedNumber}`);
            } finally {
                setInitializing(false);
            }
        };

        void ensurePendingSale();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!order?.eventId) {
                throw new Error('No se encontro la transaccion pendiente.');
            }

            const formData = new FormData();
            formData.append('eventId', order.eventId);
            formData.append('clientName', order.name);
            formData.append('clientEmail', order.email);
            formData.append('serviceName', `${order.raffleTitle} · Numero ${order.selectedNumber}`);
            formData.append('dateTime', 'Compra de rifa sin agenda');
            formData.append('paymentNote', `Numero ${order.selectedNumber} | WhatsApp: ${order.whatsapp}${note ? `\n${note}` : ''}`);
            formData.append('reservationCode', order.reservationCode || reservationCode);
            formData.append('saleType', 'raffle');
            if (file) formData.append('proof', file);

            const res = await fetch('/api/calendar/report-payment', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                alert(data?.message || 'Reporte enviado. Tu numero quedo en validacion.');
                sessionStorage.removeItem('raffle_order');
                router.push('/?success=true');
            } else {
                alert(data?.error || 'Error al enviar el reporte.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    if (!order || initializing) return <div className={styles.container}>Preparando transaccion...</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>1. Tus Datos</div>
                    <div className={styles.progressLine} style={{ opacity: 1, backgroundColor: 'var(--primary)' }}></div>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>2. Pago Manual</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Confirma tu participacion</h1>
                <p style={{ marginBottom: '1rem', opacity: 0.84, textAlign: 'center' }}>
                    Realiza la transferencia por <strong>{order.price}</strong> para asegurar el numero <strong>{order.selectedNumber}</strong>.
                </p>

                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Cuentas de Transferencia:</h4>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>Nequi: 300 000 0000</p>
                    <p style={{ fontSize: '0.9rem' }}>Daviplata: 300 000 0000</p>
                </div>

                <div style={{ marginBottom: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--primary)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.45 }}>
                        <strong>Codigo de transaccion:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{reservationCode || order.reservationCode || 'PENDIENTE'}</span>
                    </p>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.86rem', opacity: 0.8 }}>
                        Incluye este codigo en la referencia de tu consignacion o en la nota del pago.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Subir Comprobante</label>
                        <input 
                            required 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            style={{ padding: '0.5rem' }}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nota adicional</label>
                        <textarea 
                            placeholder="Ej: Pago realizado desde la cuenta de..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className={styles.textarea}
                            rows={3}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Enviando comprobante...' : 'Confirmar reporte de pago'}
                    </button>
                </form>
            </div>
        </div>
    );
}
