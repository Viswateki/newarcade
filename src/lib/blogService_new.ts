import { 
    databases, 
    storage, 
    DATABASE_ID, 
    BLOGS_COLLECTION_ID, 
    USER_INTERACTIONS_COLLECTION_ID,
    STORAGE_BUCKET_ID, 
    Blog, 
    BlogInteraction, // Updated from UserInteraction to BlogInteraction
    BlogComment,
    ID 
} from './appwrite';
import { Query } from 'appwrite';

class BlogService {
    // Create a new blog post
    async createBlog(blogData: Omit<Blog, '$id' | '$createdAt' | '$updatedAt'>): Promise<Blog> {
        try {
            // Generate unique slug from title (required field)
            const slug = blogData.slug || this.generateSlug(blogData.title);
            
            const cleanBlogData = {
                ...blogData,
                slug, // Required field
                // Convert tags array to string if needed (collection stores as string)
                tags: Array.isArray(blogData.tags) ? blogData.tags.join(',') : (blogData.tags || ''),
                // Set default values for required numeric fields
                views: blogData.views || 0,
                likes: blogData.likes || 0
            };
            
            // Remove empty/null values
            Object.keys(cleanBlogData).forEach(key => {
                const value = cleanBlogData[key as keyof typeof cleanBlogData];
                if (value === '' || value === null || value === undefined) {
                    delete cleanBlogData[key as keyof typeof cleanBlogData];
                }
            });
            
            // Simple approach: Let Appwrite generate unique ID
            try {
                const response = await databases.createDocument(
                    DATABASE_ID,
                    BLOGS_COLLECTION_ID,
                    ID.unique(),
                    cleanBlogData
                );
                
                return response as unknown as Blog;
            } catch (error: any) {
                // If slug conflict, generate new slug and retry once
                if (error.message?.includes('already exists')) {
                    console.log('Slug conflict detected, generating new slug...');
                    cleanBlogData.slug = this.generateSlug(blogData.title);
                    
                    const retryResponse = await databases.createDocument(
                        DATABASE_ID,
                        BLOGS_COLLECTION_ID,
                        ID.unique(),
                        cleanBlogData
                    );
                    
                    return retryResponse as unknown as Blog;
                }
                
                throw error;
            }
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
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add status filter only if specified
            if (status) {
                queries.push(Query.equal('status', status));
            }

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
            cleanUpdateData.$updatedAt = new Date().toISOString();
            
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
            const likeData = {
                user_id: userId,
                blog_id: blogId,
                interaction_type: 'like'
            };
            
            // Simple approach: Let Appwrite generate unique ID
            await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                ID.unique(),
                likeData
            );
            
            console.log(`Like created successfully`);

            // Increment blog likes count
            const blog = await this.getBlogById(blogId);
            await this.updateBlog(blogId, { likes: blog.likes + 1 });
        } catch (error: any) {
            // If it's a duplicate like (user already liked), handle gracefully
            if (error.message?.includes('already exists')) {
                console.log('User already liked this post');
                return; // User already liked, no need to error
            }
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
            const bookmarkData = {
                user_id: userId,
                blog_id: blogId,
                interaction_type: 'bookmark'
            };
            
            // Simple approach: Let Appwrite generate unique ID
            await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                ID.unique(),
                bookmarkData
            );
            
