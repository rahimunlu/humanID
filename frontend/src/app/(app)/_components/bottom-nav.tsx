"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/lib/context';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/apps', icon: LayoutGrid, label: 'Apps' },
  { href: '/profile', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isIndexed } = useAppContext();
  
  if (!isIndexed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/80 backdrop-blur-sm border-t border-border/50">
      <nav className="h-16 pb-safe">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                href={item.href} 
                key={item.href} 
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full gap-1 transition-all p-2 rounded-lg duration-200 active:scale-95",
                  "text-muted-foreground hover:text-primary",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                <item.icon className={cn('h-6 w-6 transition-all', isActive ? 'fill-primary' : '')} />
                <span className={cn(
                  "text-xs font-medium transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
