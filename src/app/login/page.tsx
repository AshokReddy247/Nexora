'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, Check } from 'lucide-react';
import { login, register, TokenStorage } from '@/lib/authClient';
import { toast } from '@/store/toastStore';

// ── Floating orbs (auth-themed) ───────────────────────────────────────────────
function AuthOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
                { color: '#6366f1', size: 500, x: '-10%', y: '30%', delay: 0 },
                { color: '#00ffcc', size: 300, x: '80%', y: '-10%', delay: 1.5 },
                { color: '#a78bfa', size: 200, x: '70%', y: '70%', delay: 3 },
            ].map((o, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl"
                    style={{ left: o.x, top: o.y, width: o.size, height: o.size, background: o.color, opacity: 0.07 }}
                    animate={{ x: [0, 20, -15, 0], y: [0, -20, 15, 0] }}
                    transition={{ duration: 14 + i * 2, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

// ── Strength bar for password ─────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ chars', ok: password.length >= 8 },
        { label: 'Uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /[0-9]/.test(password) },
        { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ['', '#ef4444', '#f59e0b', '#a78bfa', '#00ffcc'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    if (!password) return null;
    return (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                    <div
                        key={n}
                        className="h-0.5 flex-1 rounded-full transition-all duration-400"
                        style={{ background: n <= score ? colors[score] : 'rgba(255,255,255,0.1)' }}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {checks.map(c => (
                        <span key={c.label} className="flex items-center gap-1 text-[10px]"
                            style={{ color: c.ok ? '#00ffcc' : 'rgba(255,255,255,0.3)' }}>
                            {c.ok ? <Check size={9} /> : <span className="w-2.5 h-2.5 rounded-full border border-current inline-block" />}
                            {c.label}
                        </span>
                    ))}
                </div>
                {score > 0 && (
                    <span className="text-[10px] font-bold" style={{ color: colors[score] }}>{labels[score]}</span>
                )}
            </div>
        </motion.div>
    );
}

// ── Input field ───────────────────────────────────────────────────────────────
interface InputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    autoComplete?: string;
}
function Input({ id, label, type, value, onChange, placeholder, error, rightElement, autoComplete }: InputProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-white/60 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200 pr-10"
                    style={{
                        borderColor: error ? '#ef4444' : value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
                        boxShadow: value && !error ? '0 0 0 1px rgba(99,102,241,0.2)' : 'none',
                    }}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
                )}
            </div>
            {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-red-400 mt-1">{error}</motion.p>
            )}
        </div>
    );
}

// ── Login form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!email) e.email = 'Email is required';
        if (!password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await login(email, password);
            TokenStorage.save(res);
            toast.success(`Welcome back, ${res.username}!`);
            router.push('/system');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            toast.error(msg);
            setErrors({ form: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">{errors.form}</div>
            )}

            <Input id="email" label="Email or username" type="text" value={email}
                onChange={setEmail} placeholder="you@example.com" error={errors.email} autoComplete="username" />

            <Input id="password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                onChange={setPassword} placeholder="••••••••" error={errors.password} autoComplete="current-password"
                rightElement={
                    <button type="button" onClick={() => setShowPw(v => !v)} className="text-white/30 hover:text-white/60 transition">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                }
            />

            <div className="flex justify-end">
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                    Forgot password?
                </button>
            </div>

            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #6366f1, #00ffcc)' }}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>

            {/* Guest access */}
            <button
                type="button"
                onClick={() => { toast.info('Exploring with limited features'); router.push('/system'); }}
                className="w-full py-3 rounded-xl text-sm text-white/40 hover:text-white/60 border border-white/[0.08] hover:border-white/20 transition"
            >
                Continue as Guest
            </button>

            <p className="text-center text-xs text-white/30">
                No account?{' '}
                <button type="button" onClick={onSwitch} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                    Create one
                </button>
            </p>
        </form>
    );
}

