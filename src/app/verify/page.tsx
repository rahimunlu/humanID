
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from '@/app/index/_components/confetti';

export default function VerifyPage() {
  const { setIsVerified, deviceConnected } = useAppContext();
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');
  const router = useRouter();

  useEffect(() => {
    if (!deviceConnected) {
      router.push('/device');
    }
  }, [deviceConnected, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerified(true);
      setStatus('success');
    }, 3000); // 3-second mock verification delay

    return () => clearTimeout(timer);
  }, [setIsVerified]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/50">
      {status === 'success' && <Confetti />}
      <Card className="w-full max-w-sm text-center shadow-lg animate-fade-in">
        <CardContent className="p-8">
          {status === 'verifying' ? (
            <div className="flex flex-col items-center gap-4 transition-opacity duration-500">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <h2 className="text-2xl font-semibold">Verifying your DNA…</h2>
              <p className="text-muted-foreground">This may take a moment.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-semibold">You are Human</h2>
              <p className="text-muted-foreground">Your unique human identity has been verified.</p>
              <Button
                size="lg"
                className="w-full mt-4 transition-transform active:scale-95 bg-green-500 hover:bg-green-600 text-primary-foreground"
                onClick={() => router.push('/index')}
              >
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
