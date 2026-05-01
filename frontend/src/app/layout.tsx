import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Divino Arena | Reserve sua quadra',
  description: 'Reserve sua quadra esportiva de forma rápida e fácil. Futebol Society, Futevôlei e Vôlei de Praia.',
  keywords: 'quadra esportiva, reserva quadra, futebol society, futevolei, volei de praia',
  openGraph: {
    title: 'Divino Arena | Reserve sua quadra',
    description: 'Reserve sua quadra de forma rápida e fácil!',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
