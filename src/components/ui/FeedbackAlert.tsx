'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackAlertProps {
  type: AlertType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    wrapperClass: 'bg-teal-50 border-teal-100/60 text-teal-900',
    iconClass: 'text-teal-600',
  },
  error: {
    icon: AlertCircle,
    wrapperClass: 'bg-coral-50 border-coral-100/60 text-coral-900',
    iconClass: 'text-coral-600',
  },
  warning: {
    icon: AlertCircle,
    wrapperClass: 'bg-gold-50 border-gold-100/60 text-gold-900',
    iconClass: 'text-gold-500',
  },
  info: {
    icon: Info,
    wrapperClass: 'bg-violet-50 border-violet-100/60 text-violet-900',
    iconClass: 'text-violet-600',
  },
};

export default function FeedbackAlert({
  type,
  title,
  message,
  onClose,
  className,
}: FeedbackAlertProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-3.5 p-4 rounded-2xl border shadow-sm transition-all text-left relative overflow-hidden',
        config.wrapperClass,
        className
      )}
    >
      {/* Icon */}
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconClass)} />

      {/* Content */}
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold leading-none tracking-tight">{title}</h4>
        {message && <p className="text-xs leading-relaxed opacity-85">{message}</p>}
      </div>

      {/* Close Action */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
