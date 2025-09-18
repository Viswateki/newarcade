# 🖼️ Multi-Image Upload Guide

This guide shows you how to upload multiple images to your Appwrite storage bucket using two different methods: a command-line script and a web-based interface.

## 📋 Prerequisites

Before using either upload method, ensure you have:

1. **Environment Variables**: Your `.env.local` file should contain:
   ```bash
   NEXT_PUBLIC_APPWRITE_PROJECT_ID = "68a2fa360035825e2e75"
   NEXT_PUBLIC_APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1"
   NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID = "68cbde6800235bbba199"
   ```

2. **Dependencies**: Make sure you have the required packages installed:
   ```bash
   npm install appwrite node-appwrite dotenv
   ```

## 🖥️ Method 1: Command Line Script

### Installation

The script is located at `scripts/upload-images.js` and is ready to use.

### Usage

**Basic Usage:**
```bash
node scripts/upload-images.js <path1> [path2] [path3] ...
```

**Examples:**

1. **Upload single images:**
   ```bash
   node scripts/upload-images.js ./photo1.jpg ./photo2.png
   ```

2. **Upload all images from a folder:**
   ```bash
   node scripts/upload-images.js ./photos/
   ```

3. **Upload recursively from folders (includes subfolders):**
   ```bash
   node scripts/upload-images.js --recursive ./all-photos/
   ```

4. **Mixed upload (files and folders):**
   ```bash
   node scripts/upload-images.js ./single-image.jpg ./photo-folder/ ./another-image.png
   ```

### Supported Features

- ✅ **Multiple file formats**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG
- ✅ **Batch processing**: Upload multiple files at once
- ✅ **Folder support**: Process entire directories
- ✅ **Recursive scanning**: Include subdirectories with `--recursive` flag
- ✅ **Progress tracking**: Real-time upload progress
- ✅ **Error handling**: Detailed error messages for failed uploads
- ✅ **Results export**: Saves upload results to JSON file
- ✅ **File validation**: Checks file format and existence

### Output

The script provides:
1. **Real-time progress** during upload
2. **Summary report** with success/failure counts
3. **Detailed results** including file IDs and URLs
4. **JSON export** of all results with timestamp

Example output:
```
🚀 Found 3 image(s) to upload...

[1/3] Processing: photo1.jpg
✅ Success: photo1.jpg → 674a1b2c3d4e5f6g7h8i

[2/3] Processing: photo2.png
✅ Success: photo2.png → 789j1k2l3m4n5o6p7q8r

📊 UPLOAD SUMMARY
==================================================
Total files processed: 3
✅ Successful uploads: 3
❌ Failed uploads: 0

💾 Results saved to: upload-results-2024-09-18T10-30-45.json
```

## 🌐 Method 2: Web Interface

### Access

Navigate to the upload page in your browser:
```
http://localhost:3000/upload-images
```

### Features

- ✅ **Drag & Drop**: Simply drag images into the upload area
- ✅ **File Browser**: Click to select files from your computer
- ✅ **Multi-select**: Choose multiple files at once
- ✅ **Visual Progress**: See upload progress with progress bars
- ✅ **Real-time Results**: View success/failure status immediately
- ✅ **File Management**: Remove files before uploading
- ✅ **Validation**: Automatic file type and size checking
- ✅ **Responsive Design**: Works on desktop and mobile

### Usage Instructions

1. **Open the upload page** in your browser
2. **Add images** using either:
   - Drag and drop files into the upload area
   - Click "browse files" to select from your computer
3. **Review selected files** in the file list
4. **Remove unwanted files** by clicking the X button
5. **Click "Upload All"** to start the upload process
6. **Monitor progress** with the progress bar
7. **Review results** in the results section

### Limitations

- **Maximum files**: 50 images per upload session
- **File size limit**: 10MB per image
- **Supported formats**: JPG, PNG, GIF, WebP, BMP, SVG

## 📁 File Organization

```
your-project/
├── scripts/
│   └── upload-images.js          # Command-line upload script
├── src/
│   ├── components/
│   │   └── MultiImageUploader.tsx # Upload component
│   ├── app/
│   │   └── upload-images/
│   │       └── page.tsx           # Upload page
│   └── lib/
│       └── storageService.ts      # Storage utilities
└── .env.local                     # Environment variables
```

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   ```
   ❌ Missing required environment variables
   ```
   **Solution**: Check your `.env.local` file contains all required variables

2. **File Not Found**
   ```
   ⚠️ Path not found: ./photos/image.jpg
   ```
   **Solution**: Verify file paths are correct and files exist

3. **Unsupported File Format**
   ```
   ⚠️ Skipping unsupported file: document.pdf
   ```
   **Solution**: Only use supported image formats (JPG, PNG, GIF, WebP, BMP, SVG)

4. **Upload Failed**
   ```
   ❌ Failed: image.jpg → Network error
   ```
   **Solution**: Check internet connection and Appwrite configuration

### Getting Help

- Check the browser console for detailed error messages (web interface)
- Review the generated JSON results file (command-line script)
- Verify your Appwrite project settings and permissions
- Ensure your storage bucket exists and is accessible

## 📊 Upload Results

Both methods provide detailed results including:

- **File Name**: Original filename
- **File ID**: Unique Appwrite storage ID
- **Image URL**: Direct URL to access the image
- **Status**: Success or failure indication
- **Error Details**: Specific error messages for failed uploads
- **File Size**: Size of the uploaded file

### Using Upload Results

After successful upload, you can:

1. **Store File IDs** in your database
2. **Use Image URLs** directly in your application
3. **Reference Files** in your Appwrite collections
4. **Build Image Galleries** using the returned data

Example of using uploaded images:

```typescript
// In your React component
const imageUrl = storageService.getImageUrl(fileId);

// In your JSX
<img src={imageUrl} alt="Uploaded image" />
```

## 🚀 Advanced Usage

### Custom Upload Logic

You can extend the upload functionality by:

1. **Modifying the CLI script** to add custom naming conventions
2. **Extending the React component** to add image preview
3. **Adding metadata** to uploaded files
4. **Implementing custom validation** rules

### Integration with Your App

To integrate with your application:

1. **Import the component**:
   ```typescript
   import MultiImageUploader from '@/components/MultiImageUploader';
   ```

2. **Handle upload results**:
   ```typescript
   const handleUploadComplete = (results) => {
     // Save file IDs to your database
     // Update your UI
     // Process successful uploads
   };
   ```

3. **Customize settings**:
   ```typescript
   <MultiImageUploader
     maxFiles={20}
     maxFileSize={5}
     onUploadComplete={handleUploadComplete}
   />
   ```

This comprehensive upload system gives you flexibility to upload images both programmatically and through a user-friendly interface! 🎉