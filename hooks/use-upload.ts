import { useState } from "react";
import { toast } from "sonner";

interface UseUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);

      // Validate file
      if (!file) {
        throw new Error("No file selected");
      }

      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload image");
      }

      const data = await response.json();
      options.onSuccess?.(data.secure_url);
      return data.secure_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      options.onError?.(error instanceof Error ? error : new Error(message));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
  };
}