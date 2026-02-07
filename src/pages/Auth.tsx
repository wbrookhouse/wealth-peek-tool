import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        navigate('/dashboard');
      } else {
        if (!firstName.trim()) {
          setError('Please enter your first name');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
            },
          },
        });
        
        if (error) throw error;

        if (data.user) {
          // Create profile
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            first_name: firstName,
            email: email,
          });
        }
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to verify your account.",
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background galaxy-bg">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <Star className="h-10 w-10 text-primary fill-primary" />
          <span className="font-display text-3xl font-bold tracking-tight">
            Black Star <span className="text-gradient-green">Wealth</span>
          </span>
        </div>

        {/* Auth Card */}
        <Card className="p-6 md:p-8 bg-card/50 backdrop-blur border-primary/20 shadow-green">
          <h2 className="font-display text-xl font-semibold mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              size="lg"
              disabled={loading}
              className="w-full bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green gap-2"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>

        <div className="text-center">
          <Link 
            to="/calculator" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Or try the calculator without signing up →
          </Link>
        </div>
      </div>
    </div>
  );
}
