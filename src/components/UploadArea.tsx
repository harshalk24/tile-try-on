import { Upload, X, Image } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";

export interface RoomRender {
  id: string;
  name: string;
  image: string;
  description?: string;
}

interface UploadAreaProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  preview: string | null;
}

// Predefined room renders - using your actual room images
const roomRenders: RoomRender[] = [
  {
    id: "room-render-1",
    name: "Modern Living Space",
    image: "/room_renders/room-render.png",
    description: "Contemporary living room with modern design"
  },
  {
    id: "room-render-2",
    name: "Elegant Interior",
    image: "/room_renders/room-render-2.jpg",
    description: "Sophisticated interior with clean lines"
  },
  {
    id: "room-render-3",
    name: "Cozy Bedroom",
    image: "/room_renders/room-render-3.jpg",
    description: "Warm and inviting bedroom space"
  },
  {
    id: "room-render-4",
    name: "Modern Kitchen",
    image: "/room_renders/room-render-4.webp",
    description: "Contemporary kitchen with sleek design"
  }
];

const UploadArea = ({ onFileSelect, selectedFile, preview }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRoomRender, setSelectedRoomRender] = useState<RoomRender | null>(null);

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
    onFileSelect(null);
    setSelectedRoomRender(null);
  };

  const handleRoomRenderSelect = (roomRender: RoomRender) => {
    setSelectedRoomRender(roomRender);
    // Convert the room render to a File object for consistency
    fetch(roomRender.image)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], `${roomRender.name}.jpg`, { type: 'image/jpeg' });
        onFileSelect(file);
      })
      .catch(error => {
        console.error('Error loading room render:', error);
      });
  };

  return (
    <div className="w-full space-y-8">
      {/* Upload Section */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Upload Your Room Photo</h3>
        {preview ? (
          <div className="relative group animate-fade-in">
            <img
              src={preview}
              alt="Room preview"
              className="w-full h-[28rem] object-cover rounded-2xl shadow-medium"
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
              {selectedRoomRender ? selectedRoomRender.name : selectedFile?.name}
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center
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
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">
                  Upload your room image
                </p>
                <p className="text-muted-foreground text-sm">
                  Drag and drop or click to browse • JPG, PNG up to 10MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Room Renders Gallery */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Or Choose from Our Room Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {roomRenders.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomRenderSelect(room)}
              className={`
                relative group cursor-pointer rounded-xl overflow-hidden
                transition-all duration-300 hover:scale-105
                ${selectedRoomRender?.id === room.id 
                  ? "ring-2 ring-primary shadow-lg" 
                  : "hover:shadow-md"
                }
              `}
            >
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-48 bg-muted flex items-center justify-center">
                        <div class="text-center text-muted-foreground">
                          <Image class="h-8 w-8 mx-auto mb-2" />
                          <p class="text-sm">${room.name}</p>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">{room.name}</p>
                {room.description && (
                  <p className="text-white/80 text-xs">{room.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
