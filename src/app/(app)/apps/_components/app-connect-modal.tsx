"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

type App = {
  name: string;
  description: string;
  image: string;
} | null;

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  app: App;
};

export default function AppConnectModal({ isOpen, onOpenChange, app }: Props) {
  const { toast } = useToast();

  const handleApprove = () => {
    toast({
      title: "Connection Successful!",
      description: `Connected to ${app?.name} - KYC satisfied via BioChain.`,
    });
    onOpenChange(false);
  };

  if (!app) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {app.name}</DialogTitle>
          <DialogDescription>
            This app is requesting permission to verify your identity.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            By approving, you'll share your "Verified Human" status with {app.name}, instantly satisfying their identity verification requirements.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Verified Human Status</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleApprove}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
