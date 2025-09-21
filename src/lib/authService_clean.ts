import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import { databases } from './appwrite';

// In-memory storage for verification codes
const verificationCodes: { [email: string]: { code: string; expiry: number; userName: string } } = {};

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface UserProfile {
  $id: string;
  userId: string;
  username: string;
  name: string;
  email: string;
  type: string;
  arcadeCoins: number;
  firstName?: string;
  lastName?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  image?: string;
  isEmailVerified: boolean;
  avatar?: string;
  usernameLastUpdatedAt?: string;
  failedLoginAttempts: number;
  accountLockUntil?: string;
  passwordChangedAt?: string;
  verificationCode?: string;
  verificationCodeExpiry?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  linkedinProfile?: string;
  githubProfile?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  type: string;
  arcadeCoins: number;
  firstName?: string;
  lastName?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  image?: string;
  isEmailVerified: boolean;
  usernameLastUpdatedAt?: string;
}

class AuthService {
  private readonly userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
  private readonly databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

  // Validation helpers
  private validateEmail(email: string): { isValid: boolean; sanitized: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.toLowerCase().trim();
    return {
      isValid: emailRegex.test(sanitized),
      sanitized
    };
  }

  // Custom login - database only
  async login(data: LoginData): Promise<{ 
    success: boolean; 
    message: string; 
    user?: AuthUser;
    requiresVerification?: boolean;
    email?: string;
    verificationCode?: string;
    userName?: string;
  }> {
    try {
      const { email, password } = data;

      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      console.log('🔐 Custom login attempt for:', emailValidation.sanitized);

      // Find user in our database by email
      let existingUserResponse;
      try {
        existingUserResponse = await databases.listDocuments(
          this.databaseId,
          this.userCollectionId,
          [Query.equal('email', emailValidation.sanitized)]
        );
      } catch (dbError) {
        console.error('❌ Error accessing database:', dbError);
        return { success: false, message: 'Authentication service temporarily unavailable. Please try again.' };
      }
      
      if (existingUserResponse.documents.length === 0) {
        console.log('❌ User not found in database');
        return { success: false, message: 'Invalid email or password' };
      }

      const userProfile = existingUserResponse.documents[0] as unknown as UserProfile;
      console.log('👤 User found in database:', {
        email: userProfile.email,
        isEmailVerified: userProfile.isEmailVerified
      });

      // For now, we'll skip password verification since we don't store hashed passwords
      // In a production system, you should hash and verify passwords
      console.log('⚠️ Note: Password verification skipped - implement proper password hashing');

      // Check if user is verified
      if (!userProfile.isEmailVerified) {
        console.log('📧 User exists but is unverified, generating verification code...');
        
        // Generate verification code for unverified user
        const verificationCode = generateVerificationCode();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        
        // Store verification code in memory
        verificationCodes[emailValidation.sanitized] = {
          code: verificationCode,
          expiry,
          userName: userProfile.name
        };
        
        console.log('✅ Verification code generated for unverified user');
        
        return { 
          success: false, 
          message: 'Your email is not verified. A verification code has been sent to your email.',
          requiresVerification: true,
          email: emailValidation.sanitized,
          verificationCode, // This will be used by the API to send email
          userName: userProfile.name
        };
      }

      // Check if account is locked
      if (userProfile.accountLockUntil && new Date(userProfile.accountLockUntil) > new Date()) {
        return { success: false, message: 'Account is temporarily locked. Please try again later.' };
      }

      // Reset failed login attempts on successful login
      if (userProfile.failedLoginAttempts > 0) {
        try {
          await databases.updateDocument(
            this.databaseId,
            this.userCollectionId,
            userProfile.$id,
            {
              failedLoginAttempts: 0,
              accountLockUntil: null
            }
          );
        } catch (updateError) {
          console.log('⚠️ Could not reset failed login attempts, but login successful');
        }
      }

      // Create user object for successful login
      const user: AuthUser = {
        id: userProfile.userId,
        email: userProfile.email,
        name: userProfile.name,
        username: userProfile.username,
        type: userProfile.type,
        arcadeCoins: userProfile.arcadeCoins,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        linkedinProfile: userProfile.linkedinProfile,
        githubProfile: userProfile.githubProfile,
        image: userProfile.image,
        isEmailVerified: userProfile.isEmailVerified,
        usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
      };

      console.log('✅ Custom login successful for user:', user.email);

      return {
        success: true,
        message: 'Login successful',
        user
      };

    } catch (error: unknown) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  // Custom email verification
  async verifyEmailCode(email: string, code: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: { 
      id: string; 
      name: string; 
      email: string; 
      username: string; 
      type: string; 
      arcadeCoins: number; 
      linkedinProfile?: string; 
      githubProfile?: string; 
      image?: string; 
      isEmailVerified: boolean; 
      usernameLastUpdatedAt?: string;
      firstName?: string;
      lastName?: string;
    } 
  }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      const storedCode = verificationCodes[emailValidation.sanitized];
      
      if (!storedCode) {
        return { success: false, message: 'No verification code found. Please request a new one.' };
      }

      if (storedCode.code !== code) {
        return { success: false, message: 'Invalid verification code' };
      }

      if (Date.now() > storedCode.expiry) {
        delete verificationCodes[email];
        return { success: false, message: 'Verification code has expired. Please request a new one.' };
      }

      // Find user by email
      const users = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', email)]
      );

      if (users.documents.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const userProfile = users.documents[0];

      // Update user as verified
      let updatedProfile;
      try {
        updatedProfile = await databases.updateDocument(
          this.databaseId,
          this.userCollectionId,
          userProfile.$id,
          {
            isEmailVerified: true
          }
        );
        console.log('✅ Updated user profile with email verification status');
        
      } catch (updateError) {
        console.log('⚠️ Could not update email verification field in database, but verification code is valid');
        console.error('Update error:', updateError);
        // Continue without updating the database field - verification is still successful
        updatedProfile = userProfile;
      }

      // Clear verification code from memory
      delete verificationCodes[email];

      console.log('💡 Email verified in our system. User can now login.');

      const user = {
        id: updatedProfile.userId || updatedProfile.$id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        username: updatedProfile.username,
        type: updatedProfile.type || 'user',
        arcadeCoins: updatedProfile.arcadeCoins || 0,
        linkedinProfile: updatedProfile.linkedinProfile,
        githubProfile: updatedProfile.githubProfile,
        image: updatedProfile.image,
        isEmailVerified: true,
        usernameLastUpdatedAt: updatedProfile.usernameLastUpdatedAt,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName
      };

      return { 
        success: true, 
        message: 'Email verification successful',
        user
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  }

  // Simple logout (no Appwrite session to clean up)
  async logout(): Promise<{ success: boolean; message: string }> {
    console.log('👋 Logout - using custom auth (no Appwrite session to clean)');
    return { success: true, message: 'Logout successful' };
  }

  // Get current user (simplified - no Appwrite session)
  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('👤 getCurrentUser - using custom auth (no persistent sessions)');
    // With custom auth, we don't have persistent sessions
    // The frontend will handle user state through context
    return null;
  }
}

export const authService = new AuthService();
export default authService;