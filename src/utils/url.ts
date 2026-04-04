import { MEDIA_BASE_URL } from '../api/client';

/**
 * Resolves a product image path into a full URI.
 * If the path is relative, it appends the MEDIA_BASE_URL.
 */
export const getImageUri = (path: string | null): string | null => {
  if (!path) return null;
  
  // If it's already a full URL or a local file URI, return it as is
  if (path.startsWith('http') || path.startsWith('file://') || path.startsWith('data:')) {
    return path;
  }
  
  // If it's a relative path, ensure it doesn't have a leading slash if MEDIA_BASE_URL ends with one
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${MEDIA_BASE_URL}${cleanPath}`;
};
