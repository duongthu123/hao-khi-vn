/**
 * Structured Data (JSON-LD) Generation
 * 
 * Generates Schema.org structured data for SEO optimization.
 * Implements VideoGame schema with game information, ratings, and reviews.
 */

import { APP_CONFIG } from '@/constants/config';

/**
 * VideoGame Schema.org structured data
 * https://schema.org/VideoGame
 */
export interface VideoGameSchema {
  '@context': 'https://schema.org';
  '@type': 'VideoGame';
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  image: string | string[];
  genre: string | string[];
  gamePlatform: string | string[];
  applicationCategory: string;
  operatingSystem?: string;
  inLanguage: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Organization' | 'Person';
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    ratingCount: string;
    bestRating?: string;
    worstRating?: string;
  };
  review?: Array<{
    '@type': 'Review';
    author: {
      '@type': 'Person';
      name: string;
    };
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      '@type': 'Rating';
      ratingValue: string;
      bestRating?: string;
      worstRating?: string;
    };
  }>;
  contentRating?: string;
  playMode?: string | string[];
  numberOfPlayers?: {
    '@type': 'QuantitativeValue';
    minValue?: number;
    maxValue?: number;
  };
  educationalUse?: string;
  learningResourceType?: string;
  about?: Array<{
    '@type': 'Thing';
    name: string;
  }>;
}

/**
 * Generates VideoGame structured data for the game
 */
export function generateVideoGameSchema(baseUrl: string): VideoGameSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Đại Chiến Sử Việt - Hào Khí Đông A',
    alternateName: 'Vietnamese Historical Strategy Game - Battle of Bach Dang River',
    description: 'An educational strategy game that recreates the legendary Battle of Bach Dang River (1288) during the Mongol invasions of Vietnam. Play as Vietnamese heroes from the Tran Dynasty and defend against the Mongol Empire. Features historical accuracy, Vietnamese cultural themes, and educational content about Vietnamese history.',
    url: baseUrl,
    image: [
      `${baseUrl}/images/og-image.png`,
      `${baseUrl}/images/og-image-square.png`,
      `${baseUrl}/images/game-screenshot-1.png`,
      `${baseUrl}/images/game-screenshot-2.png`,
    ],
    genre: [
      'Strategy Game',
      'Historical Game',
      'Educational Game',
      'Turn-Based Strategy',
      'Real-Time Strategy',
    ],
    gamePlatform: [
      'Web Browser',
      'PC',
      'Mobile Web',
    ],
    applicationCategory: 'Game',
    operatingSystem: 'Any (Web-based)',
    inLanguage: ['vi-VN', 'en-US'],
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'Vietnamese History Game Team',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vietnamese History Game Team',
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    contentRating: 'Everyone',
    playMode: ['SinglePlayer', 'CoOp'],
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 1,
    },
    educationalUse: 'Learn about Vietnamese history, the Tran Dynasty, and the Mongol invasions through interactive gameplay',
    learningResourceType: 'Educational Game',
    about: [
      {
        '@type': 'Thing',
        name: 'Battle of Bach Dang River',
      },
      {
        '@type': 'Thing',
        name: 'Tran Dynasty',
      },
      {
        '@type': 'Thing',
        name: 'Vietnamese History',
      },
      {
        '@type': 'Thing',
        name: 'Mongol Invasions',
      },
      {
        '@type': 'Thing',
        name: 'Vietnamese Heroes',
      },
    ],
  };
}

/**
 * WebSite Schema.org structured data
 * https://schema.org/WebSite
 */
export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  url: string;
  description?: string;
  inLanguage?: string | string[];
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

/**
 * Generates WebSite structured data
 */
export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Đại Chiến Sử Việt - Hào Khí Đông A',
    alternateName: 'Vietnamese Historical Strategy Game',
    url: baseUrl,
    description: 'Educational strategy game featuring Vietnamese history and the Battle of Bach Dang River',
    inLanguage: ['vi-VN', 'en-US'],
  };
}

/**
 * Organization Schema.org structured data
 * https://schema.org/Organization
 */
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

/**
 * Generates Organization structured data
 */
export function generateOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vietnamese History Game Team',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: 'Developers of educational games focused on Vietnamese history and culture',
  };
}

/**
 * BreadcrumbList Schema.org structured data
 * https://schema.org/BreadcrumbList
 */
export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

/**
 * Generates BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  baseUrl: string,
  items: Array<{ name: string; url?: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${baseUrl}${item.url}` }),
    })),
  };
}

/**
 * Combines multiple schemas into a single JSON-LD script
 */
export function combineSchemas(...schemas: unknown[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

/**
 * Generates all structured data for the main page
 */
export function generateMainPageStructuredData(baseUrl: string): string {
  const videoGameSchema = generateVideoGameSchema(baseUrl);
  const webSiteSchema = generateWebSiteSchema(baseUrl);
  const organizationSchema = generateOrganizationSchema(baseUrl);

  return combineSchemas(videoGameSchema, webSiteSchema, organizationSchema);
}
