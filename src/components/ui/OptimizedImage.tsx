/**
 * OptimizedImage Component
 * 
 * Wrapper around Next.js Image component with game-specific optimizations
 * - Automatic WebP conversion with fallbacks
 * - Responsive images with srcset
 * - Lazy loading by default
 * - Blur placeholder support
 */

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  /** Image source path (relative to /hinh or /public) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Fill container (responsive) */
  fill?: boolean;
  /** Priority loading (disable lazy load) */
  priority?: boolean;
  /** Image quality (1-100) */
  quality?: number;
  /** Show loading placeholder */
  showPlaceholder?: boolean;
  /** Fallback image on error */
  fallbackSrc?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Optimized image component with automatic format conversion and responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  showPlaceholder = true,
  fallbackSrc,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize path - ensure it starts with /
  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

  // Use fallback if error occurred
  const imageSrc = error && fallbackSrc ? fallbackSrc : normalizedSrc;

  // Handle image load error
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  // Handle image load complete
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Determine sizes for responsive images
  const sizes = props.sizes || (fill ? '100vw' : undefined);

  return (
    <div className={`relative ${className}`} style={fill ? { width: '100%', height: '100%' } : undefined}>
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        placeholder={showPlaceholder ? 'blur' : undefined}
        blurDataURL={showPlaceholder ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' : undefined}
        {...props}
      />
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Hero portrait image with consistent sizing
 */
export function HeroPortrait({
  src,
  alt,
  size = 'md',
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeMap = {
    sm: { width: 64, height: 64 },
    md: { width: 128, height: 128 },
    lg: { width: 256, height: 256 },
    xl: { width: 512, height: 512 },
  };

  const dimensions = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={`rounded-lg ${className}`}
      {...props}
    />
  );
}

/**
 * Background image with fill container
 */
export function BackgroundImage({
  src,
  alt,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'fill' | 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      quality={90}
      className={className}
      sizes="100vw"
      style={{
        objectFit: 'cover',
      }}
      {...props}
    />
  );
}

/**
 * Icon image with consistent sizing
 */
export function IconImage({
  src,
  alt,
  size = 32,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}
