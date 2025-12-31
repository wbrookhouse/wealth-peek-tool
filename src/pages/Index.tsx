import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { InvestmentForm } from '@/components/InvestmentForm';
import { PricingCards } from '@/components/PricingCards';
import { ServicesChecklist } from '@/components/ServicesChecklist';
import { ComparisonReport } from '@/components/ComparisonReport';
import { Button } from '@/components/ui/button';
import { useCalculator } from '@/hooks/useCalculator';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const STEP_LABELS = ['Your Investments', 'Choose Plan', 'Current Services', 'Comparison'];

const Index = () => {
  const {
    investments,
    services,
    selectedTier,
    currentStep,
    totalInvested,
    totalFees,
    weightedMER,
    selectedPricing,
    savings,
    addInvestment,
    removeInvestment,
    updateInvestmentMER,
    toggleService,
    setSelectedTier,
    setCurrentStep
  } = useCalculator();

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return investments.some(inv => inv.mer !== null);
      case 2:
        return selectedTier !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
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
          totalSteps={4} 
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
            <PricingCards
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
            />
          )}

          {currentStep === 3 && (
            <ServicesChecklist
              services={services}
              onToggleService={toggleService}
            />
          )}

          {currentStep === 4 && (
            <ComparisonReport
              investments={investments}
              services={services}
              selectedPricing={selectedPricing}
              totalInvested={totalInvested}
              totalFees={totalFees}
              weightedMER={weightedMER}
              savings={savings}
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
            
            {currentStep < 4 && (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold shadow-gold"
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

export default Index;
