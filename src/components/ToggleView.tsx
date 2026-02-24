'use client';

import { useState } from 'react';
import styles from './ToggleView.module.css';

interface ToggleViewProps {
    servicesComponent: React.ReactNode;
    productsComponent: React.ReactNode;
}

export default function ToggleView({ servicesComponent, productsComponent }: ToggleViewProps) {
    const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

    return (
        <div className={styles.toggleContainer}>
            <div className={styles.switchWrapper}>
                <div
                    className={`${styles.indicator} ${activeTab === 'products' ? styles.indicatorRight : ''}`}
                />
                <button
                    className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    Servicios
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'products' ? styles.active : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Productos
                </button>
            </div>

            <div className={styles.contentArea}>
                {activeTab === 'services' ? servicesComponent : productsComponent}
            </div>
        </div>
    );
}
