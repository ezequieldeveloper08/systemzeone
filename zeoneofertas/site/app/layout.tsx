import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { WorkspaceProvider } from '@/components/providers/workspace-provider';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'OfertaHub - SaaS de Ofertas, Afiliados e Curadoria',
  description:
    'Plataforma completa para afiliados, gestores de grupos de ofertas e criadores de conteúdo automatizarem buscas no Mercado Livre, Shopee, conversão de links e artes de divulgação.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn('antialiased', inter.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
