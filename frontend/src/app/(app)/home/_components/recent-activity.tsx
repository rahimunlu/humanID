"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Wallet, Link2, CheckCircle, ArrowRight } from 'lucide-react';

const activities = [
  {
    icon: CheckCircle,
    text: 'Wallet indexed as Verified Human',
    time: '12s ago',
    details: {
      type: 'On-Chain Event',
      transaction: '0x123...abc',
      status: 'Confirmed',
    },
  },
  {
    icon: Link2,
    text: 'Connected to Finance App',
    time: '3m ago',
    details: {
      type: 'App Connection',
      appName: 'Finance App',
      permissions: 'Verified Human Status',
    },
  },
  {
    icon: Wallet,
    text: 'Wallet created',
    time: '5m ago',
    details: {
      type: 'Wallet Action',
      action: 'Wallet Creation',
      network: 'Sepolia Testnet',
    },
  },
];

type Activity = typeof activities[0];

export function RecentActivity() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3">
          {activities.map((activity, index) => (
            <button
              key={index}
              onClick={() => setSelectedActivity(activity)}
              className="flex items-center w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 bg-muted rounded-full mr-4">
                <activity.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Sheet open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Activity Details</SheetTitle>
            <SheetDescription>
              {selectedActivity?.details.type}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            {selectedActivity && Object.entries(selectedActivity.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono text-right truncate">{value}</span>
                </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
