"use client"

import type { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';

type StatusGridProps = {
  onRewardClick: () => void;
  onVerifyInfoClick: () => void;
};

export const StatusGrid: FC<StatusGridProps> = ({ onRewardClick, onVerifyInfoClick }) => {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(80), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="shadow-md cursor-pointer transition-transform active:scale-95 hover:shadow-lg" onClick={onVerifyInfoClick}>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold">Verified Human</p>
            <p className="text-sm text-muted-foreground">KYC-Free Security</p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-md cursor-pointer transition-transform active:scale-95 hover:shadow-lg" onClick={onRewardClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
             <Gift className="h-6 w-6 text-accent shrink-0" />
            <p className="font-semibold">Banking Points: 320</p>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </CardContent>
      </Card>
    </div>
  );
};
