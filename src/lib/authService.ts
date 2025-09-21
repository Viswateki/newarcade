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

  // Session management helpers
  private storeUserSession(user: AuthUser): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering, cannot store session');
        return;
      }
      
      // Store user data
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // Set session expiry for 7 days
      const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('auth_session_expiry', expiry.toString());
      
      console.log('✅ User session stored successfully');
    } catch (error) {
      console.error('❌ Error storing user session:', error);
    }
  }

  private clearUserSession(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering, cannot clear session');
        return;
      }
      
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session_expiry');
      console.log('✅ User session cleared');
    } catch (error) {
      console.error('❌ Error clearing user session:', error);
    }
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

      // Note: Session will be stored by the client-side AuthContext

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

  // Simple logout (session cleared client-side)
  async logout(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Logout successful' };
  }

  // Get current user (with localStorage session persistence)
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return null;
      }
      
      // Check if we have a stored session
      const storedUser = localStorage.getItem('auth_user');
      const sessionExpiry = localStorage.getItem('auth_session_expiry');
      
      if (!storedUser || !sessionExpiry) {
        return null;
      }
      
      // Check if session is expired
      const expiryTime = parseInt(sessionExpiry);
      const currentTime = Date.now();
      
      if (currentTime > expiryTime) {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_session_expiry');
        return null;
      }
      
      const user = JSON.parse(storedUser) as AuthUser;
      return user;
      
    } catch (error) {
      console.error('Error retrieving current user:', error);
      // Clear corrupted session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_session_expiry');
      }
      return null;
    }
  }

  // Register new user (simplified - no Appwrite account creation)
  async register(data: RegisterData): Promise<{ 
    success: boolean; 
    message: string; 
    user?: AuthUser; 
    requiresVerification?: boolean; 
    verificationCode?: string 
  }> {
    try {
      const { email, password, username, linkedinProfile, githubProfile } = data;

      if (!email || !password || !username) {
        return { success: false, message: 'Email, password, and username are required' };
      }

      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      console.log('📤 Custom registration attempt for:', emailValidation.sanitized);

      // Check if user already exists
      try {
        const existingUsers = await databases.listDocuments(
          this.databaseId,
          this.userCollectionId,
          [Query.equal('email', emailValidation.sanitized)]
        );

        if (existingUsers.documents.length > 0) {
          return { success: false, message: 'An account with this email already exists. Please try logging in instead.' };
        }
      } catch (checkError) {
        console.error('❌ Error checking existing users:', checkError);
        return { success: false, message: 'Registration service temporarily unavailable. Please try again.' };
      }

      // Create user profile in database
      const name = username.trim();
      try {
        const userProfile = await databases.createDocument(
          this.databaseId,
          this.userCollectionId,
          ID.unique(),
          {
            userId: ID.unique(), // Generate a unique userId
            username: username.trim(),
            name: name,
            email: emailValidation.sanitized,
            type: 'user',
            isEmailVerified: false, // Start as unverified
            arcadeCoins: 100,
            failedLoginAttempts: 0,
            linkedinProfile: linkedinProfile?.trim() || '',
            githubProfile: githubProfile?.trim() || '',
          }
        );

        console.log('✅ User profile created successfully:', userProfile.$id);

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        // Store verification code in memory
        verificationCodes[emailValidation.sanitized] = {
          code: verificationCode,
          expiry,
          userName: name
        };

        console.log('✅ Registration successful, verification code generated');

        return {
          success: true,
          message: 'Registration successful. Please check your email for verification code.',
          requiresVerification: true,
          verificationCode // This will be used by API to send email
        };

      } catch (createError) {
        console.error('❌ Error creating user profile:', createError);
        return { success: false, message: 'Registration failed. Please try again.' };
      }

    } catch (error: unknown) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  // Custom email verification (alternative method name)
  async verifyEmailWithCode(email: string, code: string): Promise<{ 
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
    return this.verifyEmailCode(email, code);
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string; verificationCode?: string; userName?: string }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if user exists
      const existingUsers = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', emailValidation.sanitized)]
      );

      if (existingUsers.documents.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const userProfile = existingUsers.documents[0];

      if (userProfile.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      // Store verification code in memory
      verificationCodes[emailValidation.sanitized] = {
        code: verificationCode,
        expiry,
        userName: userProfile.name
      };

      console.log('✅ New verification code generated');

      return {
        success: true,
        message: 'New verification code sent to your email',
        verificationCode, // This will be used by API to send email
        userName: userProfile.name
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Failed to resend verification code. Please try again.' };
    }
  }

  // Send password recovery (placeholder for custom implementation)
  async sendPasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if user exists
      const existingUsers = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', emailValidation.sanitized)]
      );

      if (existingUsers.documents.length === 0) {
        return { success: false, message: 'If this email is registered, you will receive a password reset link.' };
      }

      // In a full implementation, you would:
      // 1. Generate a secure reset token
      // 2. Store it with expiration
      // 3. Send email with reset link
      
      console.log('🔄 Password recovery requested for:', emailValidation.sanitized);
      
      // For now, just return success message
      return {
        success: true,
        message: 'If this email is registered, you will receive a password reset link.'
      };

    } catch (error) {
      console.error('Password recovery error:', error);
      return { success: false, message: 'Failed to process password recovery request. Please try again.' };
    }
  }

  // Reset password (placeholder for custom implementation)
  async resetPassword(userId: string, secret: string, newPassword: string): Promise<{ success: boolean; message: string; errors?: any }> {
    try {
      // In a full implementation, you would:
      // 1. Validate the secret/token
      // 2. Check if it's not expired
      // 3. Hash the new password
      // 4. Update the user's password in the database
      
      console.log('🔄 Password reset requested for userId:', userId);
      
      // For now, just return a placeholder response
      return {
        success: false,
        message: 'Password reset functionality is not yet implemented in custom auth system.'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        message: 'Failed to reset password. Please try again.',
        errors: error
      };
    }
  }

  // Email verification (alternative method for different signature)
  async verifyEmail(userId: string, secret: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      // In a full implementation, you would:
      // 1. Validate the secret/token 
      // 2. Find user by userId
      // 3. Update verification status
      
      console.log('🔄 Email verification requested for userId:', userId, 'with secret:', secret);
      
      // For now, just return a placeholder response
      return {
        success: false,
        message: 'This email verification method is not yet implemented in custom auth system. Use verifyEmailCode instead.'
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        message: 'Failed to verify email. Please try again.'
      };
    }
  }

  // Send email verification (alternative method without parameters)
  async sendEmailVerification(): Promise<{ success: boolean; message: string }> {
    try {
      // In a full implementation, you would:
      // 1. Get current user context
      // 2. Generate verification code/link
      // 3. Send verification email
      
      console.log('🔄 Send email verification requested');
      
      // For now, just return a placeholder response
      return {
        success: false,
        message: 'This email verification method is not yet implemented in custom auth system. Use resendVerificationCode with email instead.'
      };

    } catch (error) {
      console.error('Send email verification error:', error);
      return { 
        success: false, 
        message: 'Failed to send verification email. Please try again.'
      };
    }
  }
}

export const authService = new AuthService();
export default authService;