"use client";

import { useState } from "react";
import { FileUploadButton } from "@/components/ui/file-upload-button";
import { toast } from "sonner";

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadComplete = async (files: any[]) => {
    console.log("Files uploaded:", files);

    // In a real scenario, you would save these to a task
    // For now, just display them
    setUploadedFiles((prev) => [...prev, ...files]);

    toast.success("Files ready to be attached to a task!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">File Upload Test</h1>
          <p className="text-gray-600 mb-8">
            Test the Uploadthing integration for task attachments
          </p>

          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              <FileUploadButton
                endpoint="taskAttachment"
                onUploadComplete={handleUploadComplete}
              />
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Uploaded Files ({uploadedFiles.length})
                </h2>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          Size: {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Next Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Make sure you have set your Uploadthing API keys in .env</li>
                <li>Upload some test files using the button above</li>
                <li>Check that files appear in the "Uploaded Files" section</li>
                <li>Click "View File" to verify the file is accessible</li>
                <li>Integrate this component into your task pages</li>
              </ol>
            </div>

            {/* Integration Example */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Integration Example:</h3>
              <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`// In your task detail page:
import { FileUploadButton } from "@/components/ui/file-upload-button";

const handleUploadComplete = async (files) => {
  // Save files to task
  const response = await fetch(\`/api/tasks/\${taskId}/attachments\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: files[0].fileName,
      fileUrl: files[0].fileUrl,
      fileSize: files[0].fileSize,
      fileType: 'image/png' // or detect from file
    })
  });
};

<FileUploadButton
  endpoint="taskAttachment"
  onUploadComplete={handleUploadComplete}
  maxFiles={5}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
