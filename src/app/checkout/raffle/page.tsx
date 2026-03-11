'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { raffles as localRaffles } from '@/lib/data';
import styles from '../[serviceId]/page.module.css';

function RaffleCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const raffleId = searchParams.get('raffleId');
    const selectedNumber = searchParams.get('number');

    const [raffle, setRaffle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });

    useEffect(() => {
        const fetchRaffle = async () => {
            if (!raffleId) return;
            
            // Intentar traer de Firebase
            try {
                const docRef = doc(db, 'raffles', raffleId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRaffle({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // Fallback local
                    const local = localRaffles.find(r => r.id === raffleId);
                    setRaffle(local);
                }
            } catch (error) {
                const local = localRaffles.find(r => r.id === raffleId);
                setRaffle(local);
            } finally {
                setLoading(false);
            }
        };

        fetchRaffle();
    }, [raffleId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Guardar datos temporalmente en sessionStorage para el siguiente paso (pago)
        sessionStorage.setItem('raffle_order', JSON.stringify({
            ...formData,
            raffleId,
            raffleTitle: raffle?.title,
            selectedNumber,
            price: raffle?.price,
            priceNumber: raffle?.priceNumber
        }));
        
        // Redirigir a la página de pago que ya tienes
        // Adaptamos la URL para que el sistema de pago sepa que es una rifa
        router.push(`/checkout/raffle/pay`);
    };

    if (loading) return <div className={styles.container}>Cargando portal...</div>;
    if (!raffle) return <div className={styles.container}>Sorteo no encontrado.</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <h1 className="gradient-text">Tu Número de la Suerte</h1>
                <div className={styles.serviceBrief}>
                    <div className={styles.serviceIcon}>✧</div>
                    <div>
                        <h3>{raffle.title}</h3>
                        <p>Número seleccionado: <strong>{selectedNumber}</strong></p>
                        <p className={styles.price}>{raffle.price}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Nombre Completo</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="Tu nombre astral"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>WhatsApp (para notificarte si ganas)</label>
                        <input 
                            required 
                            type="tel" 
                            placeholder="Ej: +57 300..."
                            value={formData.whatsapp}
                            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Correo Electrónico</label>
                        <input 
                            required 
                            type="email" 
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
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
