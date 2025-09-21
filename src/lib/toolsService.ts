import { databases, DATABASE_ID, TOOLS_COLLECTION_ID, Tool, getToolImageUrlFromTool } from './appwrite';
import { Query } from 'appwrite';
import { storageService } from './storageService';
import { toolsStorageService } from './toolsStorageService';

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
            const categorySet = new Set<string>();
            
            // Get categories from each tool
            tools.forEach(tool => {
                if (tool.categories) {
                    try {
                        const parsed = JSON.parse(tool.categories);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(category => {
                                if (category && category.trim() !== '') {
                                    categorySet.add(category);
                                }
                            });
                        }
                    } catch (e) {
                        // If JSON parsing fails, skip this tool
                    }
                } else {
                    // For tools without categories, use auto-categorization
                    const autoCategory = this.getAutoCategory(tool);
                    if (autoCategory && autoCategory.trim() !== '') {
                        categorySet.add(autoCategory);
                    }
                }
            });
            
            return Array.from(categorySet);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Auto-categorization logic for tools without categories
    private getAutoCategory(tool: Tool): string {
        const toolName = tool.name?.toLowerCase() || '';
        const toolDesc = tool.description?.toLowerCase() || '';
        const allText = [toolName, toolDesc].join(' ');
        
        if (toolName.includes('google') || toolName.includes('openai') || toolName.includes('microsoft') || tool.featured) {
            return 'Official bots';
        }
        if (allText.includes('image') || allText.includes('photo') || allText.includes('art')) {
            return 'Image generation bots';
        }
        if (allText.includes('video') || allText.includes('film')) {
            return 'Video generation bots';
        }
        if (allText.includes('audio') || allText.includes('music')) {
            return 'Audio generation bots';
        }
        if (allText.includes('writing') || allText.includes('content')) {
            return 'Writing bots';
        }
        if (allText.includes('search') || allText.includes('research')) {
            return 'Search bots';
        }
        if (allText.includes('chat') || allText.includes('conversation')) {
            return 'Chat bots';
        }
        if (allText.includes('productivity') || allText.includes('work')) {
            return 'Productivity bots';
        }
        return 'Uncategorized';
    }

    // Enrich a single tool with proper image URL from storage bucket
    private async enrichToolWithImageUrl(tool: Tool): Promise<Tool> {
        try {
            // Use the enhanced method to get the best available image URL
            const enhancedImageUrl = await toolsStorageService.getEnhancedToolImageUrl(tool);
            return {
                ...tool,
                // Add a computed property for the enhanced image URL
                computedImageUrl: enhancedImageUrl,
                // Update the imageUrl field if we found a better one
                imageUrl: tool.imageUrl || enhancedImageUrl
            };
        } catch (error) {
            console.error('Error enriching tool with image URL:', error);
            // Fallback to existing logic if enhanced method fails
            return {
                ...tool,
                computedImageUrl: getToolImageUrlFromTool(tool)
            };
        }
    }

    // Enrich tools array with proper image URLs
    private async enrichToolsWithImageUrls(tools: Tool[]): Promise<Tool[]> {
        try {
            // Process tools in parallel for better performance
            const enrichedTools = await Promise.all(
                tools.map(tool => this.enrichToolWithImageUrl(tool))
            );
            return enrichedTools;
        } catch (error) {
            console.error('Error enriching tools with image URLs:', error);
            // Fallback to sync enrichment if parallel processing fails
            return tools.map(tool => ({
                ...tool,
                computedImageUrl: getToolImageUrlFromTool(tool)
            }));
        }
    }

    // Get all tools with proper image URLs
    async getAllToolsWithImages(): Promise<Tool[]> {
        try {
            const tools = await this.getAllTools();
            return await this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching tools with images:', error);
            throw error;
        }
    }

    // Get tools by category with proper image URLs
    async getToolsByCategoryWithImages(category: string): Promise<Tool[]> {
        try {
            const tools = await this.getToolsByCategory(category);
            return await this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching tools by category with images:', error);
            throw error;
        }
    }

    // Get featured tools with proper image URLs
    async getFeaturedToolsWithImages(): Promise<Tool[]> {
        try {
            const tools = await this.getFeaturedTools();
            return await this.enrichToolsWithImageUrls(tools);
        } catch (error) {
            console.error('Error fetching featured tools with images:', error);
            throw error;
        }
    }
}

// Create and export a single instance
export const toolsService = new ToolsService();