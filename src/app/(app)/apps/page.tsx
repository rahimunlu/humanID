"use client";

import { useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppConnectModal from './_components/app-connect-modal';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const apps = [
  { name: 'Finance App', description: 'Personal finance & budgeting', image: 'https://picsum.photos/seed/finance/400/200', hint: 'finance abstract', connected: true },
  { name: 'Healthcare Portal', description: 'Access your health records', image: 'https://picsum.photos/seed/health/400/200', hint: 'healthcare abstract', connected: false },
  { name: 'DeFi Exchange', description: 'Trade crypto assets', image: 'https://picsum.photos/seed/exchange/400/200', hint: 'crypto abstract', connected: false },
  { name: 'Social Platform', description: 'Verified social networking', image: 'https://picsum.photos/seed/social/400/200', hint: 'social abstract', connected: true },
  { name: 'Gaming Hub', description: 'Play and earn rewards', image: 'https://picsum.photos/seed/gaming/400/200', hint: 'gaming abstract', connected: false },
  { name: 'Travel Booker', description: 'Book flights and hotels', image: 'https://picsum.photos/seed/travel/400/200', hint: 'travel abstract', connected: false },
];

type App = typeof apps[0];

export default function AppsPage() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [filter, setFilter] = useState('all');

  const filteredApps = apps.filter(app => {
    if (filter === 'connected') return app.connected;
    return true;
  });

  return (
    <div className="p-4 md:p-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Apps</h1>
        <p className="text-muted-foreground mt-1">
          Use your verified wallet anywhere.
        </p>
      </header>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search apps..." className="pl-10" />
        </div>
        <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="connected">Connected</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <Card 
            key={app.name} 
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
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
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{app.name}</CardTitle>
                {app.connected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full pt-0">
              <p className="text-sm text-muted-foreground flex-grow mb-4">{app.description}</p>
              <Button 
                className="w-full mt-auto transition-transform active:scale-95" 
                variant={app.connected ? "outline" : "default"}
                onClick={() => setSelectedApp(app)}
              >
                {app.connected ? "Open" : "Connect"}
              </Button>
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
