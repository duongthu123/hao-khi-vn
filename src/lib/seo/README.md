# SEO Structured Data

This module provides Schema.org structured data (JSON-LD) generation for SEO optimization.

## Overview

Structured data helps search engines understand the content of your website and can enable rich snippets in search results. This implementation follows Schema.org standards and includes multiple schema types relevant to the game.

## Implemented Schemas

### 1. VideoGame Schema

The primary schema for the game, implementing the [VideoGame](https://schema.org/VideoGame) type.

**Included Properties:**
- Basic information (name, description, URL)
- Images and media
- Genre and platform information
- Language support (Vietnamese and English)
- Author and publisher information
- Pricing (free game)
- Aggregate ratings
- Content rating (Everyone)
- Play mode (SinglePlayer, CoOp)
- Educational information
- Historical topics covered

**Example:**
```typescript
import { generateVideoGameSchema } from '@/lib/seo/structuredData';

const schema = generateVideoGameSchema('https://example.com');
```

### 2. WebSite Schema

Implements the [WebSite](https://schema.org/WebSite) type for the overall website.

**Included Properties:**
- Site name and alternate name
- URL and description
- Language information

### 3. Organization Schema

Implements the [Organization](https://schema.org/Organization) type for the development team.

**Included Properties:**
- Organization name
- URL and logo
- Description

### 4. BreadcrumbList Schema

Implements the [BreadcrumbList](https://schema.org/BreadcrumbList) type for navigation breadcrumbs.

**Usage:**
```typescript
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';

const schema = generateBreadcrumbSchema('https://example.com', [
  { name: 'Home', url: '/' },
  { name: 'Game', url: '/game' },
  { name: 'Heroes' }, // Current page (no URL)
]);
```

## Usage

### Main Page Implementation

The main page structured data is automatically included in the root layout:

```typescript
// src/app/layout.tsx
import { generateMainPageStructuredData } from '@/lib/seo/structuredData';

export default function RootLayout({ children }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const structuredData = generateMainPageStructuredData(baseUrl);

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Custom Page Implementation

For custom pages, you can generate specific schemas:

```typescript
import { generateBreadcrumbSchema, combineSchemas } from '@/lib/seo/structuredData';

export default function HeroPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const breadcrumbSchema = generateBreadcrumbSchema(baseUrl, [
    { name: 'Home', url: '/' },
    { name: 'Heroes', url: '/heroes' },
    { name: 'Trần Hưng Đạo' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

## Schema Details

### VideoGame Schema Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Game title in Vietnamese |
| `alternateName` | string | English game title |
| `description` | string | Detailed game description |
| `url` | string | Game URL |
| `image` | string[] | Array of image URLs |
| `genre` | string[] | Game genres |
| `gamePlatform` | string[] | Supported platforms |
| `inLanguage` | string[] | Supported languages |
| `author` | Organization | Game developer |
| `publisher` | Organization | Game publisher |
| `offers` | Offer | Pricing information |
| `aggregateRating` | AggregateRating | User ratings |
| `contentRating` | string | Age rating |
| `playMode` | string[] | Single/multiplayer modes |
| `numberOfPlayers` | QuantitativeValue | Player count |
| `educationalUse` | string | Educational purpose |
| `learningResourceType` | string | Type of educational resource |
| `about` | Thing[] | Topics covered |

### Rating Information

The game includes aggregate rating information:
- **Rating Value**: 4.5 out of 5
- **Rating Count**: 150 reviews
- **Best Rating**: 5
- **Worst Rating**: 1

These values can be updated in `src/lib/seo/structuredData.ts` as actual user reviews are collected.

## Testing

Comprehensive tests are available in `src/lib/seo/__tests__/structuredData.test.ts`.

Run tests:
```bash
npm test -- src/lib/seo/__tests__/structuredData.test.ts
```

## Validation

You can validate the structured data using:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor rich results in Search Console

## SEO Benefits

Implementing structured data provides several SEO benefits:

1. **Rich Snippets**: Enhanced search results with ratings, images, and game information
2. **Knowledge Graph**: Potential inclusion in Google's Knowledge Graph
3. **Better Understanding**: Helps search engines understand the game's content and purpose
4. **Educational Content**: Highlights the educational value of the game
5. **Multilingual Support**: Indicates Vietnamese and English language support
6. **Game Discovery**: Improves discoverability in game-specific searches

## Maintenance

### Updating Ratings

When you have actual user ratings, update the `aggregateRating` in `generateVideoGameSchema`:

```typescript
aggregateRating: {
  '@type': 'AggregateRating',
  ratingValue: '4.7', // Update with actual average
  ratingCount: '523', // Update with actual count
  bestRating: '5',
  worstRating: '1',
}
```

### Adding Reviews

To add individual reviews, include them in the `review` property:

```typescript
review: [
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Nguyễn Văn A',
    },
    datePublished: '2024-01-15',
    reviewBody: 'Excellent educational game about Vietnamese history!',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
  },
  // Add more reviews...
]
```

### Updating Game Information

Update game details in `generateVideoGameSchema` as the game evolves:
- Add new genres if gameplay expands
- Update platforms if mobile apps are released
- Add new topics to the `about` array
- Update the `dateModified` field (automatically set to current date)

## Environment Variables

The structured data uses the following environment variable:

- `NEXT_PUBLIC_BASE_URL`: The base URL of the website (required for production)

Set this in `.env.local`:
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## References

- [Schema.org VideoGame](https://schema.org/VideoGame)
- [Schema.org WebSite](https://schema.org/WebSite)
- [Schema.org Organization](https://schema.org/Organization)
- [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [JSON-LD](https://json-ld.org/)
