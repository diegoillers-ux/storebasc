'use client';

import { useState } from 'react';
import { raffles as localRaffles } from '../lib/data';
import { useRaffles } from '../hooks/useRaffles';
import styles from './Raffles.module.css';

import { useRouter } from 'next/navigation';

export default function Raffles() {
    const router = useRouter();
    const [selectedRaffle, setSelectedRaffle] = useState<string | null>(null);
    const { raffles: firebaseRaffles } = useRaffles();

    // Fallback: Si no hay credenciales de Firebase o está cargando, usamos los datos estáticos de prueba.
    const displayRaffles = firebaseRaffles.length > 0 ? firebaseRaffles : localRaffles;

    return (
        <section className={styles.rafflesGrid}>
            {displayRaffles.map((raffle) => (
                <div key={raffle.id} className={styles.raffleCard}>
                    <div className={styles.raffleHeader}>
                        <div className={styles.starIcon}>✧</div>
                    </div>
                    <div className={styles.raffleContent}>
                        <h3 className={`${styles.raffleTitle} gradient-text`}>{raffle.title}</h3>
                        <p className={styles.raffleDesc}>{raffle.description}</p>
                        <div className={styles.raffleFooter}>
                            <span className={styles.price}>{raffle.price}</span>
                            <button 
                                className={styles.playButton}
                                onClick={() => setSelectedRaffle(raffle.id)}
                            >
                                Jugar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {selectedRaffle && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass-panel`}>
                        <button className={styles.closeModal} onClick={() => setSelectedRaffle(null)}>×</button>
                        <h2 className={`${styles.modalTitle} gradient-text`}>Elige tu Número de Suerte</h2>
                        <p className={styles.modalDesc}>
                            Selecciona una estrella disponible para el sorteo.
                        </p>
                        <div className={styles.numbersGrid}>
                            {Array.from({ length: displayRaffles.find(r => r.id === selectedRaffle)?.totalNumbers || 100 }).map((_, i) => {
                                const raffle = displayRaffles.find(r => r.id === selectedRaffle);
                                const isSold = raffle?.soldNumbers.includes(i);
                                return (
                                    <button 
                                        key={i} 
                                        className={`${styles.numberBtn} ${isSold ? styles.sold : ''}`}
                                        disabled={isSold}
                                        onClick={() => {
                                            const number = i.toString().padStart(raffle?.totalNumbers === 1000 ? 3 : 2, '0');
                                            router.push(`/checkout/raffle?raffleId=${raffle?.id}&number=${number}`);
                                            setSelectedRaffle(null);
                                        }}
                                    >
                                        {i.toString().padStart(raffle?.totalNumbers === 1000 ? 3 : 2, '0')}
                                    </button>
                                );
                            }).slice(0, 100)}
                        </div>
                        {displayRaffles.find(r => r.id === selectedRaffle)?.totalNumbers === 1000 && (
                            <p className={styles.moreNumbers}>Mostrando los primeros 100 números de 1000 disponibles.</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
