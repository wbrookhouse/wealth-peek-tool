import { useState } from 'react';
import { Plus, Loader2, X, AlertCircle, Edit2, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Investment, AccountType, ACCOUNT_TYPES, UserInfo } from '@/types/calculator';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FundSearchResult {
  fundCode: string;
  fundName: string;
  source: string;
}

interface InvestmentFormProps {
  investments: Investment[];
  userInfo: UserInfo | null;
  onAddInvestment: (fundCode: string, amount: number, accountType: AccountType) => void;
  onRemoveInvestment: (id: string) => void;
  onUpdateMER: (id: string, mer: number) => void;
  onSetUser: (info: UserInfo) => void;
  totalInvested: number;
  totalFees: number;
  weightedMER: number;
}

export function InvestmentForm({
  investments,
  userInfo,
  onAddInvestment,
  onRemoveInvestment,
  onUpdateMER,
  onSetUser,
  totalInvested,
  totalFees,
  weightedMER
}: InvestmentFormProps) {
  const [fundCode, setFundCode] = useState('');
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('RRSP');
  const [editingMER, setEditingMER] = useState<string | null>(null);
  const [editMERValue, setEditMERValue] = useState('');
  
  // User info modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [pendingFund, setPendingFund] = useState<{ fundCode: string; amount: number; accountType: AccountType } | null>(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [userError, setUserError] = useState('');

  // Fund search state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FundSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleFundSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('fund-search', {
        body: { query: searchQuery }
      });
      
      if (error) throw error;
      
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Fund search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectFundFromSearch = (code: string) => {
    setFundCode(code);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundCode.trim() || !amount) return;
    
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    // If this is the first fund and we don't have user info, show the modal
    if (investments.length === 0 && !userInfo) {
      setPendingFund({ fundCode: fundCode.trim(), amount: numAmount, accountType });
      setShowUserModal(true);
      return;
    }
    
    onAddInvestment(fundCode.trim(), numAmount, accountType);
    setFundCode('');
    setAmount('');
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    
    if (!firstName.trim()) {
      setUserError('Please enter your first name');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setUserError('Please enter a valid email address');
      return;
    }
    
    onSetUser({
      firstName: firstName.trim(),
      email: email.trim(),
      hasIncorporatedBusiness: false
    });
    
    if (pendingFund) {
      onAddInvestment(pendingFund.fundCode, pendingFund.amount, pendingFund.accountType);
      setPendingFund(null);
    }
    
    setShowUserModal(false);
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
          What Are You <span className="text-gradient-green">Really Paying</span> in Fees?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter your fund codes and investment amounts below. We'll search for the MER and calculate your total fees.
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-primary/30 shadow-green">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Add a Fund</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="fundCode" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Fund Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="fundCode"
                  value={fundCode}
                  onChange={(e) => setFundCode(e.target.value.toUpperCase())}
                  placeholder="e.g., RBF1018"
                  className="bg-background/50 border-border/50 focus:border-primary uppercase flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSearchModal(true)}
                  className="shrink-0"
                  title="Search by fund name"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
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
            <div>
              <label htmlFor="accountType" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Account Type
              </label>
              <Select value={accountType} onValueChange={(value) => setAccountType(value as AccountType)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={!fundCode.trim() || !amount || isLoading}
                size="lg"
                className="w-full bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Fund
                  </>
                )}
              </Button>
            </div>
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
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-primary">
                        {inv.fundCode}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {inv.accountType}
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

          {/* Summary Card */}
          {totalFees > 0 && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Annual Fees</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalFees)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Weighted MER</p>
                  <p className="text-xl font-semibold">{formatPercent(weightedMER)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* User Info Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Almost there!</DialogTitle>
            <DialogDescription>
              Enter your details to see your complete fee analysis and receive your personalized report.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4 pt-4">
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
            
            {userError && (
              <p className="text-destructive text-sm text-center">{userError}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
            >
              Continue to Results
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fund Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Find Fund Code</DialogTitle>
            <DialogDescription>
              Enter the fund name to search for its code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFundSearch} className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter fund name (e.g., 'RBC Canadian Dividend')"
                className="flex-1 bg-background/50 border-border/50"
                disabled={searching}
              />
              <Button 
                type="submit" 
                disabled={searching || searchQuery.length < 2}
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-sm font-medium">Found {searchResults.length} result(s):</p>
                {searchResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => selectFundFromSearch(result.fundCode)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-semibold text-primary">{result.fundCode}</p>
                      <p className="text-sm text-muted-foreground truncate">{result.fundName}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
