"use client";

import { useState } from 'react';
import { Share2, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function VerificationHero() {
  const { toast } = useToast();
  const [isProofModalOpen, setProofModalOpen] = useState(false);

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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>On-Chain Proof</DialogTitle>
                <DialogDescription>This is the transaction hash of your on-chain proof.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
                    0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
