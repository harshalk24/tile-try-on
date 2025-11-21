import { Eye, GitCompare, Zap } from "lucide-react";

const ValueProposition = () => {
  const valueProps = [
    {
      icon: Eye,
      title: "Realistic visualizations",
      benefit: "See how your own room looks with new tiles — just upload a photo and preview floors and walls with photorealistic accuracy"
    },
    {
      icon: GitCompare,
      title: "Compare Before-After in real time",
      benefit: "Slide between original and transformed views to understand exactly how the space changes with your selected tile"
    },
    {
      icon: Zap,
      title: "Instant cost estimate",
      benefit: "Get an approximate cost for your selected tiles — whether for floors or walls — based on your room’s measurements"
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-lg text-[#222] mb-12 max-w-2xl mx-auto">
          We help homeowners, designers, and retailers pick the right finishes — faster.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <div 
              key={index}
              className="text-center p-8 rounded-lg bg-[#F6F7F8] hover:bg-[#E6E6E6] transition-colors"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-6">
                <prop.icon className="h-8 w-8 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold text-[#222] mb-3">
                {prop.title}
              </h3>
              <p className="text-[#222]/70">
                {prop.benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;

