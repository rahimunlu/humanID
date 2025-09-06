"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ArrowDown, Send, Repeat } from 'lucide-react';
import { useAppContext } from '@/lib/context';
import { useToast } from "@/hooks/use-toast";

export function WalletSummary() {
  const { walletAddress, walletBalance } = useAppContext();
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

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Clicked`,
      description: `This is a mock action.`,
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <div className="flex items-center justify-between gap-2">
            <CardDescription className="font-mono text-xs truncate">{walletAddress}</CardDescription>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyAddress}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{walletBalance} ETH</span>
            <span className="text-sm text-muted-foreground">Sepolia Testnet</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
            <Button variant="outline" onClick={() => handleQuickAction('Receive')}>
                <ArrowDown className="mr-2 h-4 w-4" /> Receive
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('Send')}>
                <Send className="mr-2 h-4 w-4" /> Send
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('Switch Network')}>
                <Repeat className="mr-2 h-4 w-4" /> Switch
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
