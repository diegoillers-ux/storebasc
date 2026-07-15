import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';

// Volatile in-memory store for demo session changes (like rating assets)
let liveDemoAssets = [
  { id: 'img-1', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800', prompt: 'Lectura de Tarot espiritual con velas encendidas', label: 'Tarot Místico', format: 'Post de Instagram (1:1)', status: 'APPROVED' },
  { id: 'img-2', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800', prompt: 'Carta Astral natal rodeada de constelaciones y polvo cósmico', label: 'Carta Astral', format: 'Historia / Estado (9:16)', status: 'PENDING' },
  { id: 'img-3', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800', prompt: 'Cristales de cuarzo rosa y amatistas para sanación energética', label: 'Gemas de Cuarzo', format: 'Post de Facebook (1.91:1)', status: 'APPROVED' },
  { id: 'img-4', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800', prompt: 'Cielo estrellado nocturno con constelaciones de astrología', label: 'Cielo Estrellado', format: 'Historia / Estado (9:16)', status: 'REJECTED' },
];

const CURATED_IMAGE_RESOURCES = [
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  return NextResponse.json({ assets: liveDemoAssets });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { prompt, format } = await req.json();
    if (!prompt || !format) {
      return NextResponse.json({ error: 'Faltan campos prompt o formato.' }, { status: 400 });
    }

    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const randomIdx = Math.floor(Math.random() * CURATED_IMAGE_RESOURCES.length);
      const generated = {
        id: 'gen-' + Math.random(),
        url: CURATED_IMAGE_RESOURCES[randomIdx],
        prompt: prompt,
        label: 'Generación IA',
        format: format,
        status: 'PENDING',
      };

      liveDemoAssets = [generated, ...liveDemoAssets];
      return NextResponse.json({ success: true, asset: generated });
    }

    // Fallback real
    const randomIdx = Math.floor(Math.random() * CURATED_IMAGE_RESOURCES.length);
    const generated = {
      id: 'gen-real-' + Math.random(),
      url: CURATED_IMAGE_RESOURCES[randomIdx],
      prompt: prompt,
      label: 'Generación Real',
      format: format,
      status: 'PENDING',
    };
    return NextResponse.json({ success: true, asset: generated });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al generar asset.', details }, { status: 500 });
  }
}

// PUT /api/admin/content/generate -> Calificar/Valorar el asset (Aprobar o Rechazar)
export async function PUT(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Falta ID de asset o estatus de calificación.' }, { status: 400 });
    }

    if (isDemoMode()) {
      liveDemoAssets = liveDemoAssets.map(asset => 
        asset.id === id ? { ...asset, status } : asset
      );
      return NextResponse.json({ success: true, message: 'Calificación de asset demo actualizada.' });
    }

    return NextResponse.json({ success: true, message: 'Calificación de asset actualizada.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al calificar asset.', details }, { status: 500 });
  }
}
