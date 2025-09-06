"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/context";
import { useAccount, useBalance, useConnect } from "wagmi";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function ConnectWalletModal({ isOpen, onOpenChange }: Props) {
  const { setWalletConnected, setWalletAddress, setWalletBalance } = useAppContext();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, isPending } = useConnect();

  // Update app context when wallet connects
  React.useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      setWalletConnected(true);
      if (balance) {
        setWalletBalance(parseFloat(balance.formatted));
      }
      onOpenChange(false);
    }
  }, [isConnected, address, balance, setWalletAddress, setWalletConnected, setWalletBalance, onOpenChange]);

  const handleConnect = (connector: any) => {
    connect({ connector });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to your HumanID. This will connect to Sepolia testnet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              className="justify-start h-14 text-base"
              onClick={() => handleConnect(connector)}
              disabled={isPending}
            >
              {connector.name}
            </Button>
          ))}
          <div className="text-center text-sm text-muted-foreground">
            <p>Make sure you have a wallet extension installed (like MetaMask)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
