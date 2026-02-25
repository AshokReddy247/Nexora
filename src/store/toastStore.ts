import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    variant: ToastVariant;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        // Auto-dismiss
        const duration = toast.duration ?? 3500;
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, duration);
    },
    removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper
export const toast = {
    success: (title: string, message?: string) =>
        useToastStore.getState().addToast({ variant: 'success', title, message }),
    error: (title: string, message?: string) =>
        useToastStore.getState().addToast({ variant: 'error', title, message }),
    info: (title: string, message?: string) =>
        useToastStore.getState().addToast({ variant: 'info', title, message }),
    warning: (title: string, message?: string) =>
        useToastStore.getState().addToast({ variant: 'warning', title, message }),
};
