# Sitemap Quick Reference Guide

## Overview
Quick reference for managing the sitemap.xml and robots.txt for the Vietnamese Historical Strategy Game.

## File Locations
- **Sitemap Generator**: `src/app/sitemap.ts`
- **Robots Generator**: `src/app/robots.ts`
- **Tests**: `src/app/__tests__/sitemap.test.ts` and `src/app/__tests__/robots.test.ts`

## Accessing Files

### Development
```bash
# View sitemap
curl http://localhost:3000/sitemap.xml

# View robots.txt
curl http://localhost:3000/robots.txt
```

### Production
```bash
# View sitemap
curl https://yourdomain.com/sitemap.xml

# View robots.txt
curl https://yourdomain.com/robots.txt
```

## Adding New Pages

### Step 1: Edit sitemap.ts
```typescript
// src/app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentDate = new Date();

  return [
    // Homepage
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Add your new page here
    {
      url: `${baseUrl}/your-new-page`,
      lastModified: currentDate,
      changeFrequency: 'weekly', // or 'daily', 'monthly', etc.
      priority: 0.8, // 0.0 to 1.0
    },
  ];
}
```

### Step 2: Test
```bash
npm test -- src/app/__tests__/sitemap.test.ts --run
```

### Step 3: Build and Verify
```bash
npm run build
npm start
curl http://localhost:3000/sitemap.xml
```

## Priority Guidelines

| Priority | Use Case | Examples |
|----------|----------|----------|
| 1.0 | Critical pages | Homepage, main game page |
| 0.8 | Important features | Hero selection, combat, map |
| 0.6 | Secondary features | Collection, profile, research |
| 0.4 | Tertiary features | Settings, help, about |
| 0.3 | Utility pages | Test pages, demos |

## Change Frequency Guidelines

| Frequency | Use Case | Examples |
|-----------|----------|----------|
| always | Real-time content | Live game state (rarely used) |
| hourly | Very frequent updates | News, live scores |
| daily | Daily updates | Game events, daily quests |
| weekly | Regular updates | Main game content, features |
| monthly | Occasional updates | Documentation, guides |
| yearly | Rare updates | Static pages, terms of service |
| never | Archived content | Old announcements |

## Robots.txt Configuration

### Current Rules
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /static/

Sitemap: http://localhost:3000/sitemap.xml
```

### Adding Custom Rules
Edit `src/app/robots.ts`:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/static/'],
      },
      // Add specific bot rules
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

## Environment Variables

### Required
```bash
# .env.local or .env.production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Default Behavior
If `NEXT_PUBLIC_BASE_URL` is not set:
- Development: Uses `http://localhost:3000`
- Production: Should be set to actual domain

## Testing

### Run All Sitemap Tests
```bash
npm test -- src/app/__tests__/sitemap.test.ts --run
```

### Run All Robots Tests
```bash
npm test -- src/app/__tests__/robots.test.ts --run
```

### Run Both
```bash
npm test -- src/app/__tests__/sitemap.test.ts src/app/__tests__/robots.test.ts --run
```

## Validation

### Validate Sitemap XML
```bash
# Using xmllint (if available)
curl http://localhost:3000/sitemap.xml | xmllint --format -

# Using online validator
# Visit: https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

### Google Search Console
1. Go to Google Search Console
2. Navigate to Sitemaps section
3. Submit: `https://yourdomain.com/sitemap.xml`
4. Monitor indexing status

## Common Issues

### Issue: Sitemap not updating
**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
```

### Issue: Wrong base URL in sitemap
**Solution**: Check environment variable
```bash
echo $NEXT_PUBLIC_BASE_URL
# Set it if missing
export NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Issue: 404 on sitemap.xml
**Solution**: Ensure sitemap.ts is in src/app directory
```bash
ls -la src/app/sitemap.ts
```

### Issue: Robots.txt not blocking paths
**Solution**: Verify disallow patterns in robots.ts
```typescript
disallow: ['/api/', '/_next/', '/static/']
```

## SEO Best Practices

1. **Keep URLs Clean**: Use descriptive, readable URLs
2. **Update Regularly**: Keep lastModified dates current
3. **Prioritize Correctly**: Use priority to guide crawlers
4. **Be Honest**: Set realistic change frequencies
5. **Test Thoroughly**: Validate XML and test all URLs
6. **Monitor**: Use Google Search Console to track indexing
7. **Submit**: Submit sitemap to major search engines

## Search Engine Submission

### Google
1. Google Search Console: https://search.google.com/search-console
2. Add property → Submit sitemap

### Bing
1. Bing Webmaster Tools: https://www.bing.com/webmasters
2. Add site → Submit sitemap

### Yandex (for Russian users)
1. Yandex Webmaster: https://webmaster.yandex.com
2. Add site → Submit sitemap

## Monitoring

### Check Indexing Status
```bash
# Google
site:yourdomain.com

# Check specific page
site:yourdomain.com/specific-page
```

### View Cached Version
```bash
# Google
cache:yourdomain.com
```

## Additional Resources

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
