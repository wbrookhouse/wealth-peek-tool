import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { ServiceItem } from '@/types/calculator';

interface ServicesChecklistProps {
  services: ServiceItem[];
  onToggleService: (id: string) => void;
}

export function ServicesChecklist({ services, onToggleService }: ServicesChecklistProps) {
  const checkedCount = services.filter(s => s.checked).length;
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          What Services Do You <span className="text-gradient-gold">Currently Receive</span>?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Check the services your current advisor provides. This helps compare what you're getting for your fees.
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <label
              key={service.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={service.checked}
                onCheckedChange={() => onToggleService(service.id)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm">{service.name}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50 text-center">
          <p className="text-muted-foreground">
            You selected <span className="text-primary font-semibold">{checkedCount}</span> of {services.length} services
          </p>
        </div>
      </Card>
    </div>
  );
}
