'use client';

import Link from 'next/link';
import styles from './Services.module.css';
import { services as localServices } from '@/lib/data';
import { useCollection } from '@/hooks/useCollection';

export default function Services() {
    const { data: firebaseServices, loading } = useCollection('services');

    // Usamos los de Firebase si existen, sino los locales por defecto
    const displayServices = firebaseServices.length > 0 ? firebaseServices : localServices;

    return (
        <section id="servicios" className={styles.servicesSection}>
            <h2 className={`${styles.title} gradient-text`}>Servicios</h2>
            <div className={styles.grid}>
                {displayServices.map((service) => (
                    <div key={service.id} className={`${styles.card} glass-panel`}>
                        <h3 className={styles.cardTitle}>{service.title}</h3>
                        <p className={styles.cardDescription}>{service.description}</p>
                        <span className={styles.price}>{service.price}</span>
                        <Link href={`/checkout/${service.id}`} style={{ width: '100%' }}>
                            <button className={styles.selectButton}>Reservar</button>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
