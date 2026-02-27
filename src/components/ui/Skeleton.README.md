# Skeleton Component

Loading placeholder components with various shapes and animations for better user experience during async operations.

## Overview

The Skeleton component provides visual feedback while content is loading, implementing **Requirement 23.4** for loading skeletons. It includes multiple variants for different content types and supports customizable animations.

## Components

### Skeleton

Basic skeleton component with customizable shape and animation.

```tsx
import { Skeleton } from '@/components/ui/Skeleton';

// Basic usage
<Skeleton />

// With custom dimensions
<Skeleton width={200} height={100} />

// Different variants
<Skeleton variant="text" />
<Skeleton variant="circular" />
<Skeleton variant="rectangular" />

// Different animations
<Skeleton animation="pulse" />
<Skeleton animation="wave" />
<Skeleton animation="none" />
```

### SkeletonText

Specialized skeleton for multi-line text content.

```tsx
import { SkeletonText } from '@/components/ui/Skeleton';

// Default 3 lines
<SkeletonText />

// Custom number of lines
<SkeletonText lines={5} />

// Custom last line width
<SkeletonText lines={3} lastLineWidth="70%" />

// Different spacing
<SkeletonText spacing="tight" />
<SkeletonText spacing="normal" />
<SkeletonText spacing="relaxed" />
```

### SkeletonCard

Skeleton for card-like content with optional image, header, and body.

```tsx
import { SkeletonCard } from '@/components/ui/Skeleton';

// Basic card
<SkeletonCard />

// With image
<SkeletonCard hasImage={true} imageHeight={200} />

// Without header
<SkeletonCard hasHeader={false} />

// Custom body lines
<SkeletonCard bodyLines={5} />
```

### SkeletonAvatar

Circular skeleton for avatar/profile images.

```tsx
import { SkeletonAvatar } from '@/components/ui/Skeleton';

// Different sizes
<SkeletonAvatar size="sm" />
<SkeletonAvatar size="md" />
<SkeletonAvatar size="lg" />
<SkeletonAvatar size="xl" />
```

## Props

### Skeleton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'rectangular'` | Shape of the skeleton |
| `width` | `string \| number` | - | Width (number in px, string for other units) |
| `height` | `string \| number` | - | Height (number in px, string for other units) |
| `animation` | `'pulse' \| 'wave' \| 'none'` | `'pulse'` | Animation type |
| `className` | `string` | - | Additional CSS classes |

### SkeletonText Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | `number` | `3` | Number of text lines |
| `lastLineWidth` | `string` | `'70%'` | Width of the last line |
| `spacing` | `'tight' \| 'normal' \| 'relaxed'` | `'normal'` | Spacing between lines |
| `className` | `string` | - | Additional CSS classes |

### SkeletonCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hasImage` | `boolean` | `false` | Whether to show image skeleton |
| `imageHeight` | `number` | `200` | Height of image skeleton in px |
| `hasHeader` | `boolean` | `true` | Whether to show header skeleton |
| `bodyLines` | `number` | `3` | Number of body text lines |
| `className` | `string` | - | Additional CSS classes |

### SkeletonAvatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| `className` | `string` | - | Additional CSS classes |

## Usage Examples

### Loading List

```tsx
function UserList({ loading, users }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <Skeleton width="40%" height={20} className="mb-2" />
              <SkeletonText lines={2} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return users.map(user => <UserCard key={user.id} user={user} />);
}
```

### Loading Grid

```tsx
function ProductGrid({ loading, products }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} hasImage={true} imageHeight={200} bodyLines={2} />
        ))}
      </div>
    );
  }

  return products.map(product => <ProductCard key={product.id} product={product} />);
}
```

### Loading Profile

```tsx
function ProfileHeader({ loading, profile }) {
  if (loading) {
    return (
      <div className="flex items-center gap-6">
        <SkeletonAvatar size="xl" />
        <div className="flex-1">
          <Skeleton width="60%" height={32} className="mb-3" />
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }

  return <ProfileDisplay profile={profile} />;
}
```

## Animations

### Pulse (Default)

Smooth opacity pulsing animation. Best for most use cases.

```tsx
<Skeleton animation="pulse" />
```

### Wave

Shimmer effect that moves across the skeleton. More visually engaging.

```tsx
<Skeleton animation="wave" />
```

### None

No animation. Use when animations are disabled for accessibility.

```tsx
<Skeleton animation="none" />
```

## Accessibility

- All skeleton components have `role="status"` for screen readers
- Vietnamese aria-label "Đang tải" (Loading) by default
- Respects `prefers-reduced-motion` when animations are disabled
- Provides clear loading feedback for async operations

## Best Practices

1. **Match Content Structure**: Skeleton should closely match the actual content layout
2. **Use Appropriate Variants**: Choose the right skeleton type for your content
3. **Consistent Sizing**: Keep skeleton dimensions similar to actual content
4. **Loading Duration**: Show skeletons for at least 300ms to avoid flashing
5. **Accessibility**: Always provide loading feedback for async operations

## Requirements Validation

This component validates:
- **Requirement 23.3**: Loading states for async operations
- **Requirement 23.4**: Loading skeletons for content that takes time to load

## Related Components

- `LoadingSpinner`: For simple loading indicators
- `SaveLoadMenuSkeleton`: Specialized skeleton for save/load menu
- `QuizModuleSkeleton`: Specialized skeleton for quiz module
