import { Search, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import TileCard from "./TileCard";

export interface TileSKU {
  id: string;
  name: string;
  image: string;
  size: string;
  price?: string;
  isCustom?: boolean;
  file?: File;
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
  const [customTile, setCustomTile] = useState<TileSKU | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTiles = mockTiles.filter(tile =>
    tile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomTileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (JPG or PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const customTileData: TileSKU = {
        id: 'custom-tile-' + Date.now(),
        name: 'Custom Tile',
        image: reader.result as string,
        size: 'Custom',
        price: 'Custom',
        isCustom: true,
        file: file
      };
      setCustomTile(customTileData);
      onTileSelect(customTileData);
    };
    reader.readAsDataURL(file);
  };

  const removeCustomTile = () => {
    setCustomTile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      {/* Custom Tile Upload Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-xl font-semibold">Upload Custom Tile</h3>
          {customTile && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeCustomTile}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomTileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Tile Image
          </Button>
          <span className="text-sm text-muted-foreground">
            JPG, PNG up to 10MB
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto pr-2">
        {/* Show custom tile first if uploaded */}
        {customTile && (
          <TileCard
            key={customTile.id}
            tile={customTile}
            isSelected={selectedTile?.id === customTile.id}
            onClick={() => onTileSelect(customTile)}
          />
        )}
        
        {/* Show predefined tiles */}
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
