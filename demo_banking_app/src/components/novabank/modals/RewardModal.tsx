import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BadgeCheck } from 'lucide-react';

type RewardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const RewardModal: FC<RewardModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center text-center">
          <div className="bg-accent rounded-full p-4 mb-4 animate-bounce-in">
            <BadgeCheck className="h-16 w-16 text-accent-foreground" />
          </div>
          <DialogTitle className="text-2xl">Reward Unlocked!</DialogTitle>
          <DialogDescription className="text-base">
            Congratulations! You've earned a <span className="font-semibold text-primary">Free Wire Transfer</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-muted-foreground">Use your reward on your next international transfer. Keep up the great work!</p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">Claim Reward</Button>
      </DialogContent>
    </Dialog>
  );
};
