# Asset Optimization Guide

This guide explains how game assets are optimized in the Next.js application.

## Overview

The game includes various asset types:
- **Images**: Backgrounds, sprites, UI elements (JPG, PNG, SVG)
- **Videos**: Hero intros, win/lose animations (MP4)
- **Audio**: Sound effects, music (MP3, WAV, OGG) - to be added
- **Data**: Quiz questions, game configuration (JSON)

## Image Optimization

### Next.js Image Component

Use the Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/hinh/anhnen.jpg"
  alt="Background"
  width={1920}
  height={1080}
  priority // For above-the-fold images
  quality={85} // Default from config
/>
```

**Benefits**:
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading by default
- Blur placeholder support

### Static Images

For Canvas rendering or dynamic images:

```typescript
import { getImagePath, preloadImage } from '@/lib/utils/assets';

// Get path
const imagePath = getImagePath('hero.png');

// Preload for Canvas
const img = await preloadImage(imagePath);
ctx.drawImage(img, x, y);
```

### SVG Optimization

SVG files are allowed in the configuration:

```tsx
<Image
  src="/hinh/bandol.svg"
  alt="Flag"
  width={100}
  height={100}
/>
```

## Video Optimization

### Video Files

Videos are processed by webpack and output with content hashing:

```typescript
import { getVideoPath, preloadVideo } from '@/lib/utils/assets';

// Get video path
const videoPath = getVideoPath('gen_bachdang_intro.mp4');

// Preload video
const video = await preloadVideo(videoPath);
video.play();
```

### Video Element

```tsx
<video
  src={getVideoPath('hero_intro.mp4')}
  autoPlay
  muted
  loop
  playsInline
>
  Your browser does not support video.
</video>
```

### Video Optimization Tips

1. **Compression**: Use H.264 codec for broad compatibility
2. **Resolution**: Optimize for target display size
3. **Preload**: Only preload critical videos
4. **Lazy Load**: Load videos on-demand when needed

## Audio Optimization

### Audio Files

Audio files are processed similarly to videos:

```typescript
import { getSoundPath, preloadAudio } from '@/lib/utils/assets';

// Get audio path
const soundPath = getSoundPath('battle.mp3');

// Preload audio
const audio = await preloadAudio(soundPath);
audio.play();
```

### Web Audio API

For advanced audio features:

```typescript
const audioContext = new AudioContext();
const response = await fetch(getSoundPath('music.mp3'));
const arrayBuffer = await response.arrayBuffer();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(audioContext.destination);
source.start();
```

## Asset Preloading

### Preload Critical Assets

Load essential assets during app initialization:

```typescript
import { getCoreAssets, loadAssetsWithProgress } from '@/lib/utils/assets';

function GameLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const assets = getCoreAssets();
    loadAssetsWithProgress(assets, (progress) => {
      setProgress(progress.percentage);
    });
  }, []);

  return <LoadingScreen progress={progress} />;
}
```

### Lazy Load Non-Critical Assets

Load assets on-demand:

```typescript
// Load when entering a specific game mode
useEffect(() => {
  if (gameMode === 'quiz') {
    preloadImage(getImagePath('quiz-background.jpg'));
  }
}, [gameMode]);
```

### Preload on Hover

Preload assets before they're needed:

```tsx
<button
  onMouseEnter={() => preloadVideo(getVideoPath('hero_intro.mp4'))}
  onClick={playHeroIntro}
>
  View Hero
