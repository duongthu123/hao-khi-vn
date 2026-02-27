import { MetadataRoute } from 'next';

/**
 * Generates the sitemap for the Vietnamese Historical Strategy Game
 * 
 * This sitemap includes all public pages of the game application to help
 * search engines discover and index the content.
 * 
 * @returns {MetadataRoute.Sitemap} Array of sitemap entries
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/responsive-test`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
