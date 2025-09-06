import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

type VerificationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
};

export const VerificationModal: FC<VerificationModalProps> = ({ open, onOpenChange, onVerify }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-2xl">Verify with HumanProof</DialogTitle>
          <DialogDescription>
            Confirm you are a real, unique human to open your secure account. No documents needed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-primary/20 rounded-full p-4">
                <ShieldCheck className="h-16 w-16 text-primary" />
            </div>
            <p className="text-muted-foreground text-center text-sm">
                This is a mock verification step. In a real application, the HumanProof SDK would launch here to perform a liveness check.
            </p>
        </div>
        <Button size="lg" onClick={onVerify} className="w-full transition-transform active:scale-95">
          Verify I am Human
        </Button>
      </DialogContent>
    </Dialog>
  );
};
