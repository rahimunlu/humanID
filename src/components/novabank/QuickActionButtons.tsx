"use client"

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, CornerDownLeft } from "lucide-react";

export function QuickActionButtons() {
  const { toast } = useToast();

  const handleSendMoney = () => {
    toast({
      title: 'Transaction Completed ✅',
      description: 'Your transfer was successful.',
    });
  };

  const handleRequestMoney = () => {
    toast({
      title: 'Request Sent!',
      description: 'A request has been sent. ✅',
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="secondary" size="lg" className="h-16 text-lg font-semibold transition-transform active:scale-95" onClick={handleSendMoney}>
        <Send className="mr-2 h-5 w-5" /> Send
      </Button>
      <Button variant="accent" size="lg" className="h-16 text-lg font-semibold transition-transform active:scale-95" onClick={handleRequestMoney}>
        <CornerDownLeft className="mr-2 h-5 w-5" /> Request
      </Button>
    </div>
  );
}
