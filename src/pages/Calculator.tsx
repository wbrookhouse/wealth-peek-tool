import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { InvestmentForm } from '@/components/InvestmentForm';
import { ServicesChecklist } from '@/components/ServicesChecklist';
import { ComparisonReport } from '@/components/ComparisonReport';
import { Button } from '@/components/ui/button';
import { useCalculator } from '@/hooks/useCalculator';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { UserInfo } from '@/types/calculator';

const STEP_LABELS = ['Your Investments', 'Current Services', 'Your Report'];

const Calculator = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const {
    investments,
    services,
    meetingsPerYear,
    currentStep,
    totalInvested,
    totalFees,
    weightedMER,
    addInvestment,
    removeInvestment,
    updateInvestmentMER,
    toggleService,
    setMeetingsPerYear,
    setCurrentStep
  } = useCalculator();

  // Check for user info on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('userInfo');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    } else {
      // Redirect to sign up if no user info
      navigate('/');
    }
  }, [navigate]);

  // Don't render until we confirm user is signed in
  if (!userInfo) {
    return null;
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return investments.some(inv => inv.mer !== null);
      case 2:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background star-bg">
      <Header />
      
      <main className="container py-6 md:py-10">
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={3} 
          labels={STEP_LABELS} 
        />

        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <InvestmentForm
              investments={investments}
              onAddInvestment={addInvestment}
              onRemoveInvestment={removeInvestment}
              onUpdateMER={updateInvestmentMER}
              totalInvested={totalInvested}
              totalFees={totalFees}
              weightedMER={weightedMER}
            />
          )}

          {currentStep === 2 && (
            <ServicesChecklist
              services={services}
              onToggleService={toggleService}
              meetingsPerYear={meetingsPerYear}
              onMeetingsChange={setMeetingsPerYear}
            />
          )}

          {currentStep === 3 && (
            <ComparisonReport
              investments={investments}
              services={services}
              meetingsPerYear={meetingsPerYear}
              totalInvested={totalInvested}
              totalFees={totalFees}
              weightedMER={weightedMER}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border/50 print:hidden">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {currentStep < 3 && (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2 bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calculator;
