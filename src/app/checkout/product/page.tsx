'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { products as localProducts } from '@/lib/data';
import styles from '../[serviceId]/page.module.css';

type ProductItem = (typeof localProducts)[number];

function ProductCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get('productId');

    const [product, setProduct] = useState<ProductItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', address: '', note: '' });

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            try {
                const docRef = doc(db, 'products', productId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...(docSnap.data() as Omit<ProductItem, 'id'>) });
                } else {
                    setProduct(localProducts.find((item) => item.id === productId) || null);
                }
            } catch {
                setProduct(localProducts.find((item) => item.id === productId) || null);
            } finally {
                setLoading(false);
            }
        };

        void fetchProduct();
    }, [productId]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        sessionStorage.setItem('product_order', JSON.stringify({
            ...formData,
            productId,
            productTitle: product?.title,
            price: product?.price,
            priceNumber: product?.priceNumber,
        }));
        router.push('/checkout/product/pay');
    };

    if (loading) return <div className={styles.container}>Cargando producto...</div>;
    if (!product) return <div className={styles.container}>Producto no encontrado.</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>1. Tus Datos</div>
                    <div className={styles.progressLine}></div>
                    <div className={styles.progressStep}>2. Pago Manual</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Confirma tu pedido</h1>
                <p className={styles.price}>{product.price}</p>
                <div style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)' }}>
                    <p style={{ marginBottom: '0.35rem', fontWeight: 600 }}>{product.title}</p>
                    <p style={{ opacity: 0.78 }}>{product.description}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre completo</label>
                        <input className={styles.input} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Correo electronico</label>
                        <input className={styles.input} required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>WhatsApp</label>
                        <input className={styles.input} required type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Direccion o instruccion de entrega</label>
                        <textarea className={styles.textarea} required rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nota adicional</label>
                        <textarea className={styles.textarea} rows={3} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Ir al pago manual</button>
                </form>
            </div>
        </div>
    );
}

export default function ProductCheckout() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ProductCheckoutContent />
        </Suspense>
    );
}