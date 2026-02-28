'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wifi, WifiOff, Upload, Shield, ShieldOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MODE_CONFIG } from '@/lib/modeConfig';
import { Mode } from '@/store/modeStore';
import { useSocket } from '@/hooks/useSocket';
import { useGhostCursor } from '@/hooks/useGhostCursor';
import { useRagStore } from '@/store/ragStore';
import { useIoTStore } from '@/store/iotStore';
import SmartCopy from './SmartCopy';
import BrainView from '../three/BrainView';
import GhostHighlight from './GhostHighlight';
import CrossTalkCard from './CrossTalkCard';
import ExportMenu from './ExportMenu';
import { toast } from '@/store/toastStore';
import { TokenStorage } from '@/lib/authClient';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    streaming?: boolean;
    isCrosstalk?: boolean;
    crosstalkMeta?: { fromAgent: string; toAgent: string; query: string; streaming: boolean };
}

interface AIChatProps {
    mode: Mode;
}

export default function AIChat({ mode }: AIChatProps) {
    const config = MODE_CONFIG[mode];
    const sessionId = useMemo(() => uuidv4(), []);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: `Welcome to **${config.label} Mode** — ${config.tagline}. How can I help you?`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [zeroRetention, setZeroRetention] = useState(false);
    const [ghostIntent, setGhostIntent] = useState<{ intent: import('@/hooks/useGhostCursor').GhostIntent; confidence: number }>({ intent: null, confidence: 0 });

    const updateTelemetry = useIoTStore(s => s.updateTelemetry);
    const streamingMsgId = useRef<string | null>(null);
    const crossTalkMsgId = useRef<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef<Array<{ role: string; content: string }>>([]);
    const { setTrace } = useRagStore();

    const lastAiMessage = messages.filter(m => m.role === 'ai').at(-1)?.content ?? '';
    const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Ghost Cursor Integration ─────────────────────────────────────────────────
    useGhostCursor({
        mode,
        messageCount: messages.length,
        lastAiMessage,
        lastUserMessage,
        onIntent: setGhostIntent,
    });

    // ── Socket handlers ──────────────────────────────────────────────────────────
    const handleToken = useCallback((token: string) => {
        if (!streamingMsgId.current) return;
        const id = streamingMsgId.current;
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: m.content + token, streaming: true } : m));
    }, []);

    const handleEnd = useCallback((fullResponse: string) => {
        if (!streamingMsgId.current) return;
        const id = streamingMsgId.current;
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: fullResponse, streaming: false } : m));
        historyRef.current.push({ role: 'model', content: fullResponse });
        streamingMsgId.current = null;
        setIsStreaming(false);
    }, []);

    const handleError = useCallback((error: string) => {
        setIsStreaming(false);
        streamingMsgId.current = null;
    }, []);

    const handleStart = useCallback(() => {
        setIsStreaming(true);
        const newMsgId = uuidv4();
        streamingMsgId.current = newMsgId;
        setMessages(prev => [...prev, { id: newMsgId, role: 'ai', content: '', streaming: true }]);
    }, []);

    // ── RAG trace → BrainView ────────────────────────────────────────────────────
    const handleRagTrace = useCallback((data: unknown) => {
        const traceData = data as {
            queryLabel: string;
            nodes: Array<{ id: string; text: string; score: number; pos: [number, number, number] }>;
            latencyMs: number;
            mode: string;
            timestamp: number;
            demo?: boolean;
        };
        setTrace({
            queryLabel: traceData.queryLabel,
            nodes: traceData.nodes,
            latencyMs: traceData.latencyMs,
            mode: traceData.mode,
            timestamp: traceData.timestamp,
        });
    }, [setTrace]);

    // ── Cross-Talk handlers ──────────────────────────────────────────────────────
    const handleCrosstalkStart = useCallback((data: unknown) => {
        const ct = data as { from_agent: string; to_agent: string; query: string };
        const ctId = uuidv4();
        crossTalkMsgId.current = ctId;
        setMessages(prev => [...prev, {
            id: ctId,
            role: 'ai',
            content: '',
            isCrosstalk: true,
            crosstalkMeta: { fromAgent: ct.from_agent, toAgent: ct.to_agent, query: ct.query, streaming: true },
        }]);
    }, []);

    const handleCrosstalkToken = useCallback((data: unknown) => {
        if (!crossTalkMsgId.current) return;
        const { token } = data as { token: string };
        const id = crossTalkMsgId.current;
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: m.content + token } : m));
    }, []);

    const handleCrosstalkEnd = useCallback((data: unknown) => {
        if (!crossTalkMsgId.current) return;
        const { full_response } = data as { full_response: string };
        const id = crossTalkMsgId.current;
        setMessages(prev => prev.map(m => m.id === id
            ? { ...m, content: full_response, crosstalkMeta: m.crosstalkMeta ? { ...m.crosstalkMeta, streaming: false } : undefined }
            : m
        ));
        crossTalkMsgId.current = null;
        toast.info('Cross-Talk complete', 'Agent report received');
    }, []);

    const { sendMessage, isConnected } = useSocket({
        sessionId,
        onToken: handleToken,
        onEnd: handleEnd,
        onError: handleError,
        onStart: handleStart,
        onRagTrace: handleRagTrace,
        onCrosstalkStart: handleCrosstalkStart,
        onCrosstalkToken: handleCrosstalkToken,
        onCrosstalkEnd: handleCrosstalkEnd,
        onIoTTelemetry: (data: unknown) => updateTelemetry(data as any),
    });

    const send = () => {
        const msg = input.trim();
        if (!msg || isStreaming) return;
        setInput('');
        const userMsg: Message = { id: uuidv4(), role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        historyRef.current.push({ role: 'user', content: msg });
        sendMessage(mode, msg, historyRef.current.slice(-16), zeroRetention);
    };

    const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));

    return (
        <div className="flex flex-col h-full relative">
            {/* BrainView overlay */}
            <BrainView mode={mode} />

            {/* Status bar */}
            <div className="flex items-center justify-between gap-1.5 px-4 py-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                    {isConnected
                        ? <Wifi size={10} style={{ color: config.accent }} />
                        : <WifiOff size={10} className="text-white/25" />}
                    <span className="text-[10px] text-white/30">
                        {isConnected ? 'live · gemini 2.5 flash' : 'connecting...'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Zero-Retention Toggle */}
                    <button
                        onClick={() => {
                            setZeroRetention(v => !v);
                            toast.info(
                                zeroRetention ? 'Memory enabled' : 'Privacy mode on',
                                zeroRetention ? 'Conversations will be remembered' : 'No data stored this session'
                            );
                        }}
                        className="flex items-center gap-1 text-[9px] transition"
                        title={zeroRetention ? 'Privacy mode: no data stored' : 'Enable privacy mode'}
                        style={{ color: zeroRetention ? config.accent : 'rgba(255,255,255,0.25)' }}
                    >
                        {zeroRetention ? <ShieldOff size={10} /> : <Shield size={10} />}
                        {zeroRetention && <span>private</span>}
                    </button>

                    {/* Export trigger */}
                    <button
                        onClick={() => setShowExport(v => !v)}
                        className="text-white/25 hover:text-white/60 transition"
                        title="Export session"
                    >
                        <Upload size={10} />
                    </button>
                </div>
            </div>

            {/* Ghost Cursor hint */}
            {ghostIntent.intent && (
                <div className="px-4 py-1">
                    <GhostHighlight
                        intent={ghostIntent.intent}
                        confidence={ghostIntent.confidence}
                        accentColor={config.accent}
                    />
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.isCrosstalk && msg.crosstalkMeta ? (
                                <div className="w-full max-w-[92%]">
                                    <CrossTalkCard
                                        fromAgent={msg.crosstalkMeta.fromAgent}
                                        toAgent={msg.crosstalkMeta.toAgent}
                                        query={msg.crosstalkMeta.query}
                                        response={msg.content}
                                        isStreaming={msg.crosstalkMeta.streaming}
                                        accentColor={config.accent}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'text-white rounded-br-sm' : 'text-white/90 rounded-bl-sm border border-white/10'
                                        }`}
                                    style={{
                                        background: msg.role === 'user'
                                            ? `linear-gradient(135deg, ${config.accent}cc, ${config.accent}66)`
                                            : 'rgba(255,255,255,0.05)',
                                        fontFamily: mode === 'developer' ? config.fontFamily : 'inherit',
                                    }}
                                >
                                    {msg.role === 'ai' ? (
                                        <>
                                            <SmartCopy content={msg.content} mode={mode} accentColor={config.accent} />
                                            {msg.streaming && (
                                                <motion.span
                                                    className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full"
                                                    style={{ background: config.accent }}
                                                    animate={{ opacity: [1, 0] }}
                                                    transition={{ duration: 0.5, repeat: Infinity }}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isStreaming && messages[messages.length - 1]?.content === '' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-sm px-4 py-3 border border-white/10 bg-white/5">
                            <div className="flex gap-1 items-center">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: config.accent }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Export Menu (slide up) */}
            <AnimatePresence>
                {showExport && (
                    <ExportMenu
                        mode={mode}
                        sessionId={sessionId}
                        messages={chatMessages}
                        accentColor={config.accent}
                        onClose={() => setShowExport(false)}
                    />
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                        placeholder={isStreaming ? 'AI is responding...' : config.chatPlaceholder}
                        disabled={isStreaming}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-colors disabled:opacity-40"
                        style={{ fontFamily: mode === 'developer' ? config.fontFamily : 'inherit' }}
                    />
                    <motion.button
                        onClick={send}
                        disabled={isStreaming || !input.trim()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: config.accent }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Send size={16} className="text-black" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
