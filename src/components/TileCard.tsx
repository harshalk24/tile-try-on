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
        group relative cursor-pointer rounded-lg overflow-hidden
        transition-all duration-300 bg-card aspect-square
        ${isSelected 
          ? "ring-2 ring-[#FF6B35] shadow-md" 
          : "ring-1 ring-[#E6E6E6] hover:ring-[#FF6B35]/40"
        }
      `}
    >
      <div className="w-full h-full overflow-hidden bg-muted">
        <img
          src={tile.image}
          alt={tile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {isSelected && (
        <div className="absolute top-1 right-1 bg-[#FF6B35] rounded-full p-1 animate-scale-in shadow-md">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Heart icon for favorites - similar to reference */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isSelected && (
          <div className="bg-white/80 rounded-full p-1">
            <svg className="h-3 w-3 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default TileCard;
