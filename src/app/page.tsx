import styles from './page.module.css';
import Services from '../components/Services';
import About from '../components/About';
import Products from '../components/Products';
import Raffles from '../components/Raffles';
import ToggleView from '../components/ToggleView';
import Image from 'next/image';

export default function Home() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
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
                <h1 className={`${styles.title} gradient-text`}>El Nexo Celestial</h1>
                <p className={styles.subtitle}>
                    Descubre tu destino a través de nuestras lecturas, herramientas místicas y sorteos astrales.
                </p>

                <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialIcon}>
                        Instagram
                    </a>
                    <span className={styles.socialSeparator}>|</span>
                    <a href="#" className={styles.socialIcon}>
                        TikTok
                    </a>
                </div>
            </section>

            <About />

            <div id="ver-mas" className={styles.toggleSection}>
                <ToggleView 
                    servicesComponent={<Services />} 
                    productsComponent={<Products />} 
                    rafflesComponent={<Raffles />}
                />
            </div>
        </main>
    );
}
