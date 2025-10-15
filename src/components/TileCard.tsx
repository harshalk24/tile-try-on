import { Check } from "lucide-react";
import { TileSKU } from "./TileGallery";

interface TileCardProps {
  tile: TileSKU;
  isSelected: boolean;
  onClick: () => void;
}

const TileCard = ({ tile, isSelected, onClick }: TileCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-2xl overflow-hidden
        transition-all duration-300 bg-card
        ${isSelected 
          ? "ring-2 ring-primary shadow-large scale-[1.02]" 
          : "ring-1 ring-border hover:ring-primary/40 hover:shadow-medium"
        }
      `}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={tile.image}
          alt={tile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {isSelected && (
        <div className="absolute top-3 right-3 bg-primary rounded-full p-1.5 animate-scale-in shadow-medium">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div className="p-4 space-y-1">
        <p className="font-semibold text-sm">{tile.name}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tile.size}"</span>
          {tile.price && <span className="font-medium">{tile.price}</span>}
        </div>
      </div>
    </div>
  );
};

export default TileCard;
