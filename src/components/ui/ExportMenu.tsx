'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Github, Download, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { Mode } from '@/store/modeStore';

interface ExportMenuProps {
    mode: Mode;
    sessionId: string;
    messages: Array<{ role: string; content: string }>;
    accentColor: string;
    onClose: () => void;
}

type ExportState = 'idle' | 'loading' | 'done' | 'error';

export default function ExportMenu({
    mode,
    sessionId,
    messages,
    accentColor,
    onClose,
}: ExportMenuProps) {
    const [pdfState, setPdfState] = useState<ExportState>('idle');
    const [githubState, setGithubState] = useState<ExportState>('idle');
    const [githubRepo, setGithubRepo] = useState('');
    const [githubPat, setGithubPat] = useState('');

    // ── PDF Export ───────────────────────────────────────────────────────────────
    const handlePdfExport = async () => {
        setPdfState('loading');
        try {
            const res = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, sessionId, messages }),
            });
            if (!res.ok) throw new Error(await res.text());

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexor-${mode}-${sessionId.slice(0, 8)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            setPdfState('done');
            toast.success('PDF exported!', `nexor-${mode}-session.pdf downloaded`);
            setTimeout(() => setPdfState('idle'), 3000);
        } catch (e) {
            setPdfState('error');
            toast.error('PDF failed', (e as Error).message);
            setTimeout(() => setPdfState('idle'), 3000);
        }
    };

    // ── GitHub Export ────────────────────────────────────────────────────────────
    const handleGithubExport = async () => {
        if (!githubRepo || !githubPat) {
            toast.warning('Missing info', 'Enter your GitHub repo and PAT token.');
            return;
        }
        setGithubState('loading');
        try {
            const res = await fetch('/api/export/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, sessionId, messages, githubRepo, githubPat }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'GitHub export failed');

            setGithubState('done');
            toast.success(
                'Committed!',
                `${data.files_committed} files → ${data.url.slice(0, 40)}...`
            );
            setTimeout(() => setGithubState('idle'), 3000);
        } catch (e) {
            setGithubState('error');
            toast.error('GitHub failed', (e as Error).message);
            setTimeout(() => setGithubState('idle'), 3000);
        }
    };

    const StateIcon = ({ state }: { state: ExportState }) => {
        if (state === 'loading') return <Loader2 size={14} className="animate-spin" />;
        if (state === 'done') return <CheckCircle2 size={14} style={{ color: '#34d399' }} />;
        return <Download size={14} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 mb-2 mx-2 rounded-2xl overflow-hidden z-30"
            style={{
                background: 'rgba(10,10,20,0.95)',
                border: `1px solid ${accentColor}30`,
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: `${accentColor}20` }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Export Session
                    </span>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white/70 transition">
                    <X size={14} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* PDF Export */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} style={{ color: accentColor }} />
                        <span className="text-xs font-semibold text-white">PDF Transcript</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                        Formatted session with all messages, code blocks, and timestamps.
                    </p>
                    <motion.button
                        onClick={handlePdfExport}
                        disabled={pdfState === 'loading'}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        style={{
                            background: `${accentColor}22`,
                            border: `1px solid ${accentColor}50`,
                            color: accentColor,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <StateIcon state={pdfState} />
                        {pdfState === 'loading' ? 'Generating...' : pdfState === 'done' ? 'Downloaded!' : 'Export PDF'}
                    </motion.button>
                </div>

                {/* Divider */}
                <div className="border-t" style={{ borderColor: `${accentColor}15` }} />

                {/* GitHub Export */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Github size={14} style={{ color: accentColor }} />
                        <span className="text-xs font-semibold text-white">GitHub Commit</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                        Push code snippets from this session to your repo.
                    </p>
                    <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="username/repo-name"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                    />
                    <input
                        type="password"
                        value={githubPat}
                        onChange={(e) => setGithubPat(e.target.value)}
                        placeholder="GitHub Personal Access Token"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                    />
                    <motion.button
                        onClick={handleGithubExport}
                        disabled={githubState === 'loading'}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <StateIcon state={githubState} />
                        {githubState === 'loading' ? 'Committing...' : githubState === 'done' ? 'Committed!' : 'Push to GitHub'}
                    </motion.button>
                </div>

                {/* Message count */}
                <p className="text-[9px] text-white/20 text-center">
                    {messages.length} messages · {mode} mode · {sessionId.slice(0, 8)}
                </p>
            </div>
        </motion.div>
    );
}
