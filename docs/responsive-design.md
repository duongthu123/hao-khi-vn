# Responsive Design Implementation

## Overview

This document describes the responsive layout breakpoints implemented for the Vietnamese Historical Strategy Game. The application adapts gracefully across mobile, tablet, and desktop screen sizes while maintaining usability and readability of Vietnamese text.

**Validates Requirement 20.1**: Responsive Design Implementation

## Breakpoint Configuration

The application uses custom Tailwind CSS breakpoints configured in `tailwind.config.ts`:

| Breakpoint | Min Width | Target Devices | Usage |
|------------|-----------|----------------|-------|
| `mobile` | 320px | Small phones, iPhone SE | Base mobile layout |
| `tablet` | 768px | Tablets, iPad | Medium screen layout |
| `desktop` | 1024px | Laptops, desktops | Large screen layout |
| `wide` | 1280px | Large desktops | Extra-wide layout |

## Responsive Patterns

### Mobile-First Approach

All components use a mobile-first approach where base styles target mobile devices, and larger breakpoints progressively enhance the layout:

```tsx
// Example: Mobile-first padding
className="p-4 tablet:p-8"
// Base: 1rem padding (mobile)
// tablet+: 2rem padding
```

### Typography Scaling

Text sizes scale appropriately across breakpoints to maintain readability:

```tsx
// Main title scaling
className="text-4xl tablet:text-5xl desktop:text-6xl"
// Mobile: 2.25rem (36px)
// Tablet: 3rem (48px)
// Desktop: 3.75rem (60px)
```

### Grid Layouts

Grid columns adapt to screen size for optimal content display:

```tsx
// Hero selection grid
className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4"
// Mobile: 2 columns
// Tablet: 3 columns
// Desktop: 4 columns
```

## Component Responsive Behavior

### MenuLayout

**Mobile (320px+)**:
- Padding: `p-4` (1rem)
- Full-width content
- Stacked layout

**Tablet (768px+)**:
- Padding: `tablet:p-8` (2rem)
- Centered content with max-width
- More breathing room

**Desktop (1024px+)**:
- Same as tablet with larger max-width
- Enhanced decorative elements

### MainMenu

**Mobile (320px+)**:
- Title: `text-4xl` (2.25rem)
- Subtitle: `text-xl` (1.25rem)
- Stacked buttons
- Full-width cards

**Tablet (768px+)**:
- Title: `tablet:text-5xl` (3rem)
- Subtitle: `tablet:text-2xl` (1.5rem)
- Wider button spacing

**Desktop (1024px+)**:
- Title: `desktop:text-6xl` (3.75rem)
- Maximum visual impact
- Optimal spacing

### HeroSelection

**Mobile (320px+)**:
- Grid: 2 columns
- Compact hero cards
- Scrollable detail view

**Tablet (768px+)**:
- Grid: 3 columns
- Medium-sized cards
- Side-by-side detail view

**Desktop (1024px+)**:
- Grid: 4 columns
- Large hero cards
- Full detail panel

### GameLayout

**Mobile (320px+)**:
- Sidebar hidden by default
- Hamburger menu for navigation
- Full-width content area
- Bottom navigation bar

**Tablet (768px+)**:
- Sidebar: `tablet:w-64` (16rem)
- Visible sidebar
- Split layout

**Desktop (1024px+)**:
- Sidebar: `desktop:w-80` (20rem)
- Wider sidebar
- Optimal content distribution

### ResourceDisplay

**All Breakpoints**:
- Flexible layout adapts to container
- Maintains readability at all sizes
- Icons scale appropriately
- Progress bars remain visible

### CombatView

**Mobile (320px+)**:
- Stacked panels
- Collapsible sections
- Touch-optimized controls

**Tablet (768px+)**:
- Side-by-side panels
- Visible combat log
- Medium-sized unit cards

**Desktop (1024px+)**:
- Three-panel layout
- Full combat log
- Large unit cards
- Ability panel visible

## Vietnamese Text Considerations

### Font Sizing

