import { Button } from "./ui/button";
import { Home, Store } from "lucide-react";

const TargetAudience = () => {
  const personas = [
    {
      icon: Store,
      title: "Retailer",
      bullets: [
        "Bulk upload capabilities",
        "Branded visualizer experience",
        "Analytics & insights dashboard"
      ],
      cta: "See solutions",
      callout: "B2B features available"
    },
    {
      icon: Home,
      title: "Homeowner",
      bullets: [
        "Visualize before you buy",
        "Compare materials side-by-side",
        "Order samples delivered to your door"
      ],
      cta: "See solutions"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#222] mb-8 sm:mb-12 px-4">
          Find a solution that's right for you
        </h2>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-[#F6F7F8] rounded-lg p-6 sm:p-8 hover:bg-[#E6E6E6] transition-colors flex flex-col"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#FF6B35]/10 mb-4 sm:mb-6">
                <persona.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#FF6B35]" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-semibold text-[#222] mb-3 sm:mb-4">
                {persona.title}
              </h3>

              {persona.callout && (
                <div className="mb-3 sm:mb-4 px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs sm:text-sm font-medium rounded-full inline-block">
                  {persona.callout}
                </div>
              )}

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                {persona.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start text-sm sm:text-base text-[#222]/70">
                    <span className="text-[#FF6B35] mr-2">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full mt-auto"
                aria-label={`See solutions for ${persona.title}`}
              >
                {persona.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;

