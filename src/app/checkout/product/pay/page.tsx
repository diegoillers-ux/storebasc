'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../[serviceId]/page.module.css';

type ProductOrder = {
    eventId?: string;
    reservationCode?: string;
    productId: string;
    productTitle: string;
    price: string;
    priceNumber: number;
    name: string;
    email: string;
    whatsapp: string;
    address: string;
    note?: string;
};

export default function ProductPayPage() {
    const router = useRouter();
    const [order, setOrder] = useState<ProductOrder | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentNote, setPaymentNote] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [reservationCode, setReservationCode] = useState('');

    useEffect(() => {
        const savedOrder = sessionStorage.getItem('product_order');
        if (!savedOrder) {
            router.push('/');
            return;
        }

        const parsedOrder = JSON.parse(savedOrder) as ProductOrder;
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
                        title: `PRODUCTO: ${parsedOrder.productTitle} - ${parsedOrder.name}`,
                        description: [
                            `Pedido manual para ${parsedOrder.productTitle}.`,
                            `Email: ${parsedOrder.email}`,
                            `WhatsApp: ${parsedOrder.whatsapp}`,
                            `Entrega: ${parsedOrder.address}`,
                            `Nota: ${parsedOrder.note || 'Sin nota adicional'}`,
                        ].join('\n'),
                        metadata: {
                            saleType: 'product',
                            itemId: parsedOrder.productId,
                            itemTitle: parsedOrder.productTitle,
                            amountLabel: parsedOrder.price,
                            amountNumber: parsedOrder.priceNumber,
                            clientName: parsedOrder.name,
                            clientEmail: parsedOrder.email,
                            clientPhone: parsedOrder.whatsapp,
                            requiresScheduling: false,
                            scheduledDateLabel: 'Pedido de producto sin agenda',
                        },
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error || 'No se pudo preparar el pedido.');
                }

                const nextOrder = {
                    ...parsedOrder,
                    eventId: data.eventId,
                    reservationCode: data.reservationCode,
                };

                sessionStorage.setItem('product_order', JSON.stringify(nextOrder));
                setOrder(nextOrder);
                setReservationCode(data.reservationCode || '');
            } catch (error) {
                console.error(error);
                alert('No se pudo preparar tu pedido. Intenta nuevamente.');
                router.push(`/checkout/product?productId=${parsedOrder.productId}`);
            } finally {
                setInitializing(false);
            }
        };

        void ensurePendingSale();
    }, [router]);

    const handleFinish = async () => {
        if (!proofFile || !order?.eventId) {
            alert('Adjunta el comprobante para continuar.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('eventId', order.eventId);
            formData.append('clientName', order.name);
            formData.append('clientEmail', order.email);
            formData.append('serviceName', order.productTitle);
            formData.append('dateTime', 'Pedido de producto sin agenda');
            formData.append('paymentNote', `${paymentNote || 'Sin nota adicional'}\nEntrega: ${order.address}\nWhatsApp: ${order.whatsapp}`);
            formData.append('reservationCode', order.reservationCode || reservationCode);
            formData.append('saleType', 'product');
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

            sessionStorage.removeItem('product_order');
            alert(data?.message || 'Pago reportado. Tu pedido queda en validacion.');
            router.push('/?success=true');
        } catch (error) {
            console.error(error);
            alert('Error de conexion al enviar comprobante.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!order || initializing) return <div className={styles.container}>Preparando pedido...</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`} style={{ textAlign: 'center', maxWidth: '640px', width: '100%' }}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>1. Tus Datos</div>
                    <div className={styles.progressLine} style={{ opacity: 1, backgroundColor: 'var(--primary)' }}></div>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>2. Pago Manual</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Finaliza tu pedido</h1>
                <p style={{ marginBottom: '1.5rem', opacity: 0.82 }}>
                    Consigna <strong>{order.price}</strong> y adjunta tu comprobante para validar el pedido de <strong>{order.productTitle}</strong>.
                </p>

                <div style={{ padding: '1.4rem', background: 'rgba(213, 189, 169, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', marginBottom: '1rem', textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.08rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Medios de pago</h2>
                    <p style={{ marginBottom: '0.35rem' }}>Nequi: 300 000 0000</p>
                    <p>Daviplata: 300 000 0000</p>
                </div>

                <div style={{ marginBottom: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--primary)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.45 }}>
                        <strong>Codigo de transaccion:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{reservationCode || order.reservationCode || 'PENDIENTE'}</span>
                    </p>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.86rem', opacity: 0.8 }}>
                        Usa este codigo para que el equipo identifique rapidamente tu comprobante.
                    </p>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Adjuntar comprobante</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ width: '100%', marginBottom: '0.8rem' }} />
                    <textarea
                        placeholder="Nota opcional para entrega o validacion"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        rows={3}
                        className={styles.textarea}
                    />
                </div>

                <button onClick={handleFinish} className={styles.submitBtn} disabled={submitting} style={{ width: '100%' }}>
                    {submitting ? 'Enviando comprobante...' : 'Ya realice la consignacion'}
                </button>
            </div>
        </div>
    );
}