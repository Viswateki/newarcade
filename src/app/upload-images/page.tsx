'use client';

import React from 'react';
import MultiImageUploader from '@/components/MultiImageUploader';

interface UploadResult {
  file: File;
  success: boolean;
  fileId?: string;
  imageUrl?: string;
  error?: string;
  progress: number;
}

export default function ImageUploadPage() {
  const handleUploadComplete = (results: UploadResult[]) => {
    console.log('Upload completed:', results);
    
    // You can process the results here
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
      console.log('Successfully uploaded files:', successful.map(r => ({
        fileName: r.file.name,
        fileId: r.fileId,
        imageUrl: r.imageUrl
      })));
    }
    
    if (failed.length > 0) {
      console.log('Failed uploads:', failed.map(r => ({
        fileName: r.file.name,
        error: r.error
      })));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <MultiImageUploader
              onUploadComplete={handleUploadComplete}
              maxFiles={50}
              maxFileSize={50}
              className="w-full"
            />
          </div>
          
          {/* Instructions */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use the Image Uploader
            </h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li>• Drag and drop multiple images into the upload area</li>
              <li>• Or click "browse files" to select images from your computer</li>
              <li>• Supported formats: JPG, PNG, GIF, WebP, BMP, SVG</li>
              <li>• Maximum file size: 10MB per image</li>
              <li>• Maximum files: 50 images at once</li>
              <li>• View upload progress and results in real-time</li>
              <li>• Copy file IDs and URLs for use in your application</li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              💡 Tips
            </h3>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li>• Images are uploaded to your Appwrite storage bucket</li>
              <li>• Each uploaded image gets a unique file ID</li>
              <li>• You can use the file IDs in your database records</li>
              <li>• The image URLs can be used directly in your application</li>
              <li>• Check the browser console for detailed upload results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}