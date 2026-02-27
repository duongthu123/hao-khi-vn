/**
 * Image Optimization Utilities
 * 
 * Helper functions for responsive images, srcset generation, and format detection
 */

/**
 * Breakpoints for responsive images
 */
export const IMAGE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1920,
} as const;

/**
 * Generate sizes attribute for responsive images
 */
export function generateImageSizes(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
  default?: string;
}): string {
  const sizes: string[] = [];

  if (config.mobile) {
    sizes.push(`(max-width: ${IMAGE_BREAKPOINTS.mobile}px) ${config.mobile}`);
  }
  if (config.tablet) {
    sizes.push(`(max-width: ${IMAGE_BREAKPOINTS.tablet}px) ${config.tablet}`);
  }
  if (config.desktop) {
    sizes.push(`(max-width: ${IMAGE_BREAKPOINTS.desktop}px) ${config.desktop}`);
  }
  if (config.wide) {
    sizes.push(`(max-width: ${IMAGE_BREAKPOINTS.wide}px) ${config.wide}`);
  }
  if (config.default) {
    sizes.push(config.default);
  }

  return sizes.join(', ');
}

/**
 * Common responsive image size configurations
 */
export const RESPONSIVE_SIZES = {
  /** Full width on all devices */
  fullWidth: '100vw',
  
  /** Half width on desktop, full on mobile */
  halfWidth: generateImageSizes({
    mobile: '100vw',
    desktop: '50vw',
    default: '50vw',
  }),
  
  /** Third width on desktop, half on tablet, full on mobile */
  thirdWidth: generateImageSizes({
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    default: '33vw',
  }),
  
  /** Hero portrait sizes */
  heroPortrait: generateImageSizes({
    mobile: '128px',
    tablet: '256px',
    desktop: '256px',
    default: '256px',
  }),
  
  /** Icon sizes */
  icon: '64px',
  
  /** Thumbnail sizes */
  thumbnail: '128px',
} as const;

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalImageFormat(): Promise<'avif' | 'webp' | 'original'> {
  const [avifSupported, webpSupported] = await Promise.all([
    supportsAVIF(),
    supportsWebP(),
  ]);

  if (avifSupported) return 'avif';
  if (webpSupported) return 'webp';
  return 'original';
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  basePath: string,
  widths: number[],
  format?: 'webp' | 'avif'
): string {
  return widths
    .map((width) => {
      const path = format ? basePath.replace(/\.(jpg|jpeg|png)$/i, `.${format}`) : basePath;
      return `${path}?w=${width} ${width}w`;
    })
    .join(', ');
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('getImageDimensions can only be called in browser'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload critical images with format detection
 */
export async function preloadCriticalImages(images: string[]): Promise<void> {
  const format = await getOptimalImageFormat();
  
  const preloadPromises = images.map((src) => {
    return new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      
      // Use optimal format if available
      if (format !== 'original' && /\.(jpg|jpeg|png)$/i.test(src)) {
        link.href = src.replace(/\.(jpg|jpeg|png)$/i, `.${format}`);
        link.type = `image/${format}`;
      } else {
        link.href = src;
      }
      
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Resolve even on error to not block
      
      document.head.appendChild(link);
    });
  });

  await Promise.all(preloadPromises);
}

/**
 * Image loading priority levels
 */
export const IMAGE_PRIORITY = {
  CRITICAL: 'critical', // Above-the-fold, load immediately
  HIGH: 'high',         // Important but not critical
  NORMAL: 'normal',     // Standard lazy loading
  LOW: 'low',           // Load when idle
} as const;

export type ImagePriority = typeof IMAGE_PRIORITY[keyof typeof IMAGE_PRIORITY];

/**
 * Determine if image should be loaded with priority
 */
export function shouldPrioritizeImage(
  priority: ImagePriority,
  isAboveFold: boolean
): boolean {
  if (priority === IMAGE_PRIORITY.CRITICAL) return true;
  if (priority === IMAGE_PRIORITY.HIGH && isAboveFold) return true;
  return false;
}
