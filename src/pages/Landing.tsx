import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, ChevronDown, Menu, X, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';

function Navbar() {
  const navigate = useNavigate();
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    services: false,
    resources: false,
  });

  const handleMouseEnterNavItem = (item: string) => setHoveredNavItem(item);
  const handleMouseLeaveNavItem = () => setHoveredNavItem(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileDropdowns({ services: false, resources: false });
    }
  };

  const toggleMobileDropdown = (key: keyof typeof mobileDropdowns) => {
    setMobileDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setMobileDropdowns({ services: false, resources: false });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Star className="h-7 w-7 text-primary fill-primary" />
            <span className="font-display text-lg font-bold tracking-tight">
              Black Star <span className="text-gradient-green">Wealth</span>
            </span>
          </div>

          {/* Desktop Navigation */}
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

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-sm">
              Contact
            </Button>
            <Button
              onClick={() => navigate('/calculator')}
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green"
            >
              Start Calculator
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/30 px-4 py-4 space-y-2">
          <div>
            <button
              className="w-full flex items-center justify-between py-2 text-foreground"
              onClick={() => toggleMobileDropdown('services')}
              aria-expanded={mobileDropdowns.services}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdowns.services ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${mobileDropdowns.services ? 'max-h-40' : 'max-h-0'}`}>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">Fee Analysis</a>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">Portfolio Review</a>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">Wealth Planning</a>
            </div>
          </div>

          <div>
            <button
              className="w-full flex items-center justify-between py-2 text-foreground"
              onClick={() => toggleMobileDropdown('resources')}
              aria-expanded={mobileDropdowns.resources}
            >
              Resources
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdowns.resources ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${mobileDropdowns.resources ? 'max-h-40' : 'max-h-0'}`}>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">Blog</a>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">Guides</a>
              <a href="#" className="block py-2 pl-4 text-sm text-muted-foreground">FAQ</a>
            </div>
          </div>

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

function HeroSection() {
  const navigate = useNavigate();
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          const maxScroll = 400;
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
          const translateY = scrollPosition * 0.3;

          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = opacity.toString();
            heroContentRef.current.style.transform = `translateY(${translateY}px)`;
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Card className="w-full min-h-[600px] md:min-h-[700px] bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="hsl(145 80% 50%)"
      />

      <div className="flex flex-col md:flex-row h-full min-h-[600px] md:min-h-[700px] pt-16">
        {/* Left content */}
        <div 
          ref={heroContentRef}
          className="flex-1 p-8 md:p-12 lg:p-16 relative z-10 flex flex-col justify-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Discover what you're{' '}
            <span className="text-gradient-green">really paying</span>{' '}
            in fees.
          </h1>
          <p className="mt-6 text-neutral-300 max-w-lg text-lg">
            Uncover hidden costs in your mutual funds and seg funds. 
            Our calculator reveals the true impact of management fees on your wealth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={() => navigate('/calculator')}
              size="lg"
              className="bg-gradient-green hover:opacity-90 text-primary-foreground font-semibold shadow-green px-8"
            >
              Calculate My Fees
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-neutral-700 hover:bg-neutral-800 text-neutral-200"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Right content - 3D Scene */}
        <div className="flex-1 relative min-h-[300px] md:min-h-0">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
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

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main>
        <HeroSection />
        <FeatureCards />
        
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
