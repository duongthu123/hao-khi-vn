# Open Graph Images

This directory should contain social sharing images for the game.

## Required Images

### 1. og-image.png
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Purpose**: Primary Open Graph image for social media sharing (Facebook, LinkedIn, etc.)
- **Content**: Should feature:
  - Game title: "Đại Chiến Sử Việt - Hào Khí Đông A"
  - Visual elements from the game (heroes, map, or battle scene)
  - Vietnamese cultural motifs (Bạch Đằng theme colors)
  - Bilingual text (Vietnamese and English)

### 2. og-image-square.png
- **Dimensions**: 1200 x 1200 pixels
- **Format**: PNG
- **Purpose**: Square format for platforms that prefer 1:1 ratio
- **Content**: Similar to og-image.png but in square format

### 3. twitter-card.png (optional)
- **Dimensions**: 1200 x 675 pixels
- **Format**: PNG
- **Purpose**: Optimized for Twitter cards
- **Content**: Similar to og-image.png

## Design Guidelines

- Use the Bạch Đằng theme colors (blues, golds, traditional Vietnamese palette)
- Include recognizable game elements (heroes, units, or map)
- Ensure text is readable at small sizes
- Maintain cultural authenticity
- Include both Vietnamese and English text for international appeal

## Placeholder Images

Until proper images are created, placeholder images should be generated with:
- Solid background color from the theme
- Game title text
- Simple Vietnamese cultural pattern or motif

## Testing Social Sharing

After adding images, test social sharing previews with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Open Graph Preview: https://www.opengraph.xyz/

## Image Optimization

- Compress images to reduce file size (aim for < 300KB)
- Use PNG format for images with text
- Use WebP format with PNG fallback for better compression
- Ensure images look good on both light and dark backgrounds
