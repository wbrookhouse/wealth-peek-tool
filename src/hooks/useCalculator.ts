import { useState, useCallback } from 'react';
import { Investment, ServiceItem, UserInfo, DEFAULT_SERVICES } from '@/types/calculator';
import { lookupFundMER, calculateAnnualFee } from '@/lib/fundLookup';

export function useCalculator() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [meetingsPerYear, setMeetingsPerYear] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const signUp = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setCurrentStep(2);
  }, []);

  const addInvestment = useCallback(async (fundCode: string, amount: number) => {
    const id = crypto.randomUUID();
    
    const newInvestment: Investment = {
      id,
      fundCode: fundCode.toUpperCase(),
      fundName: fundCode.toUpperCase(),
      amount,
      mer: null,
      annualFee: null,
      isLoading: true,
      error: null
    };
    
    setInvestments(prev => [...prev, newInvestment]);

    const result = await lookupFundMER(fundCode);

    setInvestments(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      
      if (result.success && result.mer !== undefined) {
        const annualFee = calculateAnnualFee(amount, result.mer);
        return {
          ...inv,
          fundName: result.fundName || fundCode.toUpperCase(),
          mer: result.mer,
          annualFee,
          isLoading: false,
          error: null
        };
      } else {
        return {
          ...inv,
          isLoading: false,
          error: result.error || 'Could not find MER'
        };
      }
    }));
  }, []);

  const removeInvestment = useCallback((id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const updateInvestmentMER = useCallback((id: string, mer: number) => {
    setInvestments(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const annualFee = calculateAnnualFee(inv.amount, mer);
      return { ...inv, mer, annualFee, error: null };
    }));
  }, []);

  const toggleService = useCallback((id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, checked: !service.checked } : service
    ));
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalFees = investments.reduce((sum, inv) => sum + (inv.annualFee || 0), 0);
  const validInvestments = investments.filter(inv => inv.mer !== null && !inv.error);
  const weightedMER = totalInvested > 0 
    ? validInvestments.reduce((sum, inv) => sum + (inv.mer! * inv.amount), 0) / totalInvested 
    : 0;

  return {
    userInfo,
    investments,
    services,
    meetingsPerYear,
    currentStep,
    totalInvested,
    totalFees,
    weightedMER,
    signUp,
    addInvestment,
    removeInvestment,
    updateInvestmentMER,
    toggleService,
    setMeetingsPerYear,
    setCurrentStep
  };
}
