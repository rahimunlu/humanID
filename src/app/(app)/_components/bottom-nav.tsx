"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, AppWindow, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/lib/context';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/apps', icon: AppWindow, label: 'Apps' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isIndexed } = useAppContext();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Verification Required",
      description: "Please complete the verification process to access this page.",
    });
  };

  if (!mounted) {
    return <div className="h-16 fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 border-t" />;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isDisabled = !isIndexed && item.href !== '/wallet';

            return (
              <Link 
                href={isDisabled ? '#' : item.href} 
                key={item.href} 
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full gap-1 transition-colors p-2",
                  isDisabled ? "text-border cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={isDisabled ? handleDisabledClick : undefined}
                aria-disabled={isDisabled}
              >
                <item.icon className={cn('h-6 w-6 transition-colors', isActive && !isDisabled && 'text-primary')} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
