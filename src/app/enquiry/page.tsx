'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModeStore } from '@/store/modeStore';
import AIChat from '@/components/ui/AIChat';
import { TrendingUp, Search, Globe, BarChart2, ArrowUpRight, Rss } from 'lucide-react';

const metrics = [
    { label: 'Market Score', value: '94', change: '+2.4', up: true },
    { label: 'Data Sources', value: '2.4M', change: '+18k', up: true },
    { label: 'Trend Alerts', value: '7', change: '-2', up: false },
    { label: 'Confidence', value: '97%', change: '+1.2%', up: true },
];

const feed = [
    { source: 'Google Trends', snippet: '"Agentic AI" searches +340% YoY', time: '2m ago', tag: 'Trending' },
    { source: 'McKinsey', snippet: 'AI market to reach $1.8T by 2030', time: '14m ago', tag: 'Report' },
    { source: 'Bloomberg', snippet: 'Tech sector VC funding up 28% Q4', time: '1h ago', tag: 'Finance' },
];

export default function EnquiryPage() {
    const setMode = useModeStore((s) => s.setMode);
    useEffect(() => { setMode('enquiry'); }, [setMode]);

    return (
        <div className="min-h-screen p-6 pt-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#f59e0b22', border: '1px solid #f59e0b44' }}
                >
                    <BarChart2 size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: '#f59e0b' }}>BI Research Dashboard</h1>
                    <p className="text-xs text-white/40">enquiry mode · google search grounded · live</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Globe size={14} style={{ color: '#f59e0b' }} />
                    <span className="text-xs text-white/40">Grounded Sources: 2.4M</span>
                </div>
            </motion.div>

            {/* Metric Cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
            >
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="glass rounded-2xl p-4"
                        style={{ border: '1px solid rgba(245,158,11,0.15)' }}
                        whileHover={{ borderColor: 'rgba(245,158,11,0.4)', scale: 1.02 }}
                    >
                        <div className="text-xs text-white/40 mb-1">{m.label}</div>
                        <div className="text-2xl font-bold text-white">{m.value}</div>
                        <div
                            className="text-xs mt-1 flex items-center gap-1"
                            style={{ color: m.up ? '#34d399' : '#f87171' }}
                        >
                            <TrendingUp size={10} style={{ transform: m.up ? 'none' : 'scaleY(-1)' }} />
                            {m.change}
                            <span className="text-white/20">24h</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-320px)] min-h-[400px]">
                {/* AI Research Chat */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid rgba(245,158,11,0.15)' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <Search size={14} style={{ color: '#f59e0b' }} />
                        <span className="text-xs text-white/40">AI Research Assistant — grounded search</span>
                    </div>
                    <AIChat mode="enquiry" />
                </motion.div>

                {/* Live Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid rgba(245,158,11,0.15)' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <Rss size={14} style={{ color: '#f59e0b' }} />
                        <span className="text-xs text-white/40">Market Radar — Live Feed</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {feed.map((item, i) => (
                            <motion.div
                                key={item.snippet}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="p-3 rounded-xl cursor-pointer"
                                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
                                whileHover={{ borderColor: 'rgba(245,158,11,0.35)', x: 4 }}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-white/50 uppercase">{item.source}</span>
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                                                style={{ background: '#f59e0b22', color: '#f59e0b' }}
                                            >
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/80">{item.snippet}</p>
                                        <p className="text-[10px] text-white/30 mt-1">{item.time}</p>
                                    </div>
                                    <ArrowUpRight size={14} className="text-white/20 shrink-0 mt-1" />
                                </div>
                            </motion.div>
                        ))}

                        {/* Chart Placeholder */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="rounded-xl p-4"
                            style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}
                        >
                            <div className="text-xs text-white/40 mb-3 flex items-center gap-1">
                                <BarChart2 size={12} />
                                AI Market Growth (Indexed)
                            </div>
                            <div className="flex items-end gap-1 h-16">
                                {[30, 42, 38, 55, 68, 60, 75, 88, 82, 97].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 rounded-sm"
                                        style={{ background: 'linear-gradient(to top, #f59e0b88, #f59e0b33)' }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.65 + i * 0.04, duration: 0.5 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
