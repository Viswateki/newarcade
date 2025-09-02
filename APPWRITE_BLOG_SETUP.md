# Medium-like Blog System - Appwrite Setup Guide

## 🚀 Overview
This guide will help you set up the Appwrite collections needed for a Medium-like blog system with all the features including likes, bookmarks, comments, and advanced blog management.

## 📋 Collections to Create

### 1. Collection: `blogs`
**Collection ID:** `blogs`

**Attributes:**
| Attribute | Type | Size | Required | Default | Index |
|-----------|------|------|----------|---------|-------|
| `title` | String | 255 | ✅ Yes | - | ✅ |
| `subtitle` | String | 500 | ❌ No | - | ❌ |
| `content` | String | 50000 | ✅ Yes | - | ❌ |
| `excerpt` | String | 500 | ✅ Yes | - | ❌ |
| `author_id` | String | 255 | ✅ Yes | - | ✅ |
| `author_name` | String | 255 | ✅ Yes | - | ✅ |
| `author_avatar` | String | 500 | ❌ No | - | ❌ |
| `author_bio` | String | 1000 | ❌ No | - | ❌ |
| `featured_image` | String | 500 | ❌ No | - | ❌ |
| `tags` | String Array | - | ✅ Yes | [] | ✅ |
| `category` | String | 100 | ✅ Yes | - | ✅ |
| `status` | String | 20 | ✅ Yes | "draft" | ✅ |
| `featured` | Boolean | - | ✅ Yes | false | ✅ |
| `reading_time` | Integer | - | ✅ Yes | 0 | ❌ |
| `views` | Integer | - | ✅ Yes | 0 | ✅ |
| `likes` | Integer | - | ✅ Yes | 0 | ✅ |
| `comments_count` | Integer | - | ✅ Yes | 0 | ❌ |
| `bookmarks` | Integer | - | ✅ Yes | 0 | ❌ |
| `published_at` | DateTime | - | ❌ No | - | ✅ |
| `updated_at` | DateTime | - | ✅ Yes | - | ✅ |
| `seo_description` | String | 160 | ❌ No | - | ❌ |
| `slug` | String | 255 | ✅ Yes | - | ✅ |

**Indexes to Create:**
- `title` (ASC) - for search
- `author_id` (ASC) - for author's blogs
- `category` (ASC) - for category filtering
- `status` (ASC) - for published/draft filtering
- `featured` (ASC) - for featured blogs
- `views` (DESC) - for trending sorting
- `likes` (DESC) - for popular sorting
- `published_at` (DESC) - for latest sorting
- `slug` (ASC) - for URL routing

**Permissions:**
- **Create:** Users (logged-in users can create)
- **Read:** Any (public can read published blogs)
- **Update:** Users (authors can update their own)
- **Delete:** Users (authors can delete their own)

---

### 2. Collection: `blog_likes`
**Collection ID:** `blog_likes`

**Attributes:**
| Attribute | Type | Size | Required | Default | Index |
|-----------|------|------|----------|---------|-------|
| `user_id` | String | 255 | ✅ Yes | - | ✅ |
| `blog_id` | String | 255 | ✅ Yes | - | ✅ |
| `created_at` | DateTime | - | ✅ Yes | - | ✅ |

**Indexes to Create:**
- `user_id` (ASC) - for user's likes
- `blog_id` (ASC) - for blog's likes
- Compound: `user_id` + `blog_id` (UNIQUE) - prevent duplicate likes

**Permissions:**
- **Create:** Users
- **Read:** Users
- **Update:** None
- **Delete:** Users (only their own likes)

---

### 3. Collection: `blog_bookmarks`
**Collection ID:** `blog_bookmarks`

**Attributes:**
| Attribute | Type | Size | Required | Default | Index |
|-----------|------|------|----------|---------|-------|
| `user_id` | String | 255 | ✅ Yes | - | ✅ |
| `blog_id` | String | 255 | ✅ Yes | - | ✅ |
| `created_at` | DateTime | - | ✅ Yes | - | ✅ |

**Indexes to Create:**
- `user_id` (ASC) - for user's bookmarks
- `blog_id` (ASC) - for blog's bookmarks
- Compound: `user_id` + `blog_id` (UNIQUE) - prevent duplicate bookmarks

**Permissions:**
- **Create:** Users
- **Read:** Users (only their own)
- **Update:** None
- **Delete:** Users (only their own)

---

### 4. Collection: `blog_comments`
**Collection ID:** `blog_comments`

