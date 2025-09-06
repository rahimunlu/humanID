import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const VerifiedHumanCard = () => {
  return (
    <Card className="border-green-500 bg-green-50/80 border-2 animate-bounce-in shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
        <div>
          <h3 className="font-bold text-green-800">Account Created — Verified Human ✅</h3>
          <p className="text-sm text-green-700">Welcome to secure, modern banking.</p>
        </div>
      </CardContent>
    </Card>
  );
};
