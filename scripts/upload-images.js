#!/usr/bin/env node

const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID;

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

/**
 * Upload a single image file to Appwrite storage
 * @param {string} filePath - Path to the image file
 * @param {string} customName - Optional custom name for the file
 * @returns {Promise<Object>} Upload result
 */
async function uploadImage(filePath, customName = null) {
    try {
        const fileName = customName || path.basename(filePath);
        const fileExtension = path.extname(filePath).toLowerCase();
        
        // Check if file format is supported
        if (!SUPPORTED_FORMATS.includes(fileExtension)) {
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`📤 Uploading: ${fileName} (${fileSizeInMB} MB)`);

        // Create file object for upload
        const fileBuffer = fs.readFileSync(filePath);
        const fileId = ID.unique();
        
        // Upload to Appwrite storage
        const response = await storage.createFile(
            STORAGE_BUCKET_ID,
            fileId,
            fileBuffer,
            fileName
        );

        const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

        return {
            success: true,
            fileName: fileName,
            fileId: response.$id,
            imageUrl: imageUrl,
            size: fileSizeInMB + ' MB',
            originalPath: filePath
        };
    } catch (error) {
        return {
            success: false,
            fileName: path.basename(filePath),
            error: error.message,
            originalPath: filePath
        };
    }
}

/**
 * Upload multiple images from a directory or specific files
 * @param {string[]} paths - Array of file paths or directory paths
 * @param {boolean} recursive - Whether to search subdirectories
 */
async function uploadMultipleImages(paths, recursive = false) {
    const imagePaths = [];
    
    // Process each path
    for (const inputPath of paths) {
        if (fs.existsSync(inputPath)) {
            const stats = fs.statSync(inputPath);
            
            if (stats.isDirectory()) {
                // Get all image files from directory
                const files = fs.readdirSync(inputPath);
                for (const file of files) {
                    const fullPath = path.join(inputPath, file);
                    const fileStats = fs.statSync(fullPath);
                    
                    if (fileStats.isFile()) {
                        const ext = path.extname(file).toLowerCase();
                        if (SUPPORTED_FORMATS.includes(ext)) {
                            imagePaths.push(fullPath);
                        }
                    } else if (fileStats.isDirectory() && recursive) {
                        // Recursively process subdirectories
                        const subFiles = await getImagesFromDirectory(fullPath, recursive);
                        imagePaths.push(...subFiles);
                    }
                }
            } else if (stats.isFile()) {
                // Single file
                const ext = path.extname(inputPath).toLowerCase();
                if (SUPPORTED_FORMATS.includes(ext)) {
                    imagePaths.push(inputPath);
                } else {
                    console.log(`⚠️  Skipping unsupported file: ${inputPath}`);
                }
            }
        } else {
            console.log(`⚠️  Path not found: ${inputPath}`);
        }
    }

    if (imagePaths.length === 0) {
        console.log('❌ No valid image files found to upload.');
        return;
    }

    console.log(`\n🚀 Found ${imagePaths.length} image(s) to upload...\n`);

    const results = [];
    const successful = [];
    const failed = [];

    // Upload images one by one with progress
    for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(`[${i + 1}/${imagePaths.length}] Processing: ${path.basename(imagePath)}`);
        
        const result = await uploadImage(imagePath);
        results.push(result);
        
        if (result.success) {
            successful.push(result);
            console.log(`✅ Success: ${result.fileName} → ${result.fileId}`);
        } else {
            failed.push(result);
            console.log(`❌ Failed: ${result.fileName} → ${result.error}`);
        }
        
        console.log(''); // Empty line for readability
    }

    // Print summary
    console.log('📊 UPLOAD SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total files processed: ${results.length}`);
    console.log(`✅ Successful uploads: ${successful.length}`);
    console.log(`❌ Failed uploads: ${failed.length}`);
    
    if (successful.length > 0) {
        console.log('\n📋 SUCCESSFUL UPLOADS:');
        successful.forEach(result => {
            console.log(`• ${result.fileName} (${result.size})`);
            console.log(`  File ID: ${result.fileId}`);
            console.log(`  URL: ${result.imageUrl}`);
            console.log('');
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED UPLOADS:');
        failed.forEach(result => {
            console.log(`• ${result.fileName}: ${result.error}`);
        });
    }

    // Save results to JSON file
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const outputFile = `upload-results-${timestamp}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputFile}`);
}

/**
 * Helper function to get images from directory recursively
 */
async function getImagesFromDirectory(dirPath, recursive) {
    const imagePaths = [];
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_FORMATS.includes(ext)) {
                imagePaths.push(fullPath);
            }
        } else if (stats.isDirectory() && recursive) {
            const subImages = await getImagesFromDirectory(fullPath, recursive);
            imagePaths.push(...subImages);
        }
    }
    
    return imagePaths;
}

/**
 * Print usage instructions
 */
function printUsage() {
    console.log('🖼️  Image Upload Script for Appwrite Storage');
    console.log('');
    console.log('Usage:');
    console.log('  node upload-images.js <path1> [path2] [path3] ...');
    console.log('  node upload-images.js --recursive <directory>');
    console.log('');
    console.log('Examples:');
    console.log('  node upload-images.js ./image1.jpg ./image2.png');
    console.log('  node upload-images.js ./photos/');
    console.log('  node upload-images.js --recursive ./all-photos/');
    console.log('  node upload-images.js ./single-image.jpg ./photo-folder/ ./another-image.png');
    console.log('');
    console.log('Supported formats: ' + SUPPORTED_FORMATS.join(', '));
    console.log('');
    console.log('Options:');
    console.log('  --recursive, -r  Include subdirectories when processing folders');
    console.log('  --help, -h       Show this help message');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printUsage();
        return;
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 
        !process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID) {
        console.error('❌ Missing required environment variables. Please check your .env.local file.');
        console.error('Required variables:');
        console.error('  - NEXT_PUBLIC_APPWRITE_ENDPOINT');
        console.error('  - NEXT_PUBLIC_APPWRITE_PROJECT_ID');
        console.error('  - NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID');
        return;
    }

    console.log('🔗 Connected to Appwrite:');
    console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`   Project: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`   Bucket: ${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}`);
    console.log('');

    const recursive = args.includes('--recursive') || args.includes('-r');
    const paths = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
    
    if (paths.length === 0) {
        console.error('❌ No paths specified. Use --help for usage instructions.');
        return;
    }

    await uploadMultipleImages(paths, recursive);
}

// Handle script execution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { uploadImage, uploadMultipleImages };