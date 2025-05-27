import { toast } from "sonner";

interface UploadResponse {
  secure_url: string;
  public_id: string;
}

export async function uploadImage(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file selected");
    }

    if (!file.type.startsWith('image/')) {
      throw new Error("Please select an image file");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    // Upload file
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to upload image");
    }

    const data = await response.json() as UploadResponse;
    return data.secure_url;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    toast.error(message);
    throw error;
  }
}