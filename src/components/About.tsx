import styles from './About.module.css';

export default function About() {
    return (
        <section id="sobre-mi" className={styles.aboutSection}>
            <div className={styles.container}>
                <div className={styles.imagePlaceholder}>
                    <span className={styles.emoji}>*</span>
                </div>
                <div className={styles.textContent}>
                    <h2 className={`${styles.title} gradient-text`}>Sobre Nosotros</h2>
                    <p className={styles.description}>
                        Este proyecto es una plantilla comercial para vender servicios y productos con reserva de agenda.
                    </p>
                    <p className={styles.description}>
                        Puedes personalizar texto, imagenes, catalogo, precios y estilo para adaptarlo a cualquier marca.
                    </p>
                </div>
            </div>
        </section>
    );
}
