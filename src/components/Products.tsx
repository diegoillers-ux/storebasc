'use client';

import { products as localProducts } from '@/lib/data';
import styles from './Products.module.css';
import { useCollection } from '@/hooks/useCollection';

export default function Products() {
    const { data: firebaseProducts, loading } = useCollection('products');

    // Usamos los de Firebase si existen, sino los locales por defecto
    const displayProducts = firebaseProducts.length > 0 ? firebaseProducts : localProducts;

    return (
        <section id="productos" className={styles.productsSection}>
            <h2 className={`${styles.title} gradient-text`}>Bazar Místico</h2>
            <p className={styles.subtitle}>Herramientas de apoyo para complementar tu camino espiritual.</p>

            <div className={styles.grid}>
                {displayProducts.map((product) => (
                    <div key={product.id} className={`${styles.card} glass-panel`}>
                        <div className={styles.imageWrapper}>
                            {product.imagePlaceholder || '✧'}
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
