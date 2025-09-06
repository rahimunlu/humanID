"use client";

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppConnectModal from './_components/app-connect-modal';
import Image from 'next/image';

const apps = [
  { name: 'Finance App', description: 'Personal finance & budgeting', image: 'https://picsum.photos/seed/finance/400/200', hint: 'finance abstract' },
  { name: 'Healthcare Portal', description: 'Access your health records', image: 'https://picsum.photos/seed/health/400/200', hint: 'healthcare abstract' },
  { name: 'DeFi Exchange', description: 'Trade crypto assets', image: 'https://picsum.photos/seed/exchange/400/200', hint: 'crypto abstract' },
  { name: 'Social Platform', description: 'Verified social networking', image: 'https://picsum.photos/seed/social/400/200', hint: 'social abstract' },
];

type App = typeof apps[0];

export default function AppsPage() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-center flex-1">Connect to Apps</h1>
        <div className="w-10"></div>
      </header>
      
      <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
        Your Verified Human status allows you to instantly satisfy KYC requirements for supported apps.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Card 
            key={app.name} 
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            onClick={() => setSelectedApp(app)}
          >
            <div className="relative h-32">
              <Image 
                src={app.image} 
                alt={app.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={app.hint}
              />
            </div>
            <CardHeader>
              <CardTitle>{app.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{app.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <AppConnectModal 
        isOpen={!!selectedApp} 
        onOpenChange={() => setSelectedApp(null)}
        app={selectedApp}
      />
    </div>
  );
}
