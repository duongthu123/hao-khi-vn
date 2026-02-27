# Canonical URLs Implementation

This document describes the canonical URL implementation for the Vietnamese Historical Strategy Game.

## Overview

Canonical URLs help search engines understand the preferred version of each page and avoid duplicate content issues. This implementation ensures consistent URL structure across all pages.

**Validates Requirement 26.7**

## Implementation

### Utility Functions

The canonical URL utilities are located in `src/lib/seo/canonicalUrl.ts`:

- **`getBaseUrl()`**: Returns the base URL for the application
- **`getCanonicalUrl(path)`**: Generates a canonical URL for a given path
- **`getLanguageAlternates(path)`**: Generates language alternate URLs

### URL Structure Rules

1. **Root path** (`/`): Always includes trailing slash
   - Example: `https://example.com/`

2. **Non-root paths**: Never include trailing slash
   - Example: `https://example.com/about`
   - Example: `https://example.com/game/heroes`

3. **Normalization**: Paths are automatically normalized
   - `/about/` → `/about`
   - `about` → `/about`

### Usage in Pages

#### Root Layout (src/app/layout.tsx)

```typescript
import { getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/canonicalUrl';

export const metadata: Metadata = {
  // ... other metadata
  alternates: {
    canonical: getCanonicalUrl('/'),
    languages: getLanguageAlternates('/'),
  },
};
```

#### Page-Specific Metadata (src/app/[page]/page.tsx)

```typescript
import type { Metadata } from 'next';
import { getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/canonicalUrl';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  alternates: {
    canonical: getCanonicalUrl('/page-path'),
    languages: getLanguageAlternates('/page-path'),
  },
};
```

## Current Implementation

### Pages with Canonical URLs

1. **Root Page** (`/`)
   - Canonical: `https://example.com/`
   - Languages: vi-VN, en-US

2. **Responsive Test Page** (`/responsive-test`)
   - Canonical: `https://example.com/responsive-test`
   - Languages: vi-VN, en-US
   - Robots: noindex, nofollow (test page)

## Configuration

### Environment Variables

Set the base URL in your environment:

```bash
# Production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Development (default)
# Uses http://localhost:3000 automatically
```

### Next.js Metadata Base

The `metadataBase` is configured in the root layout:

```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
```

## Language Support

Currently, the game uses the same URL for both Vietnamese (vi-VN) and English (en-US) versions. The language alternates are configured to support future internationalization:

```typescript
{
  'vi-VN': 'https://example.com/path',
  'en-US': 'https://example.com/path'
}
```

### Future Enhancement

For language-specific paths, update `getLanguageAlternates()`:

```typescript
export function getLanguageAlternates(path: string): Record<string, string> {
  const baseUrl = getBaseUrl();
  
  return {
    'vi-VN': `${baseUrl}/vi${path}`,
    'en-US': `${baseUrl}/en${path}`,
  };
}
```

## Testing

### Unit Tests

Tests are located in `src/lib/seo/__tests__/canonicalUrl.test.ts`:

- Base URL generation
- Canonical URL generation
- Path normalization
- Language alternates
- URL consistency

Run tests:

```bash
npm test src/lib/seo/__tests__/canonicalUrl.test.ts
```

### Integration Tests

Metadata tests in `src/app/__tests__/metadata.test.tsx` verify:

- Canonical URL presence
- Language alternates configuration
- URL structure consistency

## SEO Benefits

1. **Prevents Duplicate Content**: Search engines know which URL is the preferred version
2. **Consolidates Link Equity**: All backlinks count toward the canonical URL
3. **Improves Crawl Efficiency**: Search engines don't waste time crawling duplicate pages
4. **Consistent URL Structure**: Users and search engines see consistent URLs

## Best Practices

1. **Always use the utility functions**: Don't hardcode URLs
2. **Set canonical on every page**: Even if there's only one version
3. **Use absolute URLs**: Include the full domain (handled by utilities)
4. **Be consistent**: Follow the URL structure rules
5. **Test in production**: Verify URLs resolve correctly

## Troubleshooting

### Canonical URL not appearing in HTML

Check that:
1. `NEXT_PUBLIC_BASE_URL` is set in production
2. The page has metadata exported
3. The utility functions are imported correctly

### Wrong base URL in development

The utilities automatically use `http://localhost:3000` in development. To override:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000 npm run dev
```

### Trailing slash issues

The utilities handle this automatically:
- Root path: Always has trailing slash
- Other paths: Never have trailing slash

## References

- [Google: Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- Requirement 26.7: Implement canonical URLs
