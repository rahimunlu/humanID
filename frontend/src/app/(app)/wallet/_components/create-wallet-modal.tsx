"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function CreateWalletModal({ isOpen, onOpenChange }: Props) {
  const { setWalletConnected, setWalletAddress, setWalletBalance } = useAppContext();

  const handleCreate = () => {
    // Generate a mock address
    const mockAddress = `0x${[...Array(4)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...${[...Array(4)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setWalletAddress(mockAddress.replace('0x', '0xA3...').slice(0, 10) + 'F1B');
    setWalletBalance(0.42);
    setWalletConnected(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
          <DialogDescription>
            A new secure wallet will be generated for you.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              In a real application, you would be shown a secret seed phrase. You must store it securely. For this demo, we'll skip that step.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleCreate}>I Understand, Create Wallet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
