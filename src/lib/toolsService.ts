import { databases, DATABASE_ID, TOOLS_COLLECTION_ID, Tool, getToolImageUrlFromTool } from './appwrite';
import { Query } from 'appwrite';
import { storageService } from './storageService';

export class ToolsService {
    // Fetch all tools
    async getAllTools(): Promise<Tool[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(500) // Increased limit to ensure we get all tools
                ]
            );
            return response.documents as unknown as Tool[];
        } catch (error) {
            console.error('Error fetching tools:', error);
            throw error;
        }
    }

    // Fetch tools by category
    async getToolsByCategory(category: string): Promise<Tool[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                [
                    Query.equal('category', category),
                    Query.orderDesc('$createdAt')
                ]
            );
            return response.documents as unknown as Tool[];
        } catch (error) {
            console.error('Error fetching tools by category:', error);
            throw error;
        }
    }

    // Fetch featured tools
    async getFeaturedTools(): Promise<Tool[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                [
                    Query.equal('featured', true),
                    Query.orderDesc('$createdAt')
                ]
            );
            return response.documents as unknown as Tool[];
        } catch (error) {
            console.error('Error fetching featured tools:', error);
            throw error;
        }
    }

    // Search tools by name or description
    async searchTools(searchTerm: string): Promise<Tool[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                [
                    Query.search('name', searchTerm),
                    Query.orderDesc('$createdAt')
                ]
            );
            return response.documents as unknown as Tool[];
        } catch (error) {
            console.error('Error searching tools:', error);
            throw error;
        }
    }

    // Get tool by ID
    async getToolById(toolId: string): Promise<Tool> {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                toolId
            );
            return response as unknown as Tool;
        } catch (error) {
            console.error('Error fetching tool by ID:', error);
            throw error;
        }
    }

    // Helper method to get unique categories from all tools
    async getCategories(): Promise<string[]> {
        try {
            const tools = await this.getAllTools();
            const categories = [...new Set(tools.map(tool => tool.category))];
            return categories.filter(cat => cat && cat.trim() !== '');
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Enrich a single tool with proper image URL
    private enrichToolWithImageUrl(tool: Tool): Tool {
        return {
            ...tool,
            // Add a computed property for the image URL
            computedImageUrl: getToolImageUrlFromTool(tool)
        };
    }

    // Enrich tools array with proper image URLs
    private enrichToolsWithImageUrls(tools: Tool[]): Tool[] {
        return tools.map(tool => this.enrichToolWithImageUrl(tool));
    }

    // Get all tools with proper image URLs
    async getAllToolsWithImages(): Promise<Tool[]> {
        try {
            const tools = await this.getAllTools();
            return this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching tools with images:', error);
            throw error;
        }
    }

    // Get tools by category with proper image URLs
    async getToolsByCategoryWithImages(category: string): Promise<Tool[]> {
        try {
            const tools = await this.getToolsByCategory(category);
            return this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching tools by category with images:', error);
            throw error;
        }
    }

    // Get featured tools with proper image URLs
    async getFeaturedToolsWithImages(): Promise<Tool[]> {
        try {
            const tools = await this.getFeaturedTools();
            return this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching featured tools with images:', error);
            throw error;
        }
    }
}

// Create and export a single instance
export const toolsService = new ToolsService();