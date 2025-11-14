import { Upload, X, Image } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface WallTileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  preview: string | null;
  required?: boolean;
}

const WallTileUpload = ({ onFileSelect, selectedFile, preview, required = false }: WallTileUploadProps) => {
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
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    onFileSelect(file);
  };

  const clearFile = () => {
    onFileSelect(null);
  };

  return (
    <Card className="border border-border shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Wall Tile Image {required && <span className="text-destructive">*</span>}
        </CardTitle>
        <CardDescription>
          Upload a reference image for the wall tile or texture
        </CardDescription>
      </CardHeader>
      <CardContent>
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Wall tile preview"
              className="w-full h-64 object-cover rounded-xl shadow-medium"
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
              relative border-2 border-dashed rounded-xl p-8 text-center
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
            <div className="flex flex-col items-center gap-4">
              <div className="bg-primary p-4 rounded-full shadow-soft">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold mb-1">
                  Upload wall tile image
                </p>
                <p className="text-muted-foreground text-sm">
                  Drag and drop or click to browse • JPG, PNG up to 10MB
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WallTileUpload;


