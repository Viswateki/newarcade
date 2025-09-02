// Blog Attributes Debug Helper - Updated for EXACT Appwrite schema

export const getRequiredBlogAttributes = () => {
  return [
    'title',
    'content', 
    'author_id',
    'date',
    'category',
    'author_name',
    'status',
    'readTime', // Required in your schema
    'views',
    'rating',
    'featured'
  ];
};

export const getOptionalBlogAttributes = () => {
  return [
    'subtitle',
    'excerpt',
    'author_avatar',
    'author_bio', 
    'featured_image',
    'image',
    'seo_description',
    'updated_at',
    'likes',
    'comments_count',
    'bookmarks',
    'reading_time', // Optional in your schema
    'tags',
    'slug'
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
