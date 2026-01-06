import { useState } from 'react';
import { Star, ArrowRight, TrendingUp, DollarSign, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserInfo } from '@/types/calculator';

interface SignUpFormProps {
  onSignUp: (info: UserInfo) => void;
}

export function SignUpForm({ onSignUp }: SignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [hasIncorporatedBusiness, setHasIncorporatedBusiness] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    onSignUp({
      firstName: firstName.trim(),
      email: email.trim(),
      hasIncorporatedBusiness
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background star-bg">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <Star className="h-10 w-10 text-primary fill-primary" />
          <span className="font-display text-3xl font-bold tracking-tight">
            Black Star <span className="text-gradient-gold">Wealth</span>
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Are You <span className="text-gradient-gold">Curious</span>?
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            What are the total fees you're paying for your mutual fund or seg fund portfolio?
          </p>
        </div>

        {/* Value Props */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Discover Hidden Fees</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Calculate Your True Costs</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <HelpCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">See What You're Getting</p>
          </Card>
        </div>

        {/* Sign Up Form */}
        <Card className="p-6 md:p-8 bg-card/50 backdrop-blur border-primary/20 shadow-gold">
          <h2 className="font-display text-xl font-semibold mb-6 text-center">
            Get Access to the Fee Calculator
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                First Name
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            
            <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
              <Checkbox
                checked={hasIncorporatedBusiness}
                onCheckedChange={(checked) => setHasIncorporatedBusiness(checked as boolean)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm">I own an incorporated business</span>
            </label>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              size="lg"
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold shadow-gold gap-2"
            >
              Calculate My Fees
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your information is kept private and secure
        </p>
      </div>
    </div>
  );
}
