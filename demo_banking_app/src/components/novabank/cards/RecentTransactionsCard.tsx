import type { FC } from 'react';
import type { Transaction } from '@/components/novabank/HomePage';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RecentTransactionsCardProps = {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
};

export const RecentTransactionsCard: FC<RecentTransactionsCardProps> = ({ transactions, onTransactionClick }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
      <Card className="shadow-md">
        <CardContent className="p-0">
          {transactions.map((tx, index) => (
            <button key={tx.id} className="w-full text-left transition-colors hover:bg-accent/50 active:bg-accent/60" onClick={() => onTransactionClick(tx)}>
              <div className="flex items-center p-4">
                <div className="flex-grow">
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-800'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                </p>
              </div>
              {index < transactions.length - 1 && <Separator className="mx-4"/>}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
