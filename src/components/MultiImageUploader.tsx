'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { StorageService } from '@/lib/storageService';

interface UploadResult {
  file: File;
  success: boolean;
  fileId?: string;
  imageUrl?: string;
  error?: string;
  progress: number;
}

interface MultiImageUploaderProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  onUploadComplete,
  maxFiles = 20,
  maxFileSize = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageService = new StorageService();

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Accepted formats: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (selectedFiles.length + validFiles.length < maxFiles) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: Maximum ${maxFiles} files allowed`);
      }
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // File input change handler
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    setUploadProgress(0);
  };

  // Upload all files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadResults([]);
    
    const results: UploadResult[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const result: UploadResult = {
        file,
        success: false,
        progress: 0
      };

      try {
        // Update progress
        const progress = ((i + 1) / selectedFiles.length) * 100;
        setUploadProgress(progress);

        // Upload file
        const fileId = await storageService.uploadFile(file);
        const imageUrl = storageService.getImageUrl(fileId);

        result.success = true;
        result.fileId = fileId;
        result.imageUrl = imageUrl;
        result.progress = 100;

      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
        result.progress = 0;
      }

      results.push(result);
      setUploadResults([...results]);
    }

    setIsUploading(false);
    setUploadProgress(100);
    
    if (onUploadComplete) {
      onUploadComplete(results);
    }
  };

  // Get upload summary
  const getUploadSummary = () => {
    const successful = uploadResults.filter(r => r.success).length;
    const failed = uploadResults.filter(r => !r.success).length;
    return { successful, failed, total: uploadResults.length };
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Multiple Images
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload up to {maxFiles} images ({maxFileSize}MB max each)
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drag and drop images here
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse files
                </button>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Supported: JPG, PNG, GIF, WebP, BMP, SVG
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-x-2">
                <button
                  onClick={clearAllFiles}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear All
                </button>
                <button
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload All</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* File List */}
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {selectedFiles.map((file, index) => {
                const result = uploadResults.find(r => r.file === file);
                
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Upload Status */}
                    <div className="flex items-center space-x-2">
                      {result ? (
                        result.success ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-xs">Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Failed</span>
                          </div>
                        )
                      ) : (
                        !isUploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upload Results
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  const { successful, failed } = getUploadSummary();
                  return `${successful} successful, ${failed} failed`;
                })()}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {result.file.name}
                      </p>
                      {result.success ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            File ID: {result.fileId}
                          </p>
                          {result.imageUrl && (
                            <a
                              href={result.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              View Image
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {result.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {result.success ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageUploader;