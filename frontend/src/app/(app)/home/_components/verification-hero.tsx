"use client";

import { useState, useEffect } from 'react';
import { Share2, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAccount } from 'wagmi';
import { GolemBaseClient, GenericBytes } from 'golem-base-sdk';

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
  const { toast } = useToast();
  const { address } = useAccount();
  const [isProofModalOpen, setProofModalOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatestVerification = async () => {
    setIsLoading(true);
    try {
      // Use connected wallet address, fallback to hardcoded for testing
      const targetUserId = address || '0x1bc868c8C92B7fD35900f6d687067748ADbd8571';
      
      console.log('🔍 Connecting directly to Golem DB for user:', targetUserId);
      
      // Connect directly to Golem DB
      const GOLEM_DB_RPC = "https://ethwarsaw.holesky.golemdb.io/rpc";
      const GOLEM_DB_WSS = "wss://ethwarsaw.holesky.golemdb.io/rpc/ws";
      const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Default for testing
      
      if (!PRIVATE_KEY) {
        throw new Error('Private key not configured for Golem DB connection');
      }
      
      // Create Golem DB client
      const client = await GolemBaseClient.create_rw_client(
        GOLEM_DB_RPC,
        GOLEM_DB_WSS,
        PRIVATE_KEY
      );
      
      console.log('✅ Connected to Golem DB, searching for user_id:', targetUserId);
      
      // Get account address (our writer address)
      const writerAddress = client.get_account_address();
      console.log('📝 Writer address:', writerAddress);
      
      // Get all entities owned by this account
      const entityKeys = await client.get_entities_of_owner(writerAddress);
      console.log(`🔍 Found ${entityKeys.length} entities owned by writer`);
      
      let latestVerification: any = null;
      let latestTimestamp: string | null = null;
      
      // Search through all entities for matching user_id
      for (const entityKey of entityKeys) {
        try {
          // Get metadata to check annotations
          const metadata = await client.get_entity_metadata(entityKey);
          
          // Check if this entity matches our user_id and is a humanity verification
          let isTargetUser = false;
          let isHumanityVerification = false;
          let entityTimestamp: string | null = null;
          
          for (const annotation of metadata.string_annotations) {
            if (annotation.key === "user_id" && annotation.value === targetUserId) {
              isTargetUser = true;
            } else if (annotation.key === "recordType" && annotation.value === "humanity_verification") {
              isHumanityVerification = true;
            } else if (annotation.key === "timestamp") {
              entityTimestamp = annotation.value;
            }
          }
          
          // If this matches our criteria and is newer than current latest
          if (isTargetUser && isHumanityVerification && entityTimestamp) {
            if (!latestTimestamp || entityTimestamp > latestTimestamp) {
              console.log(`📅 Found newer verification: ${entityTimestamp}`);
              
              // Get the full entity data
              const entityKeyHex = entityKey.as_hex_string();
              const storageValue = await client.get_storage_value(GenericBytes.from_hex_string(entityKeyHex));
              
              if (storageValue) {
                // Decode the JSON data
                const entityData = JSON.parse(storageValue.toString());
                
                // Collect all annotations
                const annotations: { [key: string]: string } = {};
                for (const annotation of metadata.string_annotations) {
                  annotations[annotation.key] = annotation.value;
                }
                
                // Update latest verification
                latestVerification = {
                  ...entityData,
                  entity_key: entityKeyHex,
                  annotations: annotations,
                  source: 'golem_db_direct'
                };
                latestTimestamp = entityTimestamp;
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error processing entity ${entityKey.as_hex_string()}:`, error);
          continue;
        }
      }
      
      if (latestVerification) {
        console.log('✅ Found latest verification:', latestVerification);
        setVerificationData(latestVerification);
      } else {
        throw new Error(`No verification found for user ${targetUserId}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching verification from Golem DB:', error);
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
                <DialogTitle>🔗 Direct Golem DB Verification</DialogTitle>
                <DialogDescription>Real-time data: Connected directly to Golem DB blockchain, searching by user_id annotation for latest verification with full metadata</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Connecting directly to Golem DB blockchain...</span>
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
