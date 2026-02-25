'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModeStore } from '@/store/modeStore';
import AIChat from '@/components/ui/AIChat';
import { Sun, Mail, Calendar, Music, Cloud, Bell } from 'lucide-react';

const digest = [
    { icon: Mail, label: 'Emails', value: '47', sub: '3 need action', color: '#f97316' },
    { icon: Calendar, label: 'Meetings', value: '3', sub: 'First at 10:00 AM', color: '#fb923c' },
    { icon: Cloud, label: 'Weather', value: '22°C', sub: 'Sunny, Hyderabad', color: '#fdba74' },
    { icon: Music, label: 'Focus Mix', value: 'Active', sub: 'Lo-fi beats • 2h 14m', color: '#f97316' },
];

const quickActions = [
    { emoji: '📝', label: 'Draft Email', color: '#f9731622' },
    { emoji: '🗓️', label: 'Schedule', color: '#f9731622' },
    { emoji: '🔍', label: 'Research', color: '#f9731622' },
    { emoji: '✅', label: 'To-Do', color: '#f9731622' },
    { emoji: '🎵', label: 'Focus Mode', color: '#f9731622' },
    { emoji: '💡', label: 'Ideas', color: '#f9731622' },
];

export default function EverydayPage() {
    const setMode = useModeStore((s) => s.setMode);
    useEffect(() => { setMode('everyday'); }, [setMode]);

    return (
        <div className="min-h-screen p-6 pt-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <motion.div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    ☀️
                </motion.div>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#f97316' }}>
                        Good Evening, Ashok
                    </h1>
                    <p className="text-xs text-white/40">everyday concierge · 8 tasks waiting</p>
                </div>
                <motion.div
                    className="ml-auto w-10 h-10 rounded-xl glass flex items-center justify-center relative"
                    whileHover={{ scale: 1.05 }}
                >
                    <Bell size={18} className="text-white/60" />
                    <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                        style={{ background: '#f97316' }}
                    >
                        8
                    </span>
                </motion.div>
            </motion.div>

            {/* Digest Cards */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {digest.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="glass rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                        style={{ border: `1px solid ${item.color}33` }}
                        whileHover={{ scale: 1.03, borderColor: `${item.color}66` }}
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${item.color}20` }}
                        >
                            <item.icon size={18} style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">{item.value}</div>
                            <div className="text-[10px] text-white/40 truncate">{item.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main: Concierge Chat + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)] min-h-[420px]">
                {/* Concierge Chat - wider */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid rgba(249,115,22,0.2)' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <span className="text-sm">🤖</span>
                        <span className="text-xs text-white/40">Nexor Concierge — always here for you</span>
                    </div>
                    <AIChat mode="everyday" />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl p-5 flex flex-col"
                    style={{ border: '1px solid rgba(249,115,22,0.15)' }}
                >
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
                        {quickActions.map((action, i) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.06 }}
                                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
                                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}
                                whileHover={{ scale: 1.06, borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.15)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-2xl">{action.emoji}</span>
                                <span className="text-[10px] text-white/50 font-medium">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Daily Tip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-4 p-3 rounded-xl"
                        style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                    >
                        <div className="text-[10px] text-white/40 mb-1 font-semibold uppercase tracking-wider">Daily Tip</div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Your peak focus window is 9–11 AM based on your patterns. Schedule deep work then! 🧠
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
