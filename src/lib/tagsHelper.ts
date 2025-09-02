// Helper functions for tags conversion
// Since Appwrite stores tags as string but UI expects array

export const tagsToArray = (tags: string | string[]): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  return [];
};

export const tagsToString = (tags: string | string[]): string => {
  if (Array.isArray(tags)) return tags.join(', ');
  return tags || '';
};

export const formatTags = (tags: string | string[]): string[] => {
  return tagsToArray(tags);
};
