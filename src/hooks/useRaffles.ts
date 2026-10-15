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
          const mapped: RaffleData[] = data.map((d: { id: string; metadata: unknown; content: string }) => {
            const metadata = typeof d.metadata === 'object' && d.metadata !== null ? d.metadata as Record<string, unknown> : {};
            return {
              id: d.id,
              title: typeof metadata.title === 'string' ? metadata.title : 'Rifa Especial',
              description: d.content || '',
              price: typeof metadata.price === 'string' ? metadata.price : '$10.000 COP',
              priceNumber: typeof metadata.priceNumber === 'number' ? metadata.priceNumber : 10000,
              totalNumbers: typeof metadata.totalNumbers === 'number' ? metadata.totalNumbers : 100,
              soldNumbers: Array.isArray(metadata.soldNumbers) ? metadata.soldNumbers.filter((n): n is number => typeof n === 'number') : [],
              active: typeof metadata.active === 'boolean' ? metadata.active : true,
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
