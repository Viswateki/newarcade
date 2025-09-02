import { Client, Databases, Storage, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BLOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOGS_COLLECTION_ID!;
export const USER_INTERACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_INTERACTION_COLLECTION_ID!;
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

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
    $createdAt?: string;
    $updatedAt?: string;
}

export { client, ID };
