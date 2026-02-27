/**
 * Canonical URL Utilities
 * 
 * Provides utilities for generating canonical URLs across the application.
 * Ensures consistent URL structure for SEO.
 * 
 * Validates Requirement 26.7
 */

/**
 * Get the base URL for the application
 * Uses environment variable or defaults to localhost in development
 */
export function getBaseUrl(): string {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Fallback
  return 'http://localhost:3000';
}

/**
 * Generate a canonical URL for a given path
 * Ensures consistent URL structure without trailing slashes (except root)
 * 
 * @param path - The path to generate a canonical URL for (e.g., '/about', '/game')
 * @returns The full canonical URL
 * 
 * @example
 * ```ts
 * getCanonicalUrl('/') // 'https://example.com/'
 * getCanonicalUrl('/about') // 'https://example.com/about'
 * getCanonicalUrl('/about/') // 'https://example.com/about' (trailing slash removed)
 * ```
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  
  // Normalize path: remove trailing slash unless it's the root path
  let normalizedPath = path;
  if (path !== '/' && path.endsWith('/')) {
    normalizedPath = path.slice(0, -1);
  }
  
  // Ensure path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate language alternate URLs for a given path
 * 
 * @param path - The path to generate alternates for
 * @returns Object with language codes as keys and URLs as values
 * 
 * @example
 * ```ts
 * getLanguageAlternates('/about')
 * // { 'vi-VN': 'https://example.com/about', 'en-US': 'https://example.com/about' }
 * ```
 */
export function getLanguageAlternates(path: string): Record<string, string> {
  const canonicalUrl = getCanonicalUrl(path);
  
  // Currently, the game uses the same URL for both languages
  // In the future, this could be extended to support language-specific paths
  return {
    'vi-VN': canonicalUrl,
    'en-US': canonicalUrl,
  };
}
