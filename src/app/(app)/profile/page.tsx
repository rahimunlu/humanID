"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, LogOut, ShieldCheck, User, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/lib/context';

export default function ProfilePage() {
  const router = useRouter();
  const { setWalletConnected } = useAppContext();
  const [showENS, setShowENS] = useState(true);
  const { toast } = useToast();

  const handleLogout = () => {
    setWalletConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out.",
    });
    router.push('/wallet');
  };

  const handleToast = (title: string) => {
    toast({ title, description: "This is a mock action." });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-center flex-1">Profile & Settings</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24 border-2 border-background shadow-md">
          <AvatarImage src="https://picsum.photos/200" data-ai-hint="woman avatar" alt="Maria's avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-center">Maria</h2>
          <p className="text-muted-foreground text-center">{showENS ? 'maria.eth' : '0xA3...9F1B'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader><h3 className="text-lg font-semibold">Settings</h3></CardHeader>
            <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                    <Label htmlFor="ens-toggle" className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span>Show ENS Name</span>
                    </Label>
                    <Switch id="ens-toggle" checked={showENS} onCheckedChange={setShowENS} />
                </div>
                 <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50" onClick={() => handleToast('Manage Device')}>
                    <span className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <span>Manage Device</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                 <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50" onClick={() => handleToast('Notifications')}>
                    <span className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span>Notifications</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><h3 className="text-lg font-semibold">Security</h3></CardHeader>
            <CardContent className="p-0">
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50" onClick={() => handleToast('View Verification Logs')}>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <span>View Verification Logs</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 text-destructive" onClick={handleLogout}>
                    <div className="flex items-center gap-3">
                        <LogOut className="h-5 w-5" />
                        <span>Disconnect Wallet</span>
                    </div>
                </button>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
