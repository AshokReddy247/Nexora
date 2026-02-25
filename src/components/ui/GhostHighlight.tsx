'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GhostIntent } from '@/hooks/useGhostCursor';

interface GhostHighlightProps {
    intent: GhostIntent;
    confidence: number;
    accentColor: string;
    targetLabel?: string;
}

const INTENT_LABELS: Record<NonNullable<GhostIntent>, string> = {
    copy_code: '📋 Copy Code',
    save_note: '📝 Save Note',
    export_pdf: '📄 Export PDF',
    export_csv: '📊 Export CSV',
    switch_mode: '🔄 Switch Mode',
    crosstalk: '🤝 Ask Enquiry Agent',
};

export default function GhostHighlight({
    intent,
    confidence,
    accentColor,
}: GhostHighlightProps) {
    if (!intent || confidence < 0.5) return null;

    return (
        <AnimatePresence>
            {intent && (
                <motion.div
                    key={intent}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                    style={{
                        background: `${accentColor}18`,
                        border: `1px solid ${accentColor}40`,
                        color: accentColor,
                    }}
                >
                    {/* Pulsing ring */}
                    <div className="relative flex-shrink-0">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ background: accentColor }}
                            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    <span className="font-medium">{INTENT_LABELS[intent]}</span>

                    {/* Confidence bar */}
                    <div className="flex-1 h-0.5 rounded-full bg-white/10 max-w-[40px]">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: accentColor }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${Math.round(confidence * 100)}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <span className="text-[9px] opacity-50">{Math.round(confidence * 100)}%</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
