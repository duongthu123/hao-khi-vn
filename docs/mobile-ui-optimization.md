# Mobile UI Optimization

## Overview

This document describes the mobile UI optimizations implemented for the Vietnamese Historical Strategy Game. The optimizations ensure that all UI elements scale appropriately for small screens, Vietnamese text remains readable, and sidebars collapse into drawers on mobile devices.

**Validates Requirements 20.3 and 20.5**: Scale UI elements appropriately for mobile and maintain readability of Vietnamese text on small screens.

## Key Optimizations

### 1. Collapsible Sidebars

**GameLayout Component**:
- Desktop (768px+): Sidebar visible at 256px (tablet) or 320px (desktop) width
- Mobile (<768px): Sidebar hidden by default, accessible via hamburger menu
- Swipeable drawer implementation for mobile sidebar access
- Touch-friendly close button (44x44px minimum)

**Implementation**:
```tsx
// Mobile hamburger menu button
<button
  onClick={() => setIsMobileSidebarOpen(true)}
  className="tablet:hidden p-2 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px]"
>
  <svg className="w-6 h-6">...</svg>
</button>

// Swipeable drawer for mobile
<SwipeableDrawer
  isOpen={isMobileSidebarOpen}
  onClose={() => setIsMobileSidebarOpen(false)}
  position="left"
  className="tablet:hidden"
>
  {sidebar}
</SwipeableDrawer>
```

### 2. Responsive Font Sizes

All text elements use responsive font sizing to ensure readability on small screens:

| Element | Mobile (320px+) | Tablet (768px+) | Desktop (1024px+) |
|---------|----------------|-----------------|-------------------|
| Page Title | text-4xl (36px) | text-5xl (48px) | text-6xl (60px) |
| Section Heading | text-base (16px) | text-lg (18px) | text-xl (20px) |
| Body Text | text-sm (14px) | text-base (16px) | text-base (16px) |
| Small Text | text-xs (12px) | text-xs (12px) | text-xs (12px) |

**Vietnamese Text Considerations**:
- Minimum font size: 14px (text-sm) for body text
- Minimum font size: 12px (text-xs) for labels and metadata
- Line height: 1.5-1.6 for proper diacritic spacing
- No text smaller than 12px to ensure diacritics remain legible

### 3. Responsive Spacing

Padding and margins scale appropriately:

```tsx
// Example: Responsive padding
className="p-3 mobile:p-4"
// Mobile: 12px padding
// Mobile+ (320px+): 16px padding

className="gap-2 mobile:gap-3"
// Mobile: 8px gap
// Mobile+ (320px+): 12px gap
```

### 4. Collapsible Panels in CombatView

**Desktop Layout**:
- Three-panel layout: Combat Log (left) | Unit List (center) | Abilities (right)
- All panels visible simultaneously
- Fixed widths for side panels (320px each)

**Mobile Layout**:
- Single-panel layout with overlay panels
- Combat Log and Abilities accessible via header buttons
- Panels slide in as full-screen overlays
- Touch-friendly toggle buttons (44x44px)

**Implementation**:
```tsx
// Mobile toggle buttons in header
<div className="flex gap-2 tablet:hidden">
  <button onClick={() => setShowCombatLog(!showCombatLog)}>
    📜
  </button>
  <button onClick={() => setShowAbilities(!showAbilities)}>
    ⚡
  </button>
</div>

// Collapsible panel
<div className={cn(
  'tablet:w-80 tablet:relative',
  'hidden tablet:flex',
  showCombatLog && 'mobile:flex mobile:absolute mobile:inset-0 mobile:z-30'
)}>
  {/* Panel content */}
</div>
```

### 5. Resource Display Optimization

**Mobile Optimizations**:
- Reduced padding: `px-3 py-2` on mobile vs `px-4 py-2` on larger screens
- Smaller icons: `text-xl` on mobile vs `text-2xl` on larger screens
- Responsive font sizes for resource values
- Narrower progress bars on mobile (min-width: 60px vs 80px)
- Tooltip hidden on mobile (hover not available)

**Vietnamese Text**:
- Resource labels use 14px minimum font size
- Generation rates use 12px font size
- All text maintains proper line height for diacritics

### 6. Touch Target Sizes

All interactive elements meet WCAG 2.1 Level AA requirements:

- Minimum touch target: 44x44px
- Applied via `min-h-[44px] min-w-[44px]` classes
- Adequate spacing between targets (8px minimum)
- Visual feedback on touch (scale animations)

**Examples**:
```tsx
// Button with minimum touch target
<button className="p-2 min-h-[44px] min-w-[44px]">
  Icon
</button>

// Unit card with touch-friendly size
<button className="p-3 rounded-lg min-h-[44px]">
  Unit Info
</button>
```

### 7. Grid Layouts

Grids adapt to screen size:

```tsx
// Hero selection grid
className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4"
// Mobile: 2 columns
// Tablet: 3 columns
// Desktop: 4 columns

// Unit list grid
className="grid grid-cols-1 mobile:grid-cols-2"
// Mobile: 1 column
// Mobile+ (320px+): 2 columns
```

### 8. Text Truncation and Wrapping

Long Vietnamese text is handled gracefully:

```tsx
// Truncate with ellipsis
className="truncate"

// Wrap with proper line height
className="leading-relaxed"

// Flexible container with minimum width
className="flex-1 min-w-0"
```

## Component-Specific Optimizations

### GameLayout

**Mobile**:
- Hamburger menu button in header (44x44px)
- Swipeable drawer for sidebar
- Full-width main content

**Tablet+**:
- Visible sidebar (256px width)
- Split layout with sidebar and content

### ResourceDisplay

**Mobile**:
- Compact padding (12px)
- Smaller icons (20px)
- Narrower progress bars
- Responsive font sizes (14px-16px for values)

