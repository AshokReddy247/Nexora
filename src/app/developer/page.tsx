'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModeStore } from '@/store/modeStore';
import AIChat from '@/components/ui/AIChat';
import { Terminal, GitBranch, Cpu, Activity, Code2, Zap } from 'lucide-react';

const codeSnippet = `// Nexor AI — Intelligent Code Analysis
async function analyzeRepo(path: string) {
  const ast = await parseAST(path);
  const insights = await ai.analyze({
    code: ast,
    model: 'nexor-dev-v1',
    depth: 'semantic'
  });
  return insights.suggestions;
}`;

export default function DeveloperPage() {
    const setMode = useModeStore((s) => s.setMode);
    useEffect(() => { setMode('developer'); }, [setMode]);

    const stats = [
        { icon: GitBranch, label: 'Branches', value: '14' },
        { icon: Cpu, label: 'CPU', value: '23%' },
        { icon: Activity, label: 'Requests/s', value: '847' },
        { icon: Zap, label: 'Latency', value: '12ms' },
    ];

    return (
        <div className="min-h-screen p-6 pt-8" style={{ fontFamily: '"Fira Code", monospace' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center glow"
                    style={{ background: '#00ffcc22', border: '1px solid #00ffcc44' }}
                >
                    <Terminal size={20} style={{ color: '#00ffcc' }} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight glow-text" style={{ color: '#00ffcc' }}>
                        Command Center
                    </h1>
                    <p className="text-xs text-white/40">nexor-ai dev-mode v1.0.0 · connected</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/40">live</span>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-3 mb-6"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="glass rounded-xl p-3 flex items-center gap-2"
                        style={{ borderColor: '#00ffcc22' }}
                        whileHover={{ borderColor: '#00ffcc66', transition: { duration: 0.2 } }}
                    >
                        <stat.icon size={14} style={{ color: '#00ffcc' }} />
                        <div>
                            <div className="text-sm font-bold text-white">{stat.value}</div>
                            <div className="text-[10px] text-white/30">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Split Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-280px)] min-h-[400px]">
                {/* AI Chat */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid #00ffcc22' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <div className="flex gap-1.5">
                            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                            ))}
                        </div>
                        <span className="text-xs text-white/30 ml-2">nexor-ai ~ terminal</span>
                    </div>
                    <AIChat mode="developer" />
                </motion.div>

                {/* Code Visualizer */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col"
                    style={{ border: '1px solid #00ffcc22' }}
                >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <Code2 size={14} style={{ color: '#00ffcc' }} />
                        <span className="text-xs text-white/30">analyze.ts — AST Viewer</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <pre
                            className="text-xs leading-relaxed text-green-300 whitespace-pre-wrap"
                            style={{ fontFamily: 'inherit' }}
                        >
                            {codeSnippet}
                        </pre>
                        <div className="mt-4 space-y-2">
                            {['FunctionDeclaration → analyzeRepo', 'AwaitExpression → parseAST()', 'AwaitExpression → ai.analyze()', 'ReturnStatement → insights.suggestions'].map((node, i) => (
                                <motion.div
                                    key={node}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-2 text-[11px] text-white/50"
                                >
                                    <span style={{ color: '#00ffcc', marginLeft: i * 12 }}>{'>'}</span>
                                    <span>{node}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
