import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Search, Loader2, Calendar, DollarSign, TrendingDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatPercent } from '@/lib/fundLookup';

interface Portfolio {
  id: string;
  name: string;
  total_invested: number;
  total_fees: number;
  weighted_mer: number;
  created_at: string;
}

interface FundSearchResult {
  fundCode: string;
  fundName: string;
  source: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fund search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FundSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      setUser(user);
      
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profileData);
      
      // Get portfolios
      const { data: portfoliosData } = await supabase
        .from('saved_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setPortfolios(portfoliosData || []);
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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

  const useFundCode = (code: string) => {
    navigate(`/calculator?fundCode=${code}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background galaxy-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background star-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-7 w-7 text-primary fill-primary" />
              <span className="font-display text-lg font-bold tracking-tight">
                Black Star <span className="text-gradient-green">Wealth</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, {profile?.first_name || 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome back, <span className="text-gradient-green">{profile?.first_name || 'User'}</span>!
            </h1>
            <p className="text-muted-foreground">
              View your saved portfolios or start a new fee analysis.
            </p>
          </div>

          {/* Fund Search */}
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Find a Fund Code</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Don't know your fund code? Search by fund name to find it.
            </p>
            <form onSubmit={handleFundSearch} className="flex gap-4">
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
                className="bg-gradient-green hover:opacity-90 text-primary-foreground"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Found {searchResults.length} result(s):</p>
                {searchResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-mono font-semibold text-primary">{result.fundCode}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{result.fundName}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => useFundCode(result.fundCode)}
                    >
                      Use This
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/calculator')}
              size="lg"
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Fee Analysis
            </Button>
          </div>

          {/* Portfolio History */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Your Portfolio History</h2>
            
            {portfolios.length === 0 ? (
              <Card className="p-8 bg-card/50 backdrop-blur border-border/50 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't saved any portfolios yet.
                </p>
                <Button
                  onClick={() => navigate('/calculator')}
                  variant="outline"
                >
                  Start Your First Analysis
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {portfolios.map((portfolio) => (
                  <Card
                    key={portfolio.id}
                    className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{portfolio.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(portfolio.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Invested</p>
                          <p className="font-semibold">{formatCurrency(portfolio.total_invested)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Annual Fees</p>
                          <p className="font-semibold text-primary">{formatCurrency(portfolio.total_fees)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">MER</p>
                          <p className="font-semibold">{formatPercent(portfolio.weighted_mer)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
