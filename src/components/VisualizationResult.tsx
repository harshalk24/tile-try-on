import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import RoomEstimation from "./RoomEstimation";

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
  const handleDownload = () => {
    if (visualizedImage) {
      const link = document.createElement('a');
      link.href = visualizedImage;
      link.download = 'roommorph-result.jpg';
      link.click();
    }
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

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Before</h3>
          <div className="rounded-2xl overflow-hidden shadow-medium border border-border">
            <img
              src={originalImage}
              alt="Original room"
              className="w-full h-[28rem] object-cover"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">After</h3>
          <div className="rounded-2xl overflow-hidden shadow-medium bg-muted h-[28rem] flex items-center justify-center border border-border">
            {isLoading ? (
              <div className="text-center space-y-4 p-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-semibold text-lg">Processing your visualization...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            ) : visualizedImage ? (
              <img
                src={visualizedImage}
                alt="Visualized room"
                className="w-full h-[28rem] object-cover animate-scale-in"
              />
            ) : (
              <p className="text-muted-foreground">No result yet</p>
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
