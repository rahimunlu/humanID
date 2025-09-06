import type { FC } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

type NotificationsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const notifications = [
  { id: 1, title: 'Salary Received', message: 'You have received $2,500.00 from your employer.', time: '2h ago', read: false },
  { id: 2, title: 'New Reward Unlocked', message: 'You earned a Free Wire Transfer. Use it now!', time: '1d ago', read: true },
  { id: 3, title: 'Security Alert', message: 'A new device has logged into your account.', time: '2d ago', read: true },
];

export const NotificationsPanel: FC<NotificationsPanelProps> = ({ open, onOpenChange }) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-lg mx-auto w-full">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>You have {unreadCount} unread message{unreadCount !== 1 && 's'}.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div className="flex items-start gap-4">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" style={{ opacity: notification.read ? 0 : 1 }} />
                <div className="flex-grow">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
              {index < notifications.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
