"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/lib/context';
import PairingModal from './_components/pairing-modal';
import { Logo } from '@/components/logo';
import { dnaSequencingService, DNASequencingRequest, SequencingStatus } from '@/lib/dna-sequencing';

export default function DevicePage() {
  const { walletConnected, deviceConnected, setDeviceConnected, walletAddress } = useAppContext();
  const [isPairingModalOpen, setPairingModalOpen] = useState(false);
  const [isSequencingLoading, setIsSequencingLoading] = useState(false);
  const [sequencingStatus, setSequencingStatus] = useState<SequencingStatus | null>(null);
  const [sequencingError, setSequencingError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if wallet is not connected, protecting the route.
    if (!walletConnected) {
      router.push('/wallet');
    }
  }, [walletConnected, router]);

  const handleStartDNAVerification = async () => {
    if (!walletAddress) {
      setSequencingError("Wallet address is required to start DNA verification");
      return;
    }

    if (!deviceConnected) {
      setSequencingError("Device must be connected to start DNA verification");
      return;
    }

    setIsSequencingLoading(true);
    setSequencingError(null);

    try {
      const request: DNASequencingRequest = {
        user_id: walletAddress,
        custodian: "HumanID Custodian",
        custodian_endpoint: "https://custodian.humanid.com/verify",
        expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };

      const result = await dnaSequencingService.startSequencing(request);
      
      if (result.success) {
        // Start polling for status updates
        const stopPolling = await dnaSequencingService.pollStatus(
          walletAddress,
          (newStatus) => {
            setSequencingStatus(newStatus);
            
            // If completed successfully, navigate to verify page
            if (newStatus.status === 'completed') {
              setTimeout(() => {
                router.push('/verify');
              }, 2000); // Wait 2 seconds to show completion status
            }
          }
        );

        // Store stop function for cleanup if needed
        (window as any).stopDNASequencingPolling = stopPolling;
      } else {
        setSequencingError(result.message);
      }
    } catch (err) {
      setSequencingError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSequencingLoading(false);
    }
  };

  const getSequencingStatusIcon = () => {
    if (!sequencingStatus) return "🧬";
    
    switch (sequencingStatus.status) {
      case 'completed':
        return "✅";
      case 'failed':
        return "❌";
      case 'processing':
        return "⏳";
      case 'queued':
        return "⏰";
      default:
        return "🧬";
    }
  };

  const getSequencingStatusColor = () => {
    if (!sequencingStatus) return "default";
    
    switch (sequencingStatus.status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'queued':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "default";
    }
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800">humanID DNA v0.9</Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
                  <XCircle className="h-16 w-16" />
                  <p className="font-semibold">Not Connected</p>
                </div>
              )}
              
              {!deviceConnected && (
                <Button size="lg" className="w-full transition-transform active:scale-95" onClick={() => setPairingModalOpen(true)}>
                  Pair Device
                </Button>
              )}
            </CardContent>
          </Card>

          {/* DNA Sequencing Status Card */}
          {sequencingStatus && (
            <Card className="text-left shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{getSequencingStatusIcon()}</span>
                  DNA Sequencing Status
                </CardTitle>
                <CardDescription>Real-time status of your DNA verification process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getSequencingStatusColor()}>
                    {sequencingStatus.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sequencingStatus.message}
                </p>
                {sequencingStatus.result_file && (
                  <p className="text-xs text-muted-foreground">
                    Result file: {sequencingStatus.result_file}
                  </p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>User ID:</strong> {sequencingStatus.user_id}</p>
                  <p><strong>Timestamp:</strong> {new Date(sequencingStatus.timestamp).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {sequencingError && (
            <Card className="text-left shadow-lg border-red-200">
              <CardContent className="pt-6">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{sequencingError}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button
            size="lg"
            className="w-full transition-transform active:scale-95 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!deviceConnected || isSequencingLoading || sequencingStatus?.status === 'processing' || sequencingStatus?.status === 'completed'}
            onClick={handleStartDNAVerification}
          >
            {isSequencingLoading ? (
              <>
                <span className="mr-2">⏳</span>
                Starting DNA Analysis...
              </>
            ) : sequencingStatus?.status === 'completed' ? (
              <>
                <span className="mr-2">✅</span>
                DNA Verification Complete
              </>
            ) : sequencingStatus?.status === 'processing' ? (
              <>
                <span className="mr-2">⏳</span>
                Processing DNA...
              </>
            ) : sequencingStatus?.status === 'queued' ? (
              <>
                <span className="mr-2">⏰</span>
                DNA Analysis Queued...
              </>
            ) : (
              <>
                <span className="mr-2">🧬</span>
                Start DNA Verification
              </>
            )}
          </Button>
        </div>
      </div>
      
      <PairingModal isOpen={isPairingModalOpen} onOpenChange={setPairingModalOpen} />
    </div>
  );
}