// ── Register form ─────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!username || username.length < 3) e.username = 'At least 3 characters';
        if (!email || !email.includes('@')) e.email = 'Valid email required';
        if (password.length < 8) e.password = 'Min 8 characters';
        if (password !== confirm) e.confirm = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await register({ username, email, password, password2: confirm });
            // Auto-login to get JWT tokens after registration
            const tokens = await login(username, password);
            TokenStorage.save(tokens);
            toast.success(`Welcome to Nexor AI, ${username}!`);
            router.push('/system');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            toast.error(msg);
            setErrors({ form: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">{errors.form}</div>
            )}

            <Input id="username" label="Username" type="text" value={username}
                onChange={setUsername} placeholder="yourname" error={errors.username} autoComplete="username" />

            <Input id="reg-email" label="Email" type="email" value={email}
                onChange={setEmail} placeholder="you@example.com" error={errors.email} autoComplete="email" />

            <div>
                <Input id="reg-password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                    onChange={setPassword} placeholder="••••••••" error={errors.password} autoComplete="new-password"
                    rightElement={
                        <button type="button" onClick={() => setShowPw(v => !v)} className="text-white/30 hover:text-white/60 transition">
                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    }
                />
                <PasswordStrength password={password} />
            </div>

            <Input id="confirm" label="Confirm password" type={showPw ? 'text' : 'password'} value={confirm}
                onChange={setConfirm} placeholder="••••••••" error={errors.confirm} autoComplete="new-password" />

            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #6366f1, #00ffcc)' }}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account →'}
            </motion.button>

            <p className="text-center text-xs text-white/30">
                Already have an account?{' '}
                <button type="button" onClick={onSwitch} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                    Sign in
                </button>
            </p>
        </form>
    );
}

// ── Page (inner) ──────────────────────────────────────────────────────────────
function LoginPageInner() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
    const [tab, setTab] = useState<'login' | 'register'>(initialTab);

    const MODE_HIGHLIGHTS = [
        { icon: '⌨', label: 'Developer', accent: '#00ffcc' },
        { icon: '🎓', label: 'Student', accent: '#a78bfa' },
        { icon: '📊', label: 'Enquiry', accent: '#f59e0b' },
        { icon: '☀️', label: 'Everyday', accent: '#fb7185' },
        { icon: '⬡', label: 'System', accent: '#6366f1' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* ── Left panel (branding) — hidden on mobile ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
                <AuthOrbs />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-black">N</div>
                    <span className="font-bold text-lg text-white">Nexor AI</span>
                </div>

                {/* Center content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-4">Your AI ecosystem awaits</div>
                        <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6">
                            <span className="text-white">Five minds.</span>
                            <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #6366f1, #00ffcc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>One platform.</span>
                        </h1>
                        <p className="text-white/40 text-base leading-relaxed max-w-sm">
                            Persistent memory, real-time streaming, and agents that collaborate — all built for you.
                        </p>
                    </motion.div>

                    {/* Mode pills */}
                    <div className="flex flex-wrap gap-2 mt-10">
                        {MODE_HIGHLIGHTS.map((m, i) => (
                            <motion.div
                                key={m.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs"
                                style={{ borderColor: `${m.accent}30`, background: `${m.accent}10`, color: m.accent }}
                            >
                                <span>{m.icon}</span>
                                <span className="font-medium">{m.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div className="relative z-10 text-white/20 text-xs">
                    &quot;Intelligence that adapts to who you are.&quot;
                </div>
            </div>

            {/* ── Right panel (form) ── */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 relative">
                <AuthOrbs />

                {/* Back to home */}
                <div className="absolute top-6 left-6">
                    <Link href="/"
                        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition">
                        <ArrowLeft size={12} />
                        <span>Back to home</span>
                    </Link>
                </div>

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-black">N</div>
                    <span className="font-bold text-white">Nexor AI</span>
                </div>

                <div className="relative z-10 max-w-sm w-full mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white mb-1">
                            {tab === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p className="text-sm text-white/40">
                            {tab === 'login'
                                ? 'Sign in to your AI ecosystem'
                                : 'Join Nexor AI — free forever'}
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] mb-6">
                        {(['login', 'register'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                                style={{
                                    background: tab === t ? 'rgba(99,102,241,0.3)' : 'transparent',
                                    color: tab === t ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                                    border: tab === t ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                }}
                            >
                                {t === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {tab === 'login'
                                ? <LoginForm onSwitch={() => setTab('register')} />
                                : <RegisterForm onSwitch={() => setTab('login')} />
                            }
                        </motion.div>
                    </AnimatePresence>

                    {/* Terms */}
                    <p className="mt-6 text-center text-[10px] text-white/20 leading-relaxed">
                        By continuing you agree to Nexor AI&apos;s Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Suspense boundary for useSearchParams ─────────────────────────────────────
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
            </div>
        }>
            <LoginPageInner />
        </Suspense>
    );
}
