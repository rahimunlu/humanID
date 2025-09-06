"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/lib/context';
import { useToast } from "@/hooks/use-toast";
import Confetti from '@/components/confetti';

export const dynamic = 'force-dynamic';

export default function IndexingPage() {
  const { isVerified, setIsIndexed } = useAppContext();
  const [isIndexing, setIsIndexing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isVerified) {
      router.push('/verify');
    }
  }, [isVerified, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIndexing(false);
      setIsIndexed(true);
      toast({
        title: "Success!",
        description: "Your wallet has been indexed as a Verified Human.",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [setIsIndexed, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/50">
      {isIndexing ? (
        <Card className="w-full max-w-sm text-center shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <h2 className="text-2xl font-semibold">Publishing to chain...</h2>
              <p className="text-muted-foreground">Your proof is being indexed on-chain. Please wait.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Confetti />
          <Card className="w-full max-w-sm text-center shadow-lg animate-fade-in">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-semibold">Verification Indexed!</h2>
                <p className="text-muted-foreground">Your wallet is now recognized as a Verified Human across supported apps.</p>
                <Button size="lg" className="w-full mt-4 transition-transform active:scale-95" onClick={() => router.push('/home')}>
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


