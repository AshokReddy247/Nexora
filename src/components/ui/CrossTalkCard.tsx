'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap, Search } from 'lucide-react';

interface CrossTalkCardProps {
    fromAgent: string;
    toAgent: string;
    query: string;
    response: string;
    isStreaming?: boolean;
    accentColor: string;
}

const AGENT_ICONS: Record<string, string> = {
    developer: '⌨',
    enquiry: '📊',
    system: '🧠',
    student: '📚',
    everyday: '☀️',
};

const AGENT_COLORS: Record<string, string> = {
    developer: '#00ffcc',
    enquiry: '#f59e0b',
    system: '#6366f1',
    student: '#a78bfa',
    everyday: '#fb7185',
};

export default function CrossTalkCard({
    fromAgent,
    toAgent,
    query,
    response,
    isStreaming = false,
    accentColor,
}: CrossTalkCardProps) {
    const [expanded, setExpanded] = useState(true);
    const toColor = AGENT_COLORS[toAgent] || accentColor;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-3 rounded-2xl overflow-hidden"
            style={{
                border: `1px solid ${toColor}40`,
                background: `linear-gradient(135deg, ${toColor}08, rgba(0,0,0,0.3))`,
            }}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition"
            >
                {/* Agent call flow indicator */}
                <span className="text-sm">{AGENT_ICONS[fromAgent] || '🤖'}</span>
                <Zap size={10} style={{ color: toColor }} />
                <span className="text-sm">{AGENT_ICONS[toAgent] || '🤖'}</span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span
                            className="text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: toColor }}
                        >
                            {toAgent} agent
                        </span>
                        {isStreaming && (
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: toColor }}
                                animate={{ opacity: [1, 0.2, 1] }}
                                transition={{ duration: 0.7, repeat: Infinity }}
                            />
                        )}
                    </div>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">
                        <Search size={8} className="inline mr-1" />
                        {query}
                    </p>
                </div>

                <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight size={12} className="text-white/30" />
                </motion.div>
            </button>

            {/* Collapsible response body */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-3 pb-3 pt-1 border-t"
                            style={{ borderColor: `${toColor}20` }}
                        >
                            <p className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap">
                                {response}
                                {isStreaming && (
                                    <motion.span
                                        className="inline-block w-0.5 h-3 ml-0.5 align-middle rounded-full"
                                        style={{ background: toColor }}
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                )}
                            </p>
                            {!isStreaming && response && (
                                <div className="mt-2 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full" style={{ background: toColor }} />
                                    <span className="text-[9px] text-white/25">
                                        via {toAgent} agent — data isolated
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
