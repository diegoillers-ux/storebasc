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
          const mapped: RaffleData[] = data.map((d: any) => ({
            id: d.id,
            title: d.metadata?.title || 'Rifa Especial',
            description: d.content || '',
            price: d.metadata?.price || '$10.000 COP',
            priceNumber: d.metadata?.priceNumber || 10000,
            totalNumbers: d.metadata?.totalNumbers || 100,
            soldNumbers: d.metadata?.soldNumbers || [],
            active: d.metadata?.active ?? true,
          }));
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
