"use client";

import { useState } from 'react';
import { ArrowLeft, ChevronRight, LogOut, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const router = useRouter();
  const [showENS, setShowENS] = useState(true);

  return (
    <div className="p-4 md:p-6 space-y-8">
      <header className="flex items-center mb-4">
        <h1 className="text-xl font-semibold text-center flex-1">Profile & Settings</h1>
      </header>

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://picsum.photos/200" data-ai-hint="woman avatar" alt="Maria's avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-center">Maria</h2>
          <p className="text-muted-foreground text-center">{showENS ? 'maria.eth' : '0xA3...9F1B'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2">Settings</h3>
            <div className="bg-card rounded-lg border">
                <div className="flex items-center justify-between p-4">
                    <Label htmlFor="ens-toggle">Show ENS Name</Label>
                    <Switch id="ens-toggle" checked={showENS} onCheckedChange={setShowENS} />
                </div>
                 <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <span>Manage Device</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2">Security</h3>
            <div className="bg-card rounded-lg border">
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>View Verification Logs</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 text-red-500">
                    <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect Wallet</span>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