**Attributes:**
| Attribute | Type | Size | Required | Default | Index |
|-----------|------|------|----------|---------|-------|
| `blog_id` | String | 255 | ✅ Yes | - | ✅ |
| `user_id` | String | 255 | ✅ Yes | - | ✅ |
| `user_name` | String | 255 | ✅ Yes | - | ❌ |
| `user_avatar` | String | 500 | ❌ No | - | ❌ |
| `content` | String | 2000 | ✅ Yes | - | ❌ |
| `parent_id` | String | 255 | ❌ No | - | ✅ |
| `likes` | Integer | - | ✅ Yes | 0 | ❌ |
| `created_at` | DateTime | - | ✅ Yes | - | ✅ |

**Indexes to Create:**
- `blog_id` (ASC) - for blog's comments
- `user_id` (ASC) - for user's comments
- `parent_id` (ASC) - for nested replies
- `created_at` (DESC) - for sorting comments

**Permissions:**
- **Create:** Users
- **Read:** Any (public can read comments)
- **Update:** Users (only their own)
- **Delete:** Users (only their own)

---

## 🗂️ Storage Bucket Setup

### Storage Bucket: `blog-images`
**Bucket ID:** `blog-images`

**Settings:**
- **File Size Limit:** 10MB
- **Allowed File Extensions:** jpg, jpeg, png, gif, webp
- **Antivirus:** Enabled
- **Encryption:** Enabled

**Permissions:**
- **Create:** Users (logged-in users can upload)
- **Read:** Any (public can view images)
- **Update:** Users (only file owner)
- **Delete:** Users (only file owner)

---

## 🔧 Step-by-Step Setup Instructions

### Step 1: Create Database
1. Go to your Appwrite Console
2. Navigate to **Databases**
3. Click **Create Database**
4. Name: `main` (or use your existing database)

### Step 2: Create Collections
For each collection above:

1. Click **Create Collection**
2. Set Collection ID and Name
3. Add all attributes as specified in the tables
4. Create the indexes as listed
5. Set permissions as specified

### Step 3: Create Storage Bucket
1. Navigate to **Storage**
2. Click **Create Bucket**
3. Set Bucket ID: `blog-images`
4. Configure settings as specified
5. Set permissions as specified

### Step 4: Environment Variables
Add these to your `.env.local` file:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_BLOGS_COLLECTION_ID=blogs
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=blog-images
```

### Step 5: Test the Setup
1. Try creating a blog post
2. Test liking and bookmarking
3. Try adding comments
4. Upload featured images

---

## 📝 Sample Data for Testing

Here's some sample data you can use to test your setup:

### Sample Blog Post
```json
{
  "title": "Getting Started with React and TypeScript",
  "subtitle": "A comprehensive guide for modern web development",
  "content": "React and TypeScript together create a powerful combination for building scalable web applications...",
  "excerpt": "Learn how to set up and use React with TypeScript for better development experience.",
  "author_id": "user123",
  "author_name": "John Doe",
  "category": "Programming",
  "tags": ["React", "TypeScript", "Web Development"],
  "status": "published",
  "featured": true
}
```

---

## ⚠️ Important Notes

1. **Permissions:** Make sure to set proper permissions for security
2. **Indexes:** Don't forget to create indexes for better performance
3. **File Size:** Adjust storage limits based on your needs
4. **Backup:** Regularly backup your database
5. **Rate Limiting:** Consider implementing rate limiting for API calls

---

## 🚀 Features Included

✅ **Blog Management**
- Create, edit, delete blogs
- Draft and publish system
- Featured blog posts
- Rich text content
- SEO-friendly slugs

✅ **User Interactions**
- Like/unlike blogs
- Bookmark/unbookmark blogs
- Comment system with replies
- Social sharing

✅ **Content Organization**
- Categories and tags
- Search functionality
- Filtering and sorting
- Reading time calculation

✅ **Media Management**
- Featured image uploads
- Image optimization
- Secure file storage

✅ **Performance**
- Proper indexing
- Pagination support
- Optimized queries

---

## 🎯 Next Steps

After setting up the collections:

1. Test all CRUD operations
2. Implement user authentication
3. Add content moderation
4. Set up email notifications
5. Implement analytics
6. Add SEO optimization
7. Set up CDN for images

---

## 🐛 Troubleshooting

**Common Issues:**

1. **Permission Errors:** Check collection permissions
2. **Attribute Errors:** Verify attribute types and sizes
3. **Index Errors:** Ensure indexes are created properly
4. **File Upload Issues:** Check storage bucket permissions

**Need Help?**
- Check Appwrite documentation
- Join Appwrite Discord community
- Review error logs in console

---

This setup provides a complete Medium-like blog system with all modern features! 🚀
