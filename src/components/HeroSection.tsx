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
        {/* Dark gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      {/* Content - Centered vertically and horizontally */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
          Visualize your space.
          <br />
          Choose with confidence.
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/90">
         Open the door to your future space—beyond imagination, into an experience.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-10 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
            aria-label="Try our visualizer - Start visualizing your space"
          >
            Try our visualizer
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="rounded-full px-10 py-6 text-lg border-2 border-white/80 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-[#222] transition-all font-medium"
          >
            Book appointment
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
