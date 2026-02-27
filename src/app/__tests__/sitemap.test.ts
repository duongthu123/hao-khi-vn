import { describe, it, expect, beforeEach, vi } from 'vitest';
import sitemap from '../sitemap';

describe('Sitemap Generation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should generate sitemap with all public pages', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    
    const result = sitemap();

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include homepage with highest priority', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    
    const result = sitemap();
    const homepage = result.find(entry => entry.url === 'https://example.com');

    expect(homepage).toBeDefined();
    expect(homepage?.priority).toBe(1.0);
    expect(homepage?.changeFrequency).toBe('weekly');
  });

  it('should include responsive-test page', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    
    const result = sitemap();
    const responsiveTest = result.find(entry => entry.url === 'https://example.com/responsive-test');

    expect(responsiveTest).toBeDefined();
    expect(responsiveTest?.priority).toBe(0.3);
    expect(responsiveTest?.changeFrequency).toBe('monthly');
  });

  it('should use localhost as default base URL', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    
    const result = sitemap();
    const homepage = result.find(entry => entry.url === 'http://localhost:3000');

    expect(homepage).toBeDefined();
  });

  it('should include lastModified date for all entries', () => {
    const result = sitemap();

    result.forEach(entry => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should have valid priority values between 0 and 1', () => {
    const result = sitemap();

    result.forEach(entry => {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it('should have valid changeFrequency values', () => {
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    const result = sitemap();

    result.forEach(entry => {
      expect(validFrequencies).toContain(entry.changeFrequency);
    });
  });

  it('should generate unique URLs', () => {
    const result = sitemap();
    const urls = result.map(entry => entry.url);
    const uniqueUrls = new Set(urls);

    expect(urls.length).toBe(uniqueUrls.size);
  });
});
