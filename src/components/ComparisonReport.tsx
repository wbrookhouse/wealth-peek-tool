import { Printer, Check, X, TrendingDown, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Investment, ServiceItem, PricingOption, PRICING_TIERS } from '@/types/calculator';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';
import { cn } from '@/lib/utils';

interface ComparisonReportProps {
  investments: Investment[];
  services: ServiceItem[];
  selectedPricing: PricingOption | null;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
  savings: number;
}

export function ComparisonReport({
  investments,
  services,
  selectedPricing,
  totalInvested,
  totalFees,
  weightedMER,
  savings
}: ComparisonReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const checkedServices = services.filter(s => s.checked);
  const isSaving = savings > 0;

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Your <span className="text-gradient-gold">Fee Comparison</span> Report
          </h2>
          <p className="text-muted-foreground">
            Review your current fees vs. Black Star Wealth
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:flex items-center gap-3 pb-4 border-b border-border">
        <Star className="h-8 w-8 text-primary fill-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Black Star Wealth</h1>
          <p className="text-sm text-muted-foreground">Fee Comparison Report</p>
        </div>
      </div>

      {/* Investment Summary */}
      <Card className="p-6 bg-card/50 backdrop-blur border-border/50 print:bg-transparent print:border print:border-gray-300">
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

      {/* Fee Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50 print:bg-transparent print:border print:border-gray-300">
          <h3 className="font-display text-lg font-semibold mb-4">Current Fees</h3>
          <div className="space-y-4">
            <div className="text-center py-6 bg-secondary/30 rounded-lg">
              <p className="text-4xl font-bold">{formatCurrency(totalFees)}</p>
              <p className="text-muted-foreground">per year</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Services you currently receive:</p>
              {checkedServices.length > 0 ? (
                <ul className="space-y-1">
                  {checkedServices.map(service => (
                    <li key={service.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      {service.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No services selected</p>
              )}
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-6 border-primary/50 shadow-gold print:bg-transparent print:border print:border-gray-300",
          "bg-gradient-to-br from-card to-primary/5"
        )}>
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            Black Star Wealth - {selectedPricing?.name}
          </h3>
          <div className="space-y-4">
            <div className="text-center py-6 bg-primary/10 rounded-lg">
              <p className="text-4xl font-bold text-gradient-gold">
                {formatCurrency(selectedPricing?.price || 0)}
              </p>
              <p className="text-muted-foreground">per year</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Services included:</p>
              <ul className="space-y-1">
                {selectedPricing?.features.slice(0, 8).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Savings Summary */}
      <Card className={cn(
        "p-8 text-center",
        isSaving 
          ? "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30" 
          : "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {isSaving ? (
            <TrendingDown className="w-6 h-6 text-green-500" />
          ) : (
            <TrendingUp className="w-6 h-6 text-primary" />
          )}
          <h3 className="font-display text-xl font-semibold">
            {isSaving ? 'Your Potential Savings' : 'Investment in Comprehensive Service'}
          </h3>
        </div>
        
        <p className={cn(
          "text-5xl font-bold my-4",
          isSaving ? "text-green-500" : "text-gradient-gold"
        )}>
          {isSaving ? formatCurrency(savings) : formatCurrency(Math.abs(savings))}
          <span className="text-lg font-normal text-muted-foreground"> /year</span>
        </p>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {isSaving 
            ? "By switching to Black Star Wealth, you could save this amount annually while receiving comprehensive financial planning services."
            : "While Black Star Wealth may cost more than embedded fees, you'll receive transparent, comprehensive financial planning with a clear picture of what you're paying for."
          }
        </p>
      </Card>

      {/* Missing Services */}
      {checkedServices.length < services.length && (
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50 print:bg-transparent print:border print:border-gray-300">
          <h3 className="font-display text-lg font-semibold mb-4">
            Services You're Missing
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Based on your selections, you may not be receiving these valuable services:
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {services.filter(s => !s.checked).map(service => (
              <div key={service.id} className="flex items-center gap-2 text-sm">
                <X className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">{service.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CTA */}
      <div className="text-center py-6 print:hidden">
        <p className="text-muted-foreground mb-4">
          Ready to take control of your financial future?
        </p>
        <Button size="lg" className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold shadow-gold">
          Schedule a Consultation
        </Button>
      </div>
    </div>
  );
}
