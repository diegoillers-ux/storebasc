import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export function useCollection<T extends Record<string, unknown> = Record<string, unknown>>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const { data: result, error } = await supabaseClient
          .from(collectionName)
          .select('*');

        if (!error && result && isMounted) {
          setData(result as unknown as T[]);
        }
      } catch (error) {
        console.warn(`Error al cargar la colección ${collectionName}:`, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [collectionName]);

  return { data, loading };
}
