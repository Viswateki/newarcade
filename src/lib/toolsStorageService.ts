import { storage, TOOLS_STORAGE_BUCKET_ID, getToolImageUrl } from './appwrite';
import { ID } from 'appwrite';

export class ToolsStorageService {
    // Get tool logo URL from file ID
    getToolImageUrl(fileId: string): string {
        return getToolImageUrl(fileId);
    }

    // Upload a tool logo to Appwrite tools storage bucket
    async uploadToolLogo(file: File, fileName?: string): Promise<string> {
        try {
            const fileId = fileName || ID.unique();
            const response = await storage.createFile(
                TOOLS_STORAGE_BUCKET_ID,
                fileId,
                file
            );
            return response.$id;
        } catch (error) {
            console.error('Error uploading tool logo:', error);
            throw error;
        }
    }

    // Delete a tool logo from Appwrite tools storage bucket
    async deleteToolLogo(fileId: string): Promise<void> {
        try {
            await storage.deleteFile(TOOLS_STORAGE_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error deleting tool logo:', error);
            throw error;
        }
    }

    // Get tool logo file information
    async getToolLogoInfo(fileId: string) {
        try {
            return await storage.getFile(TOOLS_STORAGE_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error getting tool logo info:', error);
            throw error;
        }
    }

    // List all tool logos in the bucket
    async listToolLogos(limit: number = 100) {
        try {
            return await storage.listFiles(TOOLS_STORAGE_BUCKET_ID);
        } catch (error) {
            console.error('Error listing tool logos:', error);
            throw error;
        }
    }

    // Helper method to validate if a tool logo exists
    async toolLogoExists(fileId: string): Promise<boolean> {
        try {
            await this.getToolLogoInfo(fileId);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get preview URL for a tool logo with specific dimensions
    getToolImagePreview(fileId: string, width: number = 100, height: number = 100): string {
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
        
        // For Appwrite tools storage, use preview endpoint with dimensions
        return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${TOOLS_STORAGE_BUCKET_ID}/files/${fileId}/preview?width=${width}&height=${height}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    }

    // Get tool logo by tool name (assuming logos are named after tool names)
    async getToolLogoByName(toolName: string): Promise<string | null> {
        try {
            // Normalize tool name for file searching
            const normalizedName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const logosList = await this.listToolLogos();
            
            // Look for a logo file that matches the tool name
            const matchingLogo = logosList.files.find((file: any) => {
                const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
                const normalizedFileName = fileName.replace(/[^a-z0-9]/g, '');
                return normalizedFileName.includes(normalizedName) || normalizedName.includes(normalizedFileName);
            });
            
            return matchingLogo ? matchingLogo.$id : null;
        } catch (error) {
            console.error('Error finding tool logo by name:', error);
            return null;
        }
    }

    // Enhanced method to get tool image URL with multiple fallback strategies
    async getEnhancedToolImageUrl(tool: {
        name: string;
        imageUrl?: string;
        logo?: string;
        imageurl?: string;
        toolImage?: string;
        fallbackIcon?: string;
    }): Promise<string> {
        // Priority order: imageUrl -> logo -> imageurl -> toolImage -> search by name -> fallback
        let imageSource = tool.imageUrl || tool.logo || tool.imageurl || tool.toolImage;
        
        if (imageSource) {
            // If it's already a full URL, return as is
            if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
                return imageSource;
            }
            // If it's a file ID, construct the URL
            return this.getToolImageUrl(imageSource);
        }
        
        // Try to find logo by tool name
        try {
            const logoFileId = await this.getToolLogoByName(tool.name);
            if (logoFileId) {
                return this.getToolImageUrl(logoFileId);
            }
        } catch (error) {
            console.error('Error searching for logo by name:', error);
        }
        
        // Final fallback to placeholder with first letter
        return `https://placehold.co/100x100/1C64F2/ffffff?text=${tool.name?.charAt(0) || 'T'}`;
    }
}

// Export a singleton instance
export const toolsStorageService = new ToolsStorageService();