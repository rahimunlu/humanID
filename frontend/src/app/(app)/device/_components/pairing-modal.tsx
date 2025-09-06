"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/context";
import { Loader2, Usb, Bluetooth } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type PairingStatus = 'idle' | 'searching' | 'found' | 'connecting' | 'connected';

export default function PairingModal({ isOpen, onOpenChange }: Props) {
  const { setDeviceConnected } = useAppContext();
  const [status, setStatus] = useState<PairingStatus>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStatus('searching');
      const searchTimer = setTimeout(() => setStatus('found'), 2000);
      return () => clearTimeout(searchTimer);
    } else {
      setStatus('idle');
    }
  }, [isOpen]);

  const handleConnect = () => {
    setStatus('connecting');
    const connectTimer = setTimeout(() => {
      setStatus('connected');
      setDeviceConnected(true);
      toast({
        title: "Device Paired Successfully",
        description: "humanID DNA v0.9 is now connected.",
      });
      setTimeout(() => onOpenChange(false), 1000);
    }, 2000);
    return () => clearTimeout(connectTimer);
  };
  
  const renderContent = () => {
    switch(status) {
      case 'searching':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for devices via USB and Bluetooth...</p>
          </div>
        );
      case 'found':
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">Select device to connect:</p>
            <Button variant="outline" className="justify-between h-16 text-base" onClick={handleConnect}>
              humanID DNA v0.9
              <div className="flex gap-2">
                <Usb className="h-5 w-5" />
                <Bluetooth className="h-5 w-5" />
              </div>
            </Button>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting to humanID DNA v0.9...</p>
          </div>
        );
      case 'connected':
         return (
          <div className="flex flex-col items-center gap-4 text-center">
             <p className="text-lg font-medium text-green-600">Connected!</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pair New Device</DialogTitle>
          <DialogDescription>
            Ensure your device is turned on and nearby.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8 min-h-[150px] flex items-center justify-center">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
