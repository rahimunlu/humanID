import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AccountOpeningCardProps = {
  onOpenAccount: () => void;
};

export const AccountOpeningCard: FC<AccountOpeningCardProps> = ({ onOpenAccount }) => {
  return (
    <Card className="bg-accent text-accent-foreground shadow-sm">
      <CardContent className="p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold">Open your NovaBank account</h2>
        <p className="text-accent-foreground/80">Experience modern, secure banking in minutes with decentralized identity verification.</p>
        <Button size="lg" className="w-full bg-background text-foreground hover:bg-background/90 transition-transform active:scale-95 shadow-md" onClick={onOpenAccount}>
          Open Secure Account
        </Button>
      </CardContent>
    </Card>
  );
};
