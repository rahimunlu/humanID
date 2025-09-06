
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { MoreVertical, CheckCircle, AlertTriangle, Clock, XCircle, HelpCircle, Shield, LogOut, FileText, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { App } from '../page';

type AppCardProps = {
  app: App;
  onConnect: (app: App) => void;
  onOpen: (app: App) => void;
  onDisconnect: (app: App) => void;
  onRetry: (app: App) => void;
};

const statusConfig = {
  Connected: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    action: 'Open',
    dotColor: 'text-green-500',
  },
  'Not Connected': {
    icon: HelpCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    action: 'Connect',
    dotColor: 'text-gray-400',
  },
  'Logged Out': {
    icon: AlertTriangle,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    action: 'Log in',
    dotColor: 'text-amber-500',
  },
  Pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    action: 'Retry',
    dotColor: 'text-yellow-500',
  },
  Error: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    action: 'Retry',
    dotColor: 'text-red-500',
  },
};

export default function AppCard({ app, onConnect, onOpen, onDisconnect, onRetry }: AppCardProps) {
  const config = statusConfig[app.status];

  const handlePrimaryAction = () => {
    switch (app.status) {
      case 'Connected':
        onOpen(app);
        break;
      case 'Not Connected':
      case 'Logged Out':
        onConnect(app);
        break;
      case 'Pending':
      case 'Error':
        onRetry(app);
        break;
    }
  };

  return (
    <Card className="flex flex-col text-center items-center p-4 transition-all duration-200 hover:shadow-lg active:scale-95">
      <div className="relative w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-7 w-7 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Shield className="mr-2" /> Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDisconnect(app)}>
              <LogOut className="mr-2" /> Disconnect
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2" /> Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: app.iconBg }}>
        <span className="text-2xl font-bold" style={{ color: app.iconColor }}>{app.initials}</span>
      </div>

      <p className="text-sm font-semibold truncate w-full">{app.name}</p>
      
      <Badge variant="secondary" className={cn("mt-1 text-xs font-medium", config.color)}>
        <config.icon className={cn("h-3 w-3 mr-1", config.dotColor)} />
        {app.status}
      </Badge>

      <p className="text-xs text-muted-foreground mt-2">{app.lastUsed}</p>

      <Button
        size="sm"
        variant={app.status === 'Connected' ? 'secondary' : 'default'}
        className="w-full mt-4"
        onClick={handlePrimaryAction}
      >
        {config.action}
      </Button>
    </Card>
  );
}
