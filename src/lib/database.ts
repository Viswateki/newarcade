import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const BLOGS_COLLECTION_ID = 'blogs';
const TOOLS_COLLECTION_ID = 'tools';
const FAVORITES_COLLECTION_ID = 'favorites';
const REVIEWS_COLLECTION_ID = 'reviews';
const ACTIVITY_COLLECTION_ID = 'activity';

export interface Blog {
  $id?: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  date: string; // Required date field for Appwrite
  views: number;
  likes: number;
  category: string;
  tags: string[];
}

export interface Tool {
  $id?: string;
  name: string;
  description: string;
  category: string;
  url: string;
  author_id: string;
  status: 'approved' | 'pending' | 'rejected';
  rating: number;
  submitted_at: string;
  approved_at?: string;
}

export interface Favorite {
  $id?: string;
  user_id: string;
  tool_id: string;
  tool_name: string;
  tool_description: string;
  tool_category: string;
  tool_rating: number;
  tool_url: string;
  added_at: string;
}

export interface Review {
  $id?: string;
  user_id: string;
  target_id: string;
  target_type: 'blog' | 'tool';
  target_title: string;
  rating: number;
  comment: string;
  created_at: string;
  likes: number;
}

export interface Activity {
  $id?: string;
  user_id: string;
  type: 'blog_published' | 'tool_submitted' | 'review_written' | 'tool_favorited' | 'tool_unfavorited' | 'profile_updated';
  title: string;
  description: string;
  timestamp: string;
  target_id?: string;
}

class DatabaseService {
  // Blog methods
  async getUserBlogs(userId: string): Promise<Blog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        [
          Query.equal('author_id', userId),
          Query.orderDesc('created_at'),
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
          Query.orderDesc('created_at'),
          Query.limit(100)
        ]
      );
      return response.documents as unknown as Blog[];
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      return [];
    }
  }

  async createBlog(blog: Omit<Blog, '$id'>): Promise<Blog | null> {
    try {
      const blogWithDate = {
        ...blog,
        date: new Date().toISOString() // Add required date field
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        ID.unique(),
        blogWithDate
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

  // Tool methods
  async getUserTools(userId: string): Promise<Tool[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TOOLS_COLLECTION_ID,
        [
          Query.equal('author_id', userId),
          Query.orderDesc('submitted_at'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Tool[];
    } catch (error) {
      console.error('Error fetching user tools:', error);
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

  // Favorites methods
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('added_at'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Favorite[];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  async addToFavorites(favorite: Omit<Favorite, '$id'>): Promise<Favorite | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        ID.unique(),
        favorite
      );
      return response as unknown as Favorite;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }

  async removeFromFavorites(favoriteId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, FAVORITES_COLLECTION_ID, favoriteId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  // Reviews methods
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('created_at'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Review[];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  async createReview(review: Omit<Review, '$id'>): Promise<Review | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        review
      );
      return response as unknown as Review;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  }

  // Activity methods
  async getUserActivity(userId: string): Promise<Activity[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ACTIVITY_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('timestamp'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as Activity[];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  async createActivity(activity: Omit<Activity, '$id'>): Promise<Activity | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        ACTIVITY_COLLECTION_ID,
        ID.unique(),
        activity
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  }

  // User profile methods
  async updateUserProfile(userId: string, updates: { name?: string; bio?: string; avatar?: string }): Promise<boolean> {
    try {
      // This would typically update a users collection
      // For now, we'll create an activity entry
      await this.createActivity({
        user_id: userId,
        type: 'profile_updated',
        title: 'Updated Profile',
        description: 'Profile information was updated',
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
