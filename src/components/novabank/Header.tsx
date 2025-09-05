import type { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

type HeaderProps = {
  onAvatarClick: () => void;
  onNotificationsClick: () => void;
  unreadNotifications: number;
};

export const Header: FC<HeaderProps> = ({ onAvatarClick, onNotificationsClick, unreadNotifications }) => {
  return (
    <header className="flex items-center justify-between animate-slide-up-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onAvatarClick} className="transition-transform active:scale-95 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none">
          <Avatar className="h-12 w-12 border-2 border-gray-200">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx3b21hbnxlbnwwfHx8fDE3NTcxMTEwMTl8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Maria's avatar" data-ai-hint="woman portrait" />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, Maria!</h1>
          <p className="text-muted-foreground">Your Banking Hub</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="relative rounded-full h-12 w-12 transition-transform active:scale-95" onClick={onNotificationsClick}>
        <Bell className="h-6 w-6" />
        {unreadNotifications > 0 && (
          <span className="absolute right-2 top-2 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </Button>
    </header>
  );
}
