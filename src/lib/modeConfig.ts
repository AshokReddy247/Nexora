import { Mode } from '@/store/modeStore';

export interface ModeConfig {
    label: string;
    tagline: string;
    icon: string;
    accent: string;
    accentRgb: string;
    bgFrom: string;
    bgTo: string;
    particleType: 'binary' | 'geometric' | 'grid' | 'organic' | 'cosmic';
    fontFamily: string;
    chatPlaceholder: string;
    mockResponses: string[];
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
    developer: {
        label: 'Developer',
        tagline: 'Command Center',
        icon: '⌨',
        accent: '#00ffcc',
        accentRgb: '0,255,204',
        bgFrom: '#020c18',
        bgTo: '#001a2e',
        particleType: 'binary',
        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        chatPlaceholder: '> Enter command or question...',
        mockResponses: [
            '`npm run build` completed in 2.4s — 0 errors, 2 warnings.',
            'Here\'s the optimized algorithm:\n```ts\nconst dp = Array(n+1).fill(Infinity);\ndp[0] = 0;\n```',
            'Analysing your repository... 847 files indexed. No critical vulnerabilities found.',
        ],
    },
    student: {
        label: 'Student',
        tagline: 'Zen Zone',
        icon: '🎓',
        accent: '#a78bfa',
        accentRgb: '167,139,250',
        bgFrom: '#0f0a2e',
        bgTo: '#1a0f3d',
        particleType: 'geometric',
        fontFamily: '"Inter", sans-serif',
        chatPlaceholder: 'Ask your AI tutor anything...',
        mockResponses: [
            'Great question! Let\'s break down recursion into 3 simple steps...',
            'You\'ve earned +50 XP for completing this concept! 🏆',
            'Here\'s a visual analogy for binary trees: imagine a family tree where each parent has exactly 2 children.',
        ],
    },
    enquiry: {
        label: 'Enquiry',
        tagline: 'BI Dashboard',
        icon: '📊',
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        bgFrom: '#0a0a0a',
        bgTo: '#111827',
        particleType: 'grid',
        fontFamily: '"Inter", sans-serif',
        chatPlaceholder: 'Research any market, trend, or topic...',
        mockResponses: [
            'Live search grounded: Found 12 sources. AI market projected at $1.8T by 2030 (Google, McKinsey, Bloomberg).',
            'Competitor analysis complete: 5 companies identified. Nexora AI leads on UX score (94/100).',
            'Trend detected: "Agentic AI" searches up 340% YoY. Recommend positioning update.',
        ],
    },
    everyday: {
        label: 'Everyday',
        tagline: 'Your Concierge',
        icon: '☀️',
        accent: '#f97316',
        accentRgb: '249,115,22',
        bgFrom: '#1a0a00',
        bgTo: '#2d1200',
        particleType: 'organic',
        fontFamily: '"Inter", sans-serif',
        chatPlaceholder: 'What can I help you with today?',
        mockResponses: [
            'Good morning! You have 3 meetings today. Your first is at 10am with the design team.',
            'I\'ve summarised your 47 unread emails — only 3 need action today.',
            'Based on your habits, I suggest a 25-min focus session now, then a break at 2pm ☕',
        ],
    },
    system: {
        label: 'System',
        tagline: 'The Hub',
        icon: '⬡',
        accent: '#8b5cf6',
        accentRgb: '139,92,246',
        bgFrom: '#050010',
        bgTo: '#0d0020',
        particleType: 'cosmic',
        fontFamily: '"Inter", sans-serif',
        chatPlaceholder: 'Command your digital ecosystem...',
        mockResponses: [
            'All 4 agents online. System health: 99.8% uptime.',
            'Switching orchestration mode to autonomous. 3 tasks delegated across Dev, Student, and Enquiry agents.',
            'Your AI ecosystem processed 1,247 tasks this week. Peak performance on Tuesday.',
        ],
    },
};

export const MODES: Mode[] = ['system', 'developer', 'student', 'enquiry', 'everyday'];
