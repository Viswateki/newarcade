import { storage, STORAGE_BUCKET_ID, getImageUrl } from './appwrite';
import { ID } from 'appwrite';

export class StorageService {
    // Get image URL from file ID
    getImageUrl(fileId: string): string {
        return getImageUrl(fileId);
    }

    // Upload a file to Appwrite storage
    async uploadFile(file: File, fileName?: string): Promise<string> {
        try {
            const fileId = fileName || ID.unique();
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                fileId,
                file
            );
            return response.$id;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    // Delete a file from Appwrite storage
    async deleteFile(fileId: string): Promise<void> {
        try {
            await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Get file information
    async getFileInfo(fileId: string) {
        try {
            return await storage.getFile(STORAGE_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error getting file info:', error);
            throw error;
        }
    }

    // List all files in the bucket (useful for admin purposes)
    async listFiles(limit: number = 100) {
        try {
            return await storage.listFiles(STORAGE_BUCKET_ID);
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    // Helper method to validate if a file exists
    async fileExists(fileId: string): Promise<boolean> {
        try {
            await this.getFileInfo(fileId);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get preview URL for an image with specific dimensions
    getImagePreview(fileId: string, width: number = 200, height: number = 200): string {
        if (!fileId || fileId.trim() === '') {
            return '';
        }
        
        // If it's already a full URL, return as is
        if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
            return fileId;
        }
        
        // If it's a data URL, return as is
        if (fileId.startsWith('data:')) {
            return fileId;
        }
        
        // For Appwrite storage, use preview endpoint with dimensions
        return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?width=${width}&height=${height}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    }
}

// Export a singleton instance
export const storageService = new StorageService();