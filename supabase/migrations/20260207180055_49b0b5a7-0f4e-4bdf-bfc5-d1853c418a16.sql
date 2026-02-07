-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  has_incorporated_business BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_portfolios table to store user investment history
CREATE TABLE public.saved_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  total_invested NUMERIC NOT NULL DEFAULT 0,
  total_fees NUMERIC NOT NULL DEFAULT 0,
  weighted_mer NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_investments table to store individual fund entries
CREATE TABLE public.saved_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.saved_portfolios(id) ON DELETE CASCADE,
  fund_code TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  account_type TEXT NOT NULL,
  mer NUMERIC,
  annual_fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_investments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Saved portfolios policies
CREATE POLICY "Users can view their own portfolios"
  ON public.saved_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.saved_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.saved_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.saved_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Saved investments policies
CREATE POLICY "Users can view investments in their portfolios"
  ON public.saved_investments FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM public.saved_portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert investments in their portfolios"
  ON public.saved_investments FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM public.saved_portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete investments in their portfolios"
  ON public.saved_investments FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM public.saved_portfolios WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_portfolios_updated_at
  BEFORE UPDATE ON public.saved_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();