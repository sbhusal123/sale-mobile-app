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
  
  // Ensure a clean path without leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine ensuring exactly one slash if MEDIA_BASE_URL doesn't have one, or use it as is if it does
  const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`;
  return `${baseUrl}${cleanPath}`;
};
