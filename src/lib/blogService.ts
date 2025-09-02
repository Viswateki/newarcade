import { 
    databases, 
    storage, 
    DATABASE_ID, 
    BLOGS_COLLECTION_ID, 
    USER_INTERACTIONS_COLLECTION_ID,
    STORAGE_BUCKET_ID, 
    Blog, 
    UserInteraction,
    Comment,
    ID 
} from './appwrite';
import { Query } from 'appwrite';

class BlogService {
    // Create a new blog post (Medium-like)
    async createBlog(blogData: Omit<Blog, '$id' | '$createdAt' | '$updatedAt'>): Promise<Blog> {
        try {
            // Generate slug from title
            const slug = this.generateSlug(blogData.title);
            
            // Calculate reading time
            const readingTime = this.calculateReadingTime(blogData.content);
            
            const cleanBlogData = {
                ...blogData,
                slug,
                reading_time: readingTime, // Optional in your schema
                readTime: readingTime.toString(), // Convert to string for your DB
                tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : blogData.tags, // Convert array to string
                views: 0,
                likes: 0,
                comments_count: 0,
                bookmarks: 0,
                rating: 0,
                date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Remove empty/null values
            Object.keys(cleanBlogData).forEach(key => {
                const value = cleanBlogData[key as keyof typeof cleanBlogData];
                if (value === '' || value === null || value === undefined) {
                    delete cleanBlogData[key as keyof typeof cleanBlogData];
                }
            });
            
            const response = await databases.createDocument(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                ID.unique(),
                cleanBlogData
            );
            
            return response as unknown as Blog;
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    }

    // Get blogs with filtering and pagination (Medium-like)
    async getBlogs(options: {
        limit?: number;
        offset?: number;
        category?: string;
        author?: string;
        status?: 'draft' | 'published';
        featured?: boolean;
        search?: string;
        sortBy?: 'recent' | 'popular' | 'oldest';
    } = {}): Promise<{ blogs: Blog[], total: number }> {
        try {
            const {
                limit = 20,
                offset = 0,
                category,
                author,
                status = 'published',
                featured,
                search,
                sortBy = 'recent'
            } = options;

            const queries = [
                Query.equal('status', status),
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add filters
            if (category) {
                queries.push(Query.equal('category', category));
            }
            if (author) {
                queries.push(Query.equal('author_id', author));
            }
            if (featured !== undefined) {
                queries.push(Query.equal('featured', featured));
            }
            if (search) {
                queries.push(Query.search('title', search));
            }

            // Add sorting
            switch (sortBy) {
                case 'popular':
                    queries.push(Query.orderDesc('views'));
                    break;
                case 'oldest':
                    queries.push(Query.orderAsc('$createdAt'));
                    break;
                case 'recent':
                default:
                    queries.push(Query.orderDesc('$createdAt'));
                    break;
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                queries
            );

            return {
                blogs: response.documents as unknown as Blog[],
                total: response.total
            };
        } catch (error) {
            console.error('Error fetching blogs:', error);
            throw error;
        }
    }

    // Get a single blog by ID
    async getBlogById(blogId: string): Promise<Blog> {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                blogId
            );
            
            return response as unknown as Blog;
        } catch (error) {
            console.error('Error fetching blog:', error);
            throw error;
        }
    }

    // Update blog
    async updateBlog(blogId: string, updateData: Partial<Blog>): Promise<Blog> {
        try {
            const cleanUpdateData = { ...updateData };
            cleanUpdateData.updated_at = new Date().toISOString();
            
            // Remove empty/null values
            Object.keys(cleanUpdateData).forEach(key => {
                const value = cleanUpdateData[key as keyof typeof cleanUpdateData];
                if (value === '' || value === null || value === undefined) {
                    delete cleanUpdateData[key as keyof typeof cleanUpdateData];
                }
            });

            const response = await databases.updateDocument(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                blogId,
                cleanUpdateData
            );
            
            return response as unknown as Blog;
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    }

    // Delete blog
    async deleteBlog(blogId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                blogId
            );
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    }

    // Increment views
    async incrementViews(blogId: string): Promise<void> {
        try {
            const blog = await this.getBlogById(blogId);
            await this.updateBlog(blogId, { views: blog.views + 1 });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    // LIKE FUNCTIONALITY
    async likeBlog(blogId: string, userId: string): Promise<void> {
        try {
            // Create like interaction
            await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                ID.unique(),
                {
                    user_id: userId,
                    blog_id: blogId,
                    interaction_type: 'like'
                }
            );

            // Increment blog likes count
            const blog = await this.getBlogById(blogId);
            await this.updateBlog(blogId, { likes: blog.likes + 1 });
        } catch (error) {
            console.error('Error liking blog:', error);
            throw error;
        }
    }

    async unlikeBlog(blogId: string, userId: string): Promise<void> {
        try {
            // Find and delete like interaction
            const interactions = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'like')
                ]
            );

            if (interactions.documents.length > 0) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    USER_INTERACTIONS_COLLECTION_ID,
                    interactions.documents[0].$id
                );

