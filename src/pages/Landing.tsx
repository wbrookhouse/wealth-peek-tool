import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronDown, Menu, X, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Avatar {
  id: number;
  src: string;
  alt: string;
}

const AVATARS: Avatar[] = [
  { id: 1, src: "https://i.pravatar.cc/40?img=12", alt: "Customer avatar 1" },
  { id: 2, src: "https://i.pravatar.cc/40?img=32", alt: "Customer avatar 2" },
  { id: 3, src: "https://i.pravatar.cc/40?img=45", alt: "Customer avatar 3" },
  { id: 4, src: "https://i.pravatar.cc/40?img=56", alt: "Customer avatar 4" },
];

interface HeroGridProps {
  avatars?: Avatar[];
  title?: ReactNode;
  subtitle?: ReactNode;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  className?: string;
}

function HeroGrid({
  avatars = AVATARS,
  title = (
    <>
      Discover what you're{' '}
      <span className="text-gradient-green">really paying</span>{' '}
      in fees.
    </>
  ),
  subtitle = "Uncover hidden costs in your mutual funds and seg funds. Our calculator reveals the true impact of management fees on your wealth.",
  primaryCtaText = "Calculate My Fees",
  secondaryCtaText = "Learn More",
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  className,
}: HeroGridProps) {
  return (
    <section className={cn("relative min-h-screen overflow-hidden bg-background", className)}>
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Galaxy gradient overlay */}
      <div className="absolute inset-0 galaxy-bg opacity-80" />
      
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Avatars with social proof */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((avatar) => (
                <img
                  key={avatar.id}
                  src={avatar.src}
                  alt={avatar.alt}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-medium">2,000+</span> Canadians
            </p>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={onPrimaryCtaClick}
              size="lg"
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green px-8 py-6 text-lg"
            >
              {primaryCtaText}
            </Button>
            <Button
              onClick={onSecondaryCtaClick}
              variant="outline"
              size="lg"
              className="border-border/50 hover:bg-secondary/50 px-8 py-6 text-lg"
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </div>
    </section>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const [hoveredNavItem, setHoveredNavItem] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleMouseEnterNavItem = (item: string) => setHoveredNavItem(item);
  const handleMouseLeaveNavItem = () => setHoveredNavItem(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinkClass = (itemName: string) => {
    const isCurrentItemHovered = hoveredNavItem === itemName;
    const isAnotherItemHovered = hoveredNavItem !== null && !isCurrentItemHovered;
    const colorClass = isCurrentItemHovered
      ? 'text-primary'
      : isAnotherItemHovered
        ? 'text-muted-foreground'
        : 'text-foreground';
    return `text-sm font-medium transition duration-150 ${colorClass}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Star className="h-7 w-7 text-primary fill-primary" />
            <span className="font-display text-lg font-bold tracking-tight">
              Black Star <span className="text-gradient-green">Wealth</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div 
              className="relative group"
              onMouseEnter={() => handleMouseEnterNavItem('services')}
              onMouseLeave={handleMouseLeaveNavItem}
            >
              <button className={`${navLinkClass('services')} flex items-center gap-1`}>
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-card p-2 min-w-[180px]">
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">Fee Analysis</a>
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">Portfolio Review</a>
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">Wealth Planning</a>
                </div>
              </div>
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => handleMouseEnterNavItem('resources')}
              onMouseLeave={handleMouseLeaveNavItem}
            >
              <button className={`${navLinkClass('resources')} flex items-center gap-1`}>
                Resources
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-card p-2 min-w-[180px]">
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">Blog</a>
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">Guides</a>
                  <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md transition-colors">FAQ</a>
                </div>
              </div>
            </div>

            <button 
              className={navLinkClass('about')}
              onMouseEnter={() => handleMouseEnterNavItem('about')}
              onMouseLeave={handleMouseLeaveNavItem}
            >
              About
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-sm">Contact</Button>
            <Button
              onClick={() => navigate('/calculator')}
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
            >
              Start Calculator
            </Button>
          </div>

          <button className="lg:hidden p-2 text-foreground" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/30 px-4 py-4 space-y-2">
          <a href="#" className="block py-2 text-foreground">Services</a>
          <a href="#" className="block py-2 text-foreground">Resources</a>
          <a href="#" className="block py-2 text-foreground">About</a>
          <a href="#" className="block py-2 text-foreground">Contact</a>
          <Button
            onClick={() => navigate('/calculator')}
            className="w-full mt-4 bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
          >
            Start Calculator
          </Button>
        </div>
      </div>
    </nav>
  );
}

function FeatureCards() {
  const features = [
    {
      icon: DollarSign,
      title: 'Discover Hidden Fees',
      description: 'Automatically lookup MER rates for any Canadian fund code and see the real cost.'
    },
    {
      icon: TrendingUp,
      title: 'Calculate True Costs',
      description: 'See exactly how much you\'re paying annually and what that means over time.'
    },
    {
      icon: Shield,
      title: 'Compare Your Services',
      description: 'Understand what you\'re getting for your fees and whether it\'s worth it.'
    }
  ];

  return (
    <section className="relative z-10 py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-green animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main>
        <HeroGrid 
          onPrimaryCtaClick={() => navigate('/calculator')}
          onSecondaryCtaClick={() => {
            const featuresSection = document.querySelector('#features');
            featuresSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        
        <div id="features">
          <FeatureCards />
        </div>
        
        {/* CTA Section */}
        <section className="relative z-10 py-20 galaxy-bg">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to see your <span className="text-gradient-green">true costs</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              It only takes a minute to discover what you're really paying in investment fees.
            </p>
            <Button
              onClick={() => navigate('/calculator')}
              size="lg"
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green px-8"
            >
              Start Free Calculator
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/30 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm text-muted-foreground">© 2025 Black Star Wealth. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
