import { Button } from "./ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/logo/Nazaraa-logo.png" 
            alt="Nazaraa Logo" 
            className="h-12 sm:h-16 md:h-20 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
          <a href="/products" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Products
          </a>
          <a href="/about" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            About Us
          </a>
          <a href="/blog" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Blogs
          </a>
          <a href="/contact" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Contact Us
          </a>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 sm:px-6 text-sm sm:text-base">
          Log In
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
