
"use client";

import { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, CheckCircle, AlertTriangle, Clock, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppConnectModal from './_components/app-connect-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppCard from './_components/app-card';
import { useToast } from '@/hooks/use-toast';

export type AppStatus = 'Connected' | 'Not Connected' | 'Logged Out' | 'Pending' | 'Error';
export type App = {
  name: string;
  status: AppStatus;
  initials: string;
  iconBg: string;
  iconColor: string;
  lastUsed: string;
};

const allApps: App[] = [
  { name: 'Finance App', status: 'Connected', initials: 'FA', iconBg: '#AEE9D1', iconColor: '#052e16', lastUsed: '3m ago' },
  { name: 'Healthcare Portal', status: 'Not Connected', initials: 'HP', iconBg: '#A7D8FF', iconColor: '#072c49', lastUsed: 'Never' },
  { name: 'DeFi Exchange', status: 'Logged Out', initials: 'DE', iconBg: '#FFD8B5', iconColor: '#4f2d05', lastUsed: '2d ago' },
  { name: 'Marketplace', status: 'Pending', initials: 'M', iconBg: '#CDBAFE', iconColor: '#2c1c49', lastUsed: '1h ago' },
  { name: 'Cloud Drive', status: 'Error', initials: 'CD', iconBg: '#FF9AA2', iconColor: '#4c050a', lastUsed: '5h ago' },
  { name: 'Social Platform', status: 'Connected', initials: 'SP', iconBg: '#AEE9D1', iconColor: '#052e16', lastUsed: '1d ago' },
];

const statusFilters: (AppStatus | 'All')[] = ['All', 'Connected', 'Not Connected', 'Logged Out', 'Pending', 'Error'];


export default function AppsPage() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AppStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const { toast } = useToast();

  const filteredAndSortedApps = useMemo(() => {
    let apps = allApps.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeFilter !== 'All') {
      apps = apps.filter(app => app.status === activeFilter);
    }
    
    apps.sort((a, b) => {
        if (sortOrder === 'name-asc') {
            return a.name.localeCompare(b.name);
        }
        if (sortOrder === 'status') {
            return statusFilters.indexOf(a.status) - statusFilters.indexOf(b.status);
        }
        // Add more sorting logic for lastUsed if needed
        return 0;
    });

    return apps;
  }, [searchTerm, activeFilter, sortOrder]);
  
  const handleConnect = (app: App) => setSelectedApp(app);

  const handleOpen = (app: App) => {
    toast({ title: `Opening ${app.name}...`, description: "This is a mock action." });
  };
  
  const handleDisconnect = (app: App) => {
    toast({ title: `Disconnected from ${app.name}`, variant: 'destructive' });
  };
  
  const handleRetry = (app: App) => {
    toast({ title: `Retrying connection for ${app.name}...` });
    setTimeout(() => {
        toast({ title: `Successfully connected to ${app.name}!` });
    }, 2000);
  };


  return (
    <div className="p-4 md:p-6 pb-24 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Apps</h1>
        <p className="text-muted-foreground mt-1">
          Use your verified wallet anywhere.
        </p>
      </header>
      
      <div className="space-y-4 mb-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search apps..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex-grow overflow-x-auto whitespace-nowrap scrollbar-hide">
                {statusFilters.map(filter => (
                    <Button 
                        key={filter} 
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        className="mr-2 transition-all"
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </Button>
                ))}
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="last-used">Last used</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {filteredAndSortedApps.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedApps.map((app) => (
            <AppCard 
              key={app.name} 
              app={app}
              onConnect={handleConnect}
              onOpen={handleOpen}
              onDisconnect={handleDisconnect}
              onRetry={handleRetry}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4 flex items-center justify-center bg-muted rounded-full">
                <LayoutGrid className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold">No apps found</h3>
            <p className="text-muted-foreground text-sm">
                Your search for "{searchTerm}" with filter "{activeFilter}" didn't return any results.
            </p>
        </div>
      )}
      
      <AppConnectModal 
        isOpen={!!selectedApp} 
        onOpenChange={() => setSelectedApp(null)}
        app={selectedApp}
      />
    </div>
  );
}
