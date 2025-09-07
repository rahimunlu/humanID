"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, ArrowRight, CheckCircle, QrCode, ArrowDown, Send, Repeat, Wallet as WalletIcon, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/lib/context';
import ConnectWalletModal from './_components/connect-wallet-modal';
import CreateWalletModal from './_components/create-wallet-modal';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";

const transactions = [
  { type: 'Sent', to: '0x123...abc', amount: '-0.05 ETH', time: '2h ago', status: 'Confirmed', icon: ArrowRight, color: 'text-red-500' },
  { type: 'Received', from: '0x456...def', amount: '+0.1 ETH', time: '1d ago', status: 'Confirmed', icon: ArrowDown, color: 'text-green-500'},
  { type: 'Connected', to: 'Finance App', amount: '', time: '3d ago', status: 'Completed', icon: CheckCircle, color: 'text-blue-500' },
  { type: 'Sent', to: '0x789...ghi', amount: '-0.01 ETH', time: '5d ago', status: 'Confirmed', icon: ArrowRight, color: 'text-red-500' },
];


export default function WalletPage() {
  const { walletConnected, walletAddress, walletBalance, isIndexed } = useAppContext();
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isReceiveSheetOpen, setReceiveSheetOpen] = useState(false);
  const [isSendSheetOpen, setSendSheetOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // RainbowKit hooks
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // This page serves as the entry point if wallet is not connected,
    // or as the wallet tab if it is.
  }, [walletConnected, isIndexed, router]);

  const handleCopyAddress = () => {
    const addressToCopy = address || walletAddress;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet.",
    });
  };
  
  const handleSend = () => {
    setSendSheetOpen(false);
    toast({
      title: "Transaction Sent!",
      description: "Your transaction has been submitted.",
    });
  }

  if (!walletConnected || !isIndexed) {
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
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span className="font-mono text-sm truncate">{walletAddress}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-4xl font-bold">${walletBalance.toFixed(2)}</div>
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

  return (
    <div className="p-4 md:p-6 pb-24 space-y-6">
       <header className="flex items-center">
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
      </header>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{chain?.name || 'Sepolia Testnet'}</span>
             <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5">
                <CheckCircle className="h-3 w-3" />
                Connected
            </Badge>
          </div>
          <div className="text-4xl font-bold pt-2">{balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} {balance?.symbol || 'ETH'}</div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <span className="font-mono">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...'}</span>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => setReceiveSheetOpen(true)}>
                <ArrowDown className="mr-2 h-4 w-4" /> Receive
            </Button>
            <Button variant="outline" onClick={() => setSendSheetOpen(true)}>
                <Send className="mr-2 h-4 w-4" /> Send
            </Button>
            <Button variant="outline" onClick={handleDisconnect}>
                <MoreVertical className="mr-2 h-4 w-4" /> Disconnect
            </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <div className="space-y-2">
          {transactions.map((tx, i) => {
            const Icon = tx.icon;
            return (
              <Card key={i} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toast({title: "Transaction Details", description: "This is a mock view."})}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-muted/50`}>
                    <Icon className={`h-5 w-5 ${tx.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{tx.type} {tx.type !== 'Connected' && 'ETH'}</p>
                    <p className="text-sm text-muted-foreground">{tx.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-medium ${tx.color}`}>{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
      
      <Sheet open={isReceiveSheetOpen} onOpenChange={setReceiveSheetOpen}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Receive ETH</SheetTitle>
                <SheetDescription>Scan the QR code or copy the address below.</SheetDescription>
            </SheetHeader>
            <div className="py-8 flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-lg border">
                    <QrCode className="h-40 w-40 text-foreground" />
                </div>
                <div className="w-full text-center p-3 bg-muted rounded-md">
                    <span className="font-mono text-sm break-all">{address || walletAddress}</span>
                </div>
                <Button className="w-full" onClick={handleCopyAddress}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </Button>
            </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isSendSheetOpen} onOpenChange={setSendSheetOpen}>
        <SheetContent className="flex flex-col">
            <SheetHeader>
                <SheetTitle>Send ETH</SheetTitle>
                <SheetDescription>Enter the amount and recipient address.</SheetDescription>
            </SheetHeader>
            <div className="py-4 flex-grow space-y-4">
                <div>
                    <Label htmlFor="send-address">Recipient Address</Label>
                    <Input id="send-address" placeholder="0x..." />
                </div>
                 <div>
                    <Label htmlFor="send-amount">Amount</Label>
                    <Input id="send-amount" type="number" placeholder="0.0" />
                </div>
            </div>
            <SheetFooter>
                <Button className="w-full" onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
}
