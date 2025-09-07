"use client";

import { useState, useEffect } from 'react';
import { Share2, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';

interface VerificationData {
  verification_id: string;
  user_id: string;
  humanity_score: number;
  timestamp: string;
  entity_key?: string;
  annotations?: {
    [key: string]: string;
  };
  external_kyc_document_id?: string;
  file_hash?: string;
  verification_type?: string;
  schema?: string;
  app?: string;
  record_type?: string;
  written_by?: string;
}

export function VerificationHero() {
  console.log('🚀 VerificationHero component loaded - DIRECT GOLEM DB VERSION - v2.0');
  
  const { toast } = useToast();
  const { address } = useAccount();
  const [isProofModalOpen, setProofModalOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatestVerification = async () => {
    console.log('🔥 FETCHING FROM NEXT.JS API ROUTE - INTEGRATED SOLUTION!');
    setIsLoading(true);
    try {
      // Use connected wallet address, fallback to hardcoded for testing
      const targetUserId = address || '0x1bc868c8C92B7fD35900f6d687067748ADbd8571';
      
      console.log('🔍 Calling Next.js API route for user:', targetUserId);
      
      // Call local Next.js API route - no external dependencies!
      const response = await fetch(`/api/verification-by-user/${targetUserId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Next.js API response:', data);
      
      if (data.status === 'success' && data.verification) {
        setVerificationData(data.verification);
        console.log('✅ Successfully loaded verification data from integrated API');
        console.log('📊 Verification details:');
        console.log('  Entity Key:', data.verification.entity_key);
        console.log('  User ID:', data.verification.user_id);
        console.log('  Humanity Score:', data.verification.humanity_score);
        console.log('  Timestamp:', data.verification.timestamp);
        console.log('  Source:', data.verification.source);
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      console.error('❌ Error fetching verification:', error);
      toast({
        title: "Error",
        description: `Failed to fetch verification data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setVerificationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestVerification();
  }, [address]); // Refetch when wallet address changes

  const handleShare = () => {
    const mockLink = 'https://bio.chain/verify/maria.eth';
    navigator.clipboard.writeText(mockLink);
    toast({
      title: "Copied to Clipboard!",
      description: "Shareable verification link copied.",
    });
  };

  return (
    <>
      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success-soft rounded-full">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Verified Human</h2>
            <p className="text-xs text-muted-foreground">DNA verified • Proof on-chain</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setProofModalOpen(true)}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            View Proof
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <Dialog open={isProofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>🔗 Golem DB Verification</DialogTitle>
                <DialogDescription>Real-time data: Fetched directly from Golem DB via integrated Next.js API route, showing latest verification with full blockchain metadata and annotations</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Fetching verification data from Golem DB...</span>
                </div>
              ) : verificationData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification ID</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs break-all">
                        {verificationData.verification_id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs break-all">
                        {verificationData.user_id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Humanity Score</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-sm">
                        {(verificationData.humanity_score * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs">
                        {new Date(verificationData.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entity Key (Golem DB)</label>
                    <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
                      {verificationData.entity_key || 'N/A'}
                    </div>
                  </div>
                  
                  {verificationData.annotations && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">All Annotations</label>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        {Object.entries(verificationData.annotations).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-muted-foreground">{key}:</span>
                            <span className="font-mono break-all ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">KYC Document ID</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs break-all">
                        {verificationData.external_kyc_document_id || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Hash</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs break-all">
                        {verificationData.file_hash || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification Type</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs">
                        {verificationData.verification_type || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Schema Version</label>
                      <div className="bg-muted p-2 rounded-md font-mono text-xs">
                        {verificationData.schema || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Written By (Golem DB Address)</label>
                    <div className="bg-muted p-2 rounded-md font-mono text-xs break-all">
                      {verificationData.written_by || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (verificationData.entity_key) {
                          navigator.clipboard.writeText(verificationData.entity_key);
                          toast({
                            title: "Copied!",
                            description: "Entity key copied to clipboard.",
                          });
                        }
                      }}
                    >
                      Copy Entity Key
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        fetchLatestVerification();
                        toast({
                          title: "Refreshed!",
                          description: "Latest verification fetched from Golem DB.",
                        });
                      }}
                    >
                      🔄 Refresh Direct from Golem DB
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No verification data found
                </div>
              )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
