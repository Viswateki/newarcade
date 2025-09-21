// Blog Attributes Debug Helper - Updated for EXACT Appwrite schema

export const getRequiredBlogAttributes = () => {
  return [
    'title',        // required, size: 255
    'content',      // required, size: 10000
    'category',     // required, size: 100
    'featured',     // required, boolean
    'views',        // required, integer, min: 0, max: 9999999
    'slug',         // required, size: 255
    'author_name',  // required, size: 100
    'status',       // required, size: 20
    'user_id'       // required, size: 255
  ];
};

export const getOptionalBlogAttributes = () => {
  return [
    'subtitle',           // size: 500
    'excerpt',            // size: 1000
    'image',              // size: 500
    'featured_image',     // size: 500
    'seo_description',    // size: 160
    'tags',               // size: 500 (stored as string)
    'likes'               // integer, min: 0, max: 9999999
  ];
};

export const validateBlogData = (blogData: any) => {
  const required = getRequiredBlogAttributes();
  const missing: string[] = [];
  
  required.forEach(attr => {
    if (blogData[attr] === undefined || blogData[attr] === null) {
      missing.push(attr);
    }
  });
  
  if (missing.length > 0) {
    console.error('Missing required blog attributes:', missing);
    return false;
  }
  
  console.log('✅ All required blog attributes are present');
  return true;
};

// Default blog data template
export const getDefaultBlogData = (overrides: any = {}) => {
  return {
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    author_id: '',
    author_name: '',
    author_avatar: '',
    author_bio: '',
    featured_image: '',
    tags: [],
    category: '',
    status: 'draft',
    featured: false,
    readTime: 0,
    views: 0,
    likes: 0,
    comments_count: 0,
    bookmarks: 0,
    rating: 0,
    published_at: null,
    updated_at: new Date().toISOString(),
    date: new Date().toISOString(),
    seo_description: '',
    slug: '',
    url: '',
    meta_title: '',
    meta_description: '',
    language: 'en',
    publish_date: new Date().toISOString(),
    created_date: new Date().toISOString(),
    modified_date: new Date().toISOString(),
    thumbnail: '',
    banner: '',
    keywords: [],
    ...overrides
  };
};
