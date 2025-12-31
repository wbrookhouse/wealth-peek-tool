import { useState } from 'react';
import { Plus, Loader2, X, AlertCircle, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Investment } from '@/types/calculator';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';
import { cn } from '@/lib/utils';

interface InvestmentFormProps {
  investments: Investment[];
  onAddInvestment: (fundCode: string, amount: number) => void;
  onRemoveInvestment: (id: string) => void;
  onUpdateMER: (id: string, mer: number) => void;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
}

export function InvestmentForm({
  investments,
  onAddInvestment,
  onRemoveInvestment,
  onUpdateMER,
  totalInvested,
  totalFees,
  weightedMER
}: InvestmentFormProps) {
  const [fundCode, setFundCode] = useState('');
  const [amount, setAmount] = useState('');
  const [editingMER, setEditingMER] = useState<string | null>(null);
  const [editMERValue, setEditMERValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundCode.trim() || !amount) return;
    
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    onAddInvestment(fundCode.trim(), numAmount);
    setFundCode('');
    setAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const startEditMER = (id: string, currentMER: number | null) => {
    setEditingMER(id);
    setEditMERValue(currentMER?.toString() || '');
  };

  const saveMER = (id: string) => {
    const mer = parseFloat(editMERValue);
    if (!isNaN(mer) && mer >= 0 && mer <= 10) {
      onUpdateMER(id, mer);
    }
    setEditingMER(null);
  };

  const isLoading = investments.some(inv => inv.isLoading);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          What Are You <span className="text-gradient-gold">Really Paying</span> in Fees?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter your fund codes and investment amounts below. We'll search for the MER and calculate your total fees.
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="fundCode" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Fund Code
            </label>
            <Input
              id="fundCode"
              value={fundCode}
              onChange={(e) => setFundCode(e.target.value.toUpperCase())}
              placeholder="e.g., RBF1018"
              className="bg-background/50 border-border/50 focus:border-primary uppercase"
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="amount" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Amount Invested
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="100,000"
                className="bg-background/50 border-border/50 focus:border-primary pl-7"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button 
              type="submit" 
              disabled={!fundCode.trim() || !amount || isLoading}
              className="w-full sm:w-auto bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold shadow-gold"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fund
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {investments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Your Investments</h3>
          
          <div className="space-y-3">
            {investments.map((inv) => (
              <Card
                key={inv.id}
                className={cn(
                  "p-4 bg-card/50 backdrop-blur border-border/50 transition-all",
                  inv.error && "border-destructive/50"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-primary">
                        {inv.fundCode}
                      </span>
                      {inv.isLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {inv.fundName !== inv.fundCode ? inv.fundName : 'Looking up fund name...'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(inv.amount)}</p>
                    {inv.mer !== null && !inv.error && (
                      <div className="flex items-center gap-1 justify-end">
                        {editingMER === inv.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editMERValue}
                              onChange={(e) => setEditMERValue(e.target.value)}
                              className="w-20 h-6 text-xs px-2"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => saveMER(inv.id)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-muted-foreground">
                              MER: {formatPercent(inv.mer)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => startEditMER(inv.id, inv.mer)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    {inv.error && (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertCircle className="w-3 h-3" />
                        <span>{inv.error}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => startEditMER(inv.id, null)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    {inv.annualFee !== null ? (
                      <p className="font-semibold text-primary">
                        {formatCurrency(inv.annualFee)}/yr
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">—</p>
                    )}
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveInvestment(inv.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="p-6 bg-gradient-navy border-primary/30 shadow-gold">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Weighted MER</p>
                <p className="text-2xl font-bold">{formatPercent(weightedMER)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Fees</p>
                <p className="text-2xl font-bold text-gradient-gold">{formatCurrency(totalFees)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
