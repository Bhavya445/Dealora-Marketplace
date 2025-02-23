import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ImageUploadProps {
  onImageConfirm: (imageUrl: string) => void;
}

export function ImageUpload({ onImageConfirm }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsUploaded(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0]);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      onImageConfirm(url);
      setIsUploaded(true);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
        ref={fileInputRef}
      />

      {!preview ? (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <img 
              src={preview} 
              alt="Preview" 
              className="object-cover w-full h-full"
            />
            {isUploaded && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium">Image Uploaded ✓</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleRetake}
            >
              Retake
            </Button>
            <Button 
              type="button" 
              className="flex-1"
              onClick={handleConfirm}
              disabled={isUploading || isUploaded}
            >
              {isUploading ? "Uploading..." : isUploaded ? "Uploaded" : "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}