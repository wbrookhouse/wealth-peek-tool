import { Check, X, Calendar, User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const checkedServices = services.filter(s => s.checked);
  const uncheckedServices = services.filter(s => !s.checked);
  const meetingLabel = MEETING_FREQUENCY_OPTIONS.find(o => o.value === meetingsPerYear)?.label || 'Unknown';
  const showCTA = totalFees > 3500;

  const generateReportHtml = () => {
    const greeting = userInfo?.firstName ? `Hi ${userInfo.firstName},` : 'Hello,';
    const investmentRows = investments
      .filter(inv => inv.mer !== null)
      .map(inv => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
            <strong style="color: #22c55e;">${inv.fundCode}</strong><br>
            <span style="color: #6b7280; font-size: 12px;">${inv.fundName}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(inv.amount)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPercent(inv.mer!)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">${formatCurrency(inv.annualFee!)}</td>
        </tr>
      `).join('');

    const servicesReceivedHtml = checkedServices.length > 0
      ? checkedServices.map(s => `<li style="margin: 4px 0;">&#10003; ${s.name}</li>`).join('')
      : '<li style="color: #6b7280; font-style: italic;">No services selected</li>';

    const servicesNotReceivedHtml = uncheckedServices.length > 0
      ? uncheckedServices.map(s => `<li style="margin: 4px 0; color: #6b7280;">&#10007; ${s.name}</li>`).join('')
      : '<li style="color: #22c55e;">You\'re receiving all services!</li>';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Black Star Wealth Fee Report - ${formatCurrency(totalFees)}/year</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Your Fee Report</h1>
      <p style="color: #94a3b8; margin: 8px 0 0 0;">Brought to you by <a href="https://blackstarwealth.com" style="color: #22c55e; text-decoration: none;">Black Star Wealth</a></p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">${greeting}</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Here's a summary of your investment fees and services.
      </p>
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">Your Total Annual Fees</p>
        <p style="color: #22c55e; font-size: 42px; font-weight: bold; margin: 0;">${formatCurrency(totalFees)}</p>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">per year</p>
        <div style="margin-top: 16px; color: #94a3b8; font-size: 14px;">
          Total Invested: <strong style="color: white;">${formatCurrency(totalInvested)}</strong> &nbsp;|&nbsp;
          Average MER: <strong style="color: white;">${formatPercent(weightedMER)}</strong>
        </div>
      </div>
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">Your Investments</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 500;">Fund</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">Amount</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">MER</th>
            <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">Annual Fee</th>
          </tr>
        </thead>
        <tbody>
          ${investmentRows}
          <tr style="font-weight: 600; background: #f9fafb;">
            <td style="padding: 12px;">Total</td>
            <td style="padding: 12px; text-align: right;">${formatCurrency(totalInvested)}</td>
            <td style="padding: 12px; text-align: right;">${formatPercent(weightedMER)}</td>
            <td style="padding: 12px; text-align: right; color: #22c55e;">${formatCurrency(totalFees)}</td>
          </tr>
        </tbody>
      </table>
      <div style="display: flex; gap: 24px; margin-top: 32px;">
        <div style="flex: 1;">
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Services You Receive</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #374151;">
            ${servicesReceivedHtml}
          </ul>
          <p style="margin-top: 12px; font-size: 13px; color: #6b7280;">
            Advisor meetings: <strong>${meetingLabel}</strong>
          </p>
        </div>
        <div style="flex: 1;">
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Services Not Received</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
            ${servicesNotReceivedHtml}
          </ul>
        </div>
      </div>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 32px; text-align: center;">
        <h3 style="color: #166534; margin: 0 0 12px 0;">Summary</h3>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.8;">
          You are paying <strong style="color: #22c55e;">${formatCurrency(totalFees)}</strong> per year in fees<br>
          You are receiving <strong>${checkedServices.length}</strong> of ${services.length} possible services<br>
          You meet with your advisor <strong>${meetingLabel.toLowerCase()}</strong>
        </p>
      </div>
      ${showCTA ? `
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px; padding: 24px; margin-top: 24px; text-align: center;">
        <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">There may be a better way.</p>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Would you like to learn more? Contact us to schedule a consultation.</p>
      </div>
      ` : ''}
    </div>
    <div style="background: #f3f4f6; padding: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        This report was generated by <a href="https://blackstarwealth.com" style="color: #22c55e; text-decoration: none;">Black Star Wealth</a>. The information provided is for educational purposes only.
      </p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleDownloadReport = () => {
    const html = generateReportHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BlackStarWealth-Fee-Report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
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

      {/* Download Report Section */}
      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 shadow-green">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-6 h-6 text-primary" />
          <h3 className="font-display text-lg font-semibold">Get Your Full Report</h3>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Download a detailed copy of this report{showCTA && ', including personalized recommendations'}.
          </p>
          <Button
            onClick={handleDownloadReport}
            className="w-full bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
