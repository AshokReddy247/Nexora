'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModeStore, Mode } from '@/store/modeStore';
import AIChat from '@/components/ui/AIChat';
import { MODE_CONFIG, MODES } from '@/lib/modeConfig';
import { useRouter } from 'next/navigation';
import { Activity, Shield, Cpu, Wifi, ChevronRight } from 'lucide-react';

const agentStatuses = [
    { id: 'dev', label: 'Developer Agent', status: 'online', tasks: 3, color: '#00ffcc' },
    { id: 'student', label: 'Student Agent', status: 'online', tasks: 1, color: '#a78bfa' },
    { id: 'enquiry', label: 'Enquiry Agent', status: 'processing', tasks: 5, color: '#f59e0b' },
    { id: 'everyday', label: 'Everyday Agent', status: 'idle', tasks: 0, color: '#f97316' },
];

const services = [
    { icon: Shield, label: 'Auth', status: 'Active' },
    { icon: Wifi, label: 'API Gateway', status: 'Active' },
    { icon: Cpu, label: 'GPU Cluster', status: 'Warm' },
    { icon: Activity, label: 'Monitoring', status: 'Active' },
];

export default function SystemPage() {
    const { setMode } = useModeStore();
    const router = useRouter();
    useEffect(() => { setMode('system'); }, [setMode]);

    const navigate = (mode: Mode) => {
        setMode(mode);
        router.push(`/${mode}`);
    };

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
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                >
                    ⬡
                </motion.div>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>Nexor AI — The Hub</h1>
                    <p className="text-xs text-white/40">system mode · 4 agents active · 99.8% uptime</p>
                </div>
                <motion.div
                    className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    All Systems Operational
                </motion.div>
            </motion.div>

            {/* Mode Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
            >
                {MODES.filter(m => m !== 'system').map((mode, i) => {
                    const config = MODE_CONFIG[mode];
                    return (
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 + i * 0.07 }}
                            onClick={() => navigate(mode)}
                            className="glass rounded-2xl p-4 cursor-pointer group relative overflow-hidden"
                            style={{ border: `1px solid ${config.accent}22` }}
                            whileHover={{ scale: 1.03, borderColor: `${config.accent}55` }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `radial-gradient(ellipse at top left, ${config.accent}11, transparent)` }}
                            />
                            <div className="text-3xl mb-3">{config.icon}</div>
                            <div className="text-sm font-bold text-white">{config.label}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">{config.tagline}</div>
                            <div
                                className="mt-3 flex items-center gap-1 text-[10px] font-semibold"
                                style={{ color: config.accent }}
                            >
                                Enter mode <ChevronRight size={10} />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-380px)] min-h-[360px]">
                {/* System Chat */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid rgba(139,92,246,0.2)' }}
                >
                    <div className="text-xs text-white/40 px-4 py-3 border-b border-white/5">
                        🧠 System Orchestrator
                    </div>
                    <AIChat mode="system" />
                </motion.div>

                {/* Agent Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="glass rounded-2xl p-5 flex flex-col"
                    style={{ border: '1px solid rgba(139,92,246,0.15)' }}
                >
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Agent Status</h3>
                    <div className="space-y-3 flex-1">
                        {agentStatuses.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.07 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: `${agent.color}0a` }}
                            >
                                <motion.div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: agent.status === 'idle' ? '#6b7280' : agent.color }}
                                    animate={agent.status !== 'idle' ? { opacity: [1, 0.4, 1] } : {}}
                                    transition={{ duration: agent.status === 'processing' ? 0.8 : 2, repeat: Infinity }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-white">{agent.label}</div>
                                    <div className="text-[10px] text-white/30 capitalize">{agent.status} · {agent.tasks} tasks</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-5 flex flex-col"
                    style={{ border: '1px solid rgba(139,92,246,0.15)' }}
                >
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Connected Services</h3>
                    <div className="space-y-2.5">
                        {services.map((svc, i) => (
                            <motion.div
                                key={svc.label}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 + i * 0.07 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(139,92,246,0.06)' }}
                            >
                                <svc.icon size={16} style={{ color: '#8b5cf6' }} />
                                <span className="text-xs text-white/70 flex-1">{svc.label}</span>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                                >
                                    {svc.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* System Health Bars */}
                    <div className="mt-4 space-y-2">
                        {[
                            { label: 'CPU', val: 23 },
                            { label: 'Memory', val: 61 },
                            { label: 'Network', val: 45 },
                        ].map((bar) => (
                            <div key={bar.label}>
                                <div className="flex justify-between text-[10px] text-white/30 mb-1">
                                    <span>{bar.label}</span><span>{bar.val}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${bar.val}%` }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
