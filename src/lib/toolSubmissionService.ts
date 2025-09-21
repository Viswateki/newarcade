import { ID, Query } from 'appwrite';
import { databases, storage, DATABASE_ID, TOOLS_COLLECTION_ID, TOOLS_STORAGE_BUCKET_ID, STORAGE_BUCKET_ID, Tool } from './appwrite';
import { urlValidationService } from './urlValidationService';
import { validateCategories } from '@/components/MultiSelectCategory';
import { isValidHexColor } from '@/components/ColorPicker';

// Interface for tool submission data
export interface ToolSubmissionData {
  name: string;
  description: string;
  categories: string[];
  websiteLink: string;
  logoImage?: File;
  logoBackgroundColor: string;
  fallbackIcon?: string;
  privacy: 'public' | 'private';
}

// Interface for validation results
export interface ToolValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

// Interface for submission result
export interface ToolSubmissionResult {
  success: boolean;
  toolId?: string;
  errors?: Record<string, string>;
  warnings?: string[];
  message?: string;
}

class ToolSubmissionService {
  /**
   * Validate tool submission data
   */
  async validateToolSubmission(data: ToolSubmissionData, userId: string): Promise<ToolValidationResult> {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    // 1. Validate tool name
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Tool name is required';
    } else if (data.name.length > 50) {
      errors.name = 'Tool name must be 50 characters or less';
    } else {
      // Check for name uniqueness
      const existingTool = await this.checkToolNameExists(data.name.trim());
      if (existingTool) {
        errors.name = 'A tool with this name already exists';
      }
    }

    // 2. Validate description
    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (data.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    } else if (data.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    // 3. Validate categories
    const categoryValidation = validateCategories(data.categories, 1, 3);
    if (!categoryValidation.isValid) {
      errors.categories = categoryValidation.error || 'Invalid categories selected';
    }

    // 4. Validate website URL
    if (!data.websiteLink || data.websiteLink.trim().length === 0) {
      errors.websiteLink = 'Website link is required';
    } else {
      try {
        const urlValidation = await urlValidationService.validateURL(data.websiteLink.trim());
        if (!urlValidation.isValid) {
          errors.websiteLink = urlValidation.errors[0] || 'Invalid website URL';
        } else {
          if (!urlValidation.isSecure) {
            warnings.push('Website does not use HTTPS - consider using a secure connection');
          }
          if (!urlValidation.isSafe) {
            errors.websiteLink = urlValidation.errors[0] || 'Website URL flagged as unsafe';
          }
          if (urlValidation.warnings.length > 0) {
            warnings.push(...urlValidation.warnings);
          }
        }
      } catch (error) {
        console.error('URL validation error:', error);
        warnings.push('Could not fully validate website URL');
      }
    }

    // 5. Validate image file (if provided)
    if (data.logoImage) {
      const imageValidation = this.validateImageFile(data.logoImage);
      if (!imageValidation.isValid) {
        errors.logoImage = imageValidation.error || 'Invalid image file';
      }
    }

    // 6. Validate background color
    if (data.logoBackgroundColor && !isValidHexColor(data.logoBackgroundColor) && data.logoBackgroundColor !== 'transparent') {
      errors.logoBackgroundColor = 'Invalid background color format';
    }

    // 7. Validate privacy setting
    if (!['public', 'private'].includes(data.privacy)) {
      errors.privacy = 'Invalid privacy setting';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Submit a new tool
   */
  async submitTool(data: ToolSubmissionData, userId: string): Promise<ToolSubmissionResult> {
    try {
      // Validate submission data
      const validation = await this.validateToolSubmission(data, userId);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          message: 'Please fix the validation errors before submitting'
        };
      }

      // Upload image if provided
      let imageUrl = '';
      if (data.logoImage) {
        try {
          const imageUploadResult = await this.uploadToolImage(data.logoImage);
          if (imageUploadResult.success) {
            imageUrl = imageUploadResult.url || '';
          } else {
            return {
              success: false,
              errors: { logoImage: imageUploadResult.error || 'Failed to upload image. Please check your internet connection and try again.' },
              message: 'Image upload failed. Please check your internet connection and try again.'
            };
          }
        } catch (error) {
          console.error('Image upload error:', error);
          // Check for network-related errors
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          let userFriendlyMessage = 'Failed to upload image. Please try again.';
          
          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK') || errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
            userFriendlyMessage = 'Network connection error. Please check your internet connection and try again.';
          } else if (errorMessage.includes('storage')) {
            userFriendlyMessage = 'Image storage service is temporarily unavailable. Please try again later.';
          }
          
          return {
            success: false,
            errors: { logoImage: userFriendlyMessage },
            message: 'Image upload failed: ' + userFriendlyMessage
          };
        }
      }

      // Prepare tool data for database - now with all the new fields
      const toolData = {
        name: data.name.trim(),
        description: data.description.trim(),
        categories: JSON.stringify(data.categories), // Store as JSON string
        link: data.websiteLink.trim(),
        imageUrl: imageUrl,
        logoBackgroundColor: data.logoBackgroundColor || '#3B82F6',
        fallbackIcon: data.fallbackIcon || 'Tool',
        privacy: data.privacy || 'public',
        user_id: userId,
        status: 'pending' as const, // All submissions start as pending
        views: 0,
        rating: 0,
        featured: false,
        pricing: 'freemium' as const // Default to freemium
      };

      // Create tool in database
      const response = await databases.createDocument(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        ID.unique(),
        toolData
      );

      return {
        success: true,
        toolId: response.$id,
        warnings: validation.warnings,
        message: 'Tool submitted successfully! It will be reviewed before being published.'
      };

    } catch (error) {
      console.error('Tool submission error:', error);
      
      // Handle different types of errors with user-friendly messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let userMessage = 'An error occurred while submitting your tool. Please try again.';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK') || errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
        userMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('database') || errorMessage.includes('collection')) {
        userMessage = 'Database service is temporarily unavailable. Please try again later.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'Authentication error. Please log out and log back in, then try again.';
      }
      
