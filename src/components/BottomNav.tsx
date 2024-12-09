'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Read', href: '/read', icon: BookOpenIcon },
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`p-2 hover:bg-muted/50 rounded-full transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
                aria-label={item.name}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}