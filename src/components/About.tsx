import styles from './About.module.css';

export default function About() {
    return (
        <section id="sobre-mi" className={styles.aboutSection}>
            <div className={styles.container}>
                <div className={styles.imagePlaceholder}>
                    {/* Replace with actual image later */}
                    <span className={styles.emoji}>✨</span>
                </div>
                <div className={styles.textContent}>
                    <h2 className={`${styles.title} gradient-text`}>Sobre Mí</h2>
                    <p className={styles.description}>
                        ¡Hola! Soy Lina. Acompaño a mujeres y hombres a despertar su magia interna y conectar con su propósito de vida a través de herramientas como la Astrología Evolutiva, el Tarot Terapéutico y la Canalización Angelical.
                    </p>
                    <p className={styles.description}>
                        Mi misión es brindarte luz, claridad y contención amorosa en tu proceso de sanación y evolución. En este espacio seguro, te invito a descifrar los mensajes de tu alma y de los ángeles.
                    </p>
                </div>
            </div>
        </section>
    );
}
