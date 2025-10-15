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
            className="w-full h-80 object-cover rounded-2xl shadow-medium"
          />
          <Button
            onClick={clearFile}
            size="icon"
            variant="destructive"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
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
            relative border-2 border-dashed rounded-2xl p-16 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? "border-primary bg-muted scale-[1.01]" 
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-6">
            <div className="bg-primary p-5 rounded-full shadow-soft">
              <Upload className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">
                Upload your room image
              </p>
              <p className="text-muted-foreground">
                Drag and drop or click to browse • JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
