"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, LogOut, ShieldCheck, User, X, Bell, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/lib/context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const router = useRouter();
  const { setWalletConnected, walletAddress } = useAppContext();
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
  
  const handleForgetDevice = () => {
    toast({
        title: "Device Forgotten",
        description: "humanID DNA v0.9 has been removed.",
        variant: "destructive"
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <header className="flex items-center">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
              <AvatarImage src="https://picsum.photos/200" data-ai-hint="woman avatar" alt="Maria's avatar" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">Maria</h2>
              <p className="text-muted-foreground text-sm">{showENS ? 'maria.eth' : walletAddress}</p>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <Label htmlFor="ens-toggle" className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>Show ENS Name</span>
                </Label>
                <Switch id="ens-toggle" checked={showENS} onCheckedChange={setShowENS} />
            </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
            <CardHeader><h3 className="text-lg font-semibold">Device & Security</h3></CardHeader>
            <CardContent className="p-0">
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="font-medium">humanID DNA v0.9</p>
                            <p className="text-sm text-green-600">Connected</p>
                        </div>
                        <Button variant="outline" onClick={() => handleToast('Reconnecting...')}>Reconnect</Button>
                    </div>
                </div>
                 <Separator />
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50" onClick={() => handleToast('Manage Device')}>
                    <span className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <span>View Verification Proof</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <Separator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 text-destructive">
                            <span className="flex items-center gap-3">
                                <Trash2 className="h-5 w-5" />
                                <span>Forget this Device</span>
                            </span>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Forgetting this device will require you to pair it again to perform new verifications.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForgetDevice} className="bg-destructive hover:bg-destructive/90">Forget Device</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><h3 className="text-lg font-semibold">Application</h3></CardHeader>
            <CardContent className="p-0">
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50" onClick={() => handleToast('Notifications')}>
                    <span className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span>Notifications</span>
                    </span>
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
        
        <div className="text-center text-xs text-muted-foreground">
            App Version 1.0.0
        </div>

      </div>
    </div>
  );
}
