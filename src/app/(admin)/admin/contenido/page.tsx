'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Send,
  Loader2,
  AlertCircle,
  Check,
  Grid,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Asset {
  id: string;
  url: string;
  prompt: string;
  label: string;
}

export default function ContenidoIAPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [promptInput, setPromptInput] = useState<string>('');
  
  // Last generated image
  const [generatedAsset, setGeneratedAsset] = useState<Asset | null>(null);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content/generate');
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch {
      showNotice('error', 'Error de conexión', 'No se pudieron recuperar la galería de assets.');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setGenerating(true);
    setGeneratedAsset(null);
    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput }),
      });

      const data = await res.json();
      if (data.success && data.asset) {
        setGeneratedAsset(data.asset);
        setAssets([data.asset, ...assets]);
        setPromptInput('');
        showNotice('success', 'Asset Generado', 'La imagen de marketing ha sido creada por la IA.');
      } else {
        showNotice('error', 'Fallo al generar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo contactar al motor de IA.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando galería de assets de marketing..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Generador de Contenido IA</h1>
        <p className="text-xs text-gray-500 mt-0.5">Crea banners publicitarios y piezas de marketing con el modelo de generación de imágenes de Gemini</p>
      </div>

      {/* Alert Banner */}
      {alert && (
        <FeedbackAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Generator Prompt Input */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-4">
        <h2 className="font-bold text-gray-950 text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span>¿Qué deseas promocionar hoy?</span>
        </h2>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            required
            disabled={generating}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ej. Banner para Instagram de lectura de tarot con constelaciones doradas y tonos morados místicos..."
            className="flex-1 bg-[#FAF8FF] border border-gray-100 rounded-2xl py-3.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={generating}
            className="flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] disabled:bg-gray-200 text-white px-6 py-3.5 rounded-2xl text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span>Generando con Gemini...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generar Banner</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Last Generated Panel */}
      {generatedAsset && (
        <div className="bg-[#FAF8FF] border border-violet-100 rounded-3xl p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-violet-900 text-sm">Banner Generado Recientemente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="border border-violet-200/50 rounded-2xl overflow-hidden bg-white shadow-sm max-h-80 flex items-center justify-center">
              <img
                src={generatedAsset.url}
                alt="Banner Generado"
                className="w-full object-cover max-h-80"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Prompt Utilizado</p>
                <p className="text-xs font-semibold text-gray-800 leading-relaxed italic bg-white p-3.5 border border-gray-100 rounded-xl">
                  "{generatedAsset.prompt}"
                </p>
              </div>
              <a
                href={generatedAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                download={`astro-banner-${generatedAsset.id}.jpg`}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Banner HD</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Historical Gallery */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
          <Grid className="w-5 h-5 text-gray-400" />
          <span>Galería de Contenido Místico</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-premium group transition-all duration-300 hover:shadow-premium-hover flex flex-col justify-between">
              <div className="h-44 bg-gray-50 overflow-hidden relative">
                <img
                  src={asset.url}
                  alt={asset.label}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md inline-block">
                  {asset.label.startsWith('gen-') || asset.label.startsWith('Generación') ? 'Generado IA' : 'Plantilla'}
                </p>
                <p className="text-xs text-gray-500 truncate-2 h-8 leading-normal">
                  {asset.prompt}
                </p>
                
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-full flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-violet-50 hover:text-violet-700 text-gray-500 py-2 rounded-xl text-[10px] font-bold border border-gray-100 transition-all mt-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
