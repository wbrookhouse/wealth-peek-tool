import { Star } from 'lucide-react';

export function Header() {
  return (
    <header className="relative overflow-hidden border-b border-border/50 bg-gradient-purple">
      <div className="absolute inset-0 star-bg opacity-30" />
      <div className="container relative py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Star className="h-8 w-8 text-primary fill-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                Black Star Wealth
              </h1>
              <p className="text-sm text-muted-foreground">Fee Transparency Calculator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
