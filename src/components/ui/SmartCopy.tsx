'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, FileText, Table2 } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { Mode } from '@/store/modeStore';

interface SmartCopyProps {
    content: string;
    mode: Mode;
    accentColor: string;
}

interface CodeBlockItem {
    type: 'code';
    code: string;
    placeholder: string;
}

function detectContentType(text: string): 'code' | 'table' | 'text' {
    if (/```[\s\S]*?```/.test(text)) return 'code';
    if (/\|.+\|.+\|/.test(text)) return 'table';
    return 'text';
}

function tableToCSV(text: string): string {
    const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
    return lines
        .filter((l) => !/^\|[-| ]+\|$/.test(l.trim()))
        .map((l) =>
            l.split('|').filter(Boolean).map((c) => c.trim()).join(',')
        )
        .join('\n');
}

function CodeBlock({ code, accent }: { code: string; accent: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied!', 'Pasted to your clipboard 📋');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}33` }}>
            <div className="flex items-center justify-between px-3 py-1.5 text-[10px]" style={{ background: `${accent}15` }}>
                <span className="text-white/40 font-mono">code</span>
                <motion.button onClick={copy} className="flex items-center gap-1 px-2 py-1 rounded-lg text-white/50 hover:text-white transition" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {copied ? <Check size={11} color={accent} /> : <Copy size={11} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
            </div>
            <pre className="text-xs leading-relaxed overflow-x-auto p-3 text-green-300" style={{ fontFamily: '"Fira Code", monospace', background: 'rgba(0,0,0,0.4)' }}>
                {code}
            </pre>
        </div>
    );
}

function TableBlock({ text, accent }: { text: string; accent: string }) {
    const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
    const rows = lines
        .filter((l) => !/^\|[-| ]+\|$/.test(l.trim()))
        .map((l) => l.split('|').filter(Boolean).map((c) => c.trim()));

    const exportCSV = () => {
        const csv = tableToCSV(text);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexor-data.csv';
        a.click();
        toast.success('CSV exported!', 'nexor-data.csv downloaded');
    };

    return (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}33` }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ background: `${accent}15` }}>
                <span className="text-[10px] text-white/40 flex items-center gap-1"><Table2 size={10} /> table</span>
                <motion.button onClick={exportCSV} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-white transition" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Download size={11} /> Export CSV
                </motion.button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-white/80">
                    {rows.map((row, ri) => (
                        <tr key={ri} className={ri === 0 ? 'font-bold text-white' : 'border-t border-white/5'} style={ri === 0 ? { background: `${accent}10` } : {}}>
                            {row.map((cell, ci) => <td key={ci} className="px-3 py-2">{cell}</td>)}
                        </tr>
                    ))}
                </table>
            </div>
        </div>
    );
}

export default function SmartCopy({ content, mode, accentColor }: SmartCopyProps) {
    const [copied, setCopied] = useState(false);

    const copyAll = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        const label = mode === 'student' ? 'Notes saved!' : 'Copied!';
        toast.success(label, 'Response copied to clipboard 📋');
        setTimeout(() => setCopied(false), 2000);
    };

    const saveAsNote = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexor-note.md';
        a.click();
        toast.success('Note saved!', 'nexor-note.md downloaded 📝');
    };

    const renderContent = (): React.ReactNode[] => {
        const codeBlocks: CodeBlockItem[] = [];
        let idx = 0;

        const processed = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code: string) => {
            const placeholder = `__CODE_BLOCK_${idx}__`;
            codeBlocks.push({ type: 'code', code: code.trim(), placeholder });
            idx++;
            return placeholder;
        });

        const segments = processed.split(/(__CODE_BLOCK_\d+__)/);
        return segments.map((seg, i) => {
            const block = codeBlocks.find((b) => b.placeholder === seg);
            if (block) return <CodeBlock key={i} code={block.code} accent={accentColor} />;
            if (/\|.+\|.+\|/.test(seg)) return <TableBlock key={i} text={seg} accent={accentColor} />;
            return <span key={i} className="whitespace-pre-wrap">{seg}</span>;
        });
    };

    return (
        <div className="group relative">
            <div className="text-sm leading-relaxed text-white/85">{renderContent()}</div>
            <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <motion.button onClick={copyAll} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/40 hover:text-white transition" style={{ background: `${accentColor}15` }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {copied ? <Check size={10} color={accentColor} /> : <Copy size={10} />}
                    {mode === 'student' ? 'Copy Notes' : 'Copy All'}
                </motion.button>
                {mode === 'student' && (
                    <motion.button onClick={saveAsNote} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/40 hover:text-white transition" style={{ background: `${accentColor}15` }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FileText size={10} /> Save as Note
                    </motion.button>
                )}
            </div>
        </div>
    );
}
