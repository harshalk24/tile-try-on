import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import RoomEstimation from "./RoomEstimation";
import { useState, useEffect } from "react";

interface VisualizationResultProps {
  originalImage: string;
  visualizedImage: string | null;
  isLoading: boolean;
  onBack: () => void;
}

const VisualizationResult = ({ 
  originalImage, 
  visualizedImage, 
  isLoading,
  onBack 
}: VisualizationResultProps) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Load original image to get its dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = originalImage;
  }, [originalImage]);

  const handleDownload = () => {
    if (visualizedImage) {
      const link = document.createElement('a');
      link.href = visualizedImage;
      link.download = 'roommorph-result.jpg';
      link.click();
    }
  };

  // Calculate container style to maintain aspect ratio - same for both containers
  const getContainerStyle = () => {
    if (!imageDimensions) return { minHeight: '200px' };
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    return {
      aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
      width: '100%',
      maxHeight: '80vh',
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your Visualization</h2>
        {visualizedImage && !isLoading && (
          <Button onClick={handleDownload} className="gap-2 rounded-full bg-primary">
            <Download className="h-4 w-4" />
            Download Result
          </Button>
        )}
      </div>

      <div className="flex justify-center">
        <div className="grid md:grid-cols-2 gap-8 items-start w-full max-w-7xl">
          <div className="space-y-3 flex flex-col">
            <h3 className="text-lg font-semibold text-muted-foreground">Before</h3>
            <div 
              className="rounded-2xl overflow-hidden shadow-medium border border-border w-full"
              style={getContainerStyle()}
            >
              {imageDimensions ? (
                <img
                  src={originalImage}
                  alt="Original room"
                  className="w-full h-full object-cover"
                  style={{ display: 'block', margin: 0, padding: 0 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 flex flex-col">
            <h3 className="text-lg font-semibold text-muted-foreground">After</h3>
            <div 
              className="rounded-2xl overflow-hidden shadow-medium border border-border w-full"
              style={getContainerStyle()}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <div className="text-center space-y-4 p-8">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Processing your visualization...</p>
                      <p className="text-sm text-muted-foreground">This may take a few moments</p>
                    </div>
                  </div>
                </div>
              ) : visualizedImage && imageDimensions ? (
                <img
                  src={visualizedImage}
                  alt="Visualized room"
                  className="w-full h-full object-cover animate-scale-in"
                  style={{ display: 'block', margin: 0, padding: 0 }}
                />
              ) : visualizedImage ? (
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <p className="text-muted-foreground">No result yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Estimation Section - Only show when visualization is complete */}
      {visualizedImage && !isLoading && (
        <div className="mt-12 animate-fade-in">
          <RoomEstimation />
        </div>
      )}
    </div>
  );
};

export default VisualizationResult;
