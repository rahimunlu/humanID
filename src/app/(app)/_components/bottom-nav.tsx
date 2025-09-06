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
  
  // Do not render nav if not indexed (user is in onboarding flow)
  if (!isIndexed && !['/wallet'].includes(pathname)) {
    return null;
  }

  // Always show on wallet page for initial connection
  const showNav = isIndexed || pathname === '/wallet';

  if (!showNav) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm border-t">
      <nav className="h-16">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                href={item.href} 
                key={item.href} 
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full gap-1 transition-colors p-2 rounded-lg",
                  "text-muted-foreground hover:text-primary",
                  isActive && "text-primary"
                )}
              >
                <item.icon className='h-6 w-6' />
                {isActive && <span className="text-xs font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
