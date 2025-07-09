
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  onLoading: (isLoading: boolean) => void;
  value?: string;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  onLoading,
  value,
  accept = "*",
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  // In a real app, this would upload to your server or cloud storage
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    onLoading(true);
    
    // Simulate a file upload with a delay
    setTimeout(() => {
      // Create a local object URL for the file (for demo purposes)
      const objectUrl = URL.createObjectURL(file);
      onUpload(objectUrl);
      onLoading(false);
    }, 1500);
    
    // Clear input so the same file can be selected again if needed
    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    onLoading(true);
    
    // Simulate a file upload
    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      onUpload(objectUrl);
      onLoading(false);
    }, 1500);
  };
  
  return (
    <div className={`${className}`}>
      {value ? (
        <div className="relative mt-2 rounded-md border border-gray-200 overflow-hidden">
          <img
            src={value}
            alt="Uploaded file"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onUpload("")}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div
          className={`mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Image className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 5MB
            </p>
          </div>
          <label className="mt-4">
            <input
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleFileUpload}
            />
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
