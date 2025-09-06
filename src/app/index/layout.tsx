import React from 'react';

export default function IndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}
