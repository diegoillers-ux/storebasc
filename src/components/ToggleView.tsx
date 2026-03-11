'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ToggleView.module.css';

interface ToggleViewProps {
    servicesComponent: React.ReactNode;
    productsComponent: React.ReactNode;
    rafflesComponent: React.ReactNode;
}

export default function ToggleView({ servicesComponent, productsComponent, rafflesComponent }: ToggleViewProps) {
    const [activeTab, setActiveTab] = useState<'services' | 'products' | 'raffles'>('services');
    const servicesRef = useRef<HTMLDivElement>(null);
    const productsRef = useRef<HTMLDivElement>(null);
    const rafflesRef = useRef<HTMLDivElement>(null);
    const [viewportHeight, setViewportHeight] = useState<number>(920);

    useEffect(() => {
        const updateHeight = () => {
            const sHeight = servicesRef.current?.scrollHeight || 0;
            const pHeight = productsRef.current?.scrollHeight || 0;
            const rHeight = rafflesRef.current?.scrollHeight || 0;
            const next = Math.max(sHeight, pHeight, rHeight, 720);
            setViewportHeight(next);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const getIndicatorClass = () => {
        if (activeTab === 'products') return styles.indicatorCenter;
        if (activeTab === 'raffles') return styles.indicatorRight;
        return '';
    };

    const getTrackClass = () => {
        if (activeTab === 'products') return styles.slideCenter;
        if (activeTab === 'raffles') return styles.slideRight;
        return '';
    };

    return (
        <div className={`${styles.toggleContainer} glass-panel`}>
            <div className={styles.switchWrapper}>
                <div className={`${styles.indicator} ${getIndicatorClass()}`} />
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
                    Tienda
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'raffles' ? styles.active : ''}`}
                    onClick={() => setActiveTab('raffles')}
                >
                    Sorteos
                </button>
            </div>

            <div className={styles.contentArea} style={{ minHeight: `${viewportHeight}px` }}>
                <div className={`${styles.sliderTrack} ${getTrackClass()}`}>
                    <div className={styles.slidePane} ref={servicesRef}>
                        {servicesComponent}
                    </div>
                    <div className={styles.slidePane} ref={productsRef}>
                        {productsComponent}
                    </div>
                    <div className={styles.slidePane} ref={rafflesRef}>
                        {rafflesComponent}
                    </div>
                </div>
            </div>
        </div>
    );
}
