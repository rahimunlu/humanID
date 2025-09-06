"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Terminal from './_components/terminal';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function VerifyPage() {
  const { isVerified, setIsVerified, deviceConnected } = useAppContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!deviceConnected) {
      router.push('/device');
    }
  }, [deviceConnected, router]);
  
  const onVerificationComplete = () => {
    setIsVerified(true);
    setTimeout(() => {
      setShowSuccess(true);
    }, 500);
  };
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-muted">
        <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-4 text-primary-foreground">Humanity Test</h1>
        <p className="text-lg lg:text-xl text-muted-foreground">
          {showSuccess ? "Verification successful." : "Collecting DNA sample (e.g., saliva)... please wait."}
        </p>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0B1220]">
        {!showSuccess ? (
          <Terminal onComplete={onVerificationComplete} />
        ) : (
          <div className="text-center text-white/90 p-8 rounded-lg flex flex-col items-center gap-6 animate-fade-in">
            <CheckCircle className="h-24 w-24 text-green-400 animate-bounce" />
            <h2 className="text-4xl font-bold text-white">You are Human ✅</h2>
            <Button 
              size="lg" 
              className="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold w-full max-w-xs transition-transform active:scale-95"
              onClick={() => router.push('/index')}
            >
              Index Wallet as Verified
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
