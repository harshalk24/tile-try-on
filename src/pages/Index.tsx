import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import TileGallery, { TileSKU } from "@/components/TileGallery";
import VisualizationResult from "@/components/VisualizationResult";
import { toast } from "sonner";
import { Sparkles, AlertCircle } from "lucide-react";
import { VisualizationService } from "@/services/visualizationService";

const Index = () => {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<TileSKU | null>(null);
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

  const handleVisualize = async () => {
    if (!selectedFile || !selectedTile) {
      toast.error("Please upload a room image and select a tile");
      return;
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
        tileId: selectedTile.id
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
    setSelectedFile(null);
    setPreview(null);
    setSelectedTile(null);
    setShowResult(false);
    setVisualizedImage(null);
  };

  if (!showVisualizer) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <HeroSection onGetStarted={() => setShowVisualizer(true)} />
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
              <div className="animate-fade-in">
                <TileGallery
                  onTileSelect={setSelectedTile}
                  selectedTile={selectedTile}
                />
              </div>
            )}

            {preview && selectedTile && (
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
