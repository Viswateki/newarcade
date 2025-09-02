# Blog Creation Troubleshooting Guide

## Common Appwrite Errors and Solutions

### 1. "Missing required attribute [attribute_name]"

**Solution:**
1. Check your Appwrite collection schema in the Appwrite Console
2. Ensure all required attributes are created with exact same names (case-sensitive)
3. Add the missing attribute to your Blog interface in `src/lib/appwrite.ts`
4. Add default values in `src/lib/blogService.ts` createBlog method

### 2. "Invalid document structure"

**Solution:**
- Verify attribute types match between your TypeScript interface and Appwrite collection
- String attributes need size limits set in Appwrite
- Array attributes must be created as "String Array" type in Appwrite

### 3. Quick Debug Steps

When you get a missing attribute error:

1. **Copy the attribute name exactly** from the error message
2. **Add it to the Blog interface:**
   ```typescript
   // In src/lib/appwrite.ts
   export interface Blog {
     // ... existing fields
     [missing_attribute]: string | number | boolean; // Choose appropriate type
   }
   ```

3. **Add default value in blogService:**
   ```typescript
   // In src/lib/blogService.ts createBlog method
   const cleanBlogData = {
     ...blogData,
     [missing_attribute]: 0, // or appropriate default value
     // ... other fields
   };
   ```

4. **Update create-blog page if needed:**
   ```typescript
   // In src/app/create-blog/page.tsx
   const blogData = {
     ...formData,
     [missing_attribute]: defaultValue,
     // ... other fields
   };
   ```

### 4. Validation Helper

Use the validation helper before creating blogs:

```typescript
import { validateBlogData } from '@/lib/blogValidation';

// Before calling blogService.createBlog()
if (!validateBlogData(blogData)) {
  console.error('Missing required attributes');
  return;
}
```

### 5. Current Complete Blog Attributes

See `APPWRITE_COLLECTION_SETUP.md` for the complete list of all 35 attributes your collection should have.

### 6. Emergency Fix

If you keep getting errors, you can temporarily make all attributes optional in your collection, then gradually make them required after ensuring your code provides all values.

## Testing

After making changes:
1. Clear browser cache
2. Restart your development server
3. Try creating a simple blog post
4. Check browser console for any remaining errors
