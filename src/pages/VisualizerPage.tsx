import { useState } from "react";
import VisualizerPreview from "@/components/VisualizerPreview";
import { VisualizationService } from "@/services/visualizationService";
import { toast } from "sonner";

const VisualizerPage = () => {
  const [showResult, setShowResult] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);

  const handleEnterVisualizer = async (
    imageFile?: File,
    tileId?: string,
    renderImageUrl?: string
  ) => {
    // This can be used for navigation or other actions if needed
    // Currently, the visualizer handles everything internally
  };

  const handleExit = () => {
    // Navigate back to home
    window.location.href = "/";
  };

  const handleUploadRoom = (file: File) => {
    // Handle room upload if needed
  };

  return (
    <VisualizerPreview
      onEnterVisualizer={handleEnterVisualizer}
      onExit={handleExit}
      onUploadRoom={handleUploadRoom}
    />
  );
};

export default VisualizerPage;

