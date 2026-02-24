import styles from "./page.module.css";
import Services from "../components/Services";
import About from "../components/About";
import Products from "../components/Products";
import ToggleView from "../components/ToggleView";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.logoWrapper}>
          <Image
            src="/shop-logo.png"
            alt="Lin.Ananda Profile"
            className={styles.profileLogo}
            width={220}
            height={220}
            priority
          />
        </div>
        <h1 className={`${styles.title} gradient-text`}>
          Despierta tu Energía Vital
        </h1>
        <p className={styles.subtitle}>
          Descubre tu camino a través de la astrología profunda y sesiones de canalización energética. Conecta con tu propósito.
        </p>

        <div className={styles.socialLinks}>
          <a href="https://www.instagram.com/lin.ananda_/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            Instagram
          </a>
          <span className={styles.socialSeparator}>|</span>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
            TikTok
          </a>
        </div>
      </section>

      <About />

      <div id="ver-mas" className={styles.toggleSection}>
        <ToggleView
          servicesComponent={<Services />}
          productsComponent={<Products />}
        />
      </div>
    </main>
  );
}
