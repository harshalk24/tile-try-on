import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-32 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span style={{ color: 'white' }}>Visualization made</span>
          <br />
          <span style={{ color: 'black' }}>stunningly simple</span>
        </h1>
        <p className="text-lg md:text-xl mb-16 max-w-2xl mx-auto" style={{ color: 'black' }}>
          Built for brands that want to inspire, convert and grow - everywhere they sell.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base"
          >
            Try our visualizer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="rounded-full px-8 text-base border-2"
          >
            Book a demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
