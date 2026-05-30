import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, ToastMessage } from '../../store/useToastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-[#d4af37]" />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-950/45';
      case 'error':
        return 'border-rose-500/20 bg-rose-950/45';
      case 'warning':
        return 'border-amber-500/20 bg-amber-950/45';
      case 'info':
        return 'border-[#d4af37]/20 bg-[#d4af37]/5';
    }
  };

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      role="log"
      aria-label="System notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 w-80 px-4 py-3 border rounded-xl shadow-2xl backdrop-blur-xl ${getBorderColor(
              toast.type
            )}`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex-shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-grow text-sm font-medium text-slate-200">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-emerald-600 hover:text-slate-200 transition-colors focus:ring-1 focus:ring-[#d4af37] focus:outline-none rounded-md"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
