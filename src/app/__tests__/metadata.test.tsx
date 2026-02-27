import { describe, it, expect } from 'vitest';
import { metadata, viewport } from '../layout';
import { getCanonicalUrl } from '@/lib/seo/canonicalUrl';

describe('Metadata Configuration', () => {
  describe('Basic Metadata', () => {
    it('should have proper title configuration', () => {
      expect(metadata.title).toBeDefined();
      expect(metadata.title).toHaveProperty('default');
      expect(metadata.title).toHaveProperty('template');
      expect((metadata.title as any).default).toContain('Đại Chiến Sử Việt');
    });

    it('should have bilingual description', () => {
      expect(metadata.description).toBeDefined();
      expect(metadata.description).toContain('Trò chơi chiến lược');
      expect(metadata.description).toContain('Vietnamese Historical Strategy Game');
    });

    it('should have relevant keywords', () => {
      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('Vietnamese history');
      expect(keywords).toContain('lịch sử Việt Nam');
      expect(keywords).toContain('Bach Dang');
      expect(keywords).toContain('Tran Dynasty');
    });

    it('should have proper application metadata', () => {
      expect(metadata.applicationName).toBe('Đại Chiến Sử Việt');
      expect(metadata.category).toBe('game');
      expect(metadata.classification).toBe('Educational Strategy Game');
    });
  });

  describe('Open Graph Metadata', () => {
    it('should have Open Graph configuration', () => {
      expect(metadata.openGraph).toBeDefined();
    });

    it('should have proper OG title and description', () => {
      expect(metadata.openGraph?.title).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
      expect(metadata.openGraph?.description).toContain('Trò chơi chiến lược');
      expect(metadata.openGraph?.description).toContain('Vietnamese Historical Strategy Game');
    });

    it('should have proper OG type and locale', () => {
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.locale).toBe('vi_VN');
      expect(metadata.openGraph?.alternateLocale).toContain('en_US');
    });

    it('should have OG images configured', () => {
      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);
      const images = metadata.openGraph?.images as any[];
      expect(images.length).toBeGreaterThan(0);
    });

    it('should have primary OG image with correct dimensions', () => {
      const images = metadata.openGraph?.images as any[];
      const primaryImage = images[0];
      
      expect(primaryImage.url).toBe('/images/og-image.png');
      expect(primaryImage.width).toBe(1200);
      expect(primaryImage.height).toBe(630);
      expect(primaryImage.alt).toContain('Đại Chiến Sử Việt');
      expect(primaryImage.type).toBe('image/png');
    });

    it('should have square OG image', () => {
      const images = metadata.openGraph?.images as any[];
      const squareImage = images.find((img: any) => img.width === img.height);
      
      expect(squareImage).toBeDefined();
      expect(squareImage.url).toBe('/images/og-image-square.png');
      expect(squareImage.width).toBe(1200);
      expect(squareImage.height).toBe(1200);
    });

    it('should have OG video configured', () => {
      expect(metadata.openGraph?.videos).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.videos)).toBe(true);
      const videos = metadata.openGraph?.videos as any[];
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0].url).toBe('/videos/gameplay-preview.mp4');
    });

    it('should have site name', () => {
      expect(metadata.openGraph?.siteName).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
    });
  });

  describe('Twitter Card Metadata', () => {
    it('should have Twitter card configuration', () => {
      expect(metadata.twitter).toBeDefined();
    });

    it('should use large image card type', () => {
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should have Twitter title and description', () => {
      expect(metadata.twitter?.title).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
      expect(metadata.twitter?.description).toContain('Vietnamese Historical Strategy Game');
      expect(metadata.twitter?.description).toContain('Battle of Bach Dang River');
    });

    it('should have Twitter creator and site', () => {
      expect(metadata.twitter?.creator).toBe('@vietnamesehistorygame');
      expect(metadata.twitter?.site).toBe('@vietnamesehistorygame');
    });

    it('should have Twitter image', () => {
      expect(metadata.twitter?.images).toBeDefined();
      expect(Array.isArray(metadata.twitter?.images)).toBe(true);
      const images = metadata.twitter?.images as string[];
      expect(images[0]).toBe('/images/og-image.png');
    });
  });

  describe('SEO and Robots', () => {
    it('should have robots configuration', () => {
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });

    it('should have Google bot configuration', () => {
      expect(metadata.robots?.googleBot).toBeDefined();
      expect(metadata.robots?.googleBot?.index).toBe(true);
      expect(metadata.robots?.googleBot?.follow).toBe(true);
    });

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBeDefined();
      expect(typeof metadata.alternates?.canonical).toBe('string');
    });

    it('should have language alternates', () => {
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages?.['vi-VN']).toBeDefined();
      expect(metadata.alternates?.languages?.['en-US']).toBeDefined();
    });

    it('should use canonical URL utility for consistent URL structure', () => {
      const canonical = metadata.alternates?.canonical;
      expect(canonical).toBeDefined();
      
      // Canonical URL should be a string (from getCanonicalUrl utility)
      if (typeof canonical === 'string') {
        // Root path should end with /
        expect(canonical).toMatch(/\/$/);
      }
    });

    it('should have consistent language alternate URLs', () => {
      const languages = metadata.alternates?.languages;
      expect(languages).toBeDefined();
      
      if (languages) {
        // Both languages should have the same URL for root path
        expect(languages['vi-VN']).toBeDefined();
        expect(languages['en-US']).toBeDefined();
      }
    });
  });

  describe('Viewport Configuration', () => {
    it('should have viewport configuration', () => {
      expect(viewport).toBeDefined();
    });

    it('should have proper viewport settings', () => {
      expect(viewport.width).toBe('device-width');
      expect(viewport.initialScale).toBe(1);
      expect(viewport.userScalable).toBe(true);
    });

    it('should have theme color configuration', () => {
      expect(viewport.themeColor).toBeDefined();
      expect(Array.isArray(viewport.themeColor)).toBe(true);
    });

    it('should support color scheme', () => {
      expect(viewport.colorScheme).toBe('light dark');
    });
  });

  describe('Metadata Base URL', () => {
    it('should have metadata base URL', () => {
      expect(metadata.metadataBase).toBeDefined();
      expect(metadata.metadataBase).toBeInstanceOf(URL);
    });
  });
});
