import { Client, Databases, Query, ID } from 'appwrite';
import { 
  DATABASE_ID,
  BLOGS_COLLECTION_ID, 
  TOOLS_COLLECTION_ID,
  USER_INTERACTIONS_COLLECTION_ID 
} from './appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

export interface Blog {
  $id?: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  user_id: string; // Who wrote the blog
  author_name: string; // Author display name
  category: string;
  tags: string[]; // Blog tags
  featured_image?: string; // Image URL
  views: number;
  likes: number;
  comments_count: number;
  reading_time?: number; // Estimated reading time in minutes
  featured: boolean; // Is featured blog
  slug?: string; // URL-friendly version of title
  $createdAt?: string;
  $updatedAt?: string;
}

export interface BlogInteraction {
  $id?: string;
  user_id: string; // Who interacted
  blog_id: string; // Which blog
  interaction_type: 'like' | 'comment' | 'bookmark';
  content?: string; // Comment content (if type is comment)
  user_name?: string; // User display name (for comments)
  parent_comment_id?: string; // For reply comments
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Tool {
  $id?: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string; // Tool logo/image
  link: string; // Website URL
  user_id: string; // Who submitted
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  rating: number; // Average rating
  featured: boolean; // Is featured
  tags?: string[]; // Tool tags
  pricing?: 'free' | 'paid' | 'freemium';
  $createdAt?: string;
  $updatedAt?: string;
}

class DatabaseService {
  // Blog methods
  async getUserBlogs(userId: string): Promise<Blog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Blog[];
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      return [];
    }
  }

  async getAllBlogs(): Promise<Blog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        [
          Query.equal('status', 'published'),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );
      return response.documents as unknown as Blog[];
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      return [];
    }
  }

  async getBlogById(blogId: string): Promise<Blog | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        blogId
      );
      return response as unknown as Blog;
    } catch (error) {
      console.error('Error fetching blog:', error);
      return null;
    }
  }

  async createBlog(blog: Omit<Blog, '$id'>): Promise<Blog | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        ID.unique(),
        blog
      );
      return response as unknown as Blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      return null;
    }
  }

  async updateBlog(blogId: string, updates: Partial<Blog>): Promise<Blog | null> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        blogId,
        updates
      );
      return response as unknown as Blog;
    } catch (error) {
      console.error('Error updating blog:', error);
      return null;
    }
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, BLOGS_COLLECTION_ID, blogId);
      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      return false;
    }
  }

  // Blog Interaction methods
  async getBlogInteractions(blogId: string): Promise<BlogInteraction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        [
          Query.equal('blog_id', blogId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as BlogInteraction[];
    } catch (error) {
      console.error('Error fetching blog interactions:', error);
      return [];
    }
  }

  async getBlogComments(blogId: string): Promise<BlogInteraction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        [
          Query.equal('blog_id', blogId),
          Query.equal('interaction_type', 'comment'),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as BlogInteraction[];
    } catch (error) {
      console.error('Error fetching blog comments:', error);
      return [];
    }
  }

  async addBlogInteraction(interaction: Omit<BlogInteraction, '$id'>): Promise<BlogInteraction | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        ID.unique(),
        interaction
      );
      return response as unknown as BlogInteraction;
    } catch (error) {
      console.error('Error adding blog interaction:', error);
      return null;
    }
  }

  async removeBlogInteraction(interactionId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, USER_INTERACTIONS_COLLECTION_ID, interactionId);
      return true;
    } catch (error) {
      console.error('Error removing blog interaction:', error);
      return false;
    }
  }

  // Tool methods
  async getUserTools(userId: string): Promise<Tool[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Tool[];
    } catch (error) {
      console.error('Error fetching user tools:', error);
      return [];
    }
  }

  async getAllTools(): Promise<Tool[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          Query.equal('status', 'approved'),
          Query.orderDesc('$createdAt'),
          Query.limit(500)
        ]
      );
      return response.documents as unknown as Tool[];
    } catch (error) {
      console.error('Error fetching all tools:', error);
      return [];
    }
  }

  async createTool(tool: Omit<Tool, '$id'>): Promise<Tool | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        ID.unique(),
        tool
      );
      return response as unknown as Tool;
    } catch (error) {
      console.error('Error creating tool:', error);
      return null;
    }
  }

  async updateTool(toolId: string, updates: Partial<Tool>): Promise<Tool | null> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        toolId,
        updates
      );
      return response as unknown as Tool;
    } catch (error) {
      console.error('Error updating tool:', error);
      return null;
    }
  }

  // Helper methods
  async getBlogCategories(): Promise<string[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        [
          Query.equal('status', 'published'),
          Query.limit(1000)
        ]
      );
      const categories = [...new Set(response.documents.map(doc => doc.category))];
      return categories.filter(Boolean) as string[];
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return [];
    }
  }

  async getToolCategories(): Promise<string[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          Query.equal('status', 'approved'),
          Query.limit(1000)
        ]
      );
      const categories = [...new Set(response.documents.map(doc => doc.category))];
      return categories.filter(Boolean) as string[];
    } catch (error) {
      console.error('Error fetching tool categories:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
