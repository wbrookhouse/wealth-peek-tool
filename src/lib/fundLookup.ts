import { supabase } from "@/integrations/supabase/client";

interface FundLookupResult {
  success: boolean;
  fundCode: string;
  fundName?: string;
  mer?: number;
  error?: string;
  source?: string;
}

export async function lookupFundMER(fundCode: string): Promise<FundLookupResult> {
  try {
    const { data, error } = await supabase.functions.invoke('fund-lookup', {
      body: { fundCode }
    });

    if (error) {
      console.error('Fund lookup error:', error);
      return {
        success: false,
        fundCode,
        error: error.message || 'Failed to lookup fund'
      };
    }

    return data as FundLookupResult;
  } catch (err) {
    console.error('Fund lookup exception:', err);
    return {
      success: false,
      fundCode,
      error: 'An unexpected error occurred'
    };
  }
}

export function calculateAnnualFee(amount: number, merPercent: number): number {
  // MER comes in as percentage (e.g., 2.35), convert to decimal for calculation
  return amount * (merPercent / 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
