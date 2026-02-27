# Image Optimization Quick Reference

## Quick Start

### Basic Image
```tsx
import { OptimizedImage } from '@/components/ui';

<OptimizedImage
  src="/hinh/thd.png"
  alt="Trần Hưng Đạo"
  width={256}
  height={256}
/>
```

### Hero Portrait
```tsx
import { HeroPortrait } from '@/components/ui';

<HeroPortrait
  src="/hinh/thd.png"
  alt="Trần Hưng Đạo"
  size="lg" // sm | md | lg | xl
/>
```

### Background Image
```tsx
import { BackgroundImage } from '@/components/ui';

<BackgroundImage
  src="/hinh/anhnen.jpg"
  alt="Background"
/>
```

### Icon Image
```tsx
import { IconImage } from '@/components/ui';

<IconImage
  src="/images/units/infantry.png"
  alt="Infantry"
  size={64}
/>
```

## Responsive Images

### Using Preset Sizes
```tsx
import { OptimizedImage } from '@/components/ui';
import { RESPONSIVE_SIZES } from '@/lib/utils/imageOptimization';

<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  fill
  sizes={RESPONSIVE_SIZES.halfWidth}
/>
```

### Custom Responsive Sizes
```tsx
import { generateImageSizes } from '@/lib/utils/imageOptimization';

const customSizes = generateImageSizes({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw',
  default: '33vw',
});

<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  fill
  sizes={customSizes}
/>
```

## Priority Loading

### Critical Images (Above-the-fold)
```tsx
<OptimizedImage
  src="/hinh/anhnen.jpg"
  alt="Background"
  width={1920}
  height={1080}
  priority // Disable lazy loading
/>
```

### Lazy Loading (Default)
```tsx
<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  width={256}
  height={256}
  // priority not set = lazy loading enabled
/>
```

## Image Quality

### High Quality (90-100)
```tsx
<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  width={512}
  height={512}
  quality={95}
/>
```

### Standard Quality (75-85, default: 85)
```tsx
<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  width={256}
  height={256}
  quality={85}
/>
```

### Low Quality (50-75)
```tsx
<OptimizedImage
  src="/hinh/thumbnail.png"
  alt="Thumbnail"
  width={64}
  height={64}
  quality={70}
/>
```

## Error Handling

### With Fallback Image
```tsx
<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  width={256}
  height={256}
  fallbackSrc="/hinh/default-hero.png"
/>
```

### Without Placeholder
```tsx
<OptimizedImage
  src="/hinh/hero.png"
  alt="Hero"
  width={256}
  height={256}
  showPlaceholder={false}
/>
```

## Preloading Critical Images

```tsx
import { preloadCriticalImages } from '@/lib/utils/imageOptimization';

// In component or page
useEffect(() => {
  preloadCriticalImages([
    '/hinh/thd.png',
    '/hinh/omn.png',
    '/hinh/anhnen.jpg',
  ]);
}, []);
```

## Format Detection

```tsx
import { getOptimalImageFormat } from '@/lib/utils/imageOptimization';

const format = await getOptimalImageFormat();
// Returns: 'avif' | 'webp' | 'original'
```

## Aspect Ratio Calculation

```tsx
import { calculateAspectRatio } from '@/lib/utils/imageOptimization';

const ratio = calculateAspectRatio(1920, 1080);
// Returns: "16/9"
```

## Srcset Generation

```tsx
import { generateSrcSet } from '@/lib/utils/imageOptimization';

const srcset = generateSrcSet('/hinh/hero.jpg', [640, 1280, 1920], 'webp');
// Returns: "/hinh/hero.webp?w=640 640w, /hinh/hero.webp?w=1280 1280w, /hinh/hero.webp?w=1920 1920w"
```

## Common Patterns

### Hero Card with Portrait
```tsx
<div className="hero-card">
  <HeroPortrait
    src={hero.portrait}
    alt={hero.name}
    size="lg"
    priority={isAboveFold}
  />
  <h3>{hero.name}</h3>
  <p>{hero.description}</p>
</div>
```

### Full-Screen Background
```tsx
<div className="relative h-screen w-screen">
  <BackgroundImage
    src="/hinh/anhnen.jpg"
    alt="Game Background"
  />
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

### Responsive Grid of Images
```tsx
import { RESPONSIVE_SIZES } from '@/lib/utils/imageOptimization';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {heroes.map((hero) => (
    <OptimizedImage
      key={hero.id}
      src={hero.portrait}
      alt={hero.name}
      width={256}
      height={256}
      sizes={RESPONSIVE_SIZES.thirdWidth}
    />
  ))}
</div>
```

### Icon with Text
```tsx
<div className="flex items-center gap-2">
  <IconImage
    src="/images/units/infantry.png"
    alt="Infantry"
    size={32}
  />
  <span>Infantry Unit</span>
</div>
```

## Breakpoints Reference

```typescript
IMAGE_BREAKPOINTS = {
  mobile: 640,   // 0-640px
  tablet: 768,   // 641-768px
  desktop: 1024, // 769-1024px
  wide: 1920,    // 1025-1920px
}
```

## Preset Sizes Reference

```typescript
RESPONSIVE_SIZES = {
  fullWidth: '100vw',
  halfWidth: '(max-width: 640px) 100vw, 50vw',
  thirdWidth: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
  heroPortrait: '(max-width: 640px) 128px, 256px',
  icon: '64px',
  thumbnail: '128px',
}
```

## Performance Tips

1. **Use priority for above-the-fold images only**
2. **Set appropriate quality (85 is good default)**
3. **Use fill mode for responsive containers**
4. **Provide width/height to prevent layout shift**
5. **Use HeroPortrait for consistent hero images**
6. **Preload critical images on page load**
7. **Use IconImage for small UI icons**
8. **Let Next.js handle format conversion automatically**

## Migration Checklist

- [ ] Replace `<img>` tags with `<OptimizedImage>`
- [ ] Add width/height or fill prop
- [ ] Add alt text for accessibility
- [ ] Set priority for critical images
- [ ] Use specialized components (HeroPortrait, IconImage)
- [ ] Configure responsive sizes for fill images
- [ ] Test on different devices and browsers
- [ ] Verify WebP/AVIF conversion works
- [ ] Check Lighthouse performance score

## Troubleshooting

### Image not loading
- Check path starts with `/` or use normalized path
- Verify image exists in `/hinh/` or `/public/`
- Check browser console for errors

### Image too large
- Reduce quality setting
- Use appropriate dimensions
- Enable lazy loading (remove priority)

### Layout shift
- Always provide width/height
- Use fill mode with proper container sizing
- Enable placeholder

### Slow loading
- Enable priority for critical images
- Preload important images
- Check image file size
- Verify format conversion is working
