'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODE_CONFIG } from '@/lib/modeConfig';
import { Mode } from '@/store/modeStore';
import { Send } from 'lucide-react';

interface MockAIChatProps {
    mode: Mode;
}

interface Message {
    id: number;
    role: 'user' | 'ai';
    text: string;
    typed?: boolean;
}

export default function MockAIChat({ mode }: MockAIChatProps) {
    const config = MODE_CONFIG[mode];
    const [messages, setMessages] = useState<Message[]>([
        { id: 0, role: 'ai', text: `Welcome to ${config.label} mode — ${config.tagline}. ${config.mockResponses[0]}`, typed: true },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [responseIndex, setResponseIndex] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now(), role: 'user', text: input };
        setMessages((m) => [...m, userMsg]);
        setInput('');
        setIsTyping(true);

        const nextResponse = config.mockResponses[responseIndex % config.mockResponses.length];
        setResponseIndex((i) => i + 1);

        setTimeout(() => {
            setIsTyping(false);
            const aiMsg: Message = { id: Date.now() + 1, role: 'ai', text: nextResponse, typed: false };
            setMessages((m) => [...m, aiMsg]);
            setTimeout(() => {
                setMessages((m) =>
                    m.map((msg) => (msg.id === aiMsg.id ? { ...msg, typed: true } : msg))
                );
            }, 50);
        }, 1200 + Math.random() * 600);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'text-white rounded-br-sm'
                                        : 'text-white/90 rounded-bl-sm border border-white/10'
                                    }`}
                                style={{
                                    background:
                                        msg.role === 'user'
                                            ? `linear-gradient(135deg, ${config.accent}bb, ${config.accent}66)`
                                            : 'rgba(255,255,255,0.05)',
                                    fontFamily: mode === 'developer' ? config.fontFamily : 'inherit',
                                }}
                            >
                                {msg.role === 'ai' && !msg.typed ? (
                                    <TypewriterText text={msg.text} accentColor={config.accent} />
                                ) : (
                                    <span className="whitespace-pre-wrap">{msg.text}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 border border-white/10 bg-white/5">
                            <div className="flex gap-1 items-center h-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: config.accent }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={config.chatPlaceholder}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-current transition-colors"
                        style={{ fontFamily: mode === 'developer' ? config.fontFamily : 'inherit', '--tw-ring-color': config.accent } as React.CSSProperties}
                    />
                    <motion.button
                        onClick={sendMessage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: config.accent }}
                    >
                        <Send size={16} className="text-black" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

function TypewriterText({ text, accentColor }: { text: string; accentColor: string }) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 18);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className="whitespace-pre-wrap">
            {displayed}
            {displayed.length < text.length && (
                <motion.span
                    className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full"
                    style={{ background: accentColor }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </span>
    );
}
