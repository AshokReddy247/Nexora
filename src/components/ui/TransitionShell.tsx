'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useModeStore } from '@/store/modeStore';
import { MODE_CONFIG } from '@/lib/modeConfig';

export default function TransitionShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { activeMode } = useModeStore();
    const config = MODE_CONFIG[activeMode];

    // Sync body data-mode and CSS variables
    useEffect(() => {
        document.body.setAttribute('data-mode', activeMode);
        document.documentElement.style.setProperty('--accent', config.accent);
        document.documentElement.style.setProperty('--accent-rgb', config.accentRgb);
        document.documentElement.style.setProperty('--bg-from', config.bgFrom);
        document.documentElement.style.setProperty('--bg-to', config.bgTo);
    }, [activeMode, config]);

    return (
        <>
            {/* Mode transition flash overlay */}
            <AnimatePresence>
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="fixed inset-0 z-40 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at center, ${config.accent}33 0%, transparent 70%)` }}
                />
            </AnimatePresence>

            {/* Page content */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="min-h-screen pb-24"
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </>
    );
}
