import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, ShieldCheck } from 'lucide-react';

type WelcomeScreenProps = {
  onOpenAccount: () => void;
};

export function WelcomeScreen({ onOpenAccount }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <main className="w-full max-w-md">
        <Card className="shadow-2xl animate-slide-up-fade-in rounded-2xl">
          <CardHeader className="text-center">
            <Banknote className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-3xl font-bold mt-4">Welcome to NovaBank</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">The future of banking is here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div>
                    <h3 className="font-semibold">Human-Verified Security</h3>
                    <p className="text-sm text-muted-foreground">Open an account securely without tedious paperwork.</p>
                </div>
            </div>
            <Button size="lg" className="w-full h-14 text-lg font-semibold transition-transform active:scale-95 shadow-lg" onClick={onOpenAccount}>
              Open a Secure Account
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
