import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from 'lucide-react';

type VerificationInfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const VerificationInfoModal: FC<VerificationInfoModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <DialogTitle>You are a Verified Human</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Secure banking without traditional KYC.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <p className="text-muted-foreground">Your account is secured through decentralized human verification. This revolutionary method confirms you are a unique, live human without requiring you to upload sensitive documents like passports or driver's licenses.</p>
            <p className="font-medium text-foreground">Enjoy enhanced privacy and a seamless banking experience.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
