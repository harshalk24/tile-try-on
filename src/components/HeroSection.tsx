import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate("/login");
    }
  };
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-24">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/homepage_images/home-page-img.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      >
      </div>

      {/* Content - Positioned higher on the image */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto mt-12 sm:mt-16 md:mt-24">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-white">
          Visualize your space.
          <br />
          Choose with confidence.
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto text-white/90 px-4">
         Beyond imagination, into an experience.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 px-4">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            aria-label="Try our visualizer - Start visualizing your space"
          >
            Try our visualizer
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="rounded-full px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg border-2 border-white/80 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-[#222] transition-all font-medium w-full sm:w-auto"
          >
            Book appointment
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
