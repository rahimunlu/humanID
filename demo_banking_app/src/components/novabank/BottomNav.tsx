"use client"

import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Home, List, CreditCard, Settings, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

type BottomNavProps = {
  onQuickActionsClick: () => void;
};

const NavItem: FC<{ label: string; icon: React.ElementType; isActive?: boolean; onClick: () => void; }> = ({ label, icon: Icon, isActive, onClick }) => (
    <Button variant="ghost" className={cn("flex h-auto flex-col items-center justify-center gap-1 p-0 transition-transform active:scale-95", isActive ? "text-primary" : "text-muted-foreground")} onClick={onClick}>
        <Icon className="h-6 w-6" />
        <span className="text-xs font-medium">{label}</span>
    </Button>
);

export const BottomNav: FC<BottomNavProps> = ({ onQuickActionsClick }) => {
  const { toast } = useToast();

  const handleNavClick = (screen: string) => {
    toast({
      title: `Navigating to ${screen}`,
      description: "This feature is for demonstration purposes only.",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-20 items-center justify-around">
        <NavItem label="Home" icon={Home} isActive onClick={() => handleNavClick('Home')} />
        <NavItem label="History" icon={List} onClick={() => handleNavClick('Transactions')} />
        
        <div className="w-16" />

        <NavItem label="Wallet" icon={CreditCard} onClick={() => handleNavClick('Wallet')} />
        <NavItem label="Profile" icon={Settings} onClick={() => handleNavClick('Profile')} />
      </div>

       <Button 
          aria-label="New action"
          size="icon" 
          className="bg-accent text-accent-foreground hover:bg-accent/90 absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform rounded-full shadow-lg transition-transform active:scale-90 animate-bounce-in"
          onClick={onQuickActionsClick}
        >
          <Plus className="h-8 w-8" />
        </Button>
    </div>
  );
}
