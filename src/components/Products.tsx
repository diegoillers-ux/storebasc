import { products } from '@/lib/data';
import styles from './Products.module.css';

export default function Products() {
    return (
        <section id="productos" className={styles.productsSection}>
            <h2 className={`${styles.title} gradient-text`}>Productos Complementarios</h2>
            <p className={styles.subtitle}>
                Herramientas mágicas para apoyar tu proceso y elevar tu vibración de forma diaria.
            </p>

            <div className={styles.grid}>
                {products.map((product) => (
                    <div key={product.id} className={`${styles.card} glass-panel`}>
                        <div className={styles.imageWrapper}>
                            {product.imagePlaceholder}
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{product.title}</h3>
                            <p className={styles.cardDescription}>{product.description}</p>
                            <span className={styles.price}>{product.price}</span>
                            <button className={styles.buyButton}>Próximamente</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
