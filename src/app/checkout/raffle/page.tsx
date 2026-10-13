'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { raffles as localRaffles } from '@/lib/data';
import styles from '../[serviceId]/page.module.css';

type RaffleItem = (typeof localRaffles)[number];

function RaffleCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const raffleId = searchParams.get('raffleId');
    const selectedNumber = searchParams.get('number');

    const [raffle, setRaffle] = useState<RaffleItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });

    useEffect(() => {
        const fetchRaffle = async () => {
            if (!raffleId) return;
            
            try {
                const { data, error } = await supabaseClient
                    .from('ai_assets')
                    .select('*')
                    .eq('id', raffleId)
                    .maybeSingle();

                if (!error && data) {
                    setRaffle({
                        id: data.id,
                        title: data.metadata?.title || 'Rifa Especial',
                        description: data.content || '',
                        price: data.metadata?.price || '$10.000 COP',
                        priceNumber: data.metadata?.priceNumber || 10000,
                        totalNumbers: data.metadata?.totalNumbers || 100,
                        soldNumbers: data.metadata?.soldNumbers || [],
                    });
                } else {
                    const local = localRaffles.find(r => r.id === raffleId);
                    setRaffle(local || null);
                }
            } catch {
                const local = localRaffles.find(r => r.id === raffleId);
                setRaffle(local || null);
            } finally {
                setLoading(false);
            }
        };

        fetchRaffle();
    }, [raffleId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem('raffle_order', JSON.stringify({
            ...formData,
            raffleId,
            raffleTitle: raffle?.title,
            selectedNumber,
            price: raffle?.price,
            priceNumber: raffle?.priceNumber,
        }));

        router.push(`/checkout/raffle/pay`);
    };

    if (loading) return <div className={styles.container}>Cargando portal...</div>;
    if (!raffle) return <div className={styles.container}>Sorteo no encontrado.</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>1. Tus Datos</div>
                    <div className={styles.progressLine}></div>
                    <div className={styles.progressStep}>2. Pago Manual</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Tu número de la suerte</h1>
                <p className={styles.price}>{raffle.price}</p>
                <div style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)' }}>
                    <p style={{ marginBottom: '0.35rem', fontWeight: 600 }}>{raffle.title}</p>
                    <p style={{ opacity: 0.78 }}>Número elegido: <strong>{selectedNumber}</strong></p>
                    <p style={{ opacity: 0.72, marginTop: '0.45rem', fontSize: '0.92rem' }}>
                        Cuando envíes el comprobante, el sistema generará tu código de transacción y la compra quedará en validación administrativa.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre Completo</label>
                        <input 
                            required 
                            type="text" 
                            className={styles.input}
                            placeholder="Tu nombre astral"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>WhatsApp</label>
                        <input 
                            required 
                            type="tel" 
                            className={styles.input}
                            placeholder="Ej: +57 300..."
                            value={formData.whatsapp}
                            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input 
                            required 
                            type="email" 
                            className={styles.input}
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Continuar al Pago
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RaffleCheckout() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <RaffleCheckoutContent />
        </Suspense>
    );
}
