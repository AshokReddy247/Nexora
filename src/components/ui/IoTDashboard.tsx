'use client';

import { useIoTStore } from '@/store/iotStore';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Activity, Server, Cpu, Thermometer, Wifi } from 'lucide-react';

export default function IoTDashboard() {
    const { devices, history } = useIoTStore();
    const deviceList = Object.values(devices);

    if (deviceList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4 font-mono text-xs">
                <Activity size={24} className="animate-pulse text-indigo-500" />
                <p>Waiting for IoT telemetry via WebSockets...</p>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-1">Fleet Telemetry</h2>
                    <p className="text-xs text-white/40 font-mono tracking-wider uppercase">Live Edge Devices: {deviceList.length}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Connected</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceList.map((d, i) => {
                    const data = history[d.id] || [];
                    return (
                        <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-sm font-bold text-white mb-1">{d.id}</div>
                                    <div className="flex gap-2 text-[10px] uppercase tracking-wider font-mono">
                                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{d.type}</span>
                                        <span className="text-white/40 bg-white/5 px-2 py-0.5 rounded">{d.location}</span>
                                    </div>
                                </div>
                                <Server size={16} className="text-white/20" />
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                                        <Cpu size={12} /> CPU Target
                                    </div>
                                    <div className="text-lg font-mono font-bold text-white">
                                        {d.cpu.toFixed(1)}<span className="text-xs text-white/30">%</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                                        <Thermometer size={12} /> Core Temp
                                    </div>
                                    <div className="text-lg font-mono font-bold text-white">
                                        {d.temp.toFixed(1)}<span className="text-xs text-white/30">°C</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                                        <Wifi size={12} /> Latency
                                    </div>
                                    <div className="text-lg font-mono font-bold text-emerald-400">
                                        {d.latency.toFixed(0)}<span className="text-xs text-emerald-400/50">ms</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-16 w-full -mx-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                        <Line
                                            type="monotone"
                                            dataKey="cpu"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
