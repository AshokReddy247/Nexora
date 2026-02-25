'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MODES = [
  {
    id: 'developer',
    label: 'Developer',
    icon: '⌨',
    desc: 'Elite engineering AI',
    longDesc: 'Code review, architecture, debugging, CI/CD — your senior co-pilot.',
    accent: '#00ffcc',
    bg: '#001a2e',
    gradient: 'from-cyan-500/20 to-emerald-500/10',
  },
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    desc: 'Socratic AI tutor',
    longDesc: 'Step-by-step learning, concept breakdowns, exam prep guidance.',
    accent: '#a78bfa',
    bg: '#1a0f3d',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  {
    id: 'enquiry',
    label: 'Enquiry',
    icon: '📊',
    desc: 'Market intelligence',
    longDesc: 'Market research, competitor analysis, data-driven business insights.',
    accent: '#f59e0b',
    bg: '#111827',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    id: 'everyday',
    label: 'Everyday',
    icon: '☀️',
    desc: 'Personal concierge',
    longDesc: 'Travel planning, recipes, life advice — your daily companion.',
    accent: '#fb7185',
    bg: '#2d1200',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    id: 'system',
    label: 'System',
    icon: '⬡',
    desc: 'Meta-orchestrator',
    longDesc: 'Advanced routing, multi-agent coordination, system-level tasks.',
    accent: '#6366f1',
    bg: '#0d0020',
    gradient: 'from-indigo-500/20 to-blue-500/10',
  },
];

const FEATURES = [
  { icon: '🧠', title: 'RAG Memory', desc: 'Pinecone vector memory that recalls every conversation across sessions.' },
  { icon: '⚡', title: 'Real-Time Streaming', desc: 'Token-by-token Gemini 2.5 Flash responses via WebSockets.' },
  { icon: '🔭', title: 'Neural Visualizer', desc: '3D brain view shows which memory nodes are retrieved live.' },
  { icon: '🤝', title: 'Agent Cross-Talk', desc: 'Agents collaborate — Developer calls Enquiry without switching modes.' },
  { icon: '👻', title: 'Ghost Cursor', desc: 'Predictive UI that highlights your likely next action before you click.' },
  { icon: '🔒', title: 'Zero-Retention Mode', desc: 'Developer privacy toggle: no data stored, no Pinecone writes.' },
];

// ── Floating orb background ──────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { color: '#6366f1', x: '10%', y: '20%', size: 400, delay: 0 },
        { color: '#00ffcc', x: '80%', y: '60%', size: 300, delay: 2 },
        { color: '#f59e0b', x: '60%', y: '10%', size: 200, delay: 4 },
        { color: '#fb7185', x: '20%', y: '75%', size: 250, delay: 1 },
        { color: '#a78bfa', x: '90%', y: '30%', size: 180, delay: 3 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            background: orb.color,
            opacity: 0.06,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12 + i * 2, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── AI Persona Card (hero-level, bigger) ─────────────────────────────────
function PersonaCard({ mode, index }: { mode: typeof MODES[0]; index: number }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => router.push(`/${mode.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer rounded-3xl p-6 border transition-all duration-500 group overflow-hidden"
      style={{
        background: hovered ? `${mode.bg}e6` : 'rgba(255,255,255,0.03)',
        borderColor: hovered ? `${mode.accent}50` : 'rgba(255,255,255,0.07)',
        boxShadow: hovered
          ? `0 8px 60px ${mode.accent}18, 0 0 0 1px ${mode.accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Glow backdrop */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${mode.accent}12, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon + Label */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${mode.accent}15`, border: `1px solid ${mode.accent}25` }}
          >
            {mode.icon}
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight">{mode.label}</div>
            <div className="text-[11px] font-medium" style={{ color: `${mode.accent}cc` }}>{mode.desc}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/40 leading-relaxed mb-4">{mode.longDesc}</p>

        {/* Enter CTA */}
        <div className="flex items-center justify-between">
          <motion.div
            className="h-[2px] rounded-full flex-1 mr-4"
            style={{ background: `linear-gradient(90deg, ${mode.accent}, transparent)` }}
            animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.span
            className="text-xs font-bold tracking-wider uppercase whitespace-nowrap"
            style={{ color: hovered ? mode.accent : 'rgba(255,255,255,0.2)' }}
            animate={{ x: hovered ? 0 : 4, opacity: hovered ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            Enter →
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      className="rounded-2xl p-5 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 group"
    >
      <div className="text-2xl mb-3">{f.icon}</div>
      <div className="font-semibold text-white text-sm mb-1.5 group-hover:text-white transition">{f.title}</div>
      <div className="text-xs text-white/40 leading-relaxed">{f.desc}</div>
    </motion.div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(5,0,16,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-black">N</div>
        <span className="font-bold text-white text-base tracking-wide">Nexor AI</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
        <a href="#personas" className="hover:text-white transition">AI Personas</a>
        <a href="#features" className="hover:text-white transition">Features</a>
        <a href="#about" className="hover:text-white transition">About</a>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-white/60 hover:text-white transition px-3 py-1.5"
        >
          Login
        </Link>
        <Link
          href="/login?tab=register"
          className="text-sm font-semibold px-4 py-2 rounded-xl transition hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #00ffcc)',
            color: '#000',
          }}
        >
          Sign Up
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function IndexPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 30);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 30);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Gradient BG */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#050010] via-[#080020] to-black pointer-events-none" />
      <FloatingOrbs />
      <Nav />

      {/* ── Hero + Persona Selection ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        id="personas"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 pb-12"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-indigo-300 font-medium">Powered by Gemini 2.5 Flash · Pinecone RAG</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-4"
        >
          <span className="text-white">Choose Your </span>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #00ffcc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI Mind
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-sm md:text-lg text-white/45 max-w-2xl leading-relaxed mb-10"
        >
          Five specialised AI personas — each with its own personality, persistent memory, and real-time streaming. Pick one to begin.
        </motion.p>

        {/* ── Persona Grid ── */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {MODES.map((m, i) => <PersonaCard key={m.id} mode={m} index={i} />)}
        </div>

        {/* Guest hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-white/25"
        >
          Click any persona to start chatting instantly · No account required
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 flex flex-col items-center gap-1 text-white/20"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-[10px] tracking-widest uppercase">Scroll</div>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-3">Under the Hood</div>
          <h2 className="text-3xl md:text-5xl font-black text-white">Built different.</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </section>

      {/* ── About / CTA banner ── */}
      <section id="about" className="relative py-24 px-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-3xl w-full rounded-3xl overflow-hidden text-center p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(0,255,204,0.08))',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          {/* Shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-px shimmer" />

          <div className="text-4xl mb-4">🧠</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Your AI. Your memory. Your rules.
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto text-base leading-relaxed">
            Join Nexor AI and experience a personalised AI ecosystem that grows smarter with every conversation — or stays completely private with zero-retention mode.
          </p>
          <Link
            href="/login?tab=register"
            className="inline-block px-10 py-4 rounded-2xl font-bold text-black text-base transition hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #00ffcc)' }}
          >
            Create Free Account →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 md:px-12 border-t border-white/[0.06] text-center text-white/20 text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-black">N</div>
          <span className="text-white/40 font-medium">Nexor AI</span>
        </div>
        <p>© 2026 Nexor AI · 5-mode adaptive intelligence · Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
}