**Tablet+**:
- Standard padding (16px)
- Larger icons (24px)
- Wider progress bars
- Larger font sizes (18px for values)

### CombatView

**Mobile**:
- Single-panel layout
- Collapsible combat log (overlay)
- Collapsible abilities panel (overlay)
- 1-column unit grid
- Responsive font sizes (14px-16px)

**Tablet+**:
- Three-panel layout
- Always-visible combat log (320px)
- Always-visible abilities panel (320px)
- 2-column unit grid
- Standard font sizes (16px-18px)

### HeroSelection

**Mobile**:
- 2-column hero grid
- Compact hero cards
- Stacked filter buttons
- Responsive text sizes

**Tablet+**:
- 3-4 column hero grid
- Larger hero cards
- Inline filter buttons
- Standard text sizes

## Vietnamese Text Readability

### Font Sizing Guidelines

1. **Minimum Sizes**:
   - Body text: 14px (text-sm)
   - Labels: 12px (text-xs)
   - Never use text smaller than 12px

2. **Line Height**:
   - Body text: 1.5 (leading-normal)
   - Dense text: 1.6 (leading-relaxed)
   - Ensures diacritics don't overlap

3. **Font Family**:
   ```typescript
   fontFamily: {
     vietnamese: [
       'Noto Sans Vietnamese',
       'Roboto',
       'sans-serif',
     ],
   }
   ```

4. **Text Wrapping**:
   - Use `whitespace-normal` for wrapping
   - Use `truncate` only for single-line labels
   - Avoid `text-overflow: ellipsis` for multi-word Vietnamese text

### Diacritic Spacing

Vietnamese diacritics require extra vertical space:

```tsx
// Proper line height for Vietnamese text
className="leading-relaxed" // line-height: 1.6

// Adequate padding for diacritics
className="py-1.5" // 6px vertical padding
```

### Color Contrast

All text meets WCAG AA contrast requirements:

- White text on dark backgrounds: 21:1 ratio
- Gray text (labels): Minimum 4.5:1 ratio
- Colored text (warnings): Minimum 4.5:1 ratio

## Testing Guidelines

### Manual Testing Checklist

Test on the following screen sizes:

- [ ] 320px (iPhone SE) - Smallest supported size
- [ ] 375px (iPhone 12/13) - Common mobile size
- [ ] 414px (iPhone 12 Pro Max) - Large mobile
- [ ] 768px (iPad Portrait) - Tablet breakpoint
- [ ] 1024px (iPad Landscape) - Desktop breakpoint

### Vietnamese Text Testing

- [ ] All Vietnamese text is readable at 320px width
- [ ] Diacritics don't overlap with other text
- [ ] No text is cut off or truncated inappropriately
- [ ] Line breaks occur at natural word boundaries
- [ ] All labels and buttons are fully visible

### Touch Target Testing

- [ ] All buttons are at least 44x44px
- [ ] Adequate spacing between interactive elements (8px minimum)
- [ ] Touch feedback is visible (scale, color change)
- [ ] No accidental touches due to small targets

### Layout Testing

- [ ] Sidebars collapse on mobile
- [ ] Hamburger menu opens sidebar drawer
- [ ] Swipe gestures work for drawer
- [ ] No horizontal scrolling
- [ ] All content is accessible
- [ ] Panels don't overlap inappropriately

## Performance Considerations

### CSS Optimization

- Tailwind purges unused responsive classes
- Only classes actually used are included in bundle
- Responsive classes add minimal overhead

### Animation Performance

- Collapsible panels use GPU-accelerated transforms
- Smooth 60 FPS animations on modern devices
- Reduced motion support via `prefers-reduced-motion`

### Layout Shift Prevention

- Fixed aspect ratios for images
- Skeleton loaders for async content
- Prevents Cumulative Layout Shift (CLS)

## Accessibility

### Keyboard Navigation

- Tab order remains logical on all screen sizes
- Focus indicators visible
- Skip links for mobile navigation

### Screen Readers

- Semantic HTML maintained
- ARIA labels for icon buttons
- Content order logical for screen readers

### Touch Accessibility

- Minimum 44x44px touch targets
- Visual feedback on interaction
- No hover-only functionality

## Future Enhancements

### Planned Improvements

1. **Adaptive Font Scaling**:
   - Detect user's font size preference
   - Scale all text proportionally
   - Maintain minimum sizes

2. **Orientation Handling**:
   - Detect portrait/landscape changes
   - Adapt layout for orientation
   - Maintain game state during rotation

3. **Dynamic Text Sizing**:
   - Adjust font sizes based on content length
   - Prevent overflow in constrained spaces
   - Maintain readability

4. **Enhanced Mobile Navigation**:
   - Bottom navigation bar
   - Quick action buttons
   - Gesture-based navigation

## References

- WCAG 2.1 Touch Target Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Vietnamese Typography: https://fonts.google.com/noto/specimen/Noto+Sans+Vietnamese
- Tailwind Responsive Design: https://tailwindcss.com/docs/responsive-design
- Mobile UX Best Practices: https://www.nngroup.com/articles/mobile-ux/

## Conclusion

The mobile UI optimizations ensure that the Vietnamese Historical Strategy Game provides an excellent experience on small screens. Key achievements include:

- ✅ Collapsible sidebars with swipeable drawers
- ✅ Responsive font sizes (14px minimum for Vietnamese text)
- ✅ Touch-friendly controls (44x44px minimum)
- ✅ Proper line height for Vietnamese diacritics (1.5-1.6)
- ✅ Adaptive layouts for all screen sizes
- ✅ Accessible and performant mobile experience

All UI elements scale appropriately, Vietnamese text remains readable, and the application is fully functional on devices as small as 320px wide.
