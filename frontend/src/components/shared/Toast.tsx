import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '../../types/toast';
import { cn } from '../../utils/cn';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4500;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-neon-cyan shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/40 shadow-emerald-950/40',
    error: 'border-rose-500/40 shadow-rose-950/40',
    warning: 'border-amber-500/40 shadow-amber-950/40',
    info: 'border-neon-cyan/40 shadow-cyan-950/40',
  };

  const progressBg = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-neon-cyan',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative overflow-hidden w-80 md:w-96 bg-dark-elevated/95 backdrop-blur-md border rounded-xl p-4 shadow-xl flex items-start gap-3 transition-all duration-300 pointer-events-auto',
        borderStyles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 pr-2">
        {toast.title && (
          <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
        )}
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div
        className={cn('absolute bottom-0 left-0 h-0.5 transition-all duration-75', progressBg[toast.type])}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
