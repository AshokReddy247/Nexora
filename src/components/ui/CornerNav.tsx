'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CornerNav() {
    const router = useRouter();

    return (
        <>
            {/* Back Button - Top Left */}
            <motion.div
                className="fixed top-6 left-6 z-[60]"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.6 }}
            >
                <button
                    onClick={() => router.back()}
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/20 active:scale-95"
                    title="Go Back"
                >
                    <ArrowLeft size={20} className="text-white/70 group-hover:text-white transition-colors" />
                    <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </motion.div>

            {/* Home Button - Top Right */}
            <motion.div
                className="fixed top-6 right-6 z-[60]"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.7 }}
            >
                <button
                    onClick={() => router.push('/')}
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/20 active:scale-95"
                    title="Return Home"
                >
                    <Home size={20} className="text-white/70 group-hover:text-white transition-colors" />
                    <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </motion.div>
        </>
    );
}
