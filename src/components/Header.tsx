'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="w-6 h-6" /> {/* Placeholder for theme button */}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          Fabula
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-6 w-6 text-[var(--muted-foreground)]" />
          ) : (
            <MoonIcon className="h-6 w-6 text-[var(--muted-foreground)]" />
          )}
        </button>
      </div>
    </header>
  );
}
