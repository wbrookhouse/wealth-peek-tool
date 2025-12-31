import { Building2, TrendingUp, Crown, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PricingTier, PRICING_TIERS } from '@/types/calculator';
import { formatCurrency } from '@/lib/fundLookup';
import { cn } from '@/lib/utils';

interface PricingCardsProps {
  selectedTier: PricingTier;
  onSelectTier: (tier: PricingTier) => void;
}

const tierIcons = {
  foundation: Building2,
  growth: TrendingUp,
  legacy: Crown
};

export function PricingCards({ selectedTier, onSelectTier }: PricingCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          Choose Your <span className="text-gradient-gold">Service Level</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Select the tier that best fits your financial situation. All tiers include comprehensive financial planning.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => {
          const Icon = tierIcons[tier.id!];
          const isSelected = selectedTier === tier.id;
          
          return (
            <Card
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={cn(
                "relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                "bg-card/50 backdrop-blur border-border/50",
                isSelected && "border-primary ring-2 ring-primary/30 shadow-gold",
                tier.id === 'growth' && "md:-translate-y-2"
              )}
            >
              {tier.id === 'growth' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="text-center space-y-4">
                <div className={cn(
                  "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center",
                  isSelected ? "bg-gradient-gold" : "bg-secondary"
                )}>
                  <Icon className={cn(
                    "w-7 h-7",
                    isSelected ? "text-primary-foreground" : "text-primary"
                  )} />
                </div>
                
                <div>
                  <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                
                <div className="py-4 border-y border-border/50">
                  <p className="text-4xl font-bold text-gradient-gold">
                    {formatCurrency(tier.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">per year</p>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  {tier.forWho}
                </p>
                
                <ul className="text-left space-y-2 text-sm">
                  {tier.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className="text-muted-foreground text-center pt-1">
                      +{tier.features.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-gradient-gold rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
