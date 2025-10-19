import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const Header = ({ onBack, showBackButton = false }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-white backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <img 
            src="/logo/roommorph.ai logo.jpg" 
            alt="RoomMorph.AI Logo" 
            className="h-12 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
