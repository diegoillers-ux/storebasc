import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';

// Curated list of high-quality astrology and esotericism images
const ASTRO_IMAGES = [
  { id: 'img-1', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800', prompt: 'Lectura de Tarot espiritual con velas encendidas', label: 'Tarot Místico' },
  { id: 'img-2', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800', prompt: 'Carta Astral natal rodeada de constelaciones y polvo cósmico', label: 'Carta Astral' },
  { id: 'img-3', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800', prompt: 'Cristales de cuarzo rosa y amatistas para sanación energética', label: 'Gemas de Cuarzo' },
  { id: 'img-4', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800', prompt: 'Cielo estrellado nocturno con constelaciones de astrología', label: 'Cielo Estrellado' },
  { id: 'img-5', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800', prompt: 'Meditación astral en el equinoccio de primavera', label: 'Meditación Cósmica' },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  return NextResponse.json({ assets: ASTRO_IMAGES });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Falta prompt de generación.' }, { status: 400 });
    }

    if (isDemoMode()) {
      // Simular un retraso en la red para la IA
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Seleccionar una imagen aleatoria para simular la generación
      const randomIdx = Math.floor(Math.random() * ASTRO_IMAGES.length);
      const generated = {
        id: 'gen-' + Math.random(),
        url: ASTRO_IMAGES[randomIdx].url,
        prompt: prompt,
        label: 'Generación IA: ' + prompt.substring(0, 20) + '...',
      };

      return NextResponse.json({ success: true, asset: generated });
    }

    // TODO: Integración real con la API de Vertex AI / Gemini Image Generation
    const defaultIdx = Math.floor(Math.random() * ASTRO_IMAGES.length);
    return NextResponse.json({
      success: true,
      asset: {
        id: 'gen-' + Math.random(),
        url: ASTRO_IMAGES[defaultIdx].url,
        prompt: prompt,
        label: 'Generación Real (Fallback): ' + prompt.substring(0, 20) + '...',
      },
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al generar asset.', details }, { status: 500 });
  }
}
