"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/lib/context';
import ConnectWalletModal from './_components/connect-wallet-modal';
import CreateWalletModal from './_components/create-wallet-modal';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/logo';

export default function WalletPage() {
  const { walletConnected, walletAddress, walletBalance } = useAppContext();
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <Logo />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
        </Button>
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {!walletConnected ? (
          <div className="w-full max-w-sm space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Your Digital ID</h2>
            <p className="text-muted-foreground">Connect or create a secure wallet to get started with your on-chain identity.</p>
            <div className="flex flex-col gap-4 pt-4">
              <Button size="lg" className="w-full transition-transform active:scale-95" onClick={() => setConnectModalOpen(true)}>Connect Wallet</Button>
              <Button size="lg" variant="secondary" className="w-full transition-transform active:scale-95" onClick={() => setCreateModalOpen(true)}>Create New Wallet</Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-6">
            <Card className="text-left shadow-lg">
              <CardHeader>
                <CardTitle>Your Wallet</CardTitle>
                <CardDescription>Sepolia Testnet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="font-mono text-sm truncate">{walletAddress}</span>
                  <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-3xl font-bold">{walletBalance} ETH</div>
              </CardContent>
            </Card>
            
            <Link href="/device" passHref>
              <Button size="lg" className="w-full transition-transform active:scale-95 bg-accent text-accent-foreground hover:bg-accent/90">
                Connect DNA Device
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ConnectWalletModal isOpen={isConnectModalOpen} onOpenChange={setConnectModalOpen} />
      <CreateWalletModal isOpen={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
