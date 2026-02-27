# Social Sharing Testing Guide

This guide explains how to test and validate Open Graph and Twitter Card metadata for social media sharing.

## Overview

The game implements comprehensive Open Graph and Twitter Card metadata to ensure proper previews when shared on social media platforms. This includes:

- Open Graph tags for Facebook, LinkedIn, and other platforms
- Twitter Card metadata for Twitter/X
- Multiple image formats (landscape and square)
- Video preview support
- Bilingual content (Vietnamese and English)

## Metadata Configuration

### Open Graph Tags

Located in `src/app/layout.tsx`:

```typescript
openGraph: {
  title: 'Đại Chiến Sử Việt - Hào Khí Đông A',
  description: 'Vietnamese Historical Strategy Game...',
  type: 'website',
  locale: 'vi_VN',
  alternateLocale: ['en_US'],
  images: [
    {
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: '...',
    },
    {
      url: '/images/og-image-square.png',
      width: 1200,
      height: 1200,
      alt: '...',
    },
  ],
  videos: [...],
}
```

### Twitter Card Tags

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Đại Chiến Sử Việt - Hào Khí Đông A',
  description: '...',
  creator: '@vietnamesehistorygame',
  site: '@vietnamesehistorygame',
  images: ['/images/og-image.png'],
}
```

## Testing Tools

### 1. Facebook Sharing Debugger

**URL**: https://developers.facebook.com/tools/debug/

**Steps**:
1. Enter your game URL
2. Click "Debug"
3. Review the preview
4. Check for any warnings or errors
5. Click "Scrape Again" to refresh cache

**What to verify**:
- Title displays correctly in Vietnamese
- Description is complete and bilingual
- Image loads and displays properly (1200x630)
- No missing required properties

### 2. Twitter Card Validator

**URL**: https://cards-dev.twitter.com/validator

**Steps**:
1. Enter your game URL
2. Click "Preview card"
3. Review the card preview
4. Check both mobile and desktop views

**What to verify**:
- Card type is "summary_large_image"
- Title and description are correct
- Image displays properly
- Creator attribution shows

### 3. LinkedIn Post Inspector

**URL**: https://www.linkedin.com/post-inspector/

**Steps**:
1. Enter your game URL
2. Click "Inspect"
3. Review the preview
4. Check for any errors

**What to verify**:
- Title and description display correctly
- Image loads (LinkedIn prefers 1200x627)
- No errors in metadata

### 4. Open Graph Preview Tool

**URL**: https://www.opengraph.xyz/

**Steps**:
1. Enter your game URL
2. View the generated preview
3. Check multiple platform previews

**What to verify**:
- All Open Graph tags are detected
- Images load correctly
- Metadata is complete

### 5. Meta Tags Checker

**URL**: https://metatags.io/

**Steps**:
1. Enter your game URL
2. Review all detected meta tags
3. Check previews for multiple platforms

**What to verify**:
- All meta tags are present
- No duplicate tags
- Proper tag hierarchy

## Manual Testing

### Local Testing

Before deploying, test locally:

```bash
# Start development server
npm run dev

# View page source at http://localhost:3000
# Check for meta tags in <head>
```

**Verify in source**:
```html
<meta property="og:title" content="Đại Chiến Sử Việt - Hào Khí Đông A" />
<meta property="og:description" content="..." />
<meta property="og:image" content="http://localhost:3000/images/og-image.png" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="vi_VN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="..." />
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Elements/Inspector tab
3. Search for "og:" and "twitter:" in the HTML
4. Verify all tags are present

### Testing Checklist

- [ ] Open Graph title is correct
- [ ] Open Graph description is bilingual
- [ ] Open Graph image URL is absolute
- [ ] Open Graph image dimensions are correct (1200x630)
- [ ] Square image is available (1200x1200)
- [ ] Twitter card type is "summary_large_image"
- [ ] Twitter title and description are correct
- [ ] Twitter image is specified
- [ ] Locale is set to vi_VN
- [ ] Alternate locale en_US is specified
- [ ] Site name is included
- [ ] Video preview is configured (if available)

## Common Issues and Solutions

### Issue: Image not displaying

**Causes**:
- Image file doesn't exist
- Image URL is relative instead of absolute
- Image file size is too large (>5MB)
- Image dimensions are incorrect

**Solutions**:
- Ensure image exists at `/public/images/og-image.png`
- Use absolute URLs with `metadataBase`
- Compress images to <300KB
- Use correct dimensions (1200x630 for landscape)

### Issue: Cached old preview

**Causes**:
- Social platforms cache metadata
- Changes not reflected immediately

**Solutions**:
- Use Facebook Sharing Debugger to scrape again
- Wait 24-48 hours for cache to expire
- Add version query parameter to image URL

### Issue: Description truncated

**Causes**:
- Description too long
- Platform-specific limits

**Solutions**:
- Keep description under 200 characters
- Put most important info first
- Use concise, clear language

### Issue: Vietnamese characters not displaying

**Causes**:
- Character encoding issues
- Missing UTF-8 declaration

**Solutions**:
- Ensure `<meta charset="utf-8" />` is present
- Verify file is saved as UTF-8
- Test with Vietnamese text in description

## Image Requirements

### Primary OG Image (og-image.png)
- **Dimensions**: 1200 x 630 pixels
- **Aspect Ratio**: 1.91:1
- **Format**: PNG or JPG
- **File Size**: < 300KB
- **Content**: Game title, visual elements, bilingual text

### Square OG Image (og-image-square.png)
- **Dimensions**: 1200 x 1200 pixels
- **Aspect Ratio**: 1:1
- **Format**: PNG or JPG
- **File Size**: < 300KB
- **Content**: Similar to primary but square format

### Best Practices
- Use high-quality images
- Include game branding
- Ensure text is readable at small sizes
- Test on both light and dark backgrounds
- Avoid text-heavy images
- Use Vietnamese cultural elements

## Automated Testing

The project includes automated tests for metadata:

```bash
# Run metadata tests
npm test -- src/app/__tests__/metadata.test.tsx
```

**Tests verify**:
- All required metadata fields are present
- Open Graph configuration is correct
- Twitter Card configuration is correct
- Image dimensions are specified
- Locale settings are correct
- SEO tags are properly configured

## Production Deployment

Before deploying to production:

1. **Generate actual images**:
   - Create og-image.png (1200x630)
   - Create og-image-square.png (1200x1200)
   - Place in `/public/images/`

2. **Set environment variables**:
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
   ```

3. **Test with production URL**:
   - Use all testing tools listed above
   - Verify absolute URLs are correct
   - Check image loading

4. **Monitor social shares**:
   - Track how content appears when shared
   - Gather user feedback
   - Iterate on images and text

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
- [LinkedIn Post Inspector Guide](https://www.linkedin.com/help/linkedin/answer/a521928)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

## Maintenance

- Review metadata quarterly
- Update images for seasonal events
- Monitor social sharing analytics
- Test after major updates
- Keep descriptions current
- Update images if game visuals change

## Support

If social sharing previews are not working:

1. Check automated tests pass
2. Verify images exist and are accessible
3. Use debugging tools to identify issues
4. Check browser console for errors
5. Review Next.js build output
6. Consult Next.js metadata documentation
