import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import TileGallery, { TileSKU } from "@/components/TileGallery";
import VisualizationResult from "@/components/VisualizationResult";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Index = () => {
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file (JPG or PNG)");
      return;
    }

    // Validate file size (10MB)
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
      
      // For demo purposes, using the tile image as result
      // Replace this with actual API response
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!showResult ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Visualize Tiles in Your Space
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload a photo of your room and see how different tiles look instantly
              </p>
            </div>

            {/* Upload Section */}
            <div className="max-w-3xl mx-auto">
              <UploadArea
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                preview={preview}
              />
            </div>

            {/* Tile Gallery */}
            {preview && (
              <div className="animate-fade-in">
                <TileGallery
                  onTileSelect={setSelectedTile}
                  selectedTile={selectedTile}
                />
              </div>
            )}

            {/* Visualize Button */}
            {preview && selectedTile && (
              <div className="flex justify-center animate-fade-in">
                <Button
                  onClick={handleVisualize}
                  disabled={isVisualizing}
                  size="lg"
                  className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8"
                >
                  <Sparkles className="h-5 w-5" />
                  Visualize My Room
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