</button>
```

## Asset Caching

### Browser Caching

Static assets are cached via HTTP headers (configured in next.config.js):

- **Game assets** (`/hinh/*`): 1 year, immutable
- **Data files** (`/data/*`): 1 hour, must revalidate

### In-Memory Caching

Use the asset cache for frequently accessed assets:

```typescript
import { loadAssetCached } from '@/lib/utils/assets';

// First call: loads from network
const img1 = await loadAssetCached('image', '/hinh/hero.png');

// Second call: returns from cache
const img2 = await loadAssetCached('image', '/hinh/hero.png');
```

### Cache Management

```typescript
import { assetCache } from '@/lib/utils/assets';

// Check cache
if (assetCache.has('/hinh/hero.png')) {
  const img = assetCache.get('/hinh/hero.png');
}

// Clear cache (e.g., on memory pressure)
assetCache.clear();

// Get cache size
const size = assetCache.size();
```

## Data Files

### JSON Data

Load JSON data files:

```typescript
import { loadJsonData } from '@/lib/utils/assets';

interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswer: number;
}

// Load quiz questions
const questions = await loadJsonData<QuizQuestion[]>('quiz-questions.json');
```

### Static Import

For build-time data:

```typescript
import quizData from '@/public/data/quiz-questions.json';
```

## Performance Best Practices

### 1. Prioritize Critical Assets

Load essential assets first:

```typescript
// Critical: UI, backgrounds
await preloadImages([
  getImagePath('anhnen.jpg'),
  getImagePath('ui-elements.png'),
]);

// Non-critical: hero videos (load later)
setTimeout(() => {
  preloadVideos(heroVideos);
}, 2000);
```

### 2. Use Appropriate Formats

- **Photos/Backgrounds**: JPG (smaller file size)
- **Graphics/UI**: PNG (transparency support)
- **Icons/Logos**: SVG (scalable, small size)
- **Videos**: MP4 with H.264 (broad compatibility)

### 3. Optimize File Sizes

- **Images**: Compress with tools like ImageOptim, TinyPNG
- **Videos**: Use appropriate bitrate and resolution
- **Audio**: Use appropriate bitrate (128-192 kbps for music)

### 4. Implement Progressive Loading

```typescript
// Load low-quality placeholder first
const placeholder = await preloadImage(getImagePath('hero-thumb.jpg'));
displayImage(placeholder);

// Load high-quality version
const fullImage = await preloadImage(getImagePath('hero-full.jpg'));
displayImage(fullImage);
```

### 5. Monitor Performance

```typescript
import { GAME_CONFIG } from '@/constants/config';

if (GAME_CONFIG.enablePerformanceMonitoring) {
  performance.mark('asset-load-start');
  await loadAssets();
  performance.mark('asset-load-end');
  
  performance.measure('asset-load', 'asset-load-start', 'asset-load-end');
  const measure = performance.getEntriesByName('asset-load')[0];
  console.log(`Assets loaded in ${measure.duration}ms`);
}
```

## CDN Integration

### Configure CDN

Set CDN URL in environment variables:

```env
NEXT_PUBLIC_ASSET_CDN_URL=https://cdn.example.com
```

### Use CDN URLs

The asset utilities automatically use CDN when configured:

```typescript
import { getAssetUrl } from '@/constants/config';

// Returns CDN URL if configured, otherwise local path
const url = getAssetUrl('/hinh/hero.png');
```

## Troubleshooting

### Assets Not Loading

1. **Check file paths**: Paths are case-sensitive
2. **Verify public directory**: Assets should be in `public/` or `hinh/`
3. **Check webpack config**: Ensure file types are handled
4. **Browser console**: Check for 404 errors

### Performance Issues

1. **Too many assets**: Implement lazy loading
2. **Large file sizes**: Compress and optimize
3. **No caching**: Verify cache headers
4. **Memory leaks**: Clear asset cache when not needed

### Build Errors

1. **Missing files**: Ensure all referenced assets exist
2. **Invalid formats**: Check file extensions and formats
3. **Webpack errors**: Verify webpack configuration

## Asset Checklist

Before deploying:

- [ ] All images compressed and optimized
- [ ] Videos encoded with appropriate codec and bitrate
- [ ] Critical assets preloaded
- [ ] Non-critical assets lazy loaded
- [ ] Cache headers configured
- [ ] CDN configured (if using)
- [ ] Asset paths tested in production build
- [ ] Performance metrics measured
- [ ] Browser compatibility tested

## Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web Performance](https://web.dev/performance/)
- [Image Compression Tools](https://tinypng.com/)
- [Video Compression](https://handbrake.fr/)
