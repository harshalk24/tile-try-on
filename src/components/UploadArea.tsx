import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  preview: string | null;
}

const UploadArea = ({ onFileSelect, selectedFile, preview }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null as any);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative group animate-fade-in">
          <img
            src={preview}
            alt="Room preview"
            className="w-full h-64 object-cover rounded-xl shadow-medium"
          />
          <Button
            onClick={clearFile}
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
            {selectedFile?.name}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border bg-gradient-subtle hover:border-primary/50"
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-soft">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold mb-2">
                Drop your room image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
