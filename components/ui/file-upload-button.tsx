"use client";

import { useState } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-helpers";
import { Button } from "./button";
import { toast } from "sonner";

interface FileUploadButtonProps {
  endpoint: "taskAttachment" | "avatarUploader";
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  disabled?: boolean;
}

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
}

export function FileUploadButton({
  endpoint,
  onUploadComplete,
  onUploadError,
  maxFiles,
  disabled = false,
}: FileUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      setUploading(false);
      setSelectedFiles([]);
      toast.success(`${res.length} file(s) uploaded successfully`);

      const uploadedFiles: UploadedFile[] = res.map((file) => ({
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size,
        uploadedBy: (file.serverData as any)?.uploadedBy || "",
      }));

      onUploadComplete?.(uploadedFiles);
    },
    onUploadError: (error) => {
      setUploading(false);
      toast.error(`Upload failed: ${error.message}`);
      onUploadError?.(error);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (maxFiles && files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    await startUpload(selectedFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* File Input */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          className="relative"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Files
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {selectedFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || isUploading}
          >
            {uploading || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length} file(s)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Selected {selectedFiles.length} file(s):
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
