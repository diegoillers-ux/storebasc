import Link from 'next/link';
import styles from './Services.module.css';
import { services } from '@/lib/data';

export default function Services() {
    return (
        <section id="servicios" className={styles.servicesSection}>
            {/* Adición de fondo decorativo etéreo detrás de los servicios */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% -20%, rgba(203, 163, 123, 0.1), transparent 70%)',
                pointerEvents: 'none', zIndex: -1
            }} />
            <h2 className={`${styles.title} gradient-text`}>Nuestros Servicios</h2>
            <div className={styles.grid}>
                {services.map((service) => (
                    <div key={service.id} className={`${styles.card} glass-panel`}>
                        <div className={styles.iconWrapper}>
                            {service.icon}
                        </div>
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
