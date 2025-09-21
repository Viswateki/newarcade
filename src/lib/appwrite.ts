import { Client, Databases, Storage, Account, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { client };

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BLOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOGS_COLLECTION_ID!;
export const USER_INTERACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_INTERACTION_COLLECTION_ID!;
export const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID!;
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
export const TOOLS_STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID!;

// Helper function to get image URL from Appwrite storage
export const getImageUrl = (fileIdOrUrl: string): string => {
    // Handle empty or null values
    if (!fileIdOrUrl || fileIdOrUrl.trim() === '') {
        return '';
    }
    
    // If it's already a full URL (http/https), return as is
    if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
        return fileIdOrUrl;
    }
    
    // If it's a data URL (base64 encoded image), return as is
    if (fileIdOrUrl.startsWith('data:')) {
        return fileIdOrUrl;
    }
    
    // For Appwrite storage file IDs, construct the storage URL
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileIdOrUrl}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
};

// Helper function to get tool image URL from tools storage bucket
export const getToolImageUrl = (fileIdOrUrl: string): string => {
    // Handle empty or null values
    if (!fileIdOrUrl || fileIdOrUrl.trim() === '') {
        return '';
    }
    
    // If it's already a full URL (http/https), return as is
    if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
        return fileIdOrUrl;
    }
    
    // If it's a data URL (base64 encoded image), return as is
    if (fileIdOrUrl.startsWith('data:')) {
        return fileIdOrUrl;
    }
    
    // For Appwrite storage file IDs, construct the tools storage URL
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${TOOLS_STORAGE_BUCKET_ID}/files/${fileIdOrUrl}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
};

// Helper function specifically for tool images with fallback logic
export const getToolImageUrlFromTool = (tool: Tool): string => {
    // Priority order: imageUrl (current database field) -> logo -> imageurl (legacy) -> toolImage
    const imageSource = tool.imageUrl || 
                       tool.logo || 
                       tool.imageurl ||
                       tool.toolImage;
    
    if (imageSource && imageSource.trim() !== '') {
        // If it's already a full URL (which it should be from Appwrite storage), return as is
        if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
            return imageSource;
        }
        // If it's a data URL (base64 encoded image), return as is
        if (imageSource.startsWith('data:')) {
            return imageSource;
        }
        // If it's a file ID, construct the URL
        return getToolImageUrl(imageSource);
    }
    
    // Return empty string if no actual image - let the frontend handle fallback icons
    return '';
};

// Helper function to parse categories from JSON string
export const getToolCategories = (tool: Tool): string[] => {
    if (tool.categories) {
        try {
            const parsed = JSON.parse(tool.categories);
            return Array.isArray(parsed) ? parsed : ['Uncategorized'];
        } catch (e) {
            // If JSON parsing fails, return default
            return ['Uncategorized'];
        }
    }
    // No categories field, will rely on auto-categorization in display logic
    return ['Uncategorized'];
};

// Blog interface - Updated to match actual Appwrite collection schema
export interface Blog {
    $id?: string;
    title: string; // required, size: 255
    content: string; // required, size: 10000
    category: string; // required, size: 100
    featured: boolean; // required
    image?: string; // size: 500
    views: number; // required, integer, min: 0, max: 9999999
    subtitle?: string; // size: 500
    slug: string; // required, size: 255
    excerpt?: string; // size: 1000
    author_name: string; // required, size: 100
    featured_image?: string; // size: 500
    status: string; // required, size: 20
    likes: number; // integer, min: 0, max: 9999999
    seo_description?: string; // size: 160
    tags?: string; // size: 500 - stored as string in collection
    user_id: string; // required, size: 255
    $createdAt?: string;
    $updatedAt?: string;
}

// User Interaction interface for blog interactions - Updated to match actual collection
export interface BlogInteraction {
    $id?: string;
    user_id: string; // required, size: 50
    blog_id: string; // required, size: 50
    interaction_type: 'like' | 'comment' | 'bookmark'; // required, size: 20
    content?: string; // size: 5000 (for comments)
    user_name?: string; // size: 100
    user_avatar?: string; // size: 500
    parent_comment_id?: string; // size: 255 (for reply comments)
    $createdAt?: string;
    $updatedAt?: string;
}

// Comment interface (for easier typing when dealing with comments specifically)
export interface BlogComment {
    $id?: string;
    user_id: string; // required, size: 50
    blog_id: string; // required, size: 50
    interaction_type: 'comment'; // required, will always be 'comment'
    content: string; // size: 5000
    user_name?: string; // size: 100
    user_avatar?: string; // size: 500
    parent_comment_id?: string; // size: 255 (for replies)
    $createdAt?: string;
    $updatedAt?: string;
}

// Tool interface for tools collection - Updated with actual database schema
export interface Tool {
    $id?: string;
    name: string;
    description: string;
    categories?: string; // JSON string of category array (primary field)
    imageUrl?: string; // Tool logo/image URL
    link: string; // Website URL
    user_id: string; // Who submitted
    status: 'pending' | 'approved' | 'rejected'; // Approval status
    privacy?: 'public' | 'private'; // Visibility setting
    logoBackgroundColor?: string; // Background color for logo/fallback
    fallbackIcon?: string; // Fallback icon name
    views?: number; // View count
    rating?: number; // Average rating
    featured?: boolean; // Is featured tool
    tags?: string; // JSON string of tags array
    pricing?: 'free' | 'paid' | 'freemium'; // Pricing model
    $createdAt?: string;
    $updatedAt?: string;
    // Legacy fields for backward compatibility
    reviews?: number;
    reviewCount?: number;
    icon?: string;
    logo?: string;
    cardColor?: string;
    websiteLink?: string;
    toolImage?: string;
    imageurl?: string;
    new?: boolean;
    computedImageUrl?: string;
}

export { ID };
