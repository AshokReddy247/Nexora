import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/ui/AppShell';
import ToastSystem from '@/components/ui/ToastSystem';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexor AI — A Context-Aware Digital Ecosystem',
  description: 'World-class adaptive multi-agent AI platform with 5 distinct intelligence modes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AppShell>
          {children}
        </AppShell>
        <ToastSystem />
      </body>
    </html>
  );
}
