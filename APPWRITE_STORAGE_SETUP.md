# Appwrite Storage Setup for File Uploads

## Current Issue
If you're getting "File extension not allowed" error, it means your Appwrite storage bucket has restricted file extensions.

## Solution Steps

### 1. Check Your Storage Bucket Settings

1. Go to your Appwrite Console
2. Navigate to Storage
3. Click on your bucket (the one used for blog images)
4. Go to Settings

### 2. Update Allowed File Extensions

In the bucket settings, make sure these file extensions are allowed:
- `jpg`
- `jpeg` 
- `png`
- `webp`
- `gif`

### 3. Set Maximum File Size

Recommended maximum file size: `5MB` (5242880 bytes)

### 4. Update Bucket Permissions

Make sure your bucket has the proper permissions:
- **Create**: Users should be able to upload files
- **Read**: Users should be able to view files
- **Update**: (Optional) Users can update files
- **Delete**: (Optional) Users can delete files

### 5. Code Implementation

The upload function now includes client-side validation:

```typescript
// Validates file type before upload
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  alert('Please upload only image files (JPEG, PNG, WebP, GIF)');
  return;
}

// Validates file size (max 5MB)
if (file.size > 5 * 1024 * 1024) {
  alert('Please upload an image smaller than 5MB');
  return;
}
```

## Troubleshooting

### If you still get "File extension not allowed":

1. **Check bucket settings again** - Make sure the extensions are saved properly
2. **Try uploading a different file type** - Test with a simple .jpg file
3. **Check file naming** - Avoid special characters in file names
4. **Verify bucket ID** - Make sure you're using the correct bucket ID in your code

### Common Appwrite Storage Settings:

```javascript
// In your appwrite.ts configuration
export const BUCKET_ID = 'your-bucket-id'; // Make sure this matches your actual bucket ID
```

### File Upload Best Practices:

1. **Always validate on client-side first** (as we've implemented)
2. **Set reasonable file size limits** (5MB is good for blog images)
3. **Use web-optimized formats** (WebP is great for modern browsers)
4. **Consider image compression** before upload
5. **Handle errors gracefully** with user-friendly messages

## Next Steps

1. Update your Appwrite storage bucket settings as described above
2. Test the file upload with a simple JPEG image
3. If it works, your blog creation should now be fully functional!

## Final Note

After updating the storage settings, the blog creation form should work without any attribute or file upload errors. All the code has been updated to match your Appwrite schema exactly.
