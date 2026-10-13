'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[350px] w-full text-center space-y-5 bg-white border border-gray-100 rounded-3xl shadow-premium">
      {/* Icon Area */}
      <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 select-none shadow-sm">
        {Icon ? (
          <Icon className="w-8 h-8" />
        ) : (
          <span className="text-2xl font-light">✦</span>
        )}
      </div>

      {/* Text Area */}
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-base font-bold text-gray-950">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
