import { X, Share2, Download, RotateCcw, ZoomIn, RotateCw, Grid3x3, GitCompare, Filter, Heart, Upload, Layout, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisualizationResult from "./VisualizationResult";
import { VisualizationService } from "@/services/visualizationService";
import { toast } from "sonner";

interface VisualizerPreviewProps {
  onEnterVisualizer: (imageFile?: File, tileId?: string, renderImageUrl?: string) => void;
  onExit: () => void;
  onUploadRoom?: (file: File) => void;
  onSwitchToOldUI?: () => void;
}

// Room renders from collection - organized by room type
type RoomType = "living-room" | "bedroom" | "bathroom" | "kitchen";

interface RoomRender {
  id: string;
  name: string;
  image: string;
  type: RoomType;
}

const roomRenders: RoomRender[] = [
  {
    id: "kitchen-1",
    name: "Modern Kitchen",
    image: "/room_renders/kitchen/kitchen 1.jpg",
    type: "kitchen",
  },
  {
    id: "bathroom-1",
    name: "Modern Bathroom",
    image: "/room_renders/bathroom/bathroom 1.jpg",
    type: "bathroom",
  },
  {
    id: "bedroom-1",
    name: "Cozy Bedroom",
    image: "/room_renders/bedroom/bedroom 1.jpg",
    type: "bedroom",
  },
  {
    id: "living-room-1",
    name: "Living Room Render",
    image: "/room_renders/living-room/room-render-3.jpg",
    type: "living-room",
  }
];

// Room type cards for selection
const roomTypes = [
  {
    type: "kitchen" as RoomType,
    label: "Kitchen",
    thumbnail: "/room_renders/kitchen/thumbnail.jpg", // You'll add this thumbnail
  },
  {
    type: "bathroom" as RoomType,
    label: "Bathroom",
    thumbnail: "/room_renders/bathroom/thumbnail.jpg", // You'll add this thumbnail
  },
  {
    type: "living-room" as RoomType,
    label: "Living Room",
    thumbnail: "/room_renders/living-room/thumbnail.jpg", // You'll add this thumbnail
  },
  {
    type: "bedroom" as RoomType,
    label: "Bedroom",
    thumbnail: "/room_renders/bedroom/thumbnail.jpg", // You'll add this thumbnail
  },
];

const VisualizerPreview = ({ onEnterVisualizer, onExit, onUploadRoom, onSwitchToOldUI }: VisualizerPreviewProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<"Floors" | "Walls">("Floors");
  const [visualizationType, setVisualizationType] = useState<"floor" | "walls" | "both">("floor");
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>("living-room");
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true); // Initially show thumbnail
  const [customRoomImage, setCustomRoomImage] = useState<string | null>(null);
  const [customRoomFile, setCustomRoomFile] = useState<File | null>(null);
  const [selectedFloorTile, setSelectedFloorTile] = useState<string | null>(null);
  const [selectedWallTile, setSelectedWallTile] = useState<string | null>(null);
  const [customFloorTile, setCustomFloorTile] = useState<{ id: string; file: File; preview: string } | null>(null);
  const [customWallTile, setCustomWallTile] = useState<{ id: string; file: File; preview: string } | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const floorTileInputRef = useRef<HTMLInputElement>(null);
  const wallTileInputRef = useRef<HTMLInputElement>(null);

  // Check server status on component mount
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await VisualizationService.checkServerHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    };
    checkServer();
  }, []);

  // Auto-switch category when visualization type changes
  useEffect(() => {
    if (visualizationType === "walls") {
      setSelectedCategory("Walls");
    } else if (visualizationType === "floor") {
      setSelectedCategory("Floors");
    }
    // For "both", keep current category or default to "Floors"
  }, [visualizationType]);
  
  // Material swatches - using actual tile images
  const materialSwatches = [
    { id: "marble-white-001", image: "/tiles/marble-tile.jpg", name: "Carrara Marble" },
    { id: "oak-wood-002", image: "/tiles/oak-wood.webp", name: "Natural Oak" },
    { id: "oak-wood-001", image: "/tiles/wooden-tile.jpg", name: "Natural Wood" },
    { id: "slate-grey-003", image: "/tiles/design-tile.jpg", name: "Slate Grey" },
    // Add more swatches to fill the grid
    ...Array.from({ length: 28 }, (_, i) => ({
      id: `swatch-${i + 4}`,
      image: null,
      color: `#${['d6c7b0', 'bfbfbf', '8c8c8c', 'f3f3f3', 'a8a8a8', 'e0e0e0'][i % 6]}`,
      name: `Material ${i + 5}`
    }))
  ];

  // Filter renders based on selected room type
  const filteredRenders = roomRenders.filter(render => render.type === selectedRoomType);

  // Reset room index when room type changes and show the thumbnail
  useEffect(() => {
    setCurrentRoomIndex(0);
    setCustomRoomImage(null);
    setCustomRoomFile(null);
    setShowThumbnail(true); // Show thumbnail when room type changes
  }, [selectedRoomType]);

  const handleChangeRoom = () => {
    setCustomRoomImage(null); // Clear custom image when changing room
    setCustomRoomFile(null); // Clear custom file when changing room
    setShowThumbnail(false); // Switch to showing renders instead of thumbnail
    if (filteredRenders.length > 0) {
      setCurrentRoomIndex((prev) => (prev + 1) % filteredRenders.length);
    }
  };

  const handleTileSelect = (tileId: string) => {
    // Select tile based on current category
    if (selectedCategory === "Floors") {
      const isCurrentlySelected = selectedFloorTile === tileId;
      setSelectedFloorTile(isCurrentlySelected ? null : tileId);
      // Clear custom floor tile if selecting a predefined tile (not the custom one)
      if (!isCurrentlySelected && tileId !== customFloorTile?.id) {
        setCustomFloorTile(null);
      }
    } else {
      const isCurrentlySelected = selectedWallTile === tileId;
      setSelectedWallTile(isCurrentlySelected ? null : tileId);
      // Clear custom wall tile if selecting a predefined tile (not the custom one)
      if (!isCurrentlySelected && tileId !== customWallTile?.id) {
        setCustomWallTile(null);
      }
    }
  };

  const handleCustomTileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "floor" | "wall") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file (JPG or PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const customTile = {
        id: `custom-${type}-tile-${Date.now()}`,
        file: file,
        preview: reader.result as string
      };

      if (type === "floor") {
        setCustomFloorTile(customTile);
        setSelectedFloorTile(customTile.id);
      } else {
        setCustomWallTile(customTile);
        setSelectedWallTile(customTile.id);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (type === "floor" && floorTileInputRef.current) {
      floorTileInputRef.current.value = '';
    } else if (wallTileInputRef.current) {
      wallTileInputRef.current.value = '';
    }
  };

  const handleCursorClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file (JPG or PNG)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Store the file for later use
      setCustomRoomFile(file);
      // Create a preview URL for the uploaded image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomRoomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleGenerateVisualization = async () => {
    // Get room image file or render path
    let roomImageFile: File | null = null;
    let renderImagePath: string | null = null;
    let previewUrl: string | null = null;

    if (customRoomFile) {
      // Custom uploaded image - send as File
      roomImageFile = customRoomFile;
      previewUrl = customRoomImage;
    } else {
      // For render photos, pass the path directly (renders are already on server)
      if (showThumbnail) {
        // When thumbnail is shown, use the thumbnail image for visualization
        const thumbnailPath = roomTypes.find(rt => rt.type === selectedRoomType)?.thumbnail;
        if (!thumbnailPath) {
          toast.error("Thumbnail not found for selected room type");
          return;
        }
        renderImagePath = thumbnailPath;
        previewUrl = thumbnailPath;
      } else {
        // When a specific render is selected, use that render
        const renderToUse = filteredRenders[currentRoomIndex] || filteredRenders[0];
        if (!renderToUse) {
          toast.error("No room renders available");
          return;
        }
        renderImagePath = renderToUse.image;
        previewUrl = renderImagePath;
      }
    }

    // Store the preview URL for the result view
    setOriginalImagePreview(previewUrl);

    if (!roomImageFile && !renderImagePath) {
      toast.error("Please upload a room image or select a render");
      return;
    }

    // Validate based on visualization type
    if (visualizationType === "walls") {
      if (!selectedWallTile) {
        toast.error("Please select a wall tile");
        return;
      }
    } else if (visualizationType === "floor") {
      if (!selectedFloorTile) {
        toast.error("Please select a floor tile");
        return;
      }
    } else if (visualizationType === "both") {
      if (!selectedFloorTile) {
        toast.error("Please select a floor tile");
        return;
      }
      if (!selectedWallTile) {
        toast.error("Please select a wall tile");
        return;
      }
    }

    if (serverStatus !== 'online') {
      toast.error("Visualization server is offline. Please start the backend server.");
      return;
    }

    setIsVisualizing(true);
    setShowResult(true);

    try {
      // Determine tileId and customTileFile for floor
      let tileId: string;
      let customTileFile: File | undefined;
      
      if (visualizationType === "walls") {
        // For walls-only, use dummy floor tile ID
        tileId = "walls-only";
      } else {
        // For floor or both, use selected floor tile
        if (customFloorTile && selectedFloorTile === customFloorTile.id) {
          tileId = customFloorTile.id;
          customTileFile = customFloorTile.file;
        } else {
          tileId = selectedFloorTile!;
        }
      }

      // Determine wallTileFile for walls or both
      let wallTileFile: File | undefined;
      if ((visualizationType === "walls" || visualizationType === "both") && selectedWallTile) {
        if (customWallTile && selectedWallTile === customWallTile.id) {
          wallTileFile = customWallTile.file;
        } else {
          // For predefined wall tiles, fetch the file
          const wallTileImageUrl = materialSwatches.find(s => s.id === selectedWallTile)?.image;
          if (wallTileImageUrl) {
            try {
              const response = await fetch(wallTileImageUrl);
              if (!response.ok) {
                throw new Error(`Failed to fetch wall tile image: ${response.statusText}`);
              }
              const blob = await response.blob();
              // Ensure proper MIME type - default to image/jpeg if not set
              const mimeType = blob.type || 'image/jpeg';
              // Determine file extension from URL or MIME type
              let extension = 'jpg';
              if (mimeType.includes('png')) extension = 'png';
              else if (mimeType.includes('webp')) extension = 'webp';
              wallTileFile = new File([blob], `wall-tile-${selectedWallTile}.${extension}`, { type: mimeType });
            } catch (error) {
              console.error("Error loading wall tile image:", error);
              toast.error("Failed to load wall tile image");
              setIsVisualizing(false);
              setShowResult(false);
              return;
            }
          } else {
            toast.error("Wall tile image not found");
            setIsVisualizing(false);
            setShowResult(false);
            return;
          }
        }
      }

      const result = await VisualizationService.visualizeRoom({
        roomImage: roomImageFile || undefined,
        renderImagePath: renderImagePath || undefined,
        tileId: tileId,
        customTileFile: customTileFile,
        visualizationType: visualizationType,
        wallTileFile: wallTileFile
      });

      if (result.success) {
        // Ensure we use the exact URL from the API response (with cache-busting)
        const imageUrl = result.imageUrl;
        console.log('✓ Setting visualized image URL:', imageUrl);
        console.log('✓ This is the real-time nano-banana generated image');
        setVisualizedImage(imageUrl);
        toast.success("Visualization complete!");
      } else {
        throw new Error(result.message || 'Visualization failed');
      }
    } catch (error) {
      console.error("Visualization error:", error);
      toast.error(`Failed to visualize: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowResult(false);
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setVisualizedImage(null);
  };

  // Show result view if visualization is complete
  if (showResult && originalImagePreview) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
        <header className="h-[72px] bg-white border-b border-[#E6E6E6] shadow-sm sticky top-0 z-50">
          <div className="w-full px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo/Nazaraa-logo.png" 
                alt="Company Logo" 
                className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B]"
              onClick={handleBack}
            >
              <X className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <VisualizationResult
            originalImage={originalImagePreview}
            visualizedImage={visualizedImage}
            isLoading={isVisualizing}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-[72px] bg-white border-b border-[#E6E6E6] shadow-sm sticky top-0 z-50">
        <div className="w-full px-6 h-full flex items-center justify-between">
          {/* Left: Logo and UI Toggle */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo/Nazaraa-logo.png" 
              alt="Company Logo" 
              className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            />
            {onSwitchToOldUI && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B] border-[#E6E6E6]"
                onClick={onSwitchToOldUI}
              >
                <Layout className="h-4 w-4" />
                Switch to Old UI
              </Button>
            )}
          </div>

          {/* Center: Action Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B]"
              onClick={onExit}
            >
              <X className="h-4 w-4" />
              Exit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B]"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B]"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#6B6B6B] hover:text-[#2B2B2B]"
              onClick={handleChangeRoom}
            >
              <RotateCcw className="h-4 w-4" />
              Change Room
            </Button>
          </div>

          {/* Right: Book Appointment Button */}
          <Button 
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-6"
            onClick={() => {}}
          >
            Book Appointment
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Material Picker */}
        <aside className="w-[290px] bg-white border-r border-[#E6E6E6] overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-4">
            {/* Category Toggle Chips */}
            <div className="flex flex-wrap gap-2">
              {(["Floors", "Walls"] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#FF6B35] text-white"
                      : "bg-[#f6f7f8] text-[#6B6B6B] hover:bg-[#E6E6E6]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Upload Button - Before Filter */}
            <div className="flex items-center gap-2">
              <input
                ref={selectedCategory === "Floors" ? floorTileInputRef : wallTileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => handleCustomTileUpload(e, selectedCategory === "Floors" ? "floor" : "wall")}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-[#6B6B6B] hover:text-[#2B2B2B] border-[#E6E6E6]"
                onClick={() => {
                  if (selectedCategory === "Floors" && floorTileInputRef.current) {
                    floorTileInputRef.current.click();
                  } else if (wallTileInputRef.current) {
                    wallTileInputRef.current.click();
                  }
                }}
              >
                <Upload className="h-4 w-4" />
                Upload {selectedCategory === "Floors" ? "Floor" : "Wall"} Tile
              </Button>
            </div>

            {/* Filters Icon */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2B2B2B]">Materials</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4 text-[#6B6B6B]" />
              </Button>
            </div>

            {/* Material Swatches Grid - 4 columns */}
            <div className="grid grid-cols-4 gap-3">
              {/* Show custom tile first if uploaded for current category */}
              {selectedCategory === "Floors" && customFloorTile && (
                <div
                  className={`relative group cursor-pointer transition-all ${
                    selectedFloorTile === customFloorTile.id ? 'ring-2 ring-[#FF6B35] ring-offset-2' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTileSelect(customFloorTile.id)}
                >
                  <img
                    src={customFloorTile.preview}
                    alt="Custom Floor Tile"
                    className={`w-16 h-16 rounded-lg shadow-sm border object-cover transition-transform hover:scale-105 ${
                      selectedFloorTile === customFloorTile.id ? 'border-[#FF6B35] border-2' : 'border-[#E6E6E6]'
                    }`}
                  />
                  {selectedFloorTile === customFloorTile.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FF6B35]/20 rounded-lg">
                      <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {selectedCategory === "Walls" && customWallTile && (
                <div
                  className={`relative group cursor-pointer transition-all ${
                    selectedWallTile === customWallTile.id ? 'ring-2 ring-[#FF6B35] ring-offset-2' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTileSelect(customWallTile.id)}
                >
                  <img
                    src={customWallTile.preview}
                    alt="Custom Wall Tile"
                    className={`w-16 h-16 rounded-lg shadow-sm border object-cover transition-transform hover:scale-105 ${
                      selectedWallTile === customWallTile.id ? 'border-[#FF6B35] border-2' : 'border-[#E6E6E6]'
                    }`}
                  />
                  {selectedWallTile === customWallTile.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FF6B35]/20 rounded-lg">
                      <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show predefined tiles */}
              {materialSwatches.map((swatch) => {
                const isSelected = selectedCategory === "Floors" 
                  ? selectedFloorTile === swatch.id 
                  : selectedWallTile === swatch.id;
                return (
                  <div
                    key={swatch.id}
                    className={`relative group cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-[#FF6B35] ring-offset-2' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTileSelect(swatch.id)}
                  >
                    {swatch.image ? (
                      <img
                        src={swatch.image}
                        alt={swatch.name}
                        className={`w-16 h-16 rounded-lg shadow-sm border object-cover transition-transform hover:scale-105 ${
                          isSelected ? 'border-[#FF6B35] border-2' : 'border-[#E6E6E6]'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-lg shadow-sm border transition-transform hover:scale-105 ${
                          isSelected ? 'border-[#FF6B35] border-2' : 'border-[#E6E6E6]'
                        }`}
                        style={{ backgroundColor: (swatch as any).color || '#d6c7b0' }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#FF6B35]/20 rounded-lg">
                        <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <button
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 rounded-full z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite
                      }}
                      aria-label="Add to favorites"
                    >
                      <Heart className="h-3 w-3 text-[#6B6B6B] fill-none" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative overflow-y-auto min-h-0 bg-[#f6f7f8]">
          <div className="relative w-full min-h-full flex items-center justify-center">
            {/* Hidden file input for room upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Floor/Wall Toggle - Above image */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="flex items-center bg-[#4A4A4A] rounded-md p-0.5 gap-0.5">
                <button
                  onClick={() => setVisualizationType("floor")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 text-sm ${
                    visualizationType === "floor"
                      ? "bg-[#2B2B2B] text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {visualizationType === "floor" && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center mr-0.5">
                      <svg className="w-2.5 h-2.5 text-[#2B2B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  Floor
                </button>
                <button
                  onClick={() => setVisualizationType("walls")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 text-sm ${
                    visualizationType === "walls"
                      ? "bg-[#2B2B2B] text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {visualizationType === "walls" && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#2B2B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  Walls
                </button>
                <button
                  onClick={() => setVisualizationType("both")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 text-sm ${
                    visualizationType === "both"
                      ? "bg-[#2B2B2B] text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {visualizationType === "both" && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#2B2B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  Both
                </button>
              </div>
            </div>
            
            {/* Room Image */}
            <img
              src={
                customRoomImage || 
                (showThumbnail 
                  ? (roomTypes.find(rt => rt.type === selectedRoomType)?.thumbnail || "") 
                  : (filteredRenders[currentRoomIndex] || filteredRenders[0])?.image || "")
              }
              alt={
                customRoomImage 
                  ? "Custom room photo" 
                  : showThumbnail 
                    ? `${roomTypes.find(rt => rt.type === selectedRoomType)?.label || ""} thumbnail`
                    : (filteredRenders[currentRoomIndex] || filteredRenders[0])?.name || "Room render"
              }
              className="w-full max-w-[1200px] h-auto max-h-[85vh] object-contain"
            />



            {/* Large Circular Cursor CTA - Show when no custom image is uploaded */}
            {!customRoomImage && (
              <button
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[294px] md:h-[294px] bg-[rgba(255,107,53,0.55)] hover:bg-[rgba(255,107,53,0.78)] rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.28)] cursor-pointer transition-all duration-200 hover:scale-[1.06] hover:shadow-[0_18px_40px_rgba(0,0,0,0.36)] focus:outline-none focus:ring-4 focus:ring-white/40 z-30"
                onClick={handleCursorClick}
                aria-label="Upload custom room photo"
                title="Upload custom room photo"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-[39%] h-[39%]"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 5 17 10" />
                  <line x1="12" y1="5" x2="12" y2="15" />
                </svg>
              </button>
            )}

            {/* Bottom Toolbar - Always show Generate button */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-40">
              {serverStatus === 'offline' && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Visualization server is offline. Please start the backend server.</span>
                </div>
              )}
              {/* Check if requirements are met */}
              {(() => {
                const isFloorReady = visualizationType === "floor" && selectedFloorTile;
                const isWallsReady = visualizationType === "walls" && selectedWallTile;
                const isBothReady = visualizationType === "both" && selectedFloorTile && selectedWallTile;
                const isReady = isFloorReady || isWallsReady || isBothReady;
                const isDisabled = !isReady || isVisualizing || serverStatus !== 'online';
                
                // Get tooltip message
                let tooltipMessage = "";
                if (!isReady) {
                  if (visualizationType === "floor" && !selectedFloorTile) {
                    tooltipMessage = "Please select a floor tile";
                  } else if (visualizationType === "walls" && !selectedWallTile) {
                    tooltipMessage = "Please select a wall tile";
                  } else if (visualizationType === "both") {
                    if (!selectedFloorTile && !selectedWallTile) {
                      tooltipMessage = "Please select both floor and wall tiles";
                    } else if (!selectedFloorTile) {
                      tooltipMessage = "Please select a floor tile";
                    } else if (!selectedWallTile) {
                      tooltipMessage = "Please select a wall tile";
                    }
                  }
                }
                
                return (
                  <div className="relative group">
                    <Button
                      onClick={handleGenerateVisualization}
                      disabled={isDisabled}
                      className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-8 py-4 text-base font-medium shadow-[0_8px_24px_rgba(255,107,53,0.4)] hover:shadow-[0_12px_32px_rgba(255,107,53,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={tooltipMessage}
                    >
                      {isVisualizing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Visualization
                        </>
                      )}
                    </Button>
                    {!isReady && tooltipMessage && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#2B2B2B] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {tooltipMessage}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#2B2B2B]"></div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Toolbar - Show other buttons when Generate is not ready */}
            {!((visualizationType === "floor" && selectedFloorTile) || 
              (visualizationType === "walls" && selectedWallTile) ||
              (visualizationType === "both" && selectedFloorTile && selectedWallTile)) && (
              <>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2.5 z-40">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-[#2B2B2B] hover:bg-white"
                  >
                    Remove
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-[#2B2B2B] hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4 mr-1.5" />
                    Zoom
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-[#2B2B2B] hover:bg-white"
                  >
                    <RotateCw className="h-4 w-4 mr-1.5" />
                    Rotate
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-[#2B2B2B] hover:bg-white"
                  >
                    <Grid3x3 className="h-4 w-4 mr-1.5" />
                    Pattern
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-[#2B2B2B] hover:bg-white"
                  >
                    <GitCompare className="h-4 w-4 mr-1.5" />
                    Compare
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Room Type Picker */}
        <aside className="w-[290px] bg-white border-l border-[#E6E6E6] overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-4">
            {/* Room Type Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2B2B2B]">Room Types</span>
            </div>

            {/* Room Type Selection Grid */}
            <div className="grid grid-cols-2 gap-3">
              {roomTypes.map((roomType) => {
                const isSelected = selectedRoomType === roomType.type;
                return (
                  <button
                    key={roomType.type}
                    onClick={() => {
                      setSelectedRoomType(roomType.type);
                      setCurrentRoomIndex(0);
                      setCustomRoomImage(null);
                      setCustomRoomFile(null);
                      setShowThumbnail(true); // Show thumbnail when room type is selected
                    }}
                    className={`relative group transition-all ${
                      isSelected ? 'ring-2 ring-[#FF6B35] ring-offset-2' : ''
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden border-2 bg-[#F6F7F8] transition-transform hover:scale-105">
                      {roomType.thumbnail ? (
                        <img
                          src={roomType.thumbnail}
                          alt={roomType.label}
                          className={`w-full h-full object-cover ${
                            isSelected ? 'border-[#FF6B35] border-2' : 'border-[#E6E6E6]'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-sm">
                          {roomType.label}
                        </div>
                      )}
                    </div>
                    <span className={`block text-xs font-medium mt-2 text-center ${
                      isSelected ? "text-[#FF6B35]" : "text-[#222]"
                    }`}>
                      {roomType.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-md z-10">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Room Renders List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#2B2B2B]">Room Renders</span>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {roomRenders
                  .filter(render => render.type === selectedRoomType)
                  .map((render, index) => {
                    const renderIndex = roomRenders.findIndex(r => r.id === render.id);
                    const isActive = !customRoomImage && !showThumbnail && renderIndex === currentRoomIndex;
                    return (
                      <button
                        key={render.id}
                        onClick={() => {
                          // Toggle selection: if already selected, unselect (go back to thumbnail)
                          if (isActive) {
                            setShowThumbnail(true);
                            setCurrentRoomIndex(0);
                          } else {
                            setCurrentRoomIndex(renderIndex);
                            setCustomRoomImage(null);
                            setCustomRoomFile(null);
                            setShowThumbnail(false); // Switch to showing renders
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                          isActive
                            ? 'bg-[#FF6B35]/10 border-2 border-[#FF6B35]'
                            : 'bg-[#f6f7f8] hover:bg-[#E6E6E6] border-2 border-transparent'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={render.image}
                            alt={render.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2B2B2B] truncate">{render.name}</p>
                        </div>
                        {isActive && (
                          <div className="w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VisualizerPreview;

