import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import TileCard from "./TileCard";

export interface TileSKU {
  id: string;
  name: string;
  image: string;
  size: string;
  price?: string;
}

// Mock data - replace with actual tile SKUs
const mockTiles: TileSKU[] = [
  {
    id: "marble-white-001",
    name: "Carrara Marble White",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400",
    size: "24x24",
    price: "$8.99/sq ft"
  },
  {
    id: "oak-wood-002",
    name: "Natural Oak Wood",
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400",
    size: "8x48",
    price: "$6.49/sq ft"
  },
  {
    id: "slate-grey-003",
    name: "Modern Slate Grey",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    size: "12x24",
    price: "$7.29/sq ft"
  },
  {
    id: "terracotta-004",
    name: "Rustic Terracotta",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400",
    size: "12x12",
    price: "$5.99/sq ft"
  },
  {
    id: "black-granite-005",
    name: "Premium Black Granite",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400",
    size: "24x24",
    price: "$9.99/sq ft"
  },
  {
    id: "hexagon-white-006",
    name: "Hexagon White Matte",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
    size: "8x8",
    price: "$7.99/sq ft"
  }
];

interface TileGalleryProps {
  onTileSelect: (tile: TileSKU) => void;
  selectedTile: TileSKU | null;
}

const TileGallery = ({ onTileSelect, selectedTile }: TileGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTiles = mockTiles.filter(tile =>
    tile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Select a Tile</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
        {filteredTiles.map((tile) => (
          <TileCard
            key={tile.id}
            tile={tile}
            isSelected={selectedTile?.id === tile.id}
            onClick={() => onTileSelect(tile)}
          />
        ))}
      </div>
    </div>
  );
};

export default TileGallery;
