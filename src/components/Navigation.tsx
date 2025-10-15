import { Button } from "./ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold tracking-tight">
            Roommorph.ai
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Products
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            About Us
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Blogs
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Contact Us
          </a>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
          Log In
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
