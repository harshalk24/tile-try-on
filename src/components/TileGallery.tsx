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

// Tile data - update with your actual tile images
const mockTiles: TileSKU[] = [
  {
    id: "marble-white-001",
    name: "Carrara Marble White",
    image: "/tiles/marble-tile.jpg", // Replace with your image path
    size: "24x24",
    price: "$8.99/sq ft"
  },
  {
    id: "oak-wood-002",
    name: "Natural Oak Wood",
    image: "/tiles/oak-wood.webp", // Replace with your image path
    size: "8x48",
    price: "$6.49/sq ft"
  },
  {
    id: "oak-wood-001",
    name: "Natural Wood",
    image: "/tiles/wooden-tile.jpg", // Replace with your image path
    size: "8x48",
    price: "$6.49/sq ft"
  },
  {
    id: "slate-grey-003",
    name: "Modern Slate Grey",
    image: "/tiles/design-tile.jpg", // Replace with your image path
    size: "12x24",
    price: "$7.29/sq ft"
  }
  // {
  //   id: "terracotta-004",
  //   name: "Rustic Terracotta",
  //   image: "/tiles/terracotta-004.jpg", // Replace with your image path
  //   size: "12x12",
  //   price: "$5.99/sq ft"
  // },
  // {
  //   id: "black-granite-005",
  //   name: "Premium Black Granite",
  //   image: "/tiles/black-granite-005.jpg", // Replace with your image path
  //   size: "24x24",
  //   price: "$9.99/sq ft"
  // },
  // {
  //   id: "hexagon-white-006",
  //   name: "Hexagon White Matte",
  //   image: "/tiles/hexagon-white-006.jpg", // Replace with your image path
  //   size: "8x8",
  //   price: "$7.99/sq ft"
  // }
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-6">Choose Your Tile</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full border-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto pr-2">
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
