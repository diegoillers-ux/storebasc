import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RaffleData {
    id: string;
    title: string;
    description: string;
    price: string;
    priceNumber: number;
    totalNumbers: number;
    soldNumbers: number[]; // Array de números (0, 1, 2...)
    active: boolean;
}

export function useRaffles() {
    const [raffles, setRaffles] = useState<RaffleData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchamos la colección "raffles" en Firestore en TIEMPO REAL
        const unsubscribe = onSnapshot(collection(db, 'raffles'), (snapshot) => {
            const data: RaffleData[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as RaffleData);
            });
            setRaffles(data);
            setLoading(false);
        }, (error) => {
            console.warn("No se pudo conectar a Firebase (probablemente faltan las credenciales):", error.message);
            setLoading(false);
        });

        // Limpiamos la conexión cuando el usuario cierra la página
        return () => unsubscribe();
    }, []);

    // Función que usaremos en el Checkout para marcar un número como vendido
    const reserveNumber = async (raffleId: string, numberToReserve: number) => {
        try {
            const raffleRef = doc(db, 'raffles', raffleId);
            await updateDoc(raffleRef, {
                soldNumbers: arrayUnion(numberToReserve)
            });
            return true;
        } catch (error) {
            console.error("Error al reservar el número:", error);
            return false;
        }
    };

    return { raffles, loading, reserveNumber };
}
