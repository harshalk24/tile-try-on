import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {visualizedImage && !isLoading && (
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download Result
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Original Room</h3>
          <div className="rounded-xl overflow-hidden shadow-medium">
            <img
              src={originalImage}
              alt="Original room"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">With Your Tile</h3>
          <div className="rounded-xl overflow-hidden shadow-medium bg-muted min-h-[300px] flex items-center justify-center">
            {isLoading ? (
              <div className="text-center space-y-4 p-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-semibold">Visualizing your room...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            ) : visualizedImage ? (
              <img
                src={visualizedImage}
                alt="Visualized room"
                className="w-full h-auto animate-scale-in"
              />
            ) : (
              <p className="text-muted-foreground">No result yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationResult;
