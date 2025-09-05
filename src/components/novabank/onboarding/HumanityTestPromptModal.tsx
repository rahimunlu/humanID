import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

type HumanityTestPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: () => void;
};

export function HumanityTestPromptModal({ isOpen, onClose, onStartTest }: HumanityTestPromptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <DialogTitle className="text-2xl font-bold">Sorry, you haven’t completed the Humanity Test.</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Please complete it first.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            onClick={onStartTest}
            className="w-full h-12 bg-orange-500 text-white hover:bg-orange-600 rounded-full text-lg font-semibold animate-bounce shadow-lg transition-transform active:scale-95"
          >
            Start Humanity Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