            console.log(`Bookmark created successfully`);
            
        } catch (error: any) {
            // If it's a duplicate bookmark (user already bookmarked), handle gracefully
            if (error.message?.includes('already exists')) {
                console.log('User already bookmarked this post');
                return; // User already bookmarked, no need to error
            }
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

                // Note: Bookmark count is now tracked through interactions, not stored on blog
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
    async addComment(
        blogId: string, 
        userId: string, 
        content: string, 
        userName?: string, 
        userAvatar?: string,
        parentCommentId?: string
    ): Promise<BlogComment> {
        const commentData = {
            user_id: userId,
            blog_id: blogId,
            interaction_type: 'comment' as const,
            content,
            user_name: userName || '',
            user_avatar: userAvatar || '',
            parent_comment_id: parentCommentId || ''
        };

        console.log('Adding comment to user_interactions collection');
        console.log('Creating comment with data:', commentData);
        
        try {
            // Step 1: Get user's next comment number for unique incremental ID
            const commentNumber = await this.getUserNextCommentNumber(userId);
            
            // Step 2: Generate short unique ID (max 36 chars for Appwrite)
            // Format: c_{userHash}_{count}_{timestamp}_{random}
            const userHash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString(16).substr(0, 6);
            const shortTimestamp = Date.now().toString(36); // Base36 is much shorter
            const randomSuffix = Math.random().toString(36).substr(2, 4); // Shorter random
            const uniqueId = `c_${userHash}_${commentNumber}_${shortTimestamp}_${randomSuffix}`;
            
            console.log(`🆔 Generated unique comment ID: ${uniqueId} (${uniqueId.length} chars, user comment #${commentNumber})`);
            
            // Step 3: Create comment with guaranteed unique ID (within 36 char limit)
            const response = await databases.createDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                uniqueId,
                commentData
            );

            console.log(`✅ Comment created successfully with ID: ${response.$id}`);
            return response as unknown as BlogComment;
            
        } catch (error: any) {
            console.error('💥 Error adding comment:', error);
            
            // If still getting duplicate ID (extremely unlikely now), use fallback method
            if (error.message?.includes('already exists')) {
                console.log('🆘 Using emergency fallback ID generation...');
                
                try {
                    // Emergency fallback: Ultra-short ID format (max 36 chars)
                    const now = Date.now();
                    const userHash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString(16).substr(0, 4);
                    const timeBase36 = now.toString(36);
                    const random1 = Math.random().toString(36).substr(2, 6);
                    const random2 = Math.random().toString(36).substr(2, 4);
                    
                    // Format: e_{userHash}_{time36}_{random1}_{random2} (emergency)
                    const emergencyId = `e_${userHash}_${timeBase36}_${random1}_${random2}`;
                    
                    console.log(`🆘 Emergency ID generated: ${emergencyId} (${emergencyId.length} chars)`);
                    
                    const retryResponse = await databases.createDocument(
                        DATABASE_ID,
                        USER_INTERACTIONS_COLLECTION_ID,
                        emergencyId,
                        commentData
                    );
                    
                    console.log(`✅ Comment created with emergency ID: ${retryResponse.$id}`);
                    return retryResponse as unknown as BlogComment;
                    
                } catch (retryError: any) {
                    console.error('💀 Emergency fallback also failed:', retryError);
                    throw new Error(`Failed to add comment with both primary and fallback methods: ${retryError.message}`);
                }
            }
            
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }

    // Helper method to get user's next comment number
    private async getUserNextCommentNumber(userId: string): Promise<number> {
        try {
            const userComments = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.equal('interaction_type', 'comment'),
                    Query.select(['$id'])
                ]
            );
            
            return userComments.total + 1;
        } catch (error) {
            console.error('Error getting user comment count, using timestamp fallback:', error);
            // If we can't get count, use timestamp as fallback
            return Date.now() % 100000; // Keep it reasonable
        }
    }

    async getComments(blogId: string): Promise<BlogComment[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'comment'),
                    Query.orderAsc('$createdAt') // Changed to ascending for better thread display
                ]
            );

            return response.documents as unknown as BlogComment[];
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    async deleteComment(commentId: string): Promise<void> {
        try {
            // Delete the comment document
            await databases.deleteDocument(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                commentId
            );

            // Note: Comment count is calculated dynamically from comments collection
            // No need to update blog document as comments_count doesn't exist
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    // Get comments count for a blog
    async getCommentsCount(blogId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('blog_id', blogId),
                    Query.equal('interaction_type', 'comment'),
                    Query.select(['$id']) // Only get IDs for count
                ]
            );
            
            return response.total;
        } catch (error) {
            console.error('Error getting comments count:', error);
            return 0;
        }
    }

    // Get replies for a specific comment
    async getReplies(parentCommentId: string): Promise<BlogComment[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_INTERACTIONS_COLLECTION_ID,
                [
                    Query.equal('parent_comment_id', parentCommentId),
                    Query.equal('interaction_type', 'comment'),
                    Query.orderAsc('$createdAt')
                ]
            );

            return response.documents as unknown as BlogComment[];
        } catch (error) {
            console.error('Error fetching replies:', error);
            return [];
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
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        // Add timestamp and random component to ensure uniqueness
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        
        return `${baseSlug}-${timestamp}-${randomId}`;
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
