import { Printer, Check, X, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Investment, ServiceItem, MEETING_FREQUENCY_OPTIONS } from '@/types/calculator';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';

interface ComparisonReportProps {
  investments: Investment[];
  services: ServiceItem[];
  meetingsPerYear: number;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
}

export function ComparisonReport({
  investments,
  services,
  meetingsPerYear,
  totalInvested,
  totalFees,
  weightedMER
}: ComparisonReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const checkedServices = services.filter(s => s.checked);
  const uncheckedServices = services.filter(s => !s.checked);
  const meetingLabel = MEETING_FREQUENCY_OPTIONS.find(o => o.value === meetingsPerYear)?.label || 'Unknown';

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Your <span className="text-gradient-green">Fee Report</span>
          </h2>
          <p className="text-muted-foreground">
            Review your current fees and services
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
          <p className="text-sm text-muted-foreground">Fee Report</p>
        </div>
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

      {/* Services Received */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50 print:bg-transparent print:border print:border-gray-300">
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

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50 print:bg-transparent print:border print:border-gray-300">
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

      {/* CTA - only show if fees over $5,000 */}
      {totalFees > 5000 && (
        <div className="text-center py-6 print:hidden">
          <p className="font-display text-xl font-semibold mb-2">
            There might be a better way.
          </p>
          <p className="text-muted-foreground mb-4">
            Let's talk.
          </p>
          <Button size="lg" className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green">
            Schedule a Consultation
          </Button>
        </div>
      )}
    </div>
  );
}
