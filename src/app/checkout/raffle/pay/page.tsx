'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../[serviceId]/page.module.css';

export default function RafflePayPage() {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        const savedOrder = sessionStorage.getItem('raffle_order');
        if (!savedOrder) {
            router.push('/');
            return;
        }
        setOrder(JSON.parse(savedOrder));
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Reutilizamos el API de reportar pago pero adaptando los datos
            const formData = new FormData();
            formData.append('eventId', `raffle-${Date.now()}`); // ID temporal
            formData.append('note', `COMPRA RIFA: ${order.raffleTitle} | NÚMERO: ${order.selectedNumber} | WhatsApp: ${order.whatsapp}\n\n${note}`);
            if (file) formData.append('file', file);

            // También enviamos los datos para que el sistema cree el "Evento Pendiente" en el panel Admin
            // (Simulando que es una reserva para que aparezca en el panel que ya tienes)
            const res = await fetch('/api/calendar/report-payment', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                // Crear el evento pendiente en el sistema (reutilizando tu lógica de demo o real)
                await fetch('/api/calendar/create-pending', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: `RIFA: ${order.selectedNumber} - ${order.name}`,
                        description: `Compra de número ${order.selectedNumber} para el sorteo ${order.raffleTitle}. Cliente: ${order.name}, Email: ${order.email}, WhatsApp: ${order.whatsapp}`,
                        start: new Date().toISOString(),
                        end: new Date(Date.now() + 3600000).toISOString() // 1 hora después
                    })
                });

                alert('¡Reporte enviado! Tu número se confirmará una vez verifiquemos el pago.');
                sessionStorage.removeItem('raffle_order');
                router.push('/?success=true');
            } else {
                alert('Error al enviar el reporte.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    if (!order) return <div className={styles.container}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <h1 className="gradient-text">Consagrar Pago</h1>
                <p className={styles.subtitle}>
                    Realiza la transferencia por <strong>{order.price}</strong> para asegurar el número <strong>{order.selectedNumber}</strong>.
                </p>

                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Cuentas de Transferencia:</h4>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>• Nequi: 300 000 0000</p>
                    <p style={{ fontSize: '0.9rem' }}>• Daviplata: 300 000 0000</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Subir Comprobante (Captura de pantalla)</label>
                        <input 
                            required 
                            type="file" 
                            accept="image/*"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            style={{ padding: '0.5rem' }}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Nota adicional (Opcional)</label>
                        <textarea 
                            placeholder="Ej: Pago realizado desde la cuenta de..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            style={{ height: '60px', borderRadius: '8px', padding: '0.8rem', border: '1px solid var(--card-border)', background: 'transparent', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Enviando al Oráculo...' : 'Confirmar Reporte de Pago'}
                    </button>
                </form>
            </div>
        </div>
    );
}
