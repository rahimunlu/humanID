"use client";

import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { toast } = useToast();
  const router = useRouter();

  const handleNotifications = () => {
    toast({
      title: "No new notifications",
      description: "You're all caught up!",
    });
  };

  return (
    <header className="flex items-center justify-between p-4 md:p-6">
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center gap-2 p-1 rounded-full transition-colors hover:bg-muted"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://picsum.photos/100" data-ai-hint="woman avatar" alt="Maria's avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div className="text-left md:hidden">
            <p className="font-semibold text-sm">Maria</p>
            <p className="text-xs text-muted-foreground">maria.eth</p>
        </div>
      </button>

      <Button variant="ghost" size="icon" className="relative" onClick={handleNotifications}>
        <Bell className="h-6 w-6" />
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </Button>
    </header>
  );
}
