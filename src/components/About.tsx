import styles from './About.module.css';

export default function About() {
    return (
        <section id="sobre-mi" className={styles.aboutSection}>
            <div className={styles.container}>
                <div className={styles.storyCard}>
                    <span className={styles.storyEyebrow}>Hecho para emprender con control</span>
                    <h2 className={`${styles.title} gradient-text`}>Una tienda pensada para marcas que venden con cercania</h2>
                    <p className={styles.description}>
                        No todo emprendimiento quiere una pasarela automatica desde el primer dia. Muchas marcas prefieren confirmar cada pago, revisar cada comprobante y mantener la conversacion con el cliente sin perder orden interno.
                    </p>
                    <p className={styles.description}>
                        Este proyecto une esa realidad comercial con una experiencia mas profesional: catalogo vivo, agenda conectada, rifas configurables, promociones y un CRM para administrar ventas sin caos.
                    </p>
                    <div className={styles.pointGrid}>
                        <div className={styles.pointItem}>
                            <strong>Venta</strong>
                            <span>Servicios, productos y rifas en una sola marca.</span>
                        </div>
                        <div className={styles.pointItem}>
                            <strong>Operacion</strong>
                            <span>Comprobantes, agenda y aprobacion desde un panel central.</span>
                        </div>
                        <div className={styles.pointItem}>
                            <strong>Escala</strong>
                            <span>Base lista para seguir creciendo sin rehacer lo ya avanzado.</span>
                        </div>
                    </div>
                </div>

                <div className={styles.visualColumn}>
                    <div className={styles.imagePlaceholder}>
                        <span className={styles.emoji}>✦</span>
                    </div>
                    <div className={styles.noteCard}>
                        <span className={styles.noteLabel}>Promesa operativa</span>
                        <p>
                            Cada venta genera una referencia identificable para que el equipo valide el pago manualmente y mantenga trazabilidad en el CRM.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
