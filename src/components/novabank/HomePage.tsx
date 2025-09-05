"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/novabank/Header';
import { BottomNav } from '@/components/novabank/BottomNav';
import { QuickActionsSheet } from '@/components/novabank/sheets/QuickActionsSheet';
import { NotificationsPanel } from '@/components/novabank/sheets/NotificationsPanel';
import { ProfileModal } from '@/components/novabank/modals/ProfileModal';
import { VerificationModal } from '@/components/novabank/modals/VerificationModal';
import { RewardModal } from '@/components/novabank/modals/RewardModal';
import { VerificationInfoModal } from '@/components/novabank/modals/VerificationInfoModal';
import { TransactionDetailModal } from '@/components/novabank/modals/TransactionDetailModal';
import { AccountOpeningCard } from '@/components/novabank/cards/AccountOpeningCard';
import { VerifiedHumanCard } from '@/components/novabank/cards/VerifiedHumanCard';
import { BalanceCard } from '@/components/novabank/cards/BalanceCard';
import { QuickActionButtons } from '@/components/novabank/QuickActionButtons';
import { RecentTransactionsCard } from '@/components/novabank/cards/RecentTransactionsCard';
import { StatusGrid } from '@/components/novabank/cards/StatusGrid';
import { Confetti } from './Confetti';

// Mock data
const MOCK_TRANSACTIONS = [
  { id: 1, type: 'credit' as const, description: 'Salary', amount: 2500, date: 'October 26, 2023' },
  { id: 2, type: 'debit' as const, description: 'Groceries', amount: 80, date: 'October 25, 2023' },
  { id: 3, type: 'debit' as const, description: 'Coffee', amount: 6, date: 'October 24, 2023' },
];
export type Transaction = typeof MOCK_TRANSACTIONS[0];


export default function HomePage() {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isNotificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [isQuickActionsSheetOpen, setQuickActionsSheetOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [isAccountCreated, setAccountCreated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRewardModalOpen, setRewardModalOpen] = useState(false);
  const [isVerificationInfoModalOpen, setVerificationInfoModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleVerificationSuccess = () => {
    setVerificationModalOpen(false);
    setTimeout(() => {
      setAccountCreated(true);
      setShowConfetti(true);
      const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(confettiTimer);
    }, 500);
  };
  
  return (
    <div className="bg-gray-100 font-body">
      <main className="relative mx-auto flex min-h-screen max-w-lg flex-col bg-background shadow-2xl">
        {showConfetti && <Confetti />}
        
        <ProfileModal open={isProfileModalOpen} onOpenChange={setProfileModalOpen} />
        <NotificationsPanel open={isNotificationsPanelOpen} onOpenChange={setNotificationsPanelOpen} />
        <QuickActionsSheet open={isQuickActionsSheetOpen} onOpenChange={setQuickActionsSheetOpen} />
        <VerificationModal open={isVerificationModalOpen} onOpenChange={setVerificationModalOpen} onVerify={handleVerificationSuccess} />
        <RewardModal open={isRewardModalOpen} onOpenChange={setRewardModalOpen} />
        <VerificationInfoModal open={isVerificationInfoModalOpen} onOpenChange={setVerificationInfoModalOpen} />
        <TransactionDetailModal transaction={selectedTransaction} onOpenChange={() => setSelectedTransaction(null)} />

        <div className="flex-grow space-y-6 overflow-y-auto px-4 pb-32 pt-6 sm:px-6">
          <Header onAvatarClick={() => setProfileModalOpen(true)} onNotificationsClick={() => setNotificationsPanelOpen(true)} unreadNotifications={1} />
          
          <div style={{ animationDelay: '0.1s' }} className="animate-slide-up-fade-in">
            {!isAccountCreated ? (
              <AccountOpeningCard onOpenAccount={() => setVerificationModalOpen(true)} />
            ) : (
              <VerifiedHumanCard />
            )}
          </div>

          <div style={{ animationDelay: '0.2s' }} className="animate-slide-up-fade-in">
            <BalanceCard balance={2450.00} />
          </div>

          <div style={{ animationDelay: '0.3s' }} className="animate-slide-up-fade-in">
            <QuickActionButtons />
          </div>

          <div style={{ animationDelay: '0.4s' }} className="animate-slide-up-fade-in">
            <RecentTransactionsCard transactions={MOCK_TRANSACTIONS} onTransactionClick={setSelectedTransaction} />
          </div>
          
          <div style={{ animationDelay: '0.5s' }} className="animate-slide-up-fade-in">
            <StatusGrid onRewardClick={() => setRewardModalOpen(true)} onVerifyInfoClick={() => setVerificationInfoModalOpen(true)} />
          </div>
        </div>
        
        <BottomNav onQuickActionsClick={() => setQuickActionsSheetOpen(true)} />
      </main>
    </div>
  );
}
