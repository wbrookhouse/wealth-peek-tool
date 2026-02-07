import { useState, useEffect } from 'react';
import { Mail, Check, X, Star, Calendar, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Investment, ServiceItem, MEETING_FREQUENCY_OPTIONS, UserInfo } from '@/types/calculator';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';
import { toast } from 'sonner';

interface ComparisonReportProps {
  investments: Investment[];
  services: ServiceItem[];
  meetingsPerYear: number;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
  userInfo: UserInfo | null;
}

export function ComparisonReport({
  investments,
  services,
  meetingsPerYear,
  totalInvested,
  totalFees,
  weightedMER,
  userInfo
}: ComparisonReportProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Pre-fill email from userInfo if available
  useEffect(() => {
    if (userInfo?.email) {
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const checkedServices = services.filter(s => s.checked);
  const uncheckedServices = services.filter(s => !s.checked);
  const meetingLabel = MEETING_FREQUENCY_OPTIONS.find(o => o.value === meetingsPerYear)?.label || 'Unknown';
  const showCTA = totalFees > 3500;

  const handleEmailReport = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    
    // Simulate sending email (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSending(false);
    setEmailSent(true);
    toast.success('Report sent to your email!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          {userInfo?.firstName ? `${userInfo.firstName}'s ` : 'Your '}<span className="text-gradient-green">Fee Report</span>
        </h2>
        <p className="text-muted-foreground">
          Review your current fees and services
        </p>
        {userInfo?.email && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm">
            <User className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Report for:</span>
            <span className="font-medium text-foreground">{userInfo.email}</span>
          </div>
        )}
      </div>

      {/* Total Fees Highlight */}
      <Card className="p-8 bg-gradient-purple border-primary/30 shadow-green text-center">
        <h3 className="font-display text-xl font-semibold mb-2">Your Total Annual Fees</h3>
        <p className="text-5xl md:text-6xl font-bold text-gradient-green mb-2">
          {formatCurrency(totalFees)}
        </p>
        <p className="text-muted-foreground">per year</p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Invested: </span>
            <span className="font-semibold">{formatCurrency(totalInvested)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Average MER: </span>
            <span className="font-semibold">{formatPercent(weightedMER)}</span>
          </div>
        </div>
      </Card>

      {/* CTA - show if fees over $3,500 */}
      {showCTA && (
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40 text-center">
          <p className="font-display text-xl md:text-2xl font-semibold mb-2">
            There may be a better way.
          </p>
          <p className="text-muted-foreground mb-4">
            Would you like to learn more?
          </p>
          <Button size="lg" className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green">
            Schedule a Consultation
          </Button>
        </Card>
      )}

      {/* Investment Summary */}
      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <h3 className="font-display text-lg font-semibold mb-4">Your Investments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 font-medium text-muted-foreground">Fund</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-2 font-medium text-muted-foreground">MER</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Annual Fee</th>
              </tr>
            </thead>
            <tbody>
              {investments.filter(inv => inv.mer !== null).map((inv) => (
                <tr key={inv.id} className="border-b border-border/30">
                  <td className="py-3">
                    <span className="font-mono font-medium text-primary">{inv.fundCode}</span>
                    <br />
                    <span className="text-muted-foreground text-xs">{inv.fundName}</span>
                  </td>
                  <td className="text-right py-3">{formatCurrency(inv.amount)}</td>
                  <td className="text-right py-3">{formatPercent(inv.mer!)}</td>
                  <td className="text-right py-3 font-medium">{formatCurrency(inv.annualFee!)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="py-3">Total</td>
                <td className="text-right py-3">{formatCurrency(totalInvested)}</td>
                <td className="text-right py-3">{formatPercent(weightedMER)}</td>
                <td className="text-right py-3 text-primary">{formatCurrency(totalFees)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Services Received */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Services You Receive
          </h3>
          {checkedServices.length > 0 ? (
            <ul className="space-y-2">
              {checkedServices.map(service => (
                <li key={service.id} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {service.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No services selected</p>
          )}
          
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Advisor meetings: <span className="font-medium">{meetingLabel}</span>
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-destructive" />
            Services You're Not Receiving
          </h3>
          {uncheckedServices.length > 0 ? (
            <ul className="space-y-2">
              {uncheckedServices.map(service => (
                <li key={service.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive flex-shrink-0" />
                  {service.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-500">You're receiving all services!</p>
          )}
        </Card>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
        <h3 className="font-display text-lg font-semibold mb-4 text-center">Summary</h3>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            You are paying <span className="font-bold text-primary">{formatCurrency(totalFees)}</span> per year in fees
          </p>
          <p className="text-muted-foreground">
            You are receiving <span className="font-bold text-primary">{checkedServices.length}</span> of {services.length} possible services
          </p>
          <p className="text-muted-foreground">
            You meet with your advisor <span className="font-bold text-primary">{meetingLabel.toLowerCase()}</span>
          </p>
        </div>
      </Card>

      {/* Email Report Section */}
      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 shadow-green">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-primary" />
          <h3 className="font-display text-lg font-semibold">Get Your Full Report</h3>
        </div>
        
        {emailSent ? (
          <div className="text-center py-4">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium">Report sent!</p>
            <p className="text-sm text-muted-foreground">Check your inbox for the full report.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Enter your email to receive a detailed copy of this report{showCTA && ', including personalized recommendations'}.
            </p>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary flex-1"
              />
              <Button 
                onClick={handleEmailReport}
                disabled={isSending}
                className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Email Report
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
