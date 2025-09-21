import { databaseService } from './database';

export interface DashboardStats {
  totalBlogs: number;
  totalTools: number;
  totalBlogLikes: number;
  totalBlogComments: number;
  totalBlogViews: number;
  totalToolViews: number;
}

class DashboardStatsService {
  async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      // Fetch user data in parallel
      const [blogs, tools] = await Promise.all([
        databaseService.getUserBlogs(userId),
        databaseService.getUserTools(userId)
      ]);

      // Calculate stats from blogs
      const totalBlogViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const totalBlogLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
      const totalBlogComments = blogs.reduce((sum, blog) => sum + (blog.comments_count || 0), 0);

      // Calculate stats from tools
      const totalToolViews = tools.reduce((sum, tool) => sum + (tool.views || 0), 0);

      return {
        totalBlogs: blogs.length,
        totalTools: tools.length,
        totalBlogLikes,
        totalBlogComments,
        totalBlogViews,
        totalToolViews
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalBlogs: 0,
        totalTools: 0,
        totalBlogLikes: 0,
        totalBlogComments: 0,
        totalBlogViews: 0,
        totalToolViews: 0
      };
    }
  }

  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalBlogs: number;
    totalTools: number;
    totalReviews: number;
  }> {
    // This would require additional database queries to get global stats
    // For now, return placeholder values
    return {
      totalUsers: 1250,
      totalBlogs: 450,
      totalTools: 120,
      totalReviews: 890
    };
  }
}

export const dashboardStatsService = new DashboardStatsService();
