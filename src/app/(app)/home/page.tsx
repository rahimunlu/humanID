"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';

import { DashboardHeader } from './_components/dashboard-header';
import { VerificationHero } from './_components/verification-hero';
import { WalletSummary } from './_components/wallet-summary';
import { RecentActivity } from './_components/recent-activity';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { isIndexed } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isIndexed) {
      router.push('/wallet');
    }
  }, [isIndexed, router]);

  if (!isIndexed) {
    return (
        <div className="p-4 md:p-6 space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <DashboardHeader />
      <div className="px-4 md:px-6 space-y-6">
        <VerificationHero />
        <WalletSummary />
        <RecentActivity />
      </div>
    </div>
  );
}