                // Decrement blog likes count
                const blog = await this.getBlogById(blogId);
                await this.updateBlog(blogId, { likes: Math.max(0, blog.likes - 1) });
            }
        } catch (error) {
            console.error('Error unliking blog:', error);
            throw error;
        }
    }

    async checkIfLiked(blogId: string, userId: string): Promise<boolean> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'like')
                ]
            );
            
            return response.documents.length > 0;
        } catch (error) {
            console.error('Error checking if liked:', error);
            return false;
        }
    }

    // BOOKMARK FUNCTIONALITY
    async bookmarkBlog(blogId: string, userId: string): Promise<void> {
        try {
            await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                ID.unique(),
                {
                    user_id: userId,
                    blog_id: blogId,
                    interaction_type: 'bookmark'
                }
            );

            // Increment blog bookmarks count
            const blog = await this.getBlogById(blogId);
            await this.updateBlog(blogId, { bookmarks: blog.bookmarks + 1 });
        } catch (error) {
            console.error('Error bookmarking blog:', error);
            throw error;
        }
    }

    async removeBookmark(blogId: string, userId: string): Promise<void> {
        try {
            const interactions = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'bookmark')
                ]
            );

            if (interactions.documents.length > 0) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    USER_INTERACTIONS_COLLECTION_ID,
                    interactions.documents[0].$id
                );

                // Decrement blog bookmarks count
                const blog = await this.getBlogById(blogId);
                await this.updateBlog(blogId, { bookmarks: Math.max(0, blog.bookmarks - 1) });
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            throw error;
        }
    }

    async checkIfBookmarked(blogId: string, userId: string): Promise<boolean> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'bookmark')
                ]
            );
            
            return response.documents.length > 0;
        } catch (error) {
            console.error('Error checking if bookmarked:', error);
            return false;
        }
    }

    async getUserBookmarks(userId: string): Promise<Blog[]> {
        try {
            // Get user's bookmark interactions
            const bookmarks = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('interaction_type', 'bookmark'),
                    Query.orderDesc('$createdAt')
                ]
            );

            // Get the actual blog posts
            const blogIds = bookmarks.documents.map(bookmark => bookmark.blog_id);
            if (blogIds.length === 0) return [];

            const blogs = await databases.listDocuments(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                [
                    Query.equal('$id', blogIds),
                    Query.equal('status', 'published')
                ]
            );

            return blogs.documents as unknown as Blog[];
        } catch (error) {
            console.error('Error fetching user bookmarks:', error);
            throw error;
        }
    }

    // COMMENT FUNCTIONALITY
    async addComment(blogId: string, userId: string, content: string, userName?: string, userAvatar?: string): Promise<Comment> {
        try {
            const commentData = {
                user_id: userId,
                blog_id: blogId,
                interaction_type: 'comment' as const,
                content,
                user_name: userName || '',
                user_avatar: userAvatar || ''
            };

            const response = await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                ID.unique(),
                commentData
            );

            // Increment blog comments count
            const blog = await this.getBlogById(blogId);
            await this.updateBlog(blogId, { comments_count: blog.comments_count + 1 });

            return response as unknown as Comment;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }

    async getComments(blogId: string): Promise<Comment[]> {
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

            return response.documents as unknown as Comment[];
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    // IMAGE UPLOAD
    async uploadImage(file: File): Promise<string> {
        try {
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file
            );

            // Return the file URL
            const fileUrl = storage.getFileView(STORAGE_BUCKET_ID, response.$id);
            return fileUrl.toString();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    // UTILITY METHODS
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    // Get blog categories
    async getCategories(): Promise<string[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                [
                    Query.equal('status', 'published'),
                    Query.select(['category'])
                ]
            );

            const categories = [...new Set(response.documents.map(doc => doc.category))];
            return categories.filter(Boolean);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Get trending tags
    async getTrendingTags(): Promise<string[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BLOGS_COLLECTION_ID,
                [
                    Query.equal('status', 'published'),
                    Query.select(['tags']),
                    Query.limit(100)
                ]
            );

            const allTags: string[] = [];
            response.documents.forEach(doc => {
                try {
                    const tags = JSON.parse(doc.tags || '[]');
                    allTags.push(...tags);
                } catch (e) {
                    // Handle cases where tags might not be valid JSON
                }
            });

            // Count occurrences and return top tags
            const tagCounts: { [key: string]: number } = {};
            allTags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });

            return Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20)
                .map(([tag]) => tag);
        } catch (error) {
            console.error('Error fetching trending tags:', error);
            return [];
        }
    }
}

export const blogService = new BlogService();
