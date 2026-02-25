'use client';

import { usePathname } from 'next/navigation';
import ThreeBackground from '@/components/three/ThreeBackground';
import ModeSelector from '@/components/ui/ModeSelector';
import TransitionShell from '@/components/ui/TransitionShell';

// Routes where the AI chrome (background, mode selector, transition shell) should NOT show
const BARE_ROUTES = ['/', '/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isBare = BARE_ROUTES.includes(pathname);

    if (isBare) {
        // Landing & login — just render children directly, no AI chrome
        return <>{children}</>;
    }

    return (
        <>
            <ThreeBackground />
            <TransitionShell>
                {children}
            </TransitionShell>
            <ModeSelector />
        </>
    );
}
