import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getBaseUrl, getCanonicalUrl, getLanguageAlternates } from '../canonicalUrl';

describe('Canonical URL Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getBaseUrl', () => {
    it('should return NEXT_PUBLIC_BASE_URL when set', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
      expect(getBaseUrl()).toBe('https://example.com');
    });

    it('should return localhost in development when NEXT_PUBLIC_BASE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NODE_ENV = 'development';
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });

    it('should return localhost as fallback', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.NODE_ENV;
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getCanonicalUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    });

    it('should generate canonical URL for root path', () => {
      expect(getCanonicalUrl('/')).toBe('https://example.com/');
    });

    it('should generate canonical URL for simple path', () => {
      expect(getCanonicalUrl('/about')).toBe('https://example.com/about');
    });

    it('should remove trailing slash from non-root paths', () => {
      expect(getCanonicalUrl('/about/')).toBe('https://example.com/about');
      expect(getCanonicalUrl('/game/')).toBe('https://example.com/game');
    });

    it('should preserve trailing slash for root path', () => {
      expect(getCanonicalUrl('/')).toBe('https://example.com/');
    });

    it('should add leading slash if missing', () => {
      expect(getCanonicalUrl('about')).toBe('https://example.com/about');
      expect(getCanonicalUrl('game')).toBe('https://example.com/game');
    });

    it('should handle nested paths', () => {
      expect(getCanonicalUrl('/game/heroes')).toBe('https://example.com/game/heroes');
      expect(getCanonicalUrl('/game/heroes/')).toBe('https://example.com/game/heroes');
    });

    it('should handle paths with multiple segments', () => {
      expect(getCanonicalUrl('/game/heroes/tran-hung-dao')).toBe('https://example.com/game/heroes/tran-hung-dao');
    });

    it('should handle responsive-test path', () => {
      expect(getCanonicalUrl('/responsive-test')).toBe('https://example.com/responsive-test');
    });
  });

  describe('getLanguageAlternates', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    });

    it('should generate language alternates for root path', () => {
      const alternates = getLanguageAlternates('/');
      expect(alternates).toEqual({
        'vi-VN': 'https://example.com/',
        'en-US': 'https://example.com/',
      });
    });

    it('should generate language alternates for simple path', () => {
      const alternates = getLanguageAlternates('/about');
      expect(alternates).toEqual({
        'vi-VN': 'https://example.com/about',
        'en-US': 'https://example.com/about',
      });
    });

    it('should generate language alternates for nested path', () => {
      const alternates = getLanguageAlternates('/game/heroes');
      expect(alternates).toEqual({
        'vi-VN': 'https://example.com/game/heroes',
        'en-US': 'https://example.com/game/heroes',
      });
    });

    it('should normalize paths in language alternates', () => {
      const alternates = getLanguageAlternates('/about/');
      expect(alternates).toEqual({
        'vi-VN': 'https://example.com/about',
        'en-US': 'https://example.com/about',
      });
    });

    it('should have both vi-VN and en-US keys', () => {
      const alternates = getLanguageAlternates('/game');
      expect(Object.keys(alternates)).toContain('vi-VN');
      expect(Object.keys(alternates)).toContain('en-US');
    });
  });

  describe('URL Consistency', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    });

    it('should ensure consistent URL structure without trailing slashes', () => {
      const paths = ['/about', '/game', '/heroes', '/collection'];
      
      paths.forEach(path => {
        const url = getCanonicalUrl(path);
        expect(url).not.toMatch(/\/$/); // Should not end with /
        expect(url).toMatch(/^https:\/\//); // Should start with https://
      });
    });

    it('should ensure root path always has trailing slash', () => {
      expect(getCanonicalUrl('/')).toMatch(/\/$/);
    });

    it('should produce valid URLs', () => {
      const paths = ['/', '/about', '/game', '/responsive-test'];
      
      paths.forEach(path => {
        const url = getCanonicalUrl(path);
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should maintain consistency between canonical and language alternates', () => {
      const path = '/game';
      const canonical = getCanonicalUrl(path);
      const alternates = getLanguageAlternates(path);
      
      expect(alternates['vi-VN']).toBe(canonical);
      expect(alternates['en-US']).toBe(canonical);
    });
  });
});
