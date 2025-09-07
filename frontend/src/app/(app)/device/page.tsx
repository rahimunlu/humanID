"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/lib/context';
import PairingModal from './_components/pairing-modal';
import { useToast } from '@/hooks/use-toast';

export default function DevicePage() {
  const { walletConnected, deviceConnected, setDeviceConnected } = useAppContext();
  const [isPairingModalOpen, setPairingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if wallet is not connected, protecting the route.
    if (!walletConnected) {
      router.push('/wallet');
    }
  }, [walletConnected, router]);

  const handlePairDevice = () => {
    setIsLoading(true);
    setPairingModalOpen(true);
    // Reset loading state when modal closes
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleDeviceConnected = () => {
    setDeviceConnected(true);
    toast({
      title: "Device Connected Successfully",
      description: "Your humanID DNA device is now ready for verification.",
    });
  };

  return (
    <div className="p-4 md:p-6 min-h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center font-semibold">Connect Device</div>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-sm space-y-6">
          <Card className="text-left shadow-lg">
            <CardHeader>
              <CardTitle>DNA Device</CardTitle>
              <CardDescription>Pair your humanID hardware to begin verification.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {deviceConnected ? (
                <div className="flex flex-col items-center text-center gap-2 text-green-600">
                  <CheckCircle2 className="h-16 w-16" />
                  <p className="font-semibold">Device Connected</p>
                  <Badge className="bg-green-100 text-green-800">humanID DNA v0.9</Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
                  <XCircle className="h-16 w-16" />
                  <p className="font-semibold">Not Connected</p>
                </div>
              )}
              
              {!deviceConnected && (
                <Button 
                  size="lg" 
                  className="w-full transition-transform active:scale-95" 
                  onClick={handlePairDevice}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Pairing...
                    </>
                  ) : (
                    'Pair Device'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Link href="/verify" passHref>
            <Button
              size="lg"
              className="w-full transition-transform active:scale-95 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!deviceConnected}
            >
              Start DNA Verification
            </Button>
          </Link>
        </div>
      </div>
      
      <PairingModal 
        isOpen={isPairingModalOpen} 
        onOpenChange={setPairingModalOpen}
        onDeviceConnected={handleDeviceConnected}
      />
    </div>
  );
}
