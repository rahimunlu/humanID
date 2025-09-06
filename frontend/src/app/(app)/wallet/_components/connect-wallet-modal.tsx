"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/context";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function ConnectWalletModal({ isOpen, onOpenChange }: Props) {
  const { setWalletConnected, setWalletAddress, setWalletBalance } = useAppContext();

  const handleConnect = (type: 'injected' | 'demo') => {
    // In a real app, this would involve libraries like ethers.js or wagmi
    setWalletAddress(type === 'demo' ? '0xA3f...9F1B' : '0xDemo...c4aD');
    setWalletBalance(0.42);
    setWalletConnected(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to your BioChain ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button variant="outline" className="justify-start h-14 text-base" onClick={() => handleConnect('injected')}>
            Injected Wallet (e.g. MetaMask)
          </Button>
          <Button variant="outline" className="justify-start h-14 text-base" onClick={() => handleConnect('demo')}>
            Demo Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
