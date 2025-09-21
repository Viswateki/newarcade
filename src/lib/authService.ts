import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import { databases } from './appwrite';
import bcrypt from 'bcryptjs';

// In-memory storage for verification codes
const verificationCodes: { [email: string]: { code: string; expiry: number; userName: string } } = {};

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Password hashing utilities
const SALT_ROUNDS = 12; // Higher number = more secure but slower

async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
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
  social_links?: string;
  image?: string;
  isEmailVerified: boolean;
  avatar?: string;
  usernameLastUpdatedAt?: string;
  passwordHash?: string; // Stores the hashed password
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
  social_links?: string | object;
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

      // Verify password against stored hash
      if (!userProfile.passwordHash) {
        console.log('❌ No password hash found - user may need to reset password');
        return { success: false, message: 'Invalid email or password. If you registered before this update, please reset your password.' };
      }

      console.log('🔐 Verifying password...');
      const isPasswordValid = await verifyPassword(password, userProfile.passwordHash);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password provided');
        
        // Increment failed login attempts
        try {
          await databases.updateDocument(
            this.databaseId,
            this.userCollectionId,
            userProfile.$id,
            {
              failedLoginAttempts: userProfile.failedLoginAttempts + 1,
              // Lock account after 5 failed attempts for 15 minutes
              ...(userProfile.failedLoginAttempts + 1 >= 5 && {
                accountLockUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
              })
            }
          );
        } catch (updateError) {
          console.error('⚠️ Could not update failed login attempts:', updateError);
        }

        return { success: false, message: 'Invalid email or password' };
      }

      console.log('✅ Password verified successfully');

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

      // Parse social links from the user document
      let socialLinks: any = {};
      try {
        if (userProfile.social_links) {
          socialLinks = typeof userProfile.social_links === 'string' 
            ? JSON.parse(userProfile.social_links) 
            : userProfile.social_links;
        }
      } catch (e) {
        console.log('⚠️ Could not parse social links:', e);
        socialLinks = {};
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
        linkedinProfile: socialLinks.linkedin,
        githubProfile: socialLinks.github,
        social_links: userProfile.social_links,
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

      // Validate password strength
      if (password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }

      console.log('📤 Custom registration attempt for:', emailValidation.sanitized);

      // Hash password before storing
      console.log('🔐 Hashing password...');
      const passwordHash = await hashPassword(password);

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
      
      // Prepare social links as JSON string
      const socialLinks = {
        linkedin: linkedinProfile?.trim() || '',
        github: githubProfile?.trim() || ''
      };
      
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
            passwordHash: passwordHash, // Store the hashed password
            social_links: JSON.stringify(socialLinks), // Store as JSON string
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

  // Send password recovery
  async sendPasswordRecovery(email: string): Promise<{ 
    success: boolean; 
    message: string; 
    verificationCode?: string;
    userName?: string;
  }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      console.log('🔄 Password recovery requested for:', emailValidation.sanitized);

      // Check if user exists
      const existingUsers = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', emailValidation.sanitized)]
      );

      if (existingUsers.documents.length === 0) {
        // Don't reveal if email exists or not for security
        return { 
          success: true, 
          message: 'If this email is registered, you will receive a password reset code.' 
        };
      }

      const userProfile = existingUsers.documents[0];

      // Generate verification code for password reset
      const verificationCode = generateVerificationCode();
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes for password reset

      // Store verification code with 'password-reset' prefix to distinguish from other codes
      const resetKey = `password-reset:${emailValidation.sanitized}`;
      verificationCodes[resetKey] = {
        code: verificationCode,
        expiry,
        userName: userProfile.name || userProfile.username
      };

      console.log('✅ Password reset verification code generated');
      
      return {
        success: true,
        message: 'If this email is registered, you will receive a password reset code.',
        verificationCode, // This will be used by API to send email
        userName: userProfile.name || userProfile.username
      };

    } catch (error) {
      console.error('Password recovery error:', error);
      return { success: false, message: 'Failed to process password recovery request. Please try again.' };
    }
  }

  // Verify password reset code
  async verifyPasswordResetCode(email: string, code: string): Promise<{ 
    success: boolean; 
    message: string; 
    isValidCode?: boolean;
  }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      const resetKey = `password-reset:${emailValidation.sanitized}`;
      const storedCode = verificationCodes[resetKey];
      
      if (!storedCode) {
        return { 
          success: false, 
          message: 'No password reset code found. Please request a new one.' 
        };
      }

      if (Date.now() > storedCode.expiry) {
        delete verificationCodes[resetKey];
        return { 
          success: false, 
          message: 'Password reset code has expired. Please request a new one.' 
        };
      }

      if (storedCode.code !== code) {
        return { 
          success: false, 
          message: 'Invalid password reset code' 
        };
      }

      console.log('✅ Password reset code verified successfully');

      return { 
        success: true, 
        message: 'Code verified successfully',
        isValidCode: true
      };

    } catch (error) {
      console.error('Password reset code verification error:', error);
      return { 
        success: false, 
        message: 'Failed to verify code. Please try again.' 
      };
    }
  }

  // Reset password with verification code
  async resetPassword(email: string, verificationCode: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string; 
    errors?: any 
  }> {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: 'Invalid email format' };
      }

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        return { 
          success: false, 
          message: 'New password must be at least 8 characters long' 
        };
      }

      console.log('🔄 Password reset requested for:', emailValidation.sanitized);

      // Verify the reset code first
      const resetKey = `password-reset:${emailValidation.sanitized}`;
      const storedCode = verificationCodes[resetKey];
      
      if (!storedCode) {
        return { 
          success: false, 
          message: 'Invalid or expired reset code. Please request a new one.' 
        };
      }

      if (Date.now() > storedCode.expiry) {
        delete verificationCodes[resetKey];
        return { 
          success: false, 
          message: 'Reset code has expired. Please request a new one.' 
        };
      }

      if (storedCode.code !== verificationCode) {
        return { 
          success: false, 
          message: 'Invalid reset code' 
        };
      }

      // Find user by email
      const userResponse = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', emailValidation.sanitized)]
      );

      if (userResponse.documents.length === 0) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const userDoc = userResponse.documents[0] as unknown as UserProfile;

      // Hash the new password
      console.log('🔐 Hashing new password...');
      const newPasswordHash = await hashPassword(newPassword);

      // Update password hash and reset failed login attempts
      await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userDoc.$id,
        {
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date().toISOString(),
          failedLoginAttempts: 0, // Reset failed attempts
          accountLockUntil: null // Remove any account lock
        }
      );

      // Clear the verification code
      delete verificationCodes[resetKey];

      console.log('✅ Password reset successful');

      return {
        success: true,
        message: 'Password reset successful! You can now log in with your new password.'
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

  // Update user profile
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ 
    success: boolean; 
    message: string; 
    user?: UserProfile;
  }> {
    try {
      console.log('🔄 Updating user profile for:', userId);
      
      // Find the user document first to get the document ID
      const userResponse = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('userId', userId)]
      );

      if (userResponse.documents.length === 0) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const userDoc = userResponse.documents[0];
      
      // Prepare update data - only include non-null, defined values
      const updateData: any = {};
      
      if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
      if (profileData.username !== undefined) {
        // Check if username is already taken by another user
        const usernameCheck = await databases.listDocuments(
          this.databaseId,
          this.userCollectionId,
          [
            Query.equal('username', profileData.username),
            Query.notEqual('userId', userId)
          ]
        );
        
        if (usernameCheck.documents.length > 0) {
          return { 
            success: false, 
            message: 'Username is already taken' 
          };
        }
        
        updateData.username = profileData.username;
        updateData.usernameLastUpdatedAt = new Date().toISOString();
      }
      
      if (profileData.linkedinProfile !== undefined || profileData.githubProfile !== undefined) {
        // Handle social links - parse existing social_links or create new object
        let socialLinks: any = {};
        try {
          if (userDoc.social_links) {
            socialLinks = typeof userDoc.social_links === 'string' 
              ? JSON.parse(userDoc.social_links) 
              : userDoc.social_links;
          }
        } catch (e) {
          socialLinks = {};
        }
        
        if (profileData.linkedinProfile !== undefined) {
          socialLinks.linkedin = profileData.linkedinProfile;
        }
        if (profileData.githubProfile !== undefined) {
          socialLinks.github = profileData.githubProfile;
        }
        
        updateData.social_links = JSON.stringify(socialLinks);
      }

      // Update the document
      const updatedUser = await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userDoc.$id,
        updateData
      );

      console.log('✅ Profile updated successfully');

      // Update local session if this is the current user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        // Parse social links for session update
        let socialLinks: any = {};
        try {
          if (updateData.social_links) {
            socialLinks = typeof updateData.social_links === 'string' 
              ? JSON.parse(updateData.social_links) 
              : updateData.social_links;
          }
        } catch (e) {
          socialLinks = {};
        }

        const updatedSessionUser: AuthUser = {
          ...currentUser,
          username: updateData.username || currentUser.username,
          firstName: updateData.firstName ?? currentUser.firstName,
          lastName: updateData.lastName ?? currentUser.lastName,
          linkedinProfile: socialLinks.linkedin ?? currentUser.linkedinProfile,
          githubProfile: socialLinks.github ?? currentUser.githubProfile,
          social_links: updateData.social_links || currentUser.social_links,
        };
        this.storeUserSession(updatedSessionUser);
      }

      return { 
        success: true, 
        message: 'Profile updated successfully',
        user: updatedUser as unknown as UserProfile
      };

    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { 
        success: false, 
        message: 'Failed to update profile. Please try again.' 
      };
    }
  }

  // Change password - Database-only approach (no Appwrite account needed)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string; 
  }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { 
          success: false, 
          message: 'You must be logged in to change your password' 
        };
      }

      console.log('🔐 Attempting to change password for:', currentUser.email);

      // Validate current password
      if (!currentPassword) {
        return { 
          success: false, 
          message: 'Current password is required' 
        };
      }

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        return { 
          success: false, 
          message: 'New password must be at least 8 characters long' 
        };
      }

      // Get user from database to verify current password
      const userResponse = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', currentUser.email)]
      );

      if (userResponse.documents.length === 0) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const userDoc = userResponse.documents[0] as unknown as UserProfile;

      // Verify current password
      if (!userDoc.passwordHash) {
        return { 
          success: false, 
          message: 'Password not set. Please reset your password.' 
        };
      }

      console.log('🔐 Verifying current password...');
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userDoc.passwordHash);
      
      if (!isCurrentPasswordValid) {
        console.log('❌ Current password is incorrect');
        return { 
          success: false, 
          message: 'Current password is incorrect' 
        };
      }

      console.log('✅ Current password verified successfully');

      // Hash the new password
      console.log('🔐 Hashing new password...');
      const newPasswordHash = await hashPassword(newPassword);

      // Update password hash and passwordChangedAt in the database
      await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userDoc.$id,
        {
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date().toISOString(),
        }
      );

      console.log('✅ Password changed successfully');

      return { 
        success: true, 
        message: 'Password changed successfully' 
      };

    } catch (error) {
      console.error('❌ Error changing password:', error);
      return { 
        success: false, 
        message: 'Failed to change password. Please try again.' 
      };
    }
  }

  // Send verification code for email change
  async sendEmailChangeVerification(currentPassword: string, newEmail: string): Promise<{ 
    success: boolean; 
    message: string; 
    verificationCode?: string;
  }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { 
          success: false, 
          message: 'You must be logged in to change your email' 
        };
      }

      // Verify current password
      const loginResult = await this.login({
        email: currentUser.email,
        password: currentPassword
      });

      if (!loginResult.success) {
        return { 
          success: false, 
          message: 'Current password is incorrect' 
        };
      }

      // Validate new email
      const emailValidation = this.validateEmail(newEmail);
      if (!emailValidation.isValid) {
        return { 
          success: false, 
          message: 'Invalid email format' 
        };
      }

      // Check if email is already in use
      const existingUserResponse = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('email', emailValidation.sanitized)]
      );

      if (existingUserResponse.documents.length > 0) {
        return { 
          success: false, 
          message: 'Email address is already in use' 
        };
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store verification code
      verificationCodes[emailValidation.sanitized] = {
        code: verificationCode,
        expiry,
        userName: currentUser.username || currentUser.name || 'User'
      };

      // Send verification email
      try {
        const response = await fetch('/api/auth/send-email-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailValidation.sanitized,
            code: verificationCode,
            name: currentUser.username || currentUser.name || 'User',
            type: 'email-change'
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          console.error('❌ Failed to send verification email:', result.message);
          return { 
            success: false, 
            message: 'Failed to send verification email. Please try again.' 
          };
        }
        
        console.log('📧 Email change verification sent to:', emailValidation.sanitized);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        return { 
          success: false, 
          message: 'Failed to send verification email. Please check your connection.' 
        };
      }

      return { 
        success: true, 
        message: `Verification code sent to ${newEmail}. Please check your inbox.`,
      };

    } catch (error) {
      console.error('❌ Send email change verification error:', error);
      return { 
        success: false, 
        message: 'Failed to send verification code. Please try again.' 
      };
    }
  }

  // Change email with verification
  async changeEmail(newEmail: string, verificationCode: string): Promise<{ 
    success: boolean; 
    message: string; 
  }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { 
          success: false, 
          message: 'You must be logged in to change your email' 
        };
      }

      // Validate new email
      const emailValidation = this.validateEmail(newEmail);
      if (!emailValidation.isValid) {
        return { 
          success: false, 
          message: 'Invalid email format' 
        };
      }

      // Verify code
      const storedCode = verificationCodes[emailValidation.sanitized];
      if (!storedCode) {
        return { 
          success: false, 
          message: 'Verification code not found. Please request a new code.' 
        };
      }

      if (Date.now() > storedCode.expiry) {
        delete verificationCodes[emailValidation.sanitized];
        return { 
          success: false, 
          message: 'Verification code has expired. Please request a new code.' 
        };
      }

      if (storedCode.code !== verificationCode) {
        return { 
          success: false, 
          message: 'Invalid verification code' 
        };
      }

      // Find the user document
      const userResponse = await databases.listDocuments(
        this.databaseId,
        this.userCollectionId,
        [Query.equal('userId', currentUser.id)]
      );

      if (userResponse.documents.length === 0) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const userDoc = userResponse.documents[0];
      
      // Update the email
      await databases.updateDocument(
        this.databaseId,
        this.userCollectionId,
        userDoc.$id,
        { email: emailValidation.sanitized }
      );

      // Clean up verification code
      delete verificationCodes[emailValidation.sanitized];

      // Clear current session since email changed
      this.clearUserSession();

      console.log('✅ Email changed successfully');

      return { 
        success: true, 
        message: 'Email changed successfully! Please log in with your new email address.' 
      };

    } catch (error) {
      console.error('❌ Change email error:', error);
      return { 
        success: false, 
        message: 'Failed to change email. Please try again.' 
      };
    }
  }
}

export const authService = new AuthService();
export default authService;