const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path from the database (e.g., "/uploads/menu-images/image.jpg")
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's a relative path from the server
  if (imagePath.startsWith('/')) {
    return `${SERVER_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend the server URL
  return `${SERVER_BASE_URL}/${imagePath}`;
};
