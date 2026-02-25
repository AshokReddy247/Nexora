'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useModeStore, Mode } from '@/store/modeStore';
import { MODE_CONFIG, MODES } from '@/lib/modeConfig';
import { useRouter, usePathname } from 'next/navigation';

export default function ModeSelector() {
    const { activeMode, setMode } = useModeStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleModeSelect = (mode: Mode) => {
        setMode(mode);
        router.push(`/${mode}`);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                className="flex items-center gap-1 p-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
            >
                {MODES.map((mode) => {
                    const config = MODE_CONFIG[mode];
                    const isActive = activeMode === mode;

                    return (
                        <motion.button
                            key={mode}
                            onClick={() => handleModeSelect(mode)}
                            className="relative flex flex-col items-center justify-center w-14 h-12 rounded-full text-xs font-medium transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title={`${config.label} — ${config.tagline}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mode-active-pill"
                                    className="absolute inset-0 rounded-full"
                                    style={{ background: `${config.accent}22`, border: `1px solid ${config.accent}66` }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                />
                            )}
                            <span className="relative z-10 text-lg leading-none">{config.icon}</span>
                            <span
                                className="relative z-10 text-[9px] mt-0.5 font-semibold tracking-wide uppercase"
                                style={{ color: isActive ? config.accent : 'rgba(255,255,255,0.4)' }}
                            >
                                {config.label}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
