import { storage, STORAGE_BUCKET_ID, getImageUrl } from './appwrite';
import { authService } from './authService';
import { ID } from 'appwrite';

export class UserProfileImageService {
    // Upload user profile image to Appwrite storage
    async uploadUserImage(file: File, userId: string): Promise<string> {
        try {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Please upload only image files (JPEG, PNG, WebP, GIF, BMP)');
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                throw new Error('Please upload an image smaller than 10MB');
            }

            // Use Appwrite's ID.unique() for generating valid fileId
            const fileId = ID.unique();
            
            console.log('Uploading profile image:', {
                fileId,
                fileIdLength: fileId.length,
                fileName: file.name,
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                fileType: file.type,
                bucketId: STORAGE_BUCKET_ID,
                userId: userId
            });

            // Upload to Appwrite storage using client-side SDK
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                fileId,
                file
            );

            console.log('Upload successful:', {
                fileId: response.$id,
                bucketId: response.bucketId,
                name: response.name,
                sizeOriginal: response.sizeOriginal,
                mimeType: response.mimeType
            });

            // Get the image URL
            const imageUrl = getImageUrl(response.$id);
            
            console.log('Generated image URL:', imageUrl);
            
            // Update user profile with new image URL
            await this.updateUserProfileImage(userId, imageUrl);

            return imageUrl;
        } catch (error) {
            console.error('Error uploading user profile image:', error);
            
            // Provide more specific error messages
            if (error instanceof Error) {
                if (error.message.includes('fileId')) {
                    throw new Error('Invalid file ID format. Please try again.');
                } else if (error.message.includes('bucket')) {
                    throw new Error('Storage bucket not accessible. Please contact support.');
                } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                    throw new Error('You do not have permission to upload files. Please log in again.');
                }
            }
            
            throw error;
        }
    }

    // Update user profile with image URL in the database
    async updateUserProfileImage(userId: string, imageUrl: string): Promise<void> {
        try {
            console.log('Updating user profile image in database:', {
                userId,
                imageUrl,
                imageUrlLength: imageUrl.length
            });
            
            // Use the authService to update user profile
            const result = await authService.updateProfile(userId, { 
                image: imageUrl 
            });
            
            console.log('Profile update result:', result);
            
            if (!result.success) {
                console.error('Profile update failed:', result.message);
                throw new Error(result.message || 'Failed to update profile');
            }
            
            console.log('✅ User profile updated with new image successfully');
            
        } catch (error) {
            console.error('❌ Error updating user profile with image:', error);
            
            // Log more details about the error
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            
            throw new Error(`Failed to update profile image in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Delete old profile image from storage
    async deleteUserImage(fileId: string): Promise<void> {
        try {
            // Extract file ID from URL if a full URL is provided
            let actualFileId = fileId;
            if (fileId.includes('/files/')) {
                const urlParts = fileId.split('/files/');
                if (urlParts[1]) {
                    actualFileId = urlParts[1].split('/')[0];
                }
            }

            await storage.deleteFile(STORAGE_BUCKET_ID, actualFileId);
            console.log('Deleted old profile image:', actualFileId);
        } catch (error) {
            console.error('Error deleting old profile image:', error);
            // Don't throw error here as it's not critical if old image deletion fails
        }
    }

    // Get image URL from file ID
    getImageUrl(fileId: string): string {
        return getImageUrl(fileId);
    }

    // Get image preview URL with specific dimensions
    getImagePreview(fileId: string, width: number = 200, height: number = 200): string {
        if (!fileId || fileId.trim() === '') {
            return '';
        }

        // If it's already a full URL, return as is
        if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
            return fileId;
        }

        // For Appwrite storage file IDs, construct the preview URL
        return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&width=${width}&height=${height}`;
    }

    // Upload and replace user profile image (handles cleanup of old image)
    async uploadAndReplaceUserImage(file: File, userId: string, oldImageUrl?: string): Promise<string> {
        try {
            // Upload new image first
            const newImageUrl = await this.uploadUserImage(file, userId);

            // If there was an old image, try to delete it
            if (oldImageUrl && oldImageUrl !== newImageUrl) {
                await this.deleteUserImage(oldImageUrl);
            }

            return newImageUrl;
        } catch (error) {
            console.error('Error uploading and replacing user image:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const userProfileImageService = new UserProfileImageService();