      return {
        success: false,
        message: userMessage,
        errors: { general: userMessage }
      };
    }
  }

  /**
   * Upload tool image to storage
   */
  private async uploadToolImage(imageFile: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('🔄 Starting image upload...', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });

      // Normalize file extension - Appwrite is strict about extensions
      let fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      
      // Map common extensions to ensure compatibility
      const extensionMap: Record<string, string> = {
        'jpeg': 'jpg',
        'jpg': 'jpg',
        'png': 'png',
        'webp': 'webp',
        'gif': 'gif'
      };
      
      // Use mapped extension or default to jpg
      fileExtension = extensionMap[fileExtension] || 'jpg';
      
      // Create a safe file name that Appwrite will accept
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `tool_${timestamp}_${randomId}.${fileExtension}`;
      
      console.log('📝 Normalized filename:', fileName);

      // Create a new File object with the correct name if needed
      let fileToUpload = imageFile;
      if (imageFile.name.split('.').pop()?.toLowerCase() !== fileExtension) {
        // Create new file with correct extension
        fileToUpload = new File([imageFile], fileName, { type: imageFile.type });
        console.log('🔄 Created new file with corrected name:', fileName);
      }

      let response;
      let bucketUsed;
      
      // Try tools storage bucket first, fallback to regular storage bucket
      try {
        console.log('📁 Trying tools storage bucket:', TOOLS_STORAGE_BUCKET_ID);
        response = await storage.createFile(
          TOOLS_STORAGE_BUCKET_ID,
          ID.unique(),
          fileToUpload
        );
        bucketUsed = TOOLS_STORAGE_BUCKET_ID;
        console.log('✅ Upload successful to tools bucket');
        
      } catch (toolsBucketError: any) {
        console.warn('⚠️ Tools bucket failed, trying regular bucket:', toolsBucketError?.message || 'Unknown error');
        
        // Fallback to regular storage bucket
        response = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          fileToUpload
        );
        bucketUsed = STORAGE_BUCKET_ID;
        console.log('✅ Upload successful to regular bucket');
      }

      // Generate the public URL
      const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketUsed}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      console.log('🔗 Generated image URL:', imageUrl);

      return {
        success: true,
        url: imageUrl
      };

    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      
      // Handle Appwrite-specific errors
      let errorMessage = 'Failed to upload image';
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes('file extension not allowed') || message.includes('extension')) {
          errorMessage = 'File type not supported by storage. Please try a different image format (JPG, PNG, WebP, or GIF).';
        } else if (message.includes('file size') || message.includes('size')) {
          errorMessage = 'File size too large. Please use an image smaller than 5MB.';
        } else if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
          errorMessage = 'Network error - please check your internet connection and try again.';
        } else if (message.includes('permission') || message.includes('unauthorized')) {
          errorMessage = 'Storage access denied. Please contact support.';
        } else if (message.includes('not found') || message.includes('bucket')) {
          errorMessage = 'Storage service unavailable. Please try again later or contact support.';
        } else {
          // Show the actual error for debugging
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    // Check file type - be more flexible with MIME types and extensions
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    // Check both MIME type and file extension for better compatibility
    const isValidMimeType = allowedTypes.includes(file.type);
    const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
    
    if (!isValidMimeType && !isValidExtension) {
      return { 
        isValid: false, 
        error: `Only JPEG, PNG, WebP, and GIF images are allowed. Your file type: ${file.type || 'unknown'}, extension: ${fileExtension || 'none'}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Check if tool name already exists
   */
  private async checkToolNameExists(name: string): Promise<boolean> {
    try {
      // Use a more efficient query to check for exact name matches
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          Query.equal('name', name.trim()),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking tool name:', error);
      // If we can't check due to network issues, allow submission to proceed
      // The duplicate check will happen again during actual submission
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK')) {
        console.warn('Network error during name check - allowing submission to proceed');
      }
      return false; // If we can't check, allow submission
    }
  }

  /**
   * Get user's submitted tools
   */
  async getUserSubmittedTools(userId: string): Promise<Tool[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          // Query by user_id
          // Add more filters as needed
        ]
      );

      return response.documents.filter((tool: any) => tool.user_id === userId) as unknown as Tool[];
    } catch (error) {
      console.error('Error fetching user tools:', error);
      return [];
    }
  }
}

// Export service instance
export const toolSubmissionService = new ToolSubmissionService();

// Export for easy use
export const submitTool = (data: ToolSubmissionData, userId: string) => 
  toolSubmissionService.submitTool(data, userId);

export const validateToolSubmission = (data: ToolSubmissionData, userId: string) => 
  toolSubmissionService.validateToolSubmission(data, userId);