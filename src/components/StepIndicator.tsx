import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full py-6 md:py-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground shadow-gold",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/30 shadow-gold",
                    !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                <span className={cn(
                  "text-xs md:text-sm font-medium text-center whitespace-nowrap",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {labels[i]}
                </span>
              </div>
              
              {stepNum < totalSteps && (
                <div className="flex-1 h-[2px] mx-2 md:mx-4">
                  <div
                    className={cn(
                      "h-full transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
