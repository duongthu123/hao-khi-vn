# Canonical URLs Quick Reference

Quick reference for implementing canonical URLs in the Vietnamese Historical Strategy Game.

**Validates Requirement 26.7**

## What are Canonical URLs?

Canonical URLs tell search engines which version of a page is the "official" one, preventing duplicate content issues and consolidating SEO value.

## Implementation

### Import the Utilities

```typescript
import { getCanonicalUrl, getLanguageAlternates } from '@/lib/seo/canonicalUrl';
```

### Add to Page Metadata

```typescript
export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your page description',
  alternates: {
    canonical: getCanonicalUrl('/your-path'),
    languages: getLanguageAlternates('/your-path'),
  },
};
```

## URL Structure Rules

| Path Type | Example Input | Canonical Output |
|-----------|---------------|------------------|
| Root | `/` | `https://example.com/` |
| Simple | `/about` | `https://example.com/about` |
| With trailing slash | `/about/` | `https://example.com/about` |
| Without leading slash | `about` | `https://example.com/about` |
| Nested | `/game/heroes` | `https://example.com/game/heroes` |

**Key Rule**: Root path keeps trailing slash, all other paths remove it.

## Current Pages

| Page | Path | Canonical URL | Indexed |
|------|------|---------------|---------|
| Home | `/` | `https://example.com/` | ✅ Yes |
| Responsive Test | `/responsive-test` | `https://example.com/responsive-test` | ❌ No (test page) |

## Language Alternates

Both Vietnamese (vi-VN) and English (en-US) currently use the same URL:

```typescript
{
  'vi-VN': 'https://example.com/path',
  'en-US': 'https://example.com/path'
}
```

## Configuration

### Environment Variable

Set in `.env.local` or production environment:

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Development

Automatically uses `http://localhost:3000` when `NEXT_PUBLIC_BASE_URL` is not set.

## Testing

### Check Canonical URL in HTML

View page source and look for:

```html
<link rel="canonical" href="https://example.com/path" />
<link rel="alternate" hreflang="vi-VN" href="https://example.com/path" />
<link rel="alternate" hreflang="en-US" href="https://example.com/path" />
```

### Run Unit Tests

```bash
npm test src/lib/seo/__tests__/canonicalUrl.test.ts
```

### Verify in Production

1. Deploy to production
2. View page source
3. Confirm canonical URL uses production domain
4. Use Google Search Console to verify

## Common Issues

### Wrong Domain in Canonical URL

**Problem**: Canonical shows `localhost` in production

**Solution**: Set `NEXT_PUBLIC_BASE_URL` environment variable

### Trailing Slash Inconsistency

**Problem**: Some URLs have trailing slashes, others don't

**Solution**: Use `getCanonicalUrl()` utility - it handles normalization automatically

### Missing Canonical Tag

**Problem**: No canonical tag in HTML

**Solution**: Ensure page exports `metadata` with `alternates.canonical`

## SEO Benefits

✅ **Prevents Duplicate Content**: Search engines know which URL is preferred  
✅ **Consolidates Link Equity**: All backlinks count toward canonical URL  
✅ **Improves Crawl Efficiency**: Search engines don't waste time on duplicates  
✅ **Better Rankings**: Consolidated signals improve search rankings

## Best Practices

1. ✅ Always use utility functions (don't hardcode URLs)
2. ✅ Set canonical on every page
3. ✅ Use absolute URLs (handled automatically)
4. ✅ Be consistent with URL structure
5. ✅ Test in production environment

## Resources

- [Google: Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- Full documentation: `src/lib/seo/CANONICAL-URLS.md`
