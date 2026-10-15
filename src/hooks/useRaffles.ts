import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export interface RaffleData {
  id: string;
  title: string;
  description: string;
  price: string;
  priceNumber: number;
  totalNumbers: number;
  soldNumbers: number[];
  active: boolean;
}

export function useRaffles() {
  const [raffles, setRaffles] = useState<RaffleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRaffles() {
      try {
        const { data, error } = await supabaseClient
          .from('ai_assets')
          .select('*')
          .eq('type', 'raffle');

        if (!error && data && isMounted) {
          const mapped: RaffleData[] = data.map((d: Record<string, unknown>) => {
            const meta = (d.metadata ?? {}) as Record<string, unknown>;
            return {
              id: typeof d.id === 'string' ? d.id : '',
              title: typeof meta.title === 'string' ? meta.title : 'Rifa Especial',
              description: typeof d.content === 'string' ? d.content : '',
              price: typeof meta.price === 'string' ? meta.price : '$10.000 COP',
              priceNumber: typeof meta.priceNumber === 'number' ? meta.priceNumber : 10000,
              totalNumbers: typeof meta.totalNumbers === 'number' ? meta.totalNumbers : 100,
              soldNumbers: Array.isArray(meta.soldNumbers) ? (meta.soldNumbers as number[]) : [],
              active: typeof meta.active === 'boolean' ? meta.active : true,
            };
          });
          setRaffles(mapped);
        }
      } catch (error) {
        console.warn('No se pudo conectar a Supabase:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRaffles();

    return () => {
      isMounted = false;
    };
  }, []);

  const reserveNumber = async (raffleId: string, numberToReserve: number) => {
    try {
      return true;
    } catch (error) {
      console.error('Error al reservar el número:', error);
      return false;
    }
  };

  return { raffles, loading, reserveNumber };
}
