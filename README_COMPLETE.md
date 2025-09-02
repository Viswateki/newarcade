# Modern Next.js App with Authentication & Blog System

A fully-featured Next.js application with authentication, protected routes, blog management, and performance optimizations.

## 🚀 Features

### Authentication & Security
- ✅ **Complete Auth System** - Login, Signup, Password Reset
- ✅ **Route Protection** - Middleware-based route protection
- ✅ **Session Management** - Automatic session handling
- ✅ **OAuth Support** - Google & GitHub social login
- ✅ **Protected Dashboard** - User-specific dashboard access

### Blog Management
- ✅ **Create Blogs** - Rich blog creation (auth required)
- ✅ **Blog Listing** - Beautiful blog display with search/filter
- ✅ **Image Upload** - Integrated file storage
- ✅ **Categories** - Organized content categories
- ✅ **View Tracking** - Blog analytics

### Performance & UX
- ✅ **Performance Optimized** - Lazy loading, caching, debouncing
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark/Light Theme** - Theme persistence
- ✅ **Loading States** - Smooth user experience
- ✅ **Error Handling** - Comprehensive error management

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 (App Router)
- **Authentication**: Appwrite
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion, GSAP
- **Icons**: React Icons
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Appwrite Cloud account or self-hosted instance

## 🚀 Quick Start

### 1. Clone & Install

\`\`\`bash
git clone <your-repo>
cd app_new
pnpm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Appwrite credentials
\`\`\`

Required environment variables:
\`\`\`
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
\`\`\`

### 3. Appwrite Setup

#### Create Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create new project
3. Copy project ID to `.env.local`

#### Configure Authentication
1. **Auth Settings**:
   - Go to Auth → Settings
   - Enable Email/Password authentication
   - Set success/failure URLs:
     - Success: `http://localhost:3000/dashboard`
     - Failure: `http://localhost:3000/auth/login?error=oauth_failed`

2. **OAuth Providers** (Optional):
   - Enable Google OAuth
   - Enable GitHub OAuth
   - Configure redirect URLs

#### Create Database (For Blog Features)
1. **Create Database**:
   \`\`\`
   Database ID: main
   \`\`\`

2. **Create Blogs Collection**:
   \`\`\`
   Collection ID: blogs
   \`\`\`

3. **Add Attributes**:
   \`\`\`
   title: String (required, 255 chars)
   excerpt: String (required, 500 chars)
   content: String (required, 10000 chars)
   author: String (required, 100 chars)
   date: String (required, 50 chars)
   readTime: String (required, 50 chars)
   category: String (required, 100 chars)
   featured: Boolean (required, default: false)
   image: String (optional, 500 chars)
   views: Integer (required, default: 0)
   rating: Float (required, default: 5.0)
   \`\`\`

4. **Set Permissions**:
   \`\`\`
   Role: any
   Permissions: Create, Read, Update, Delete
   \`\`\`

#### Create Storage (For Blog Images)
1. **Create Bucket**:
   \`\`\`
   Bucket ID: blog-images
   \`\`\`

2. **Set Permissions**:
   \`\`\`
   Role: any
   Permissions: Create, Read, Update, Delete
   \`\`\`

### 4. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit `http://localhost:3000`

## 📱 App Structure

### Route Protection

\`\`\`
/                    # Public - Landing page
/auth/login         # Public - Login page  
/auth/signup        # Public - Signup page
/auth/reset-password # Public - Password reset
/blogs              # Public - Blog listing
/blogs/[id]         # Public - Individual blog
/blogs/create       # Protected - Create blog (auth required)
/dashboard          # Protected - User dashboard (auth required)
/tools              # Public - Tools page
/learn              # Public - Learning resources
\`\`\`

### Authentication Flow

1. **Login/Signup** → User authenticates via Appwrite
2. **Session Created** → Auth context updates
3. **Redirect** → User redirected to dashboard or intended page
4. **Protected Routes** → Middleware checks authentication
5. **Logout** → Session cleared, redirect to login

### Blog Management Flow

1. **View Blogs** → Anyone can view blogs
2. **Create Blog** → Requires authentication
3. **Upload Images** → Automatic storage handling
4. **Publish** → Blog saved to database
5. **Analytics** → View tracking enabled

## 🔧 Configuration

### Middleware Configuration
- Routes protection configured in `middleware.ts`
- Automatic redirects for auth/protected routes
- Session validation via cookies

### Theme System
- Dark/Light mode toggle
- Persistent theme preference
- System theme detection

### Performance Optimizations
- Lazy loading components
- Image optimization
- API response caching
- Debounced search
- Virtual scrolling for large lists

## 🚀 Production Deployment

### 1. Build Application
\`\`\`bash
pnpm build
\`\`\`

### 2. Deploy to Vercel
\`\`\`bash
npx vercel --prod
\`\`\`

### 3. Update Environment Variables
- Set production Appwrite endpoint
- Update OAuth redirect URLs
- Configure production domain

### 4. Update Appwrite Settings
- Add production domain to allowed origins
- Update OAuth success/failure URLs
- Set CORS policies

## 🐛 Troubleshooting

### Authentication Issues
- **Login fails**: Check Appwrite project ID and endpoint
- **OAuth redirect**: Verify OAuth settings in Appwrite console
- **Session not persisting**: Check domain settings and cookies

### Blog Features Not Working
- **Cannot create blogs**: Verify database and collection setup
- **Images not uploading**: Check storage bucket permissions
- **Blogs not loading**: Verify collection attributes and permissions

### Performance Issues
- **Slow loading**: Enable caching in `src/lib/performance.ts`
- **Large bundle**: Use dynamic imports for heavy components
- **Memory leaks**: Check component cleanup in useEffect hooks

## 📚 Key Files

### Authentication
- `src/lib/authService.ts` - Authentication service
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/ProtectedRoute.tsx` - Route protection
- `middleware.ts` - Route middleware

### Blog System
- `src/lib/blogServiceNew.ts` - Blog CRUD operations
- `src/app/blogs/create/page.tsx` - Blog creation
- `src/app/blogs/page.tsx` - Blog listing
- `src/components/BlogCreationForm.tsx` - Blog form

### Performance
- `src/lib/performance.ts` - Performance utilities
- `src/lib/appwrite.ts` - Appwrite configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issue for bugs
- **Appwrite Docs**: [https://appwrite.io/docs](https://appwrite.io/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
