import type { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ProfileModal: FC<ProfileModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>Your personal and security details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src="https://picsum.photos/id/433/100/100" alt="Maria's avatar" data-ai-hint="woman portrait" />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Maria</h2>
            <p className="text-muted-foreground">maria@email.com</p>
            <p className="text-sm text-muted-foreground mt-2">Member since: Jan 2023</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
