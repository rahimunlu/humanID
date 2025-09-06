"use client";

import { Bell, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  const { toast } = useToast();
  const router = useRouter();
  const { walletAddress } = useAppContext();

  const handleNotifications = () => {
    toast({
      title: "No new notifications",
      description: "You're all caught up!",
    });
  };

  return (
    <header className="flex items-center justify-between p-4 md:p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/profile')}
          className="transition-transform active:scale-95"
        >
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src="https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxibG9uZGUlMjB3b21hbnxlbnwwfHx8fDE3NTcxMTExNzd8MA&ixlib=rb-4.1.0&q=80&w=1080" data-ai-hint="woman avatar" alt="Maria's avatar" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </button>
        <div>
            <h1 className="text-xl font-bold text-foreground">Hello, Maria!</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '...'}</span>
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                </Badge>
            </div>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="relative transition-transform active:scale-95" onClick={handleNotifications}>
        <Bell className="h-6 w-6" />
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </Button>
    </header>
  );
}
