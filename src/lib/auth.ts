import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);

export class AuthService {
  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      throw error;
    }
  }

  // Login with email and password
  async login(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  }

  // Create account and login
  async createAccount(email: string, password: string, name: string) {
    try {
      const { ID } = await import('appwrite');
      const response = await account.create(ID.unique(), email, password, name);
      // Auto login after account creation
      await this.login(email, password);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  }

  // Logout from all devices
  async logoutAll() {
    try {
      return await account.deleteSessions();
    } catch (error) {
      throw error;
    }
  }

  // Update password
  async updatePassword(password: string, oldPassword?: string) {
    try {
      return await account.updatePassword(password, oldPassword);
    } catch (error) {
      throw error;
    }
  }

  // Send password recovery email
  async forgotPassword(email: string) {
    try {
      return await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      throw error;
    }
  }

  // Complete password recovery
  async resetPassword(userId: string, secret: string, password: string) {
    try {
      return await account.updateRecovery(userId, secret, password);
    } catch (error) {
      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      return await account.createVerification(`${window.location.origin}/verify-email`);
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(userId: string, secret: string) {
    try {
      return await account.updateVerification(userId, secret);
    } catch (error) {
      throw error;
    }
  }

  // Check if user exists and their account type
  async checkUserExists(email: string) {
    try {
      // Try to create a session with a dummy password to see what type of account this is
      await account.createEmailPasswordSession(email, 'dummy_password_123');
      return { exists: true, isOAuthOnly: false }; // If this succeeds, they have a password
    } catch (error: any) {
      if (error.code === 401) {
        if (error.message?.includes('Invalid credentials') || error.message?.includes('wrong password')) {
          // User exists and has a password, just wrong password
          return { exists: true, isOAuthOnly: false };
        } else if (error.message?.includes('Invalid `password` param') || 
                   error.message?.includes('OAuth')) {
          // User exists but was created via OAuth (no password set)
          return { exists: true, isOAuthOnly: true };
        }
      } else if (error.code === 404 || error.message?.includes('user not found')) {
        // User doesn't exist
        return { exists: false, isOAuthOnly: false };
      }
      // For any other error, assume user doesn't exist
      return { exists: false, isOAuthOnly: false };
    }
  }

  // OAuth login
  async oAuthLogin(provider: 'google' | 'github') {
    try {
      const { OAuthProvider } = await import('appwrite');
      const oauthProvider = provider === 'google' ? OAuthProvider.Google : OAuthProvider.Github;
      const scopes = provider === 'github' ? ['user:email'] : undefined;
      
      return account.createOAuth2Session(
        oauthProvider,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/login?error=oauth_failed`,
        scopes
      );
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
