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
    // Priority order: imageUrl (current database field) -> logo -> imageurl (legacy) -> toolImage -> fallbackIcon
    const imageSource = tool.imageUrl || 
                       tool.logo || 
                       tool.imageurl ||
                       tool.toolImage || 
                       tool.fallbackIcon;
    
    if (imageSource) {
        // If it's already a full URL (which it should be from Appwrite storage), return as is
        if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
            return imageSource;
        }
        // If it's a file ID, construct the URL
        return getToolImageUrl(imageSource);
    }
    
    // Fallback to placeholder with first letter
    return `https://placehold.co/100x100/1C64F2/ffffff?text=${tool.name?.charAt(0) || 'T'}`;
};

// Blog interface - Matches your exact Appwrite collection schema
export interface Blog {
    $id?: string;
    title: string;
    subtitle?: string;
    content: string;
    excerpt: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_bio?: string;
    featured_image?: string;
    image?: string;
    tags: string; // Your DB has this as string, not array
    category: string;
    status: string;
    featured: boolean;
    readTime: string; // Your DB has this as string, not number
    reading_time: number; // Optional in your schema (you have both!)
    views: number;
    likes: number;
    comments_count: number;
    bookmarks: number;
    rating: number;
    updated_at: string;
    date: string;
    seo_description?: string;
    slug?: string; // Making this optional since I don't see it as required
    $createdAt?: string;
    $updatedAt?: string;
}

// User Interaction interface (replaces separate like, bookmark, comment interfaces)
export interface UserInteraction {
    $id?: string;
    user_id: string;
    blog_id: string;
    interaction_type: 'like' | 'bookmark' | 'comment';
    content?: string; // For comments
    user_name?: string; // For comments
    user_avatar?: string; // For comments
    $createdAt?: string;
    $updatedAt?: string;
}

// Comment interface (for easier typing when dealing with comments specifically)
export interface Comment {
    $id?: string;
    user_id: string;
    blog_id: string;
    user_name: string;
    user_avatar?: string;
    content: string;
    parent_comment_id?: string; // For replies
    reply_to_user?: string; // Username being replied to
    client_request_id?: string; // For duplicate prevention
    $createdAt?: string;
    $updatedAt?: string;
}

// Tool interface for tools collection
export interface Tool {
    $id?: string;
    name: string;
    description: string;
    category: string;
    icon?: string; // Text icon from database
    imageUrl?: string; // Image URL from database (matches actual schema)
    link?: string; // Website link (matches actual schema)
    submittedBy?: string; // User who submitted
    status?: string; // Approval status
    views?: number; // View count
    rating?: number; // Rating score
    reviewCount?: number; // Number of reviews (matches actual schema)
    // Legacy fields for compatibility
    reviews?: number;
    pricing?: string;
    tags?: string[];
    featured?: boolean;
    new?: boolean;
    logo?: string;
    cardColor?: string;
    websiteLink?: string;
    toolImage?: string;
    logoBackgroundColor?: string;
    fallbackIcon?: string;
    imageurl?: string; // Legacy field
    $createdAt?: string;
    $updatedAt?: string;
    // Computed properties
    computedImageUrl?: string;
}

export { ID };