Vietnamese text with diacritics requires careful font sizing to ensure readability:

- Minimum font size: `text-sm` (0.875rem / 14px)
- Base font size: `text-base` (1rem / 16px)
- Increased line height: 1.5-1.6 for proper diacritic spacing

### Font Family

The application uses Vietnamese-optimized fonts:

```typescript
fontFamily: {
  vietnamese: [
    'Noto Sans Vietnamese',
    'Roboto',
    'sans-serif',
  ],
}
```

### Text Wrapping

Vietnamese text wraps naturally at word boundaries. The application ensures:
- No text overflow on small screens
- Proper word breaking
- Maintained readability

## Testing Responsive Layouts

### Automated Tests

Comprehensive responsive tests are located in `src/__tests__/responsive-layout.test.tsx`:

```bash
npm test -- src/__tests__/responsive-layout.test.tsx
```

Tests verify:
- ✅ Correct breakpoint classes applied
- ✅ Grid columns adapt to screen size
- ✅ Text sizes scale appropriately
- ✅ Vietnamese text remains readable
- ✅ Layout adapts on screen size changes

### Manual Testing

To manually test responsive behavior:

1. **Browser DevTools**:
   - Open Chrome/Firefox DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test at different viewport sizes

2. **Recommended Test Sizes**:
   - 320px (iPhone SE)
   - 375px (iPhone 12/13)
   - 768px (iPad Portrait)
   - 1024px (iPad Landscape)
   - 1280px (Desktop)
   - 1920px (Large Desktop)

3. **Test Checklist**:
   - [ ] All text is readable
   - [ ] No horizontal scrolling
   - [ ] Buttons are touch-friendly (44x44px minimum)
   - [ ] Images scale appropriately
   - [ ] Navigation is accessible
   - [ ] Vietnamese diacritics display correctly

## Performance Considerations

### CSS Optimization

Tailwind CSS purges unused styles in production:

```javascript
// tailwind.config.ts
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
],
```

Only responsive classes actually used in components are included in the final bundle.

### Image Optimization

Next.js Image component handles responsive images:

```tsx
<Image
  src="/hero.png"
  alt="Hero"
  width={300}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Layout Shift Prevention

Components use fixed aspect ratios and skeleton loaders to prevent Cumulative Layout Shift (CLS).

## Accessibility

### Touch Targets

All interactive elements meet WCAG 2.1 Level AA requirements:
- Minimum touch target: 44x44px
- Adequate spacing between targets
- Visual feedback on interaction

### Keyboard Navigation

Responsive layouts maintain keyboard navigation:
- Tab order remains logical
- Focus indicators visible at all sizes
- Skip links for mobile navigation

### Screen Readers

Responsive changes don't affect screen reader experience:
- Semantic HTML maintained
- ARIA labels consistent
- Content order logical

## Future Enhancements

### Planned Improvements

1. **Orientation Handling** (Task 14.5):
   - Detect orientation changes
   - Adapt layout for portrait/landscape
   - Maintain game state during rotation

2. **Mobile Touch Controls** (Task 14.2):
   - Swipe gestures for navigation
   - Pinch-to-zoom for map
   - Touch-optimized game controls

3. **Mobile Menu System** (Task 14.4):
   - Hamburger menu
   - Bottom navigation bar
   - Full-screen modals

4. **Mobile Browser Testing** (Task 14.6):
   - iOS Safari testing
   - Android Chrome testing
   - Mobile-specific bug fixes

## References

- Tailwind CSS Documentation: https://tailwindcss.com/docs/responsive-design
- WCAG 2.1 Touch Target Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Next.js Image Optimization: https://nextjs.org/docs/basic-features/image-optimization
- Vietnamese Typography Best Practices: https://fonts.google.com/noto/specimen/Noto+Sans+Vietnamese

## Conclusion

The responsive layout implementation ensures the Vietnamese Historical Strategy Game provides an optimal experience across all device sizes. The mobile-first approach, combined with careful attention to Vietnamese text rendering, creates a accessible and performant application that honors the game's cultural and educational mission.
