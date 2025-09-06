import React from 'react';
import BottomNav from './_components/bottom-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
