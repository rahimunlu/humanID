import type { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";

type BalanceCardProps = {
  balance: number;
};

export const BalanceCard: FC<BalanceCardProps> = ({ balance }) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <p className="text-muted-foreground">Total Balance</p>
        <p className="text-4xl font-bold tracking-tighter">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
        </p>
      </CardContent>
    </Card>
  );
};
