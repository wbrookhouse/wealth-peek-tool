export type AccountType = 'TFSA' | 'RRSP' | 'LIRA' | 'RRIF' | 'RESP' | 'FHSA' | 'Open';

export const ACCOUNT_TYPES: AccountType[] = ['TFSA', 'RRSP', 'LIRA', 'RRIF', 'RESP', 'FHSA', 'Open'];

export interface Investment {
  id: string;
  fundCode: string;
  fundName: string;
  amount: number;
  accountType: AccountType;
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

export interface UserInfo {
  firstName: string;
  email: string;
  hasIncorporatedBusiness: boolean;
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'financial-planning', name: 'Financial planning', checked: false },
  { id: 'tax-optimization', name: 'Tax optimization/planning', checked: false },
  { id: 'portfolio-reviews', name: 'Portfolio reviews', checked: false },
  { id: 'retirement-planning', name: 'Retirement planning', checked: false },
  { id: 'estate-planning', name: 'Estate planning', checked: false },
  { id: 'insurance-planning', name: 'Insurance planning', checked: false },
  { id: 'investment-management', name: 'Investment management', checked: false },
  { id: 'advisor-access', name: 'Access to advisor', checked: false },
  { id: 'education', name: 'Education/resources', checked: false }
];

export const MEETING_FREQUENCY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Once a year' },
  { value: 2, label: 'Twice a year' },
  { value: 4, label: 'Quarterly' },
  { value: 12, label: 'Monthly' }
];
