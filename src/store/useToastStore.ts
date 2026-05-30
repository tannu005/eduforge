import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastStoreState {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  
  showToast: (message, type, duration = 3000) => {
    const id = crypto.randomUUID();
    const newToast: ToastMessage = { id, type, message, duration };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
