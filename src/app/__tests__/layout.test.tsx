import { describe, it, expect } from 'vitest';
import { metadata, viewport } from '../layout';

describe('Root Layout Metadata', () => {
  describe('metadata', () => {
    it('should have proper title configuration', () => {
      expect(metadata.title).toBeDefined();
      expect(typeof metadata.title).toBe('object');
      if (typeof metadata.title === 'object' && metadata.title !== null && 'default' in metadata.title) {
        expect(metadata.title.default).toContain('Đại Chiến Sử Việt');
        expect(metadata.title.default).toContain('Vietnamese Strategy Game');
        expect(metadata.title.template).toBe('%s | Đại Chiến Sử Việt');
      }
    });

    it('should have bilingual description (Vietnamese and English)', () => {
      expect(metadata.description).toBeDefined();
      expect(metadata.description).toContain('Trò chơi chiến lược');
      expect(metadata.description).toContain('Vietnamese Historical Strategy Game');
      expect(metadata.description).toContain('Bạch Đằng');
      expect(metadata.description).toContain('Bach Dang River');
    });

    it('should have comprehensive keywords in both languages', () => {
      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);
      
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('Vietnamese history');
      expect(keywords).toContain('lịch sử Việt Nam');
      expect(keywords).toContain('strategy game');
      expect(keywords).toContain('game chiến lược');
      expect(keywords).toContain('Bach Dang');
      expect(keywords).toContain('Bạch Đằng');
      expect(keywords).toContain('Tran Dynasty');
      expect(keywords).toContain('nhà Trần');
    });

    it('should have proper author and creator information', () => {
      expect(metadata.authors).toBeDefined();
      expect(Array.isArray(metadata.authors)).toBe(true);
      expect(metadata.creator).toBe('Vietnamese History Game Team');
      expect(metadata.publisher).toBe('Vietnamese History Game Team');
    });

    it('should have application metadata', () => {
      expect(metadata.applicationName).toBe('Đại Chiến Sử Việt');
      expect(metadata.category).toBe('game');
      expect(metadata.classification).toBe('Educational Strategy Game');
    });

    it('should have canonical URL configuration', () => {
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe('/');
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages?.['vi-VN']).toBe('/');
      expect(metadata.alternates?.languages?.['en-US']).toBe('/');
    });

    it('should have Open Graph tags for social sharing', () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toContain('Đại Chiến Sử Việt');
      expect(metadata.openGraph?.description).toBeDefined();
      if (metadata.openGraph && typeof metadata.openGraph === 'object' && 'type' in metadata.openGraph) {
        expect(metadata.openGraph.type).toBe('website');
      }
      if (metadata.openGraph && typeof metadata.openGraph === 'object' && 'locale' in metadata.openGraph) {
        expect(metadata.openGraph.locale).toBe('vi_VN');
      }
      if (metadata.openGraph && typeof metadata.openGraph === 'object' && 'alternateLocale' in metadata.openGraph) {
        expect(metadata.openGraph.alternateLocale).toContain('en_US');
      }
      expect(metadata.openGraph?.siteName).toBeDefined();
      expect(metadata.openGraph?.url).toBe('/');
    });

    it('should have Twitter card metadata', () => {
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.title).toContain('Đại Chiến Sử Việt');
      expect(metadata.twitter?.description).toBeDefined();
      if (metadata.twitter && typeof metadata.twitter === 'object' && 'card' in metadata.twitter) {
        expect(metadata.twitter.card).toBe('summary_large_image');
      }
      if (metadata.twitter && typeof metadata.twitter === 'object' && 'creator' in metadata.twitter) {
        expect(metadata.twitter.creator).toBe('@vietnamesehistorygame');
      }
    });

    it('should have proper robots configuration', () => {
      expect(metadata.robots).toBeDefined();
      if (metadata.robots && typeof metadata.robots === 'object' && 'index' in metadata.robots) {
        expect(metadata.robots.index).toBe(true);
        expect(metadata.robots.follow).toBe(true);
        expect(metadata.robots.googleBot).toBeDefined();
        if (metadata.robots.googleBot && typeof metadata.robots.googleBot === 'object') {
          expect(metadata.robots.googleBot.index).toBe(true);
          expect(metadata.robots.googleBot.follow).toBe(true);
        }
      }
    });

    it('should have format detection disabled', () => {
      expect(metadata.formatDetection).toBeDefined();
      expect(metadata.formatDetection?.email).toBe(false);
      expect(metadata.formatDetection?.address).toBe(false);
      expect(metadata.formatDetection?.telephone).toBe(false);
    });
  });

  describe('viewport', () => {
    it('should have proper viewport configuration', () => {
      expect(viewport.width).toBe('device-width');
      expect(viewport.initialScale).toBe(1);
      expect(viewport.maximumScale).toBe(5);
      expect(viewport.minimumScale).toBe(1);
      expect(viewport.userScalable).toBe(true);
    });

    it('should have theme color configuration', () => {
      expect(viewport.themeColor).toBeDefined();
      expect(Array.isArray(viewport.themeColor)).toBe(true);
      
      const themeColors = viewport.themeColor as Array<{ media: string; color: string }>;
      expect(themeColors).toHaveLength(2);
      
      const lightTheme = themeColors.find(t => t.media === '(prefers-color-scheme: light)');
      const darkTheme = themeColors.find(t => t.media === '(prefers-color-scheme: dark)');
      
      expect(lightTheme?.color).toBe('#ffffff');
      expect(darkTheme?.color).toBe('#1a1a1a');
    });

    it('should support both light and dark color schemes', () => {
      expect(viewport.colorScheme).toBe('light dark');
    });
  });

  describe('SEO Requirements Validation', () => {
    it('should meet Requirement 26.1: Implement Next.js metadata API', () => {
      // Validates that metadata is properly exported and structured
      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
    });

    it('should meet Requirement 26.2: Provide Vietnamese and English meta descriptions', () => {
      // Validates bilingual content in description
      const desc = metadata.description as string;
      expect(desc).toMatch(/Trò chơi.*Vietnamese/i);
      expect(desc).toContain('Việt Nam');
      expect(desc).toContain('Vietnamese');
    });

    it('should meet Requirement 26.6: Optimize page titles for search engines', () => {
      // Validates title structure with template for SEO
      if (typeof metadata.title === 'object' && metadata.title !== null && 'default' in metadata.title) {
        expect(metadata.title.default).toContain('|');
        expect(metadata.title.template).toContain('%s');
        expect(metadata.title.default?.length).toBeGreaterThan(30);
        expect(metadata.title.default?.length).toBeLessThan(70);
      }
    });
  });
});
