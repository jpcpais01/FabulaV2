import type { Metadata } from 'next';
import { Crimson_Text } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson',
});

export const metadata: Metadata = {
  title: 'Fabula - AI Story Maker',
  description: 'Create and read AI-generated stories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background font-serif antialiased ${crimsonText.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1 overflow-auto pt-16 pb-16">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
