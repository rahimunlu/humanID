"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/lib/context';
import { useToast } from "@/hooks/use-toast";
import { shareVerificationStatus } from '@/ai/flows/share-verification-status';

export default function HomePage() {
  const { isIndexed, walletAddress, walletBalance } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isIndexed) {
      router.push('/wallet');
    }
  }, [isIndexed, router]);

  const handleShare = async () => {
    if (!walletAddress) return;
    setIsSharing(true);
    try {
      // This is a mocked call to the GenAI flow
      const result = await shareVerificationStatus({ walletAddress });
      navigator.clipboard.writeText(result.shareableCode);
      toast({
        title: "Copied to Clipboard!",
        description: `Shareable Code: ${result.shareableCode}`,
      });
    } catch (error) {
      console.error("Share verification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a shareable code.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const recentActions = [
    { text: 'Proof published to chain', time: '12s ago' },
    { text: 'humanID DNA v0.9 connected', time: '3m ago' },
    { text: 'Wallet created', time: '5m ago' },
  ];

  if (!isIndexed) return null; // Or a loading skeleton

  return (
    <div className="p-4 md:p-6 space-y-8">
      <header className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://picsum.photos/100" data-ai-hint="woman avatar" alt="Maria's avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">maria.eth</p>
        </div>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Wallet Summary</CardTitle>
          <div className="flex justify-between items-center">
            <CardDescription className="truncate font-mono text-xs">{walletAddress}</CardDescription>
            <Badge className="bg-green-100 text-green-800 border-green-200">Verified Human</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex justify-between items-baseline">
          <span className="text-3xl font-bold">{walletBalance} ETH</span>
          <Button variant="ghost" size="icon" onClick={handleShare} disabled={isSharing}>
            <Share2 className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Actions</h2>
        <div className="space-y-2">
          {recentActions.map((action, index) => (
            <Card key={index} className="p-3">
              <div className="flex justify-between items-center text-sm">
                <span>{action.text}</span>
                <span className="text-muted-foreground">{action.time}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Link href="/apps" passHref>
        <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-transform active:scale-95">
          Connect to Apps <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
