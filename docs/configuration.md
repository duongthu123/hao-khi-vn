# Configuration Guide

This document explains the configuration setup for the Đại Chiến Sử Việt Next.js application.

## Table of Contents

- [Next.js Configuration](#nextjs-configuration)
- [Environment Variables](#environment-variables)
- [Asset Management](#asset-management)
- [Build Optimization](#build-optimization)
- [Development Setup](#development-setup)

## Next.js Configuration

The `next.config.js` file contains optimizations for game assets and performance.

### Image Optimization

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  dangerouslyAllowSVG: true,
}
```

- Supports modern image formats (AVIF, WebP) for better compression
- Allows SVG images for game graphics
- Automatic image optimization via Next.js Image component

### Webpack Configuration

Custom webpack loaders handle game-specific assets:

**Video Files** (`.mp4`, `.webm`, `.ogg`):
- Processed as static resources
- Output to `static/media/` directory
- Includes content hash for cache busting

**Audio Files** (`.mp3`, `.wav`, `.ogg`):
- Processed as static resources
- Output to `static/audio/` directory
- Includes content hash for cache busting

**JSON Data Files**:
- Loaded as JSON modules
- Used for quiz questions, game data, etc.

### Build Optimizations

```javascript
output: 'standalone',
compress: true,
swcMinify: true,
```

- **Standalone output**: Optimized for deployment
- **Compression**: Gzip compression enabled
- **SWC minification**: Faster minification using SWC

### Experimental Features

```javascript
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['framer-motion', '@radix-ui/react-dialog'],
}
```

- CSS optimization for smaller bundle sizes
- Package import optimization for frequently used libraries

### Caching Headers

Static assets are cached aggressively:

- **Game assets** (`/hinh/*`): 1 year cache, immutable
- **Data files** (`/data/*`): 1 hour cache, must revalidate

## Environment Variables

### Setup

1. Copy the template:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` with your configuration

3. Restart the development server after changes

### Variable Categories

#### Application Configuration

```env
NEXT_PUBLIC_APP_NAME="Đại Chiến Sử Việt - Hào Khí Đông A"
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=development
```

#### Game Configuration

```env
NEXT_PUBLIC_AUTOSAVE_INTERVAL=300000  # 5 minutes in milliseconds
NEXT_PUBLIC_MAX_SAVE_SLOTS=5
NEXT_PUBLIC_DEBUG_MODE=true
```

#### Cloud Storage (Optional)

```env
NEXT_PUBLIC_ENABLE_CLOUD_SAVES=false

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Firebase (alternative)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

#### Feature Flags

```env
NEXT_PUBLIC_ENABLE_WEB_SPEECH=true
NEXT_PUBLIC_ENABLE_MULTIPLAYER=false
NEXT_PUBLIC_ENABLE_LEADERBOARD=false
```

#### Development Tools

```env
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=true
NEXT_PUBLIC_ENABLE_ZUSTAND_DEVTOOLS=true
```

### Using Environment Variables

Import from the config module:

```typescript
import { GAME_CONFIG, FEATURES, isFeatureEnabled } from '@/constants/config';

// Use configuration
const autoSaveInterval = GAME_CONFIG.autoSaveInterval;

// Check feature flags
if (isFeatureEnabled('webSpeech')) {
  // Enable speech features
}
```

### Variable Naming Convention

- **`NEXT_PUBLIC_*`**: Exposed to browser (client-side)
- **No prefix**: Server-only (API routes, server components)

⚠️ **Security**: Never expose sensitive keys with `NEXT_PUBLIC_` prefix!

## Asset Management

### Directory Structure

```
public/
├── images/          # Static images
├── videos/          # Video files
├── sounds/          # Audio files
└── data/            # JSON data files

hinh/                # Legacy game assets (Vietnamese: "images")
├── *.jpg            # Background images
├── *.png            # Unit sprites
├── *.svg            # Vector graphics
└── *.mp4            # Hero videos
```

### Asset Utilities

Use the asset helper functions:

```typescript
import { 
  getImagePath, 
  getVideoPath, 
  preloadImage,
  loadAssetsWithProgress 
} from '@/lib/utils/assets';

// Get asset paths
const heroImage = getImagePath('gen_bachdang_intro.mp4');

// Preload assets
await preloadImage('/hinh/anhnen.jpg');

// Load with progress tracking
await loadAssetsWithProgress(assets, (progress) => {
  console.log(`Loading: ${progress.percentage}%`);
});
```

### Asset Preloading

Core game assets are defined in `src/lib/utils/assets.ts`:

```typescript
import { getCoreAssets, loadAssetsWithProgress } from '@/lib/utils/assets';

// Load all core assets
const assets = getCoreAssets();
await loadAssetsWithProgress(assets, onProgress);
```

### Asset Caching

Assets are cached in memory for performance:

```typescript
import { loadAssetCached } from '@/lib/utils/assets';

// Loads from cache if available
const image = await loadAssetCached('image', '/hinh/hero.png');
```

## Build Optimization

### Production Build

```bash
npm run build
```

Optimizations applied:

1. **Code Splitting**: Automatic route-based splitting
2. **Tree Shaking**: Removes unused code
3. **Minification**: SWC-based minification
4. **Image Optimization**: Automatic format conversion
5. **CSS Optimization**: Tailwind purging + optimization
6. **Bundle Analysis**: Check bundle sizes

### Bundle Size Optimization

**Lazy Loading**:
```typescript
import dynamic from 'next/dynamic';

const GameMap = dynamic(() => import('@/components/game/GameMap'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

**Package Optimization**:
- Framer Motion: Tree-shakeable imports
- Radix UI: Import only needed components
- Zustand: Lightweight state management

### Performance Targets

- **Lighthouse Score**: 80+ (desktop)
- **FPS**: 60 FPS during gameplay
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB (main bundle)

## Development Setup

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your settings
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:3000
   ```

### Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

### Hot Module Replacement

Next.js automatically reloads on file changes:

- **React components**: Fast Refresh
- **CSS/Tailwind**: Instant updates
- **Environment variables**: Requires server restart

### Development Tools

**React Query DevTools**:
- Enabled in development by default
- View query cache and mutations
- Debug data fetching

**Zustand DevTools**:
- Enabled in development by default
- Inspect state changes
- Time-travel debugging

### Debugging

**Browser DevTools**:
```typescript
import { GAME_CONFIG } from '@/constants/config';

if (GAME_CONFIG.debugMode) {
  console.log('Debug info:', gameState);
}
```

**Source Maps**:
- Enabled in development
- Maps minified code to source
- Better error stack traces

## Configuration Validation

The configuration is validated on startup:

```typescript
import { validateConfig } from '@/constants/config';

// Throws error if configuration is invalid
validateConfig();
```

Validation checks:

- Cloud storage configuration (if enabled)
- Save slot limits (1-10)
- Auto-save interval (minimum 30 seconds)

## Best Practices

### Environment Variables

✅ **Do**:
- Use `NEXT_PUBLIC_` for client-side variables
- Keep sensitive keys server-only
- Document all variables in template
- Use TypeScript for type safety

❌ **Don't**:
- Commit `.env.local` to version control
- Expose API keys with `NEXT_PUBLIC_`
- Use environment variables for constants

### Asset Management

✅ **Do**:
- Preload critical assets
- Use Next.js Image component
- Implement loading states
- Cache loaded assets

❌ **Don't**:
- Load all assets at once
- Use unoptimized images
- Block rendering on asset loading

### Build Optimization

✅ **Do**:
- Use dynamic imports for heavy components
- Implement code splitting
- Monitor bundle sizes
- Use production builds for testing

❌ **Don't**:
- Import entire libraries
- Disable optimizations
- Skip bundle analysis

## Troubleshooting

### Common Issues

**Environment variables not updating**:
- Restart the development server
- Check variable naming (NEXT_PUBLIC_ prefix)
- Verify .env.local exists

**Assets not loading**:
- Check file paths (case-sensitive)
- Verify public directory structure
- Check webpack configuration

**Build errors**:
- Clear `.next` directory
- Delete `node_modules` and reinstall
- Check TypeScript errors

**Performance issues**:
- Enable production mode
- Check bundle sizes
- Profile with React DevTools
- Monitor FPS with Performance API

## Additional Resources

- [Next.js Configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Webpack Configuration](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config)
