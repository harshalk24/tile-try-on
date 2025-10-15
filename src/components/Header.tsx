import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Roommorph.AI
          </h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Visualize tiles in your space instantly
        </p>
      </div>
    </header>
  );
};

export default Header;
