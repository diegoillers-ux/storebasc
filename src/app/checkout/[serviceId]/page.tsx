'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

import { getServiceById } from '@/lib/data';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params?.serviceId as string;
    const service = getServiceById(serviceId);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [context, setContext] = useState('');

    if (!service) {
        return <div className={styles.container}>Servicio no encontrado</div>;
    }

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            // Guardar contexto temporalmente si es necesario (ej: session storage)
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('booking_context', context);
                sessionStorage.setItem('booking_name', name);
                sessionStorage.setItem('booking_email', email);
            }
            // Navegar a la selección del calendario propiamente armado (Paso 2)
            router.push(`/checkout/${serviceId}/schedule`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>

                {/* Progress Indicator */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>1. Tus Datos</div>
                    <div className={styles.progressLine}></div>
                    <div className={styles.progressStep}>2. Agendar</div>
                    <div className={styles.progressLine}></div>
                    <div className={styles.progressStep}>3. Pago Seguro</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>{service.title}</h1>
                <p className={styles.price}>{service.price}</p>

                <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    Bienvenido/a a tu espacio seguro. Por favor, compárteme algunos detalles para conectarnos mejor.
                </p>

                <form className={styles.form} onSubmit={handleContinue}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="name">Nombre Completo</label>
                        <input
                            id="name"
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Tu nombre cósmico..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Para enviarte detalles de la sesión..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="context">Cuéntame de ti (Opcional)</label>
                        <textarea
                            id="context"
                            className={styles.textarea}
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Una breve descripción sobre tu situación actual o qué te gustaría trabajar hoy..."
                            rows={4}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Ir a Elegir Fechas
                    </button>
                </form>
            </div>
        </div>
    );
}
