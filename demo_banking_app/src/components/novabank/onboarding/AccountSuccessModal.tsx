import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

type AccountSuccessModalProps = {
  isOpen: boolean;
  onContinue: () => void;
};

export function AccountSuccessModal({ isOpen, onContinue }: AccountSuccessModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold">Thank you, you are human.</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Your account is now open ✅
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            onClick={onContinue}
            className="w-full h-12 text-lg font-semibold transition-transform active:scale-95"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
