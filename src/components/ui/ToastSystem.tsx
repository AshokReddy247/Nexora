'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, Toast, ToastVariant } from '@/store/toastStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react';

interface VariantStyle {
    icon: LucideIcon;
    color: string;
    bg: string;
}

const VARIANT_STYLES: Record<ToastVariant, VariantStyle> = {
    success: { icon: CheckCircle2, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    error: { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    info: { icon: Info, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useToastStore((s) => s.removeToast);
    const { icon: Icon, color, bg } = VARIANT_STYLES[toast.variant];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="flex items-start gap-3 w-80 rounded-2xl px-4 py-3 shadow-xl"
            style={{
                background: bg,
                border: `1px solid ${color}40`,
                backdropFilter: 'blur(16px)',
            }}
        >
            <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

export default function ToastSystem() {
    const toasts = useToastStore((s) => s.toasts);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
