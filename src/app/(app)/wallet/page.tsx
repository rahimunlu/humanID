"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/lib/context';
import ConnectWalletModal from './_components/connect-wallet-modal';
import CreateWalletModal from './_components/create-wallet-modal';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/logo';

export default function WalletPage() {
  const { walletConnected, walletAddress, walletBalance, isIndexed } = useAppContext();
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (walletConnected && isIndexed) {
      router.push('/home');
    }
  }, [walletConnected, isIndexed, router]);

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
    <div className="p-4 md:p-6 min-h-[calc(100vh-6rem)] flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <Logo />
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {!walletConnected ? (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Your Digital ID</h1>
            <p className="text-muted-foreground">Connect or create a secure wallet to get started with your on-chain identity.</p>
            <div className="flex flex-col gap-4 pt-4">
              <Button size="lg" className="w-full transition-transform active:scale-95 shadow-md" onClick={() => setConnectModalOpen(true)}>Connect Existing Wallet</Button>
              <Button size="lg" variant="secondary" className="w-full transition-transform active:scale-95" onClick={() => setCreateModalOpen(true)}>Create New Wallet</Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-6 animate-fade-in">
            <Card className="text-left shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-success" />
                    <CardTitle>Wallet Connected</CardTitle>
                </div>
                <CardDescription>Sepolia Testnet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="font-mono text-sm truncate">{walletAddress}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-4xl font-bold">{walletBalance} ETH</div>
              </CardContent>
            </Card>
            
            <Link href="/device" passHref>
              <Button size="lg" className="w-full transition-transform active:scale-95 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                Next: Connect DNA Device <ArrowRight className="ml-2"/>
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
