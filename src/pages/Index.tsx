import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ValueProposition from "@/components/ValueProposition";
import ProductsSection from "@/components/ProductsSection";
import TargetAudience from "@/components/TargetAudience";
import HowItWorks from "@/components/HowItWorks";
import MESASection from "@/components/MESASection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import TileGallery, { TileSKU } from "@/components/TileGallery";
import VisualizationResult from "@/components/VisualizationResult";
import VisualizationTypeSelector, { VisualizationType } from "@/components/VisualizationTypeSelector";
import WallTileUpload from "@/components/WallTileUpload";
import VisualizerPreview from "@/components/VisualizerPreview";
import { toast } from "sonner";
import { Sparkles, AlertCircle } from "lucide-react";
import { VisualizationService } from "@/services/visualizationService";

const Index = () => {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showVisualizerPreview, setShowVisualizerPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<TileSKU | null>(null);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>("floor");
  const [wallTileFile, setWallTileFile] = useState<File | null>(null);
  const [wallTilePreview, setWallTilePreview] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await VisualizationService.checkServerHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    };
    checkServer();
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file (JPG or PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleWallTileSelect = (file: File | null) => {
    if (!file) {
      setWallTileFile(null);
      setWallTilePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file (JPG or PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setWallTileFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setWallTilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVisualize = async () => {
    if (!selectedFile) {
      toast.error("Please upload a room image");
      return;
    }

    // Validate based on visualization type
    if (visualizationType === "walls") {
      if (!wallTileFile) {
        toast.error("Please upload a wall tile image for wall visualization");
        return;
      }
    } else if (visualizationType === "both") {
      if (!selectedTile) {
        toast.error("Please select a floor tile");
        return;
      }
      if (!wallTileFile) {
        toast.error("Please upload a wall tile image");
        return;
      }
    } else {
      // Floor only
      if (!selectedTile) {
        toast.error("Please select a floor tile");
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
      const result = await VisualizationService.visualizeRoom({
        roomImage: selectedFile,
        tileId: visualizationType === "walls" ? "walls-only" : selectedTile.id, // Dummy tile ID for walls-only
        customTileFile: visualizationType === "walls" ? undefined : (selectedTile?.isCustom ? selectedTile.file : undefined),
        visualizationType: visualizationType,
        wallTileFile: wallTileFile || undefined
      });

      if (result.success) {
        setVisualizedImage(result.imageUrl);
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

  const handleBackToHome = () => {
    setShowVisualizer(false);
    setShowVisualizerPreview(false);
    setSelectedFile(null);
    setPreview(null);
    setSelectedTile(null);
    setVisualizationType("floor");
    setWallTileFile(null);
    setWallTilePreview(null);
    setShowResult(false);
    setVisualizedImage(null);
  };

  const [useOldUI, setUseOldUI] = useState(false);

  const handleEnterVisualizer = async (imageFile?: File, tileId?: string, renderImageUrl?: string) => {
    if (imageFile) {
      handleFileSelect(imageFile);
    } else if (renderImageUrl) {
      // Convert render image URL to File for consistency
      try {
        const response = await fetch(renderImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `room-render-${Date.now()}.jpg`, { type: blob.type });
        handleFileSelect(file);
      } catch (error) {
        console.error("Error loading render image:", error);
        toast.error("Failed to load room render image");
        return;
      }
    }
    if (tileId) {
      // Find and set the selected tile - matching IDs from TileGallery
      const tileMap: Record<string, TileSKU> = {
        "marble-white-001": { id: "marble-white-001", name: "Carrara Marble White", image: "/tiles/marble-tile.jpg", size: "24x24", price: "$8.99/sq ft" },
        "oak-wood-002": { id: "oak-wood-002", name: "Natural Oak Wood", image: "/tiles/oak-wood.webp", size: "8x48", price: "$6.49/sq ft" },
        "oak-wood-001": { id: "oak-wood-001", name: "Natural Wood", image: "/tiles/wooden-tile.jpg", size: "8x48", price: "$6.49/sq ft" },
        "slate-grey-003": { id: "slate-grey-003", name: "Modern Slate Grey", image: "/tiles/design-tile.jpg", size: "12x24", price: "$7.29/sq ft" }
      };
      const tile = tileMap[tileId];
      if (tile) {
        setSelectedTile(tile);
      }
    }
    setShowVisualizerPreview(false);
    setShowVisualizer(true);
  };

  const handleUploadRoomFromPreview = (file: File) => {
    handleFileSelect(file);
    setShowVisualizerPreview(false);
    setShowVisualizer(true);
  };

  const handleSwitchToOldUI = () => {
    setUseOldUI(true);
    setShowVisualizerPreview(false);
    setShowVisualizer(true);
  };

  if (!showVisualizerPreview && !showVisualizer) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <HeroSection onGetStarted={() => setShowVisualizerPreview(true)} />
        <ValueProposition />
        <ProductsSection />
        <TargetAudience />
        <HowItWorks />
        <MESASection />
        <FAQ />
        <Footer />
      </div>
    );
  }

  // Show preview page when "Try our visualizer" is clicked
  if (showVisualizerPreview && !showVisualizer) {
    return (
      <VisualizerPreview
        onEnterVisualizer={handleEnterVisualizer}
        onExit={handleBackToHome}
        onUploadRoom={handleUploadRoomFromPreview}
        onSwitchToOldUI={handleSwitchToOldUI}
      />
    );
  }

  // Show old UI if toggled
  if (useOldUI && showVisualizer) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
        {/* Top Bar */}
        <header className="h-[72px] bg-white border-b border-[#E6E6E6] shadow-sm sticky top-0 z-50">
          <div className="w-full px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo/Nazaraa-logo.png" 
                alt="Company Logo" 
                className="h-20 w-auto"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setUseOldUI(false);
                  setShowVisualizer(false);
                  setShowVisualizerPreview(true);
                }}
              >
                Switch to New UI
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Change space
              </Button>
            </div>
          </div>
        </header>

        {!showResult ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Tile Selection */}
            <aside className="w-[320px] bg-white border-r border-[#E6E6E6] overflow-y-auto flex-shrink-0">
              <div className="p-4 space-y-4">
                {/* Content Type Button */}
                <div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-start bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                  >
                    Tiles
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    type="text"
                    placeholder="Q Search"
                    className="pl-9 h-9 rounded-lg border-[#E6E6E6]"
                  />
                </div>

                {/* Filter Icons */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                    <Filter className="h-4 w-4 text-[#6B6B6B]" />
                    <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <svg className="h-4 w-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4 text-[#6B6B6B]" />
                  </Button>
                </div>

                {/* Tile Gallery */}
                <TileGallery
                  onTileSelect={setSelectedTile}
                  selectedTile={selectedTile}
                />
              </div>
            </aside>

            {/* Right Pane - Room Visualization */}
            <main className="flex-1 relative overflow-hidden bg-[#f6f7f8]">
              {!preview ? (
                <div className="h-full flex items-center justify-center">
                  <UploadArea
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    preview={preview}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Floor/Wall Toggle */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-1 py-1 rounded-full shadow-md">
                      <Button
                        variant={visualizationType === "floor" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setVisualizationType("floor")}
                        className={`rounded-full ${
                          visualizationType === "floor" 
                                  ? "bg-[#FF6B35] text-white"
                            : "text-[#6B6B6B] hover:text-[#2B2B2B]"
                        }`}
                      >
                        {visualizationType === "floor" && "✔ "}Floor
                      </Button>
                      <Button
                        variant={visualizationType === "walls" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setVisualizationType("walls")}
                        className={`rounded-full ${
                          visualizationType === "walls" 
                                  ? "bg-[#FF6B35] text-white"
                            : "text-[#6B6B6B] hover:text-[#2B2B2B]"
                        }`}
                      >
                        Walls
                      </Button>
                    </div>
                  </div>

                  {/* Room Image */}
                  <img
                    src={preview}
                    alt="Room preview"
                    className="w-full h-full object-contain"
                  />

                  {/* Wall Tile Upload - Show if walls selected */}
                  {(visualizationType === "walls" || visualizationType === "both") && !wallTileFile && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
                      <WallTileUpload
                        onFileSelect={handleWallTileSelect}
                        selectedFile={wallTileFile}
                        preview={wallTilePreview}
                        required={true}
                      />
                    </div>
                  )}

                  {/* Generate Button */}
                  {preview && (
                    (visualizationType === "walls" && wallTileFile) ||
                    (visualizationType === "both" && selectedTile && wallTileFile) ||
                    (visualizationType === "floor" && selectedTile)
                  ) && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                      {serverStatus === 'offline' && (
                        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Visualization server is offline. Please start the backend server.</span>
                        </div>
                      )}
                      <Button
                        onClick={handleVisualize}
                        disabled={isVisualizing || serverStatus !== 'online'}
                        className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-8 py-4 text-base font-medium shadow-[0_8px_24px_rgba(255,107,53,0.4)] hover:shadow-[0_12px_32px_rgba(255,107,53,0.5)] transition-all"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        {isVisualizing ? 'Generating...' : 'Generate Visualization'}
                      </Button>
                    </div>
                  )}

                  {/* Powered by badge */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B6B] z-40">
                    Powered by nazaraa
                  </div>
                </div>
              )}
            </main>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <VisualizationResult
              originalImage={preview!}
              visualizedImage={visualizedImage}
              isLoading={isVisualizing}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onBack={handleBackToHome} showBackButton={true} />
      
      <main className="container mx-auto px-6 py-12">
        {!showResult ? (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Visualize Your Space
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload a photo of your room and see how different tiles transform your space
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <UploadArea
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                preview={preview}
              />
            </div>

            {preview && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <VisualizationTypeSelector
                  value={visualizationType}
                  onChange={setVisualizationType}
                />

                <TileGallery
                  onTileSelect={setSelectedTile}
                  selectedTile={selectedTile}
                />

                {(visualizationType === "walls" || visualizationType === "both") && (
                  <div className="animate-fade-in">
                    <WallTileUpload
                      onFileSelect={handleWallTileSelect}
                      selectedFile={wallTileFile}
                      preview={wallTilePreview}
                      required={true}
                    />
                  </div>
                )}
              </div>
            )}

            {preview && (
              (visualizationType === "walls" && wallTileFile) ||
              (visualizationType === "both" && selectedTile && wallTileFile) ||
              (visualizationType === "floor" && selectedTile)
            ) && (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                {serverStatus === 'offline' && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Visualization server is offline. Please start the backend server.</span>
                  </div>
                )}
                <Button
                  onClick={handleVisualize}
                  disabled={isVisualizing || serverStatus !== 'online'}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 rounded-full text-base px-10 h-14"
                >
                  <Sparkles className="h-5 w-5" />
                  {isVisualizing ? 'Generating...' : 'Generate Visualization'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <VisualizationResult
            originalImage={preview!}
            visualizedImage={visualizedImage}
            isLoading={isVisualizing}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
