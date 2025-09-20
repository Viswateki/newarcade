import { account, databases } from './appwrite';
import { ID, Query } from 'appwrite';

// Helper function to generate 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple in-memory store for verification codes
interface VerificationCodeStore {
  [email: string]: {
    code: string;
    expiry: number;
    userName: string;
  }
}

const verificationCodes: VerificationCodeStore = {};

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(verificationCodes).forEach(email => {
    if (verificationCodes[email].expiry < now) {
      delete verificationCodes[email];
    }
  });
}, 5 * 60 * 1000);

// Types
export interface UserProfile {
  $id: string;
  userId: string;
  username: string;
  name: string;
  email: string;
  emailVerified: boolean;
  type: string;
  arcadeCoins: number;
  firstName?: string;
  lastName?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  image?: string;
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

  private validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('username', username.trim())]
      );
      return response.documents.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      // If we can't check due to permissions, assume it's available for now
      // This is a temporary workaround until permissions are fixed
      console.warn('Username availability check failed - proceeding with registration');
      return true;
    }
  }

  // Get user profile by userId
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('userId', userId)]
      );
      
      return response.documents.length > 0 ? response.documents[0] as unknown as UserProfile : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Check if it's a permission error
      if ((error as any)?.code === 401) {
        console.error('Permission denied: User does not have permission to read from users collection');
        console.error('Please check your Appwrite collection permissions');
      }
      
      // If database access fails due to permissions, try to get account info
      try {
        const accountInfo = await account.get();
        console.warn('Profile database access failed, using minimal profile from account');
        return {
          $id: accountInfo.$id,
          userId: accountInfo.$id,
          name: accountInfo.name,
          username: accountInfo.email.split('@')[0], // Use email prefix as fallback
          email: accountInfo.email,
          emailVerified: accountInfo.emailVerification,
          type: 'user',
          arcadeCoins: 0,
          failedLoginAttempts: 0,
          $createdAt: accountInfo.$createdAt,
          $updatedAt: accountInfo.$updatedAt
        } as UserProfile;
      } catch (accountError) {
        console.error('Failed to get account info as fallback:', accountError);
        return null;
      }
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: AuthUser; requiresVerification?: boolean; verificationCode?: string }> {
    try {
      const { email, password, username, linkedinProfile, githubProfile } = data;

      // Validate input
      if (!email || !password || !username) {
        return { success: false, message: 'Email, password, and username are required' };
      }

      // Use username as name for now (can be updated later in profile)
      const name = username.trim();

      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join(', ') };
      }

      // Validate username
      if (username.trim().length < 3) {
        return { success: false, message: 'Username must be at least 3 characters long' };
      }

      console.log('🔍 Environment check:', {
        databaseId: this.databaseId,
        userCollectionId: this.userCollectionId,
        hasDatabase: !!this.databaseId,
        hasCollection: !!this.userCollectionId
      });

      console.log('📝 Registration data:', {
        email: emailValidation.sanitized,
        username: username.trim(),
        name
      });
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          message: 'Weak password', 
        };
      }

      // Check if username is available
      const usernameAvailable = await this.isUsernameAvailable(username);
      if (!usernameAvailable) {
        return { success: false, message: 'Username is already taken' };
      }

      // Check if email already exists in our database
      try {
        const existingUsers = await databases.listDocuments(
          this.databaseId,
          this.userCollectionId,
          [Query.equal('email', emailValidation.sanitized)]
        );
        
        if (existingUsers.documents.length > 0) {
          return { success: false, message: 'An account with this email already exists' };
        }
      } catch (emailCheckError) {
        console.warn('Could not check existing emails:', emailCheckError);
        // Continue with registration attempt
      }

      console.log('📤 About to create Appwrite account with:', {
        email: emailValidation.sanitized,
        name: name
      });

      // Check if email already exists by trying to create account
      let appwriteUser;
      try {
        appwriteUser = await account.create(
          ID.unique(),
          emailValidation.sanitized,
          password,
          name.trim()
        );
      } catch (accountError: any) {
        console.error('❌ Account creation failed:', accountError);
        
        // Handle specific Appwrite errors
        if (accountError.type === 'user_already_exists') {
          return { success: false, message: 'An account with this email already exists. Please try logging in instead.' };
        }
        
        if (accountError.type === 'user_invalid_format') {
          return { success: false, message: 'Invalid email format' };
        }
        
        if (accountError.type === 'user_password_mismatch') {
          return { success: false, message: 'Password does not meet requirements' };
        }
        
        if (accountError.code === 429) {
          return { success: false, message: 'Too many requests. Please wait and try again.' };
        }
        
        // For generic bad request errors, it's often a duplicate email
        if (accountError.code === 400 && accountError.type === 'general_bad_request') {
          return { 
            success: false, 
            message: 'Registration failed. This email may already be in use. Please try logging in or use a different email address.'
          };
        }
        
        // Generic fallback
        return { 
          success: false, 
          message: 'Account creation failed: ' + (accountError.message || 'Unknown error')
        };
      }

      console.log('✅ Appwrite account created successfully:', {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name
      });

      console.log('📤 About to create database document with:', {
        userId: appwriteUser.$id,
        username: username.trim(),
        name: name.trim(),
        email: emailValidation.sanitized,
        type: 'user',
        arcadeCoins: 100,
        failedLoginAttempts: 0,
        linkedinProfile: linkedinProfile?.trim() || '',
        githubProfile: githubProfile?.trim() || '',
      });

      // Create user profile in database with minimal fields first
      console.log('🔍 Attempting minimal document creation...');
      
      let userProfile: any;
      
      try {
        // Try with just the essential fields
        const minimalProfile = await databases.createDocument(
          this.databaseId,
          this.userCollectionId,
          ID.unique(),
          {
            userId: appwriteUser.$id,
            username: username.trim(),
            name: name.trim(),
            email: emailValidation.sanitized,
            type: 'user'
          }
        );
        
        console.log('✅ Minimal document created successfully:', minimalProfile.$id);
        
        // Now try to update it with additional fields
        try {
          const updatedProfile = await databases.updateDocument(
            this.databaseId,
            this.userCollectionId,
            minimalProfile.$id,
            {
              arcadeCoins: 100,
              failedLoginAttempts: 0,
              linkedinProfile: linkedinProfile?.trim() || '',
              githubProfile: githubProfile?.trim() || '',
            }
          );
          
          console.log('✅ Document updated with additional fields');
          userProfile = updatedProfile;
        } catch (updateError) {
          console.log('⚠️ Could not update with additional fields, using minimal profile');
          userProfile = minimalProfile;
        }
        
      } catch (minimalError) {
        console.error('❌ Even minimal document creation failed:', minimalError);
        throw minimalError;
      }

      console.log('✅ Database document created successfully:', userProfile.$id);

      // Generate verification code and store in memory
      console.log('📧 Generating verification code...');
      const verificationCode = generateVerificationCode();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      
      // Store verification code in memory
      verificationCodes[emailValidation.sanitized] = {
        code: verificationCode,
        expiry,
        userName: userProfile.name
      };

      console.log('✅ Verification code stored in memory');

      const user: AuthUser = {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: userProfile.name,
        username: userProfile.username,
        type: userProfile.type,
        arcadeCoins: userProfile.arcadeCoins || 100,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        linkedinProfile: userProfile.linkedinProfile,
        githubProfile: userProfile.githubProfile,
        image: userProfile.image,
        isEmailVerified: appwriteUser.emailVerification,
        usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
      };

      return {
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        user,
        requiresVerification: true,
        verificationCode
      };

    } catch (error: unknown) {
      console.error('Registration error:', error);
      console.error('Registration error details:', JSON.stringify(error, null, 2));
      
      // If user was created but profile creation failed, clean up
      try {
        await account.deleteSession('current');
      } catch (cleanupError) {
        // Don't log this as an error if it's just "no session to delete"
        if ((cleanupError as any)?.code !== 401) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      if ((error as { code?: number }).code === 409) {
        return { success: false, message: 'User with this email already exists' };
      }
      
      if ((error as any)?.code === 400) {
        console.error('Registration validation error. Full error:', error);
        const errorMessage = (error as any)?.message || 'Invalid data provided';
        return { success: false, message: `Registration failed: ${errorMessage}` };
      }
      
      if ((error as any)?.type === 'user_email_already_exists') {
        return { success: false, message: 'An account with this email already exists' };
      }
      
      if ((error as any)?.type === 'user_invalid_credentials') {
        return { success: false, message: 'Invalid email or password format' };
      }
      
      if ((error as any)?.type === 'general_bad_request') {
        return { success: false, message: 'Invalid data provided. Please check all fields are filled correctly.' };
      }
      
      return { 
        success: false, 
        message: (error as any)?.message || 'Failed to register user. Please try again.' 
      };
    }
  }

  // Verify email with 6-digit code
  async verifyEmailWithCode(email: string, code: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      console.log('🔍 Verifying email code for:', email);
      
      // Check verification code from memory store
      const storedCode = verificationCodes[email];
      if (!storedCode) {
        return { success: false, message: 'No verification code found. Please request a new one.' };
      }

      // Check if code matches and is not expired
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
      const updatedProfile = await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userProfile.$id,
        {
          emailVerified: true
        }
      );

      // Clear verification code from memory
      delete verificationCodes[email];

      console.log('✅ Email verified successfully');

      const user: AuthUser = {
        id: userProfile.userId,
        email: userProfile.email,
        name: updatedProfile.name,
        username: updatedProfile.username,
        type: updatedProfile.type,
        arcadeCoins: updatedProfile.arcadeCoins,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        linkedinProfile: updatedProfile.linkedinProfile,
        githubProfile: updatedProfile.githubProfile,
        image: updatedProfile.image,
        isEmailVerified: true,
        usernameLastUpdatedAt: updatedProfile.usernameLastUpdatedAt,
      };

      return {
        success: true,
        message: 'Email verified successfully! You can now access your dashboard.',
        user
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string; verificationCode?: string; userName?: string }> {
    try {
      console.log('🔍 Resending verification code for:', email);
      
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

      // Generate new verification code and store in memory
      const verificationCode = generateVerificationCode();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      
      verificationCodes[email] = {
        code: verificationCode,
        expiry,
        userName: userProfile.name || 'User'
      };

      console.log('✅ Verification code stored in memory');
      
      return { 
        success: true, 
        message: 'New verification code generated', 
        verificationCode,
        userName: userProfile.name || 'User'
      };

    } catch (error) {
      console.error('Resend verification code error:', error);
      return { success: false, message: 'Failed to resend verification code. Please try again.' };
    }
  }

  // Login user
  async login(data: LoginData): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const { email, password } = data;

      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      // Create session with Appwrite
      await account.createEmailPasswordSession(emailValidation.sanitized, password);
      
      // Get current user from Appwrite
      const appwriteUser = await account.get();
      
      // Check if email is verified
      if (!appwriteUser.emailVerification) {
        // Delete the session since email is not verified
        await account.deleteSession('current');
        return { 
          success: false, 
          message: 'Please verify your email before logging in. Check your inbox for the verification code.' 
        };
      }

      // Get user profile
      const userProfile = await this.getUserProfile(appwriteUser.$id);
      if (!userProfile) {
        // Clean up session if profile doesn't exist
        await account.deleteSession('current');
        return { success: false, message: 'User profile not found' };
      }

      // Check if account is locked
      if (userProfile.accountLockUntil && new Date(userProfile.accountLockUntil) > new Date()) {
        await account.deleteSession('current');
        return { success: false, message: 'Account is temporarily locked. Please try again later.' };
      }

      // Reset failed login attempts on successful login
      if (userProfile.failedLoginAttempts > 0) {
        await databases.updateDocument(
          this.databaseId,
          this.userCollectionId,
          userProfile.$id,
          {
            failedLoginAttempts: 0,
            accountLockUntil: null
          }
        );
      }

      const user: AuthUser = {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: userProfile.name,
        username: userProfile.username,
        type: userProfile.type,
        arcadeCoins: userProfile.arcadeCoins,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        linkedinProfile: userProfile.linkedinProfile,
        githubProfile: userProfile.githubProfile,
        image: userProfile.image,
        isEmailVerified: appwriteUser.emailVerification,
        usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
      };

      return {
        success: true,
        message: 'Login successful',
        user
      };

    } catch (error: unknown) {
      console.error('Login error:', error);

      // Handle failed login attempts
      if ((error as { code?: number }).code === 401) {
        // Note: We'll need to handle failed attempts differently since we can't identify user without successful login
        return { success: false, message: 'Invalid email or password' };
      }

      return { success: false, message: 'Login failed' };
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await account.deleteSession('current');
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const appwriteUser = await account.get();
      
      if (!appwriteUser.emailVerification) {
        console.log('User email not verified');
        return null;
      }
      
      const userProfile = await this.getUserProfile(appwriteUser.$id);

      if (!userProfile) {
        console.error('User profile not found for user:', appwriteUser.$id);
        return null;
      }

      return {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: userProfile.name,
        username: userProfile.username,
        type: userProfile.type,
        arcadeCoins: userProfile.arcadeCoins,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        linkedinProfile: userProfile.linkedinProfile,
        githubProfile: userProfile.githubProfile,
        image: userProfile.image,
        isEmailVerified: appwriteUser.emailVerification,
        usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
      };
    } catch (error) {
      // If it's a 401 error, it just means no user is logged in - this is normal
      if ((error as any)?.code === 401) {
        // Don't log this as an error since it's expected when no user is logged in
        return null;
      }
      
      // Log other errors as they might be actual issues
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<{ success: boolean; message: string }> {
    try {
      await account.createVerification(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email`);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Send verification error:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  }

  // Verify email
  async verifyEmail(userId: string, secret: string): Promise<{ success: boolean; message: string }> {
    try {
      await account.updateVerification(userId, secret);
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Invalid or expired verification code' };
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: true, message: 'If the account exists, a recovery email will be sent.' };
      }

      await account.createRecovery(
        emailValidation.sanitized,
        `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      );

      return { success: true, message: 'If the account exists, a recovery email will be sent.' };
    } catch (error) {
      console.error('Password recovery error:', error);
      // Always return success to prevent user enumeration
      return { success: true, message: 'If the account exists, a recovery email will be sent.' };
    }
  }

  // Reset password
  async resetPassword(userId: string, secret: string, newPassword: string): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          message: 'Weak password', 
          errors: passwordValidation.errors 
        };
      }

      await account.updateRecovery(userId, secret, newPassword);

      // Update password change timestamp in user profile
      try {
        const userProfile = await this.getUserProfile(userId);
        if (userProfile) {
          await databases.updateDocument(
            this.databaseId,
            this.userCollectionId,
            userProfile.$id,
            {
              passwordChangedAt: new Date().toISOString(),
              failedLoginAttempts: 0,
              accountLockUntil: null
            }
          );
        }
      } catch (profileError) {
        console.error('Could not update password change timestamp:', profileError);
        // Don't fail the password reset if profile update fails
      }

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Invalid or expired recovery code' };
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return { success: false, message: 'User profile not found' };
      }

      // If updating username, check availability
      if (updates.username && updates.username !== userProfile.username) {
        const usernameAvailable = await this.isUsernameAvailable(updates.username);
        if (!usernameAvailable) {
          return { success: false, message: 'Username is already taken' };
        }
        updates.usernameLastUpdatedAt = new Date().toISOString();
      }

      const updatedProfile = await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userProfile.$id,
        updates
      );

      const appwriteUser = await account.get();
      
      const user: AuthUser = {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: updatedProfile.name,
        username: updatedProfile.username,
        type: updatedProfile.type,
        arcadeCoins: updatedProfile.arcadeCoins,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        linkedinProfile: updatedProfile.linkedinProfile,
        githubProfile: updatedProfile.githubProfile,
        image: updatedProfile.image,
        isEmailVerified: appwriteUser.emailVerification,
        usernameLastUpdatedAt: updatedProfile.usernameLastUpdatedAt,
      };

      return {
        success: true,
        message: 'Profile updated successfully',
        user
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }
}

export const authService = new AuthService();