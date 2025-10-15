import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import TileGallery, { TileSKU } from "@/components/TileGallery";
import VisualizationResult from "@/components/VisualizationResult";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<TileSKU | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

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

    setIsVisualizing(true);
    setShowResult(true);

    try {
      // TODO: Replace this with actual API call to your Python backend
      // const formData = new FormData();
      // formData.append('image', selectedFile);
      // formData.append('sku_id', selectedTile.id);
      // 
      // const response = await fetch('YOUR_API_ENDPOINT/visualize', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const result = await response.json();
      // setVisualizedImage(result.image_url);

      // Mock visualization with delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setVisualizedImage(selectedTile.image);
      toast.success("Visualization complete!");
    } catch (error) {
      console.error("Visualization error:", error);
      toast.error("Failed to visualize. Please try again.");
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
              <div className="flex justify-center animate-fade-in">
                <Button
                  onClick={handleVisualize}
                  disabled={isVisualizing}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 rounded-full text-base px-10 h-14"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Visualization
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
