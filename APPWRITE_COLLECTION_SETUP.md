# Appwrite Blog Collection - EXACT SCHEMA FROM YOUR DATABASE

Based on your Appwrite collection screenshots, here are the EXACT attributes you have:

## String Attributes:
1. `title` (required)
2. `content` (required) 
3. `author_id` (required)
4. `date` (required)
5. `category` (required)
6. `subtitle` (optional)
7. `excerpt` (optional)
8. `author_name` (required)
9. `author_avatar` (optional)
10. `author_bio` (optional)
11. `featured_image` (optional)
12. `status` (required)
13. `seo_description` (optional)
14. `updated_at` (optional)
15. `image` (optional)

## Integer Attributes:
16. `readTime` (required)
17. `views` (required)
18. `rating` (required)
19. `likes` (optional)
20. `comments_count` (optional)
21. `bookmarks` (optional)
22. `reading_time` (optional)

## Boolean Attributes:
23. `featured` (required)

## Array Attributes:
24. `tags` (optional)

## System Attributes (Auto-generated):
25. `$id`
26. `createdAt`
27. `updatedAt`

**IMPORTANT NOTES:**
- "blog" is the TABLE/COLLECTION NAME, NOT an attribute!
- You have BOTH `readTime` AND `reading_time` attributes
- There is NO `published_at` attribute
- There is NO `slug` attribute (making it optional in code)

## Steps to Create in Appwrite Console:

1. Go to your Appwrite Console
2. Navigate to Databases → Your Database → Collections → Blogs Collection
3. Click on "Attributes" tab
4. For each attribute above, click "Create Attribute" and:
   - Choose the correct type (String, Integer, Boolean, String Array)
   - Set the attribute key exactly as shown above
   - Mark as Required or Optional as indicated
   - Set appropriate size limits for strings (e.g., title: 255, content: 65535)

## Important Notes:
- Attribute names are case-sensitive and must match exactly
- Use `readTime` (camelCase) not `reading_time` (snake_case)
- Make sure all required attributes are created before testing
