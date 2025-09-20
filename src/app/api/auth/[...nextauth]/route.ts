import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/lib/authService';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          if (!credentials?.email || !credentials.password) {
            return null;
          }

          const result = await authService.login({
            email: credentials.email,
            password: credentials.password
          });

          if (!result.success || !result.user) {
            // If the error message is about email verification, throw it so it can be handled by the client
            if (result.message.includes('verify your email')) {
              throw new Error(result.message);
            }
            return null;
          }

          const user = result.user;

          return {
            id: user.id,
            $id: user.id, // Add $id for compatibility
            email: user.email,
            name: user.name,
            type: user.type,
            arcadeCoins: user.arcadeCoins,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            linkedinProfile: user.linkedinProfile || '',
            githubProfile: user.githubProfile || '',
            image: user.image || '',
            username: user.username,
            usernameLastUpdatedAt: user.usernameLastUpdatedAt || undefined,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          // Re-throw the error so it can be handled by the client
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.$id = user.id; // Add $id for compatibility
        token.type = user.type;
        token.arcadeCoins = user.arcadeCoins;
        // Add extended user fields to token
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.linkedinProfile = user.linkedinProfile;
        token.githubProfile = user.githubProfile;
        token.username = user.username;
        token.usernameLastUpdatedAt = user.usernameLastUpdatedAt;
        token.image = user.image;
        token.name = user.name;
      }
      
      // Handle session.update() calls to refresh token fields immediately
      if (trigger === 'update' && session) {
        const s = session as Record<string, unknown>;
        if (s.firstName !== undefined) token.firstName = s.firstName as string;
        if (s.lastName !== undefined) token.lastName = s.lastName as string;
        if (s.linkedinProfile !== undefined) token.linkedinProfile = s.linkedinProfile as string;
        if (s.githubProfile !== undefined) token.githubProfile = s.githubProfile as string;
        if (s.username !== undefined) token.username = s.username as string;
        if (s.usernameLastUpdatedAt !== undefined) token.usernameLastUpdatedAt = s.usernameLastUpdatedAt as Date;
        if (s.image !== undefined) token.image = s.image as string;
        if (s.name !== undefined) token.name = s.name as string;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        const user = session.user as Record<string, unknown>;
        user.id = token.id as string;
        user.$id = token.id as string; // Add $id for compatibility
        user.type = token.type as string;
        user.arcadeCoins = token.arcadeCoins as number;
        // Add extended user fields to session
        user.name = token.name as string;
        user.firstName = token.firstName as string;
        user.lastName = token.lastName as string;
        user.linkedinProfile = token.linkedinProfile as string;
        user.githubProfile = token.githubProfile as string;
        user.username = token.username as string;
        user.usernameLastUpdatedAt = token.usernameLastUpdatedAt as Date;
        user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };