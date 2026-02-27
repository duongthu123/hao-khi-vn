import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 * Provides loading placeholder with various shapes and animations
 * **Implements: Requirement 23.4 - Loading skeletons for content loading**
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const inlineStyles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={inlineStyles}
      role="status"
      aria-label="Đang tải"
      {...props}
    />
  );
}

/**
 * SkeletonText Component
 * Specialized skeleton for text content with multiple lines
 */
export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '70%',
  spacing = 'normal',
  className,
  ...props
}: SkeletonTextProps) {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    relaxed: 'gap-3',
  };

  return (
    <div className={cn('flex flex-col', spacingClasses[spacing], className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard Component
 * Skeleton for card-like content with header and body
 */
export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean;
  imageHeight?: number;
  hasHeader?: boolean;
  bodyLines?: number;
}

export function SkeletonCard({
  hasImage = false,
  imageHeight = 200,
  hasHeader = true,
  bodyLines = 3,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn('border rounded-lg p-4 space-y-4', className)}
      role="status"
      aria-label="Đang tải nội dung"
      {...props}
    >
      {hasImage && <Skeleton variant="rectangular" height={imageHeight} className="w-full" />}
      {hasHeader && <Skeleton variant="text" height={24} width="60%" />}
      <SkeletonText lines={bodyLines} />
    </div>
  );
}

/**
 * SkeletonAvatar Component
 * Skeleton for avatar/profile images
 */
export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SkeletonAvatar({ size = 'md', className, ...props }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}
