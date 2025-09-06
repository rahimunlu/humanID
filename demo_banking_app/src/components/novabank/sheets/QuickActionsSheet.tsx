import type { FC } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, FileText, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QuickActionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const QuickActionsSheet: FC<QuickActionsSheetProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({ title: `${action} Initiated`, description: "This is a mock action for demonstration." });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-w-lg mx-auto w-full">
        <SheetHeader>
          <SheetTitle>New Action</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button variant="outline" className="h-24 flex-col gap-2 text-base transition-transform active:scale-95" onClick={() => handleAction("Send Money")}>
            <ArrowUpRight className="h-8 w-8 text-secondary" />
            Send Money
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base transition-transform active:scale-95" onClick={() => handleAction("Request Money")}>
            <ArrowDownLeft className="h-8 w-8 text-accent" />
            Request Money
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base transition-transform active:scale-95" onClick={() => handleAction("Pay Bill")}>
            <FileText className="h-8 w-8 text-primary" />
            Pay a Bill
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base transition-transform active:scale-95" onClick={() => handleAction("Mobile Top-up")}>
            <Smartphone className="h-8 w-8 text-yellow-500" />
            Mobile Top-up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
