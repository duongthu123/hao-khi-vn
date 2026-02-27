import { describe, it, expect, beforeEach, vi } from 'vitest';
import robots from '../robots';

describe('Robots.txt Generation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should generate robots.txt configuration', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    
    const result = robots();

    expect(result).toBeDefined();
    expect(result.rules).toBeInstanceOf(Array);
    expect(result.sitemap).toBeDefined();
  });

  it('should allow all user agents to access root', () => {
    const result = robots();
    const allAgentsRule = result.rules.find(rule => rule.userAgent === '*');

    expect(allAgentsRule).toBeDefined();
    expect(allAgentsRule?.allow).toBe('/');
  });

  it('should disallow access to API routes', () => {
    const result = robots();
    const allAgentsRule = result.rules.find(rule => rule.userAgent === '*');

    expect(allAgentsRule?.disallow).toContain('/api/');
  });

  it('should disallow access to Next.js internal routes', () => {
    const result = robots();
    const allAgentsRule = result.rules.find(rule => rule.userAgent === '*');

    expect(allAgentsRule?.disallow).toContain('/_next/');
  });

  it('should disallow access to static folder', () => {
    const result = robots();
    const allAgentsRule = result.rules.find(rule => rule.userAgent === '*');

    expect(allAgentsRule?.disallow).toContain('/static/');
  });

  it('should reference sitemap with correct URL', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    
    const result = robots();

    expect(result.sitemap).toBe('https://example.com/sitemap.xml');
  });

  it('should use localhost as default base URL for sitemap', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    
    const result = robots();

    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });

  it('should have at least one rule defined', () => {
    const result = robots();

    expect(result.rules.length).toBeGreaterThan(0);
  });
});
