import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type HumanityTestCompleteScreenProps = {
  onReturn: () => void;
};

export function HumanityTestCompleteScreen({ onReturn }: HumanityTestCompleteScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="mb-8"
      >
        <CheckCircle className="h-24 w-24 text-green-500" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold mb-4"
      >
        Thank you for verifying your humanity
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={onReturn}
          size="lg"
          className="w-full h-16 bg-green-500 text-white hover:bg-green-600 rounded-full text-xl font-semibold shadow-lg transition-transform active:scale-95"
        >
          You are Human ✅
        </Button>
        <p className="mt-4 text-muted-foreground">Please return to your bank account application.</p>
      </motion.div>
    </div>
  );
}
