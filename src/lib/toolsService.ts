import { databases, DATABASE_ID, TOOLS_COLLECTION_ID, Tool } from './appwrite';
import { Query } from 'appwrite';

export class ToolsService {
    // Fetch all tools
    async getAllTools(): Promise<Tool[]> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TOOLS_COLLECTION_ID,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100) // Adjust limit as needed
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
}

// Create and export a single instance
export const toolsService = new ToolsService();