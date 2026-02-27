# Open Graph Quick Reference

Quick reference for Open Graph and Twitter Card metadata implementation.

## Current Implementation

### Location
`src/app/layout.tsx` - metadata export

### Open Graph Tags

| Property | Value | Purpose |
|----------|-------|---------|
| `og:title` | Đại Chiến Sử Việt - Hào Khí Đông A | Page title |
| `og:description` | Bilingual game description | Page description |
| `og:type` | website | Content type |
| `og:locale` | vi_VN | Primary language |
| `og:locale:alternate` | en_US | Alternate language |
| `og:site_name` | Đại Chiến Sử Việt - Hào Khí Đông A | Site name |
| `og:url` | / | Canonical URL |
| `og:image` | /images/og-image.png | Primary image (1200x630) |
| `og:image:width` | 1200 | Image width |
| `og:image:height` | 630 | Image height |
| `og:image:alt` | Descriptive alt text | Image description |
| `og:image:type` | image/png | Image MIME type |
| `og:image` (2) | /images/og-image-square.png | Square image (1200x1200) |
| `og:video` | /videos/gameplay-preview.mp4 | Video preview |

### Twitter Card Tags

| Property | Value | Purpose |
|----------|-------|---------|
| `twitter:card` | summary_large_image | Card type |
| `twitter:title` | Đại Chiến Sử Việt - Hào Khí Đông A | Card title |
| `twitter:description` | Game description | Card description |
| `twitter:creator` | @vietnamesehistorygame | Content creator |
| `twitter:site` | @vietnamesehistorygame | Site account |
| `twitter:image` | /images/og-image.png | Card image |

## Image Specifications

### Primary Image (og-image.png)
```
Dimensions: 1200 x 630 px
Aspect Ratio: 1.91:1
Format: PNG
Max Size: 300KB
Path: /public/images/og-image.png
```

### Square Image (og-image-square.png)
```
Dimensions: 1200 x 1200 px
Aspect Ratio: 1:1
Format: PNG
Max Size: 300KB
Path: /public/images/og-image-square.png
```

## Testing URLs

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/
- **General**: https://www.opengraph.xyz/

## Code Example

```typescript
export const metadata: Metadata = {
  openGraph: {
    title: 'Your Title',
    description: 'Your Description',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Alt text',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Title',
    description: 'Your Description',
    images: ['/images/og-image.png'],
  },
};
```

## Validation Checklist

- [ ] Images exist in `/public/images/`
- [ ] Image dimensions are correct
- [ ] Alt text is descriptive
- [ ] URLs are absolute (with metadataBase)
- [ ] Description is bilingual
- [ ] Locale is set correctly
- [ ] Tests pass: `npm test -- metadata.test.tsx`
- [ ] Preview looks good on Facebook
- [ ] Preview looks good on Twitter
- [ ] Preview looks good on LinkedIn

## Common Commands

```bash
# Run metadata tests
npm test -- src/app/__tests__/metadata.test.tsx

# Build and check output
npm run build

# Start dev server
npm run dev

# Check meta tags in browser
curl http://localhost:3000 | grep -E "og:|twitter:"
```

## Environment Variables

```env
# Required for absolute URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Optional for Google verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

## Platform-Specific Notes

### Facebook
- Caches aggressively (use debugger to refresh)
- Prefers 1200x630 images
- Supports video previews
- Requires absolute URLs

### Twitter/X
- Uses summary_large_image for large previews
- Falls back to summary if image fails
- Requires twitter:card tag
- Supports creator attribution

### LinkedIn
- Prefers 1200x627 images
- Caches for 7 days
- Requires og:title and og:description
- Supports og:image only

### WhatsApp
- Uses Open Graph tags
- Prefers square images
- Shows title and description
- Caches for 30 days

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Image not showing | Check file exists, use absolute URL |
| Old preview cached | Use platform debugger to refresh |
| Vietnamese text broken | Verify UTF-8 encoding |
| Description truncated | Keep under 200 characters |
| Wrong image size | Use 1200x630 for landscape |

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Testing Guide](./social-sharing-testing.md)
