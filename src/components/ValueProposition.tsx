import { useState } from "react";
import { Eye, GitCompare, Zap, Image as ImageIcon } from "lucide-react";

const ValueProposition = () => {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const valueProps = [
    {
      icon: Eye,
      title: "Realistic visualizations",
      benefit: "See how your own room looks with new tiles — just upload a photo and preview floors and walls with photorealistic accuracy",
      image: "/homepage_images/realistic-visualization.jpg"
    },
    {
      icon: GitCompare,
      title: "Enhanced Customer Experience",
      benefit: "Customers make decisions 5x faster and convert up to 2.5x more when they can see materials in their own space with Nazaraa.",
      image: "/homepage_images/customer-experience.jpg"
    },
    {
      icon: Zap,
      title: "Instant cost estimate",
      benefit: "Get an approximate cost for your selected tiles — whether for floors or walls — based on your room's measurements",
      image: "/homepage_images/cost-estimate.jpg"
    }
  ];

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 bg-white">
      <div className="container mx-auto max-w-7xl">
        <p className="text-center text-base sm:text-lg text-[#222] mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
          We help homeowners, designers, and retailers pick the right finishes — faster.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
          {valueProps.map((prop, index) => (
            <div 
              key={index}
              className="text-center rounded-lg bg-[#F6F7F8] hover:bg-[#E6E6E6] transition-all overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Image Section */}
              <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/10">
                {imageErrors[index] ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF6B35]/20">
                      <ImageIcon className="h-10 w-10 text-[#FF6B35]" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={prop.image} 
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-4 sm:p-6 md:p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#FF6B35]/10 mb-4 sm:mb-6">
                  <prop.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#222] mb-2 sm:mb-3">
                  {prop.title}
                </h3>
                <p className="text-sm sm:text-base text-[#222]/70">
                  {prop.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;

