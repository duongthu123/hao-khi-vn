/**
 * Tests for Structured Data Generation
 */

import { describe, it, expect } from 'vitest';
import {
  generateVideoGameSchema,
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  combineSchemas,
  generateMainPageStructuredData,
} from '../structuredData';

describe('Structured Data Generation', () => {
  const baseUrl = 'https://example.com';

  describe('generateVideoGameSchema', () => {
    it('should generate valid VideoGame schema', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('VideoGame');
      expect(schema.name).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
      expect(schema.url).toBe(baseUrl);
    });

    it('should include game description', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.description).toContain('Battle of Bach Dang River');
      expect(schema.description).toContain('Tran Dynasty');
      expect(schema.description).toContain('educational');
    });

    it('should include multiple images', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.image)).toBe(true);
      expect(schema.image.length).toBeGreaterThan(0);
      expect(schema.image[0]).toContain(baseUrl);
    });

    it('should include game genres', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.genre)).toBe(true);
      expect(schema.genre).toContain('Strategy Game');
      expect(schema.genre).toContain('Educational Game');
      expect(schema.genre).toContain('Historical Game');
    });

    it('should include game platforms', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.gamePlatform)).toBe(true);
      expect(schema.gamePlatform).toContain('Web Browser');
      expect(schema.gamePlatform).toContain('PC');
      expect(schema.gamePlatform).toContain('Mobile Web');
    });

    it('should include language information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.inLanguage)).toBe(true);
      expect(schema.inLanguage).toContain('vi-VN');
      expect(schema.inLanguage).toContain('en-US');
    });

    it('should include author information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.author).toBeDefined();
      expect(schema.author?.['@type']).toBe('Organization');
      expect(schema.author?.name).toBe('Vietnamese History Game Team');
    });

    it('should include publisher information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.publisher).toBeDefined();
      expect(schema.publisher?.['@type']).toBe('Organization');
      expect(schema.publisher?.name).toBe('Vietnamese History Game Team');
    });

    it('should include free offer information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.offers).toBeDefined();
      expect(schema.offers?.price).toBe('0');
      expect(schema.offers?.priceCurrency).toBe('USD');
      expect(schema.offers?.availability).toBe('https://schema.org/InStock');
    });

    it('should include aggregate rating', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating?.['@type']).toBe('AggregateRating');
      expect(parseFloat(schema.aggregateRating?.ratingValue || '0')).toBeGreaterThan(0);
      expect(parseInt(schema.aggregateRating?.ratingCount || '0')).toBeGreaterThan(0);
      expect(schema.aggregateRating?.bestRating).toBe('5');
      expect(schema.aggregateRating?.worstRating).toBe('1');
    });

    it('should include content rating', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.contentRating).toBe('Everyone');
    });

    it('should include play mode information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.playMode)).toBe(true);
      expect(schema.playMode).toContain('SinglePlayer');
    });

    it('should include number of players', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.numberOfPlayers).toBeDefined();
      expect(schema.numberOfPlayers?.['@type']).toBe('QuantitativeValue');
      expect(schema.numberOfPlayers?.minValue).toBe(1);
      expect(schema.numberOfPlayers?.maxValue).toBe(1);
    });

    it('should include educational information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.educationalUse).toBeDefined();
      expect(schema.educationalUse).toContain('Vietnamese history');
      expect(schema.learningResourceType).toBe('Educational Game');
    });

    it('should include about topics', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(Array.isArray(schema.about)).toBe(true);
      expect(schema.about?.length).toBeGreaterThan(0);
      
      const topics = schema.about?.map(item => item.name) || [];
      expect(topics).toContain('Battle of Bach Dang River');
      expect(topics).toContain('Tran Dynasty');
      expect(topics).toContain('Vietnamese History');
      expect(topics).toContain('Mongol Invasions');
    });

    it('should include date information', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.datePublished).toBeDefined();
      expect(schema.dateModified).toBeDefined();
      
      // Verify date format (YYYY-MM-DD)
      expect(schema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(schema.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate valid WebSite schema', () => {
      const schema = generateWebSiteSchema(baseUrl);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
      expect(schema.url).toBe(baseUrl);
    });

    it('should include alternate name', () => {
      const schema = generateWebSiteSchema(baseUrl);

      expect(schema.alternateName).toBe('Vietnamese Historical Strategy Game');
    });

    it('should include description', () => {
      const schema = generateWebSiteSchema(baseUrl);

      expect(schema.description).toBeDefined();
      expect(schema.description).toContain('Vietnamese history');
    });

    it('should include language information', () => {
      const schema = generateWebSiteSchema(baseUrl);

      expect(Array.isArray(schema.inLanguage)).toBe(true);
      expect(schema.inLanguage).toContain('vi-VN');
      expect(schema.inLanguage).toContain('en-US');
    });
  });

  describe('generateOrganizationSchema', () => {
    it('should generate valid Organization schema', () => {
      const schema = generateOrganizationSchema(baseUrl);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Vietnamese History Game Team');
      expect(schema.url).toBe(baseUrl);
    });

    it('should include logo', () => {
      const schema = generateOrganizationSchema(baseUrl);

      expect(schema.logo).toBeDefined();
      expect(schema.logo).toContain(baseUrl);
      expect(schema.logo).toContain('logo.png');
    });

    it('should include description', () => {
      const schema = generateOrganizationSchema(baseUrl);

      expect(schema.description).toBeDefined();
      expect(schema.description).toContain('educational games');
      expect(schema.description).toContain('Vietnamese history');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Game', url: '/game' },
        { name: 'Heroes' },
      ];
      const schema = generateBreadcrumbSchema(baseUrl, items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
    });

    it('should set correct positions', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Game', url: '/game' },
      ];
      const schema = generateBreadcrumbSchema(baseUrl, items);

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });

    it('should include item URLs when provided', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Game', url: '/game' },
      ];
      const schema = generateBreadcrumbSchema(baseUrl, items);

      expect(schema.itemListElement[0].item).toBe(`${baseUrl}/`);
      expect(schema.itemListElement[1].item).toBe(`${baseUrl}/game`);
    });

    it('should handle items without URLs', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Current Page' },
      ];
      const schema = generateBreadcrumbSchema(baseUrl, items);

      expect(schema.itemListElement[0].item).toBeDefined();
      expect(schema.itemListElement[1].item).toBeUndefined();
    });
  });

  describe('combineSchemas', () => {
    it('should return single schema as-is', () => {
      const schema = { '@type': 'VideoGame', name: 'Test' };
      const result = combineSchemas(schema);
      const parsed = JSON.parse(result);

      expect(parsed['@type']).toBe('VideoGame');
      expect(parsed.name).toBe('Test');
    });

    it('should combine multiple schemas into array', () => {
      const schema1 = { '@type': 'VideoGame', name: 'Test1' };
      const schema2 = { '@type': 'WebSite', name: 'Test2' };
      const result = combineSchemas(schema1, schema2);
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]['@type']).toBe('VideoGame');
      expect(parsed[1]['@type']).toBe('WebSite');
    });

    it('should produce valid JSON', () => {
      const schema1 = { '@type': 'VideoGame', name: 'Test1' };
      const schema2 = { '@type': 'WebSite', name: 'Test2' };
      const result = combineSchemas(schema1, schema2);

      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('generateMainPageStructuredData', () => {
    it('should generate combined structured data', () => {
      const result = generateMainPageStructuredData(baseUrl);
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThanOrEqual(3);
    });

    it('should include VideoGame schema', () => {
      const result = generateMainPageStructuredData(baseUrl);
      const parsed = JSON.parse(result);

      const videoGameSchema = parsed.find((s: any) => s['@type'] === 'VideoGame');
      expect(videoGameSchema).toBeDefined();
      expect(videoGameSchema.name).toBe('Đại Chiến Sử Việt - Hào Khí Đông A');
    });

    it('should include WebSite schema', () => {
      const result = generateMainPageStructuredData(baseUrl);
      const parsed = JSON.parse(result);

      const webSiteSchema = parsed.find((s: any) => s['@type'] === 'WebSite');
      expect(webSiteSchema).toBeDefined();
      expect(webSiteSchema.url).toBe(baseUrl);
    });

    it('should include Organization schema', () => {
      const result = generateMainPageStructuredData(baseUrl);
      const parsed = JSON.parse(result);

      const orgSchema = parsed.find((s: any) => s['@type'] === 'Organization');
      expect(orgSchema).toBeDefined();
      expect(orgSchema.name).toBe('Vietnamese History Game Team');
    });

    it('should produce valid JSON-LD', () => {
      const result = generateMainPageStructuredData(baseUrl);

      expect(() => JSON.parse(result)).not.toThrow();
      
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      
      parsed.forEach((schema: any) => {
        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@type']).toBeDefined();
      });
    });
  });

  describe('Schema Validation', () => {
    it('should include all required VideoGame properties', () => {
      const schema = generateVideoGameSchema(baseUrl);

      // Required properties according to Schema.org
      expect(schema['@context']).toBeDefined();
      expect(schema['@type']).toBeDefined();
      expect(schema.name).toBeDefined();
      expect(schema.description).toBeDefined();
    });

    it('should use valid Schema.org types', () => {
      const videoGame = generateVideoGameSchema(baseUrl);
      const webSite = generateWebSiteSchema(baseUrl);
      const organization = generateOrganizationSchema(baseUrl);

      expect(videoGame['@type']).toBe('VideoGame');
      expect(webSite['@type']).toBe('WebSite');
      expect(organization['@type']).toBe('Organization');
    });

    it('should use valid Schema.org context', () => {
      const videoGame = generateVideoGameSchema(baseUrl);
      const webSite = generateWebSiteSchema(baseUrl);
      const organization = generateOrganizationSchema(baseUrl);

      expect(videoGame['@context']).toBe('https://schema.org');
      expect(webSite['@context']).toBe('https://schema.org');
      expect(organization['@context']).toBe('https://schema.org');
    });
  });

  describe('Vietnamese Content', () => {
    it('should include Vietnamese game name', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.name).toContain('Đại Chiến Sử Việt');
      expect(schema.name).toContain('Hào Khí Đông A');
    });

    it('should include Vietnamese language code', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.inLanguage).toContain('vi-VN');
    });

    it('should include Vietnamese cultural content', () => {
      const schema = generateVideoGameSchema(baseUrl);

      expect(schema.description).toContain('Vietnamese');
      expect(schema.description).toContain('Tran Dynasty');
      
      const topics = schema.about?.map(item => item.name) || [];
      expect(topics.some(topic => topic.includes('Vietnamese'))).toBe(true);
    });
  });
});
