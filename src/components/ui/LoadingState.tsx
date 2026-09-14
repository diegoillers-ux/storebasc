'use client';

import React from 'react';

export default function LoadingState({ message = 'Cargando registros astrales...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] w-full text-center space-y-4">
      {/* Mystical custom spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-violet-100/60" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-violet-600/10 flex items-center justify-center text-[10px] text-violet-600 font-bold animate-pulse">
          ✦
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 tracking-wide">{message}</p>
        <p className="text-xs text-gray-400 mt-1 select-none">Espíritu Ananda</p>
      </div>
    </div>
  );
}
