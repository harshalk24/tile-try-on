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
        group relative cursor-pointer rounded-xl overflow-hidden
        transition-all duration-300
        ${isSelected 
          ? "ring-2 ring-primary shadow-large scale-105" 
          : "ring-1 ring-border hover:ring-primary/50 hover:shadow-medium hover:scale-[1.02]"
        }
      `}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={tile.image}
          alt={tile.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary rounded-full p-1 animate-scale-in">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-semibold text-sm mb-1">{tile.name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/80">{tile.size}"</span>
          {tile.price && <span className="text-white/80">{tile.price}</span>}
        </div>
      </div>
    </div>
  );
};

export default TileCard;
