import { databaseService } from './database';

export interface DashboardStats {
  totalBlogs: number;
  totalTools: number;
  totalReviews: number;
  totalFavorites: number;
  totalViews: number;
  totalLikes: number;
  recentActivityCount: number;
}

class DashboardStatsService {
  async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      // Fetch all user data in parallel
      const [blogs, tools, reviews, favorites, activities] = await Promise.all([
        databaseService.getUserBlogs(userId),
        databaseService.getUserTools(userId),
        databaseService.getUserReviews(userId),
        databaseService.getUserFavorites(userId),
        databaseService.getUserActivity(userId)
      ]);

      // Calculate stats
      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);

      return {
        totalBlogs: blogs.length,
        totalTools: tools.length,
        totalReviews: reviews.length,
        totalFavorites: favorites.length,
        totalViews,
        totalLikes,
        recentActivityCount: activities.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalBlogs: 0,
        totalTools: 0,
        totalReviews: 0,
        totalFavorites: 0,
        totalViews: 0,
        totalLikes: 0,
        recentActivityCount: 0
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
