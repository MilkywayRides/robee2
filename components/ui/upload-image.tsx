"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Image, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadImageProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
  disabled?: boolean;
}

export function UploadImage({
  value,
  onChange,
  onRemove,
  className,
  disabled
}: UploadImageProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      
      if (!file) {
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: isUploading || disabled,
    multiple: false
  });

  return (
    <div className={className}>
      {value ? (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Uploaded image"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isUploading || disabled}
                {...getRootProps()}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isUploading || disabled}
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors",
            isDragActive && "border-primary/50 bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Image className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-center text-muted-foreground">
                  {isDragActive ? (
                    "Drop the image here"
                  ) : (
                    "Drag & drop an image here, or click to select"
                  )}
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Supported formats: JPEG, PNG, GIF, WebP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}