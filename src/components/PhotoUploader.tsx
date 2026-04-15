"use client";

import React, { useRef, useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

interface PhotoUploaderProps {
  onPhotosChange: (urls: string[]) => void;
  photos: string[];
}

export function PhotoUploader({ onPhotosChange, photos }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [localPhotos, setLocalPhotos] = useState<
    { url: string; isUploading: boolean; progress: number }[]
  >(photos.map((url) => ({ url, isUploading: false, progress: 0 })));
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const { uploadMultipleImages, progress, error, setError } =
    useCloudinaryUpload();

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setUploadingFiles(fileArray.map((f) => f.name));

    // Upload files
    const urls = await uploadMultipleImages(fileArray);

    if (urls.length > 0) {
      const updatedPhotos = [
        ...localPhotos,
        ...urls.map((url) => ({ url, isUploading: false, progress: 100 })),
      ];
      setLocalPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos.map((p) => p.url));
    }

    setUploadingFiles([]);

    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = localPhotos.filter((_, i) => i !== index);
    setLocalPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map((p) => p.url));
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFiles.length > 0}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Upload size={18} />
          Ajouter photos
        </Button>

        <Button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploadingFiles.length > 0}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <Camera size={18} />
          Appareil photo
        </Button>
      </div>

      {/* File inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Uploading files info */}
      {uploadingFiles.length > 0 && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Téléchargement de {uploadingFiles.length} photo(s)...
        </div>
      )}

      {/* Photos Grid */}
      {localPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {localPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover"
              />

              {/* Progress overlay */}
              {photo.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm font-medium">
                    {photo.progress}%
                  </div>
                </div>
              )}

              {/* Remove button */}
              {!photo.isUploading && (
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo count */}
      <p className="text-sm text-gray-600">
        {localPhotos.length} photo(s) ajoutée(s)
        {localPhotos.length > 0 && " (moins de 500KB chacune)"}
      </p>
    </div>
  );
}
