import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureSlideProps {
  onGetStarted?: () => void;
}

const FeatureSlide = ({ onGetStarted }: FeatureSlideProps) => {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] md:min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/homepage_images/Slide-4.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-white/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#222] mb-4 sm:mb-6">
            Who are we catering to?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8 sm:mb-12">
          {/* Large Retailer */}
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-[#222]">
              Large Retailer
            </h3>
            <p className="text-base sm:text-lg text-[#222]/70 leading-relaxed">
              Deliver in-store and online solutions that increase sales and enhance customer satisfaction.
            </p>
          </div>

          {/* E-Commerce */}
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-[#222]">
              E-Commerce
            </h3>
            <p className="text-base sm:text-lg text-[#222]/70 leading-relaxed">
              Transform online shopping experiences and boost conversions with seamless visualization tools.
            </p>
          </div>

          {/* Architects & Designers */}
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-[#222]">
              Architects & Designers
            </h3>
            <p className="text-base sm:text-lg text-[#222]/70 leading-relaxed">
              Visualize ideas with ease and bring client concepts to life with immersive design tools.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        {onGetStarted && (
          <div className="text-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all"
              aria-label="Start visualizing your space"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureSlide;

