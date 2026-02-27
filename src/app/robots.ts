import { MetadataRoute } from 'next';

/**
 * Generates the robots.txt file for the Vietnamese Historical Strategy Game
 * 
 * This file tells search engine crawlers which pages they can access and
 * where to find the sitemap.
 * 
 * @returns {MetadataRoute.Robots} Robots configuration
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
