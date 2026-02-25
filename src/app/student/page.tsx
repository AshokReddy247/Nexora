'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModeStore } from '@/store/modeStore';
import AIChat from '@/components/ui/AIChat';
import { BookOpen, Flame, Star, Trophy, Clock, ChevronRight } from 'lucide-react';

const quests = [
    { title: 'Recursion Deep Dive', progress: 72, xp: 150, difficulty: 'Medium', emoji: '🌀' },
    { title: 'Binary Trees Mastery', progress: 45, xp: 200, difficulty: 'Hard', emoji: '🌲' },
    { title: 'CSS Grid Magic', progress: 90, xp: 80, difficulty: 'Easy', emoji: '🎨' },
];

export default function StudentPage() {
    const setMode = useModeStore((s) => s.setMode);
    useEffect(() => { setMode('student'); }, [setMode]);

    return (
        <div className="min-h-screen p-6 pt-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl glass animate-float">
                    🎓
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#a78bfa' }}>
                        Zen Zone
                    </h1>
                    <p className="text-xs text-white/40">student mode · focus session active</p>
                </div>
                {/* XP Bar */}
                <div className="ml-auto flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs text-white/40">Level 7</div>
                        <div className="text-sm font-bold" style={{ color: '#a78bfa' }}>2,450 XP</div>
                    </div>
                    <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                            initial={{ width: 0 }}
                            animate={{ width: '68%' }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 mb-6"
            >
                {[
                    { icon: Flame, label: '7-Day Streak', value: '🔥 7', color: '#f97316' },
                    { icon: Star, label: 'Stars Earned', value: '⭐ 124', color: '#fcd34d' },
                    { icon: Trophy, label: 'Rank', value: '🏆 #42', color: '#a78bfa' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="glass rounded-2xl p-4 text-center"
                        style={{ border: '1px solid rgba(167,139,250,0.15)' }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-[10px] text-white/40 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)] min-h-[400px]">
                {/* Quest Cards */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Active Quests</h2>
                    {quests.map((quest, i) => (
                        <motion.div
                            key={quest.title}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                            className="glass rounded-2xl p-4 cursor-pointer"
                            style={{ border: '1px solid rgba(167,139,250,0.15)' }}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(167,139,250,0.4)' }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{quest.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{quest.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-white/40">{quest.difficulty}</span>
                                        <span className="text-[10px]" style={{ color: '#a78bfa' }}>+{quest.xp} XP</span>
                                    </div>
                                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${quest.progress}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-white/30 mt-1">{quest.progress}% complete</div>
                                </div>
                                <ChevronRight size={14} className="text-white/20 shrink-0 mt-1" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Pomodoro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-2xl p-4 text-center"
                        style={{ border: '1px solid rgba(167,139,250,0.15)' }}
                    >
                        <Clock size={18} className="mx-auto mb-2 text-white/40" />
                        <div className="text-2xl font-mono font-bold text-white">24:35</div>
                        <div className="text-[10px] text-white/30 mt-1">focus session</div>
                        <motion.button
                            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Pause
                        </motion.button>
                    </motion.div>
                </div>

                {/* AI Tutor Chat */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid rgba(167,139,250,0.15)' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <BookOpen size={14} style={{ color: '#a78bfa' }} />
                        <span className="text-xs text-white/40">AI Tutor — ask me anything</span>
                    </div>
                    <AIChat mode="student" />
                </motion.div>
            </div>
        </div>
    );
}
