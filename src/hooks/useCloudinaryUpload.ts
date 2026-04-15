import { useState } from "react";
import { generateCloudinarySignature } from "@/actions/cloudinary";

interface UploadProgress {
  [key: string]: number;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB in bytes

/**
 * Compress image to be under 500KB
 */
async function compressImage(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions if image is large
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            // If still too large, reduce quality
            if (blob && blob.size > MAX_FILE_SIZE && quality > 0.1) {
              compressImage(
                new File([blob], file.name, { type: file.type }),
                quality - 0.1,
              ).then(resolve);
            } else {
              resolve(blob || file);
            }
          },
          file.type,
          quality,
        );
      };
    };
  });
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setError(null);
      const fileId = `${Date.now()}-${Math.random()}`;

      // Compress image
      setProgress((prev) => ({ ...prev, [fileId]: 10 }));
      const compressedBlob = await compressImage(file);
      setProgress((prev) => ({ ...prev, [fileId]: 50 }));

      // Get signature from server
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureData = await generateCloudinarySignature(timestamp);

      // Create FormData
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signatureData.signature);
      formData.append("folder", "interventions_electro");

      setProgress((prev) => ({ ...prev, [fileId]: 70 }));

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      setProgress((prev) => ({ ...prev, [fileId]: 85 }));

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de la photo");
      }

      const data = await response.json();
      setProgress((prev) => ({ ...prev, [fileId]: 100 }));

      // Clean up after 1 second
      setTimeout(() => {
        setProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return data.secure_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur d'upload";
      setError(message);
      return null;
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadImage(file);
      if (url) {
        urls.push(url);
      }
    }

    setUploading(false);
    return urls;
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    progress,
    error,
    setError,
  };
}
