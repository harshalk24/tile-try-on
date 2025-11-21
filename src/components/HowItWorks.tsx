import { Upload, Grid3x3, Eye, Calculator, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Select a room or upload a photo",
      description: "Choose from our room templates or upload your own space"
    },
    {
      icon: Grid3x3,
      title: "Pick materials from our library",
      description: "Browse thousands of materials and finishes"
    },
    {
      icon: Eye,
      title: "See photorealistic render & compare options",
      description: "View your space with different materials side-by-side"
    },
    {
      icon: Calculator,
      title: "Cost estimate",
      description: "Get instant cost estimates for retailers and customers based on room measurements"
    }
  ];

  return (
    <section className="py-20 px-6 bg-[#FF6B35]/10">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-[#222] mb-4">
          How it works
        </h2>
        <p className="text-center text-[#222]/70 mb-16 max-w-2xl mx-auto">
          Get started in minutes with our simple, intuitive process
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 items-stretch">
          {steps.map((step, index) => (
            <div key={index} className="relative flex">
              <div className="bg-white rounded-lg p-6 text-center flex flex-col w-full h-full">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4 mx-auto flex-shrink-0">
                  <step.icon className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-[#222] mb-2 min-h-[3rem]">
                  {step.title}
                </h3>
                <p className="text-sm text-[#222]/70 flex-grow">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-[#FF6B35]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conversion CTA */}
        <div className="text-center bg-white rounded-lg p-8 max-w-3xl mx-auto">
          <p className="text-lg text-[#222] mb-6">
          Proven to increase retailer conversion rates by <span className="font-bold text-[#FF6B35]">40%</span> and reduce customer tile-selection time by <span className="font-bold text-[#FF6B35]">50%</span>— get started in under 5 minutes.
          </p>
          <Button
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-10 py-6 text-lg font-medium"
          >
            Get started now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

