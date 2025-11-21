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
  const [viewMode, setViewMode] = useState<"before" | "after">("after");

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

  // Reset to "after" view when visualization completes
  useEffect(() => {
    if (visualizedImage && !isLoading) {
      setViewMode("after");
    }
  }, [visualizedImage, isLoading]);

  const handleDownload = () => {
    if (visualizedImage) {
      const link = document.createElement('a');
      link.href = visualizedImage;
      link.download = 'nazaraa-result.jpg';
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
      {/* Centered Header */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold text-center">Your Visualization</h2>
        {visualizedImage && !isLoading && (
          <Button onClick={handleDownload} className="gap-2 rounded-full bg-primary">
            <Download className="h-4 w-4" />
            Download Result
          </Button>
        )}
      </div>

      {/* Toggle Buttons */}
      {visualizedImage && !isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center bg-[#4A4A4A] rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("before")}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 text-sm ${
                viewMode === "before"
                  ? "bg-[#2B2B2B] text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {viewMode === "before" && (
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#2B2B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              Before
            </button>
            <button
              onClick={() => setViewMode("after")}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 text-sm ${
                viewMode === "after"
                  ? "bg-[#2B2B2B] text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {viewMode === "after" && (
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#2B2B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              After
            </button>
          </div>
        </div>
      )}

      {/* Single Image Display */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <div 
            className="rounded-2xl overflow-hidden shadow-medium border border-border w-full mx-auto"
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
            ) : viewMode === "before" && imageDimensions ? (
              <img
                src={originalImage}
                alt="Original room"
                className="w-full h-full object-contain animate-scale-in"
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
            ) : visualizedImage && imageDimensions ? (
              <img
                src={visualizedImage}
                alt="Visualized room"
                className="w-full h-full object-contain animate-scale-in"
                style={{ display: 'block', margin: 0, padding: 0 }}
                onError={(e) => {
                  console.error('Image load error:', {
                    src: visualizedImage,
                    error: e,
                    currentSrc: e.currentTarget.currentSrc,
                    naturalWidth: e.currentTarget.naturalWidth,
                    naturalHeight: e.currentTarget.naturalHeight
                  });
                  // Try to reload or show error
                  const img = e.currentTarget;
                  const originalSrc = img.src;
                  console.log('Attempting to reload image from:', originalSrc);
                  // Force reload by adding timestamp
                  img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + '_retry=' + Date.now();
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', visualizedImage);
                }}
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
