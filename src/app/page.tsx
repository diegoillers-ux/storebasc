import styles from './page.module.css';
import Services from '../components/Services';
import About from '../components/About';
import Products from '../components/Products';
import Raffles from '../components/Raffles';
import ToggleView from '../components/ToggleView';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>Ventas manuales + agenda inteligente + catalogo vivo</span>

                    <h1 className={`${styles.title} gradient-text`}>El Nexo Celestial</h1>
                    <p className={styles.subtitle}>
                        Una experiencia de compra pensada para un emprendimiento que vende servicios, productos y rifas con un flujo humano: el cliente consigna, sube su comprobante y tu negocio conserva el control total.
                    </p>

                    <div className={styles.heroActions}>
                        <a href="#ver-mas" className={styles.primaryButton}>Explorar catalogo</a>
                        <Link href="/admin/reservas" className={styles.secondaryButton}>Entrar al CRM</Link>
                    </div>

                    <div className={styles.featureRow}>
                        <span className={styles.featureChip}>Agenda automatizada</span>
                        <span className={styles.featureChip}>Consignacion con comprobante</span>
                        <span className={styles.featureChip}>Rifas configurables</span>
                    </div>

                    <div className={styles.socialLinks}>
                        <a href="#servicios" className={styles.socialIcon}>Servicios</a>
                        <span className={styles.socialSeparator}>•</span>
                        <a href="#productos" className={styles.socialIcon}>Productos</a>
                        <span className={styles.socialSeparator}>•</span>
                        <a href="#ver-mas" className={styles.socialIcon}>Sorteos</a>
                    </div>
                </div>

                <div className={`${styles.heroShowcase} glass-panel`}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/shop-logo.png"
                            alt="Logo del Oráculo"
                            className={styles.profileLogo}
                            width={220}
                            height={220}
                            priority
                        />
                    </div>

                    <div className={styles.showcaseCard}>
                        <span className={styles.showcaseLabel}>Flujo comercial</span>
                        <ol className={styles.showcaseList}>
                            <li>El cliente elige su servicio, producto o numero de rifa.</li>
                            <li>La pagina genera un codigo de transaccion y separa la operacion.</li>
                            <li>El comprobante entra al panel para validacion manual.</li>
                            <li>Tu emprendimiento aprueba y agenda sin perder trazabilidad.</li>
                        </ol>
                    </div>
                </div>
            </section>

            <section className={styles.metricsStrip}>
                <div className={styles.metricBox}>
                    <span className={styles.metricValue}>3 lineas</span>
                    <span className={styles.metricLabel}>Servicios, productos y rifas en un mismo ecosistema</span>
                </div>
                <div className={styles.metricBox}>
                    <span className={styles.metricValue}>1 panel</span>
                    <span className={styles.metricLabel}>Ventas, agenda, promociones y disponibilidad centralizadas</span>
                </div>
                <div className={styles.metricBox}>
                    <span className={styles.metricValue}>100%</span>
                    <span className={styles.metricLabel}>Control manual del pago para marcas que prefieren cercania y validacion propia</span>
                </div>
            </section>

            <About />

            <div id="ver-mas" className={styles.toggleSection}>
                <section className={styles.catalogIntro}>
                    <span className={styles.catalogEyebrow}>Experiencia de compra</span>
                    <h2 className={styles.catalogTitle}>Un escaparate pensado para vender sin verse improvisado</h2>
                    <p className={styles.catalogText}>
                        El visitante puede recorrer tus servicios, descubrir productos, participar en rifas y avanzar por un flujo claro de pago manual con comprobante y seguimiento administrativo.
                    </p>
                </section>
                <ToggleView 
                    servicesComponent={<Services />} 
                    productsComponent={<Products />} 
                    rafflesComponent={<Raffles />}
                />
            </div>
        </main>
    );
}
