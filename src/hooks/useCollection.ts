import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCollection<T extends Record<string, unknown> = Record<string, unknown>>(collectionName: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T));
            setData(items);
            setLoading(false);
        }, (error) => {
            console.warn(`Error al cargar la colección ${collectionName}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading };
}
