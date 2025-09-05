import type { FC } from 'react';
import type { Transaction } from '@/components/novabank/HomePage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

type TransactionDetailModalProps = {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
};

export const TransactionDetailModal: FC<TransactionDetailModalProps> = ({ transaction, onOpenChange }) => {
  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Description</span>
            <span className="font-medium">{transaction.description}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className={`font-bold text-lg ${transaction.type === 'credit' ? 'text-green-600' : 'text-gray-800'}`}>
              {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{transaction.date}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">TXN{transaction.id}MOCKDATA</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
