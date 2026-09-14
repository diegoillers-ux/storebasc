'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Send,
  Loader2,
  Check,
  X,
  Grid,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  FileImage,
  Award,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Asset {
  id: string;
  url: string;
  prompt: string;
  label: string;
  format: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const FORMAT_OPTIONS = [
  { id: '9:16', name: 'Historia / Estado (9:16)', desc: 'Instagram Stories, Facebook, WhatsApp Status (1080x1920)' },
  { id: '1:1', name: 'Post de Instagram (1:1)', desc: 'Instagram Feed, Carrusel (1080x1080)' },
  { id: '1.91:1', name: 'Post de Facebook (1.91:1)', desc: 'Facebook Feed, Link share post (1200x630)' },
];

const ESTILO_PRESETS = [
  {
    title: 'Taller de Cuarzos',
    prompt: 'Taller de Cuarzos en tonos rosa pastel y beige con cristales limpios en el agua, estrellas doradas, tipografía serif en oro y firma manuscrita "Con amor, Lina". Estética de paz y naturaleza.',
    tag: 'Pastel / Cuarzos'
  },
  {
    title: 'Camino de Magia Blanca',
    prompt: 'El Camino de la Magia Blanca, fondo de pergamino pálido texturizado con estatua de ángel clásica en mármol blanco, velas encendidas, cristales de amatistas y flores de lavanda en las esquinas. Títulos en oro y violeta.',
    tag: 'Magia / Ángeles'
  },
  {
    title: 'Rituales de Luz',
    prompt: 'Rituales celestiales, fondo de acuarela arcoíris suave con destellos brillantes y alas doradas resplandecientes en el centro. Letras doradas elegantes respetando leyes universales.',
    tag: 'Acuarela / Alas'
  },
  {
    title: 'Portal Mitad de Año',
    prompt: 'Lectura Especial Portal Mitad de Año, luna creciente dorada, tonos violeta profundo, tipografías manuscritas elegantes, constelaciones celestiales y destellos de estrellas.',
    tag: 'Místico / Violeta'
  }
];

export default function ContenidoIAPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('9:16');

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
      showNotice('error', 'Error de conexión', 'No se pudieron recuperar los assets.');
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

    const activeFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat);
    const formatLabel = activeFormatObj ? activeFormatObj.name : 'Formato Desconocido';

    // Auto-detect parameters to inject into prompt for the AI model
    const enhancedPrompt = `${promptInput} [Format constraint: Aspect Ratio ${selectedFormat}, optimized for ${formatLabel}]`;

    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          format: formatLabel,
        }),
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

  const handleRateAsset = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (data.success) {
        setAssets(assets.map(a => a.id === id ? { ...a, status } : a));
        if (generatedAsset?.id === id) {
          setGeneratedAsset({ ...generatedAsset, status });
        }
        showNotice('success', 'Calificación registrada', status === 'APPROVED' ? 'Asset aprobado.' : 'Asset rechazado.');
      } else {
        showNotice('error', 'Error al calificar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo calificar el elemento.');
    }
  };

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

      {/* Generator Prompt & Format Input */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
        <h2 className="font-bold text-gray-950 text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span>Configura tu Promoción</span>
        </h2>

        {/* STEP 1: Format Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500">Paso 1: Selecciona el formato de red social</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMAT_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedFormat(opt.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedFormat === opt.id
                    ? 'border-violet-600 bg-violet-50/30 text-violet-950 shadow-sm'
                    : 'border-gray-100 bg-white hover:bg-gray-50/50 text-gray-500'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    selectedFormat === opt.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    Relación {opt.id}
                  </span>
                  <h4 className="font-bold text-xs mt-2 text-gray-900">{opt.name}</h4>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 2: Presets from Lina's assets */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500">Paso 2: Inspírate con las plantillas de Espíritu Ananda</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ESTILO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptInput(preset.prompt)}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-violet-200 text-left hover:bg-violet-50/20 transition-all flex flex-col justify-between h-28"
              >
                <div>
                  <h4 className="font-bold text-xs text-gray-950">{preset.title}</h4>
                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{preset.tag}</p>
                </div>
                <span className="text-[9px] text-violet-600 font-semibold flex items-center gap-1 mt-2">
                  <span>Usar Plantilla</span>
                  <span>→</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Prompt Text Input */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Paso 3: Ajusta o describe la idea del banner</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                required
                disabled={generating}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Escribe aquí tu prompt o selecciona una de las plantillas de arriba..."
                className="flex-1 bg-[#FAF8FF] border border-gray-100 rounded-2xl py-3.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 disabled:opacity-60 font-medium"
              />
              <button
                type="submit"
                disabled={generating}
                className="flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] disabled:bg-gray-200 text-white px-6 py-3.5 rounded-2xl text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                    <span>Generando {selectedFormat}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generar Banner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Last Generated Panel */}
      {generatedAsset && (
        <div className="bg-[#FAF8FF] border border-violet-100 rounded-3xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-violet-900 text-sm">Banner Generado Recientemente</h3>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full">
              {generatedAsset.format}
            </span>
          </div>
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
                <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Prompt Optimizado</p>
                <p className="text-xs font-semibold text-gray-800 leading-relaxed italic bg-white p-3.5 border border-gray-100 rounded-xl">
                  "{generatedAsset.prompt}"
                </p>
              </div>

              {/* Approval status & Action */}
              <div className="flex flex-wrap items-center gap-3">
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

                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <button
                    onClick={() => handleRateAsset(generatedAsset.id, 'APPROVED')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      generatedAsset.status === 'APPROVED'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white border-gray-150 text-gray-400 hover:text-teal-600 hover:bg-teal-50/50'
                    }`}
                    title="Aprobar pieza"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRateAsset(generatedAsset.id, 'REJECTED')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      generatedAsset.status === 'REJECTED'
                        ? 'bg-coral-500 text-white border-coral-500'
                        : 'bg-white border-gray-150 text-gray-400 hover:text-coral-600 hover:bg-coral-50/50'
                    }`}
                    title="Rechazar pieza"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Gallery with status options */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
          <Grid className="w-5 h-5 text-gray-400" />
          <span>Galería de Contenido y Calificaciones</span>
        </h3>

        {loading ? (
          <LoadingState message="Cargando contenido generado..." />
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-12 text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-500 mt-3">Aún no hay contenido generado</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Los banners y piezas de marketing generados por IA aparecerán aquí para su revisión y calificación. La generación de imágenes se habilitará próximamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const isApproved = asset.status === 'APPROVED';
            const isRejected = asset.status === 'REJECTED';
            const isPending = asset.status === 'PENDING';

            return (
              <div key={asset.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-premium group transition-all duration-300 hover:shadow-premium-hover flex flex-col justify-between">
                <div className="h-48 bg-gray-50 overflow-hidden relative">
                  <img
                    src={asset.url}
                    alt={asset.label}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  
                  {/* Aspect Ratio Overlays */}
                  <span className="absolute top-3 left-3 text-[9px] font-bold bg-[#1A0F3D]/80 backdrop-blur-sm text-violet-200 border border-violet-700/50 px-2 py-0.5 rounded-md">
                    {asset.format}
                  </span>

                  {/* Rating Tag Badge overlay */}
                  <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                    isApproved
                      ? 'bg-teal-50 text-teal-600 border-teal-100'
                      : isRejected
                      ? 'bg-coral-50 text-coral-600 border-coral-100'
                      : 'bg-gold-50 text-gold-500 border-gold-100'
                  }`}>
                    {isApproved ? 'Aprobado' : isRejected ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed truncate-3 h-12">
                    {asset.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-50">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1 text-gray-500 hover:text-violet-700 bg-gray-50 hover:bg-violet-50 px-3.5 py-2 rounded-xl text-[10px] font-bold border border-gray-100 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </a>

                    {/* Approve/Reject Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRateAsset(asset.id, 'APPROVED')}
                        className={`p-2 rounded-lg border transition-all ${
                          isApproved
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white border-gray-100 text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                        title="Marcar como Aprobado"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRateAsset(asset.id, 'REJECTED')}
                        className={`p-2 rounded-lg border transition-all ${
                          isRejected
                            ? 'bg-coral-500 text-white border-coral-500'
                            : 'bg-white border-gray-100 text-gray-400 hover:text-coral-600 hover:bg-coral-50'
                        }`}
                        title="Marcar como Rechazado"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

    </div>
  );
}
