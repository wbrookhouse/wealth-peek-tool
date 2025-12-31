export interface Investment {
  id: string;
  fundCode: string;
  fundName: string;
  amount: number;
  mer: number | null;
  annualFee: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface ServiceItem {
  id: string;
  name: string;
  checked: boolean;
}

export type PricingTier = 'foundation' | 'growth' | 'legacy' | null;

export interface PricingOption {
  id: PricingTier;
  name: string;
  price: number;
  description: string;
  forWho: string;
  features: string[];
}

export const PRICING_TIERS: PricingOption[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    price: 3000,
    description: 'Individual investors',
    forWho: 'You have personal investments and want professional guidance',
    features: [
      'Comprehensive financial planning',
      'Investment management',
      'Tax optimization strategies',
      'Retirement planning',
      'Regular portfolio reviews',
      'Quarterly check-in meetings',
      'Direct advisor access',
      'Educational resources'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 4500,
    description: 'Incorporated company owners',
    forWho: 'You own an incorporated business',
    features: [
      'Everything in Foundation, plus:',
      'Corporate investment strategy',
      'Salary vs. dividend optimization',
      'Corporate tax planning',
      'Integration with business finances',
      'Monthly check-in meetings',
      'Priority advisor access',
      'Business succession planning basics'
    ]
  },
  {
    id: 'legacy',
    name: 'Legacy',
    price: 8500,
    description: 'Complex wealth structures',
    forWho: 'Multiple corps, family trusts, or holding companies',
    features: [
      'Everything in Growth, plus:',
      'Multi-entity coordination',
      'Family trust management',
      'Holding company strategies',
      'Estate planning & wealth transfer',
      'Insurance planning',
      'Family governance support',
      'Unlimited advisor access',
      'Priority support'
    ]
  }
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'financial-planning', name: 'Financial planning', checked: false },
  { id: 'tax-optimization', name: 'Tax optimization/planning', checked: false },
  { id: 'portfolio-reviews', name: 'Portfolio reviews', checked: false },
  { id: 'retirement-planning', name: 'Retirement planning', checked: false },
  { id: 'estate-planning', name: 'Estate planning', checked: false },
  { id: 'insurance-planning', name: 'Insurance planning', checked: false },
  { id: 'investment-management', name: 'Investment management', checked: false },
  { id: 'regular-meetings', name: 'Regular check-in meetings', checked: false },
  { id: 'advisor-access', name: 'Access to advisor', checked: false },
  { id: 'education', name: 'Education/resources', checked: false }
];
