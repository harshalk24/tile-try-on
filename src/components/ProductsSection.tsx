import { Button } from "./ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
}

const ProductsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const products: Product[] = [
    {
      id: "floors",
      name: "Floors",
      description: "Explore tile, hardwood, and luxury vinyl options",
      thumbnail: "/tiles/marble-tile.jpg",
      category: "floors"
    },
    {
      id: "countertops",
      name: "Countertops",
      description: "Granite, quartz, and marble surfaces",
      thumbnail: "/tiles/design-tile.jpg",
      category: "countertops"
    },
    {
      id: "rugs",
      name: "Rugs",
      description: "Area rugs and carpeting solutions",
      thumbnail: "/tiles/oak-wood.webp",
      category: "rugs"
    },
    {
      id: "walls",
      name: "Walls",
      description: "Wall tiles, paint, and decorative finishes",
      thumbnail: "/tiles/wooden-tile.jpg",
      category: "walls"
    }
  ];

  const categories = ["all", "floors", "countertops", "rugs", "walls"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 px-6 bg-[#FF6B35]/10">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-[#222] mb-4">
          Products
        </h2>
        <p className="text-center text-[#222]/70 mb-12 max-w-2xl mx-auto">
          Browse our extensive catalog of materials and finishes
        </p>

        {/* Filter / Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#222]/40" />
            <Input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white border-[#E6E6E6]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#222]/40" />
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white text-[#222] hover:bg-[#E6E6E6] border border-[#E6E6E6]"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-[#F6F7F8] overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#222] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-[#222]/70 mb-4">
                  {product.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                >
                  Explore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

