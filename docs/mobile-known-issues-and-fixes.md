# Mobile Browser Known Issues and Fixes

## Overview

This document catalogs known mobile browser issues, their root causes, implemented fixes, and workarounds. This serves as a reference for developers and testers working on the Vietnamese Historical Strategy Game.

**Last Updated**: 2024  
**Status**: Living Document

---

## iOS Safari Issues

### Issue 1: 100vh with Address Bar

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
When using `height: 100vh` in CSS, iOS Safari includes the address bar in the calculation. When the address bar is visible, content at the bottom gets cut off. When the user scrolls and the address bar hides, the content jumps.

**Root Cause**:
iOS Safari's viewport height includes the browser chrome (address bar and toolbar), which can show/hide dynamically during scrolling.

**Symptoms**:
- Content cut off at bottom of screen
- Layout jumps when scrolling
- Bottom navigation bar hidden by address bar
- Modals don't fill full screen

**Fix Implemented**:
```css
/* Use dvh (dynamic viewport height) instead of vh */
.full-height {
  height: 100dvh; /* Dynamic viewport height */
  min-height: -webkit-fill-available; /* Fallback for older iOS */
}
```

**Alternative Fix** (if dvh not supported):
```typescript
// JavaScript calculation
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', setViewportHeight);
setViewportHeight();
```

```css
.full-height {
  height: calc(var(--vh, 1vh) * 100);
}
```

**Files Modified**:
- `src/app/globals.css`
- `src/components/layout/GameLayout.tsx`
- `src/components/ui/Modal.tsx`

**Testing**:
- [ ] Test on iPhone with address bar visible
- [ ] Scroll to hide address bar
- [ ] Verify no content cut off
- [ ] Verify no layout jump

---

### Issue 2: Input Zoom on Focus

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
When a user taps on an input field with font size less than 16px, iOS Safari automatically zooms in to make the text readable. This disrupts the layout and user experience.

**Root Cause**:
iOS Safari's accessibility feature to ensure text inputs are readable. Triggers when input font size is < 16px.

**Symptoms**:
- Page zooms in when tapping input
- Layout becomes disrupted
- User must manually zoom out
- Poor user experience

**Fix Implemented**:
```css
/* Ensure all inputs have 16px font size minimum */
input, textarea, select {
  font-size: 16px;
}

/* For smaller visual appearance, use transform */
.small-input {
  font-size: 16px;
  transform: scale(0.875); /* Visually 14px */
  transform-origin: left top;
}
```

**Alternative Fix**:
```html
<!-- Disable zoom entirely (not recommended for accessibility) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

**Files Modified**:
- `src/app/globals.css`
- `src/components/ui/Input.tsx` (if exists)
- Form components

**Testing**:
- [ ] Tap all input fields
- [ ] Verify no zoom occurs
- [ ] Verify inputs are readable
- [ ] Test with VoiceOver enabled

---

### Issue 3: Pinch-to-Zoom on Buttons

**Severity**: Minor  
**Status**: ✅ Fixed

**Problem**:
Double-tapping buttons can trigger iOS Safari's zoom feature, which is disruptive during gameplay.

**Root Cause**:
iOS Safari's default double-tap-to-zoom gesture applies to all elements, including buttons.

**Symptoms**:
- Double-tap on button zooms page
- Disrupts gameplay
- User must zoom out manually

**Fix Implemented**:
```css
/* Disable double-tap zoom on interactive elements */
button, a, [role="button"] {
  touch-action: manipulation;
}
```

**Explanation**:
`touch-action: manipulation` disables double-tap-to-zoom while preserving other touch gestures like pan and pinch.

**Files Modified**:
- `src/app/globals.css`
- `src/components/ui/Button.tsx`

**Testing**:
- [ ] Double-tap buttons
- [ ] Verify no zoom occurs
- [ ] Verify single tap still works
- [ ] Verify other gestures still work

---

### Issue 4: Safe Area Insets (iPhone X+)

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
On iPhone X and newer models with notches and home indicators, content can be hidden behind these UI elements.

**Root Cause**:
iOS provides safe area insets to indicate areas that might be obscured by device features.

**Symptoms**:
- Content hidden by notch
- Content hidden by home indicator
- Bottom navigation bar partially hidden
- Important UI elements not accessible

**Fix Implemented**:
```css
/* Use safe area insets for padding */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

/* For full-screen elements */
.full-screen-safe {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) 
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Files Modified**:
- `src/app/globals.css`
- `src/components/layout/GameLayout.tsx`
- `src/components/layout/MobileNavigation.tsx`

**Testing**:
- [ ] Test on iPhone X or newer
- [ ] Verify content not hidden by notch
- [ ] Verify content not hidden by home indicator
- [ ] Test in portrait and landscape

---

### Issue 5: Rubber Band Scrolling

**Severity**: Minor  
**Status**: ⚠️ Partial Fix

**Problem**:
iOS Safari's "rubber band" effect when scrolling past the top or bottom of a page can be disruptive during gameplay, especially on the game map.

**Root Cause**:
iOS Safari's default overscroll behavior provides visual feedback when reaching scroll boundaries.

**Symptoms**:
- Page bounces when scrolling past top/bottom
- Can reveal browser chrome
- Disruptive during map panning

**Fix Implemented**:
```css
/* Disable overscroll on game elements */
.game-map, .no-overscroll {
  overscroll-behavior: none;
}

/* For body to prevent pull-to-refresh */
body {
  overscroll-behavior-y: none;
}
```

**Limitations**:
- Cannot completely disable rubber band effect in iOS Safari
- Can only prevent it on specific elements
- Pull-to-refresh can still trigger in some cases

**Files Modified**:
- `src/app/globals.css`
- `src/components/game/GameMap/GameMap.tsx`

**Testing**:
- [ ] Scroll past top of page
- [ ] Scroll past bottom of page
- [ ] Pan map to edges
- [ ] Verify minimal rubber band effect

---

### Issue 6: Touch Event Delays

**Severity**: Minor  
**Status**: ✅ Fixed

**Problem**:
iOS Safari adds a 300ms delay to touch events to detect double-tap gestures, making the app feel sluggish.

**Root Cause**:
Historical iOS Safari behavior to distinguish between single tap and double-tap.

**Symptoms**:
- Buttons feel unresponsive
- 300ms delay before action
- Poor user experience

**Fix Implemented**:
```html
<!-- Viewport meta tag disables delay -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

```css
/* Additional CSS fix */
* {
  touch-action: manipulation;
}
```

**Files Modified**:
- `src/app/layout.tsx` (viewport meta tag)
- `src/app/globals.css`

**Testing**:
- [ ] Tap buttons
- [ ] Verify immediate response
- [ ] No noticeable delay

---

## Android Chrome Issues

### Issue 7: Pull-to-Refresh in Game

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
Android Chrome's pull-to-refresh gesture can be triggered during gameplay, especially when panning the map upward, causing the page to reload.

**Root Cause**:
Android Chrome's default pull-to-refresh gesture is active on all pages.

**Symptoms**:
- Page reloads during map panning
- Game state lost
- Disruptive user experience

**Fix Implemented**:
```css
/* Disable pull-to-refresh */
body {
  overscroll-behavior-y: contain;
}

.game-container {
  overscroll-behavior: none;
}
```

**Alternative Fix** (JavaScript):
```typescript
// Prevent pull-to-refresh
let lastTouchY = 0;
let preventPullToRefresh = false;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  lastTouchY = e.touches[0].clientY;
  preventPullToRefresh = window.pageYOffset === 0;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  const touchY = e.touches[0].clientY;
  const touchYDelta = touchY - lastTouchY;
  lastTouchY = touchY;

  if (preventPullToRefresh && touchYDelta > 0) {
    e.preventDefault();
  }
}, { passive: false });
```

**Files Modified**:
- `src/app/globals.css`
- `src/components/layout/GameLayout.tsx`

**Testing**:
- [ ] Pull down from top of page
- [ ] Verify no refresh occurs
- [ ] Pan map upward
- [ ] Verify no refresh occurs

---

### Issue 8: Hardware Back Button

**Severity**: Major  
**Status**: ⚠️ Needs Implementation

**Problem**:
Android's hardware back button can exit the game unexpectedly, causing loss of game state.

**Root Cause**:
Android Chrome's default back button behavior navigates browser history.

**Symptoms**:
- Back button exits game
- Game state lost
- User must restart game

**Proposed Fix**:
```typescript
// Handle back button
window.addEventListener('popstate', (e) => {
  // Prevent default back navigation
  e.preventDefault();
  
  // Custom back button logic
  if (isModalOpen) {
    closeModal();
  } else if (isDrawerOpen) {
    closeDrawer();
  } else {
    // Show exit confirmation
    showExitConfirmation();
  }
  
  // Push state to prevent actual navigation
  window.history.pushState(null, '', window.location.href);
});

// Initialize history state
window.history.pushState(null, '', window.location.href);
```

**Status**: To be implemented if needed based on user feedback

**Testing**:
- [ ] Press back button with modal open
- [ ] Press back button with drawer open
- [ ] Press back button on main game screen
- [ ] Verify appropriate behavior

---

### Issue 9: Viewport Height with Address Bar

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
Similar to iOS, Android Chrome's address bar can show/hide, affecting viewport height calculations.

**Root Cause**:
Android Chrome's dynamic address bar behavior.

**Symptoms**:
- Content cut off when address bar visible
- Layout jumps when address bar hides
- Inconsistent viewport height

**Fix Implemented**:
Same as iOS Issue 1 - using `dvh` and JavaScript fallback.

**Files Modified**:
- `src/app/globals.css`
- `src/components/layout/GameLayout.tsx`

**Testing**:
- [ ] Test with address bar visible
- [ ] Scroll to hide address bar
- [ ] Verify no content cut off
- [ ] Verify no layout jump

---

### Issue 10: Touch Event Conflicts

**Severity**: Minor  
**Status**: ✅ Fixed

**Problem**:
Touch events can conflict with browser gestures (e.g., swipe to navigate, pinch to zoom).

**Root Cause**:
Android Chrome's default touch gestures.

**Symptoms**:
- Map pan triggers browser navigation
- Pinch zoom triggers browser zoom
- Gesture conflicts

**Fix Implemented**:
```css
/* Prevent browser gestures */
.game-map {
  touch-action: none; /* Disable all browser gestures */
}

.game-container {
  touch-action: pan-x pan-y; /* Allow only pan */
}
```

```html
<!-- Disable zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

**Note**: Disabling zoom can affect accessibility. Use with caution.

**Files Modified**:
- `src/app/globals.css`
- `src/components/game/GameMap/GameMap.tsx`
- `src/app/layout.tsx`

**Testing**:
- [ ] Pan map
- [ ] Verify no browser navigation
- [ ] Pinch on map
- [ ] Verify only game zoom, not browser zoom

---

## Cross-Browser Issues

### Issue 11: Touch Target Size

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
Touch targets smaller than 44×44px are difficult to tap accurately on mobile devices.

**Root Cause**:
Small UI elements designed for mouse pointers, not finger taps.

**Symptoms**:
- Difficulty tapping buttons
- Accidental taps on wrong elements
- Poor user experience
- Accessibility issues

**Fix Implemented**:
```css
/* Ensure minimum touch target size */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* For smaller visual elements, use padding */
.small-button {
  padding: 12px; /* Ensures 44px total with content */
}
```

```typescript
// Button component with minimum size
export function Button({ size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'min-h-[44px] min-w-[44px]', // Minimum touch target
        size === 'sm' && 'text-sm px-3',
        size === 'md' && 'text-base px-4',
        size === 'lg' && 'text-lg px-6'
      )}
      {...props}
    />
  );
}
```

**Files Modified**:
- `src/app/globals.css`
- `src/components/ui/Button.tsx`
- All interactive components

**Testing**:
- [ ] Measure all interactive elements
- [ ] Verify all ≥44×44px
- [ ] Test tapping accuracy
- [ ] Test with accessibility tools

---

### Issue 12: Touch Target Spacing

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
Interactive elements too close together cause accidental taps.

**Root Cause**:
Insufficient spacing between touch targets.

**Symptoms**:
- Accidental taps on adjacent elements
- Difficulty tapping intended target
- Poor user experience

**Fix Implemented**:
```css
/* Ensure minimum spacing between touch targets */
.touch-target-group > * + * {
  margin-left: 8px; /* Minimum 8px spacing */
}

.touch-target-grid {
  gap: 8px; /* Minimum 8px gap in grids */
}
```

**Files Modified**:
- `src/app/globals.css`
- Layout components
- Grid components

**Testing**:
- [ ] Measure spacing between elements
- [ ] Verify all ≥8px
- [ ] Test tapping accuracy
- [ ] No accidental taps

---

### Issue 13: Orientation Change Layout Shift

**Severity**: Minor  
**Status**: ✅ Fixed

**Problem**:
Layout shifts or flickers during orientation changes.

**Root Cause**:
React re-rendering during orientation change without transition.

**Symptoms**:
- Layout flickers
- Content jumps
- Poor user experience

**Fix Implemented**:
```typescript
// useOrientation hook with transition
export function useOrientation({ onChange, debounceDelay = 100 } = {}) {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsTransitioning(true);
      const newOrientation = detectOrientation();
      setOrientation(newOrientation);
      onChange?.(newOrientation);
      
      setTimeout(() => setIsTransitioning(false), 300);
    };

    // Debounced handler
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleChange, debounceDelay);
    };

    window.addEventListener('orientationchange', debouncedHandler);
    window.addEventListener('resize', debouncedHandler);

    return () => {
      window.removeEventListener('orientationchange', debouncedHandler);
      window.removeEventListener('resize', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [onChange, debounceDelay]);

  return { orientation, isTransitioning };
}
```

```tsx
// OrientationTransition component
{isTransitioning && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="text-white text-center">
      <div className="animate-spin text-4xl mb-2">🔄</div>
      <p>Đang điều chỉnh bố cục...</p>
    </div>
  </div>
)}
```

**Files Modified**:
- `src/hooks/useOrientation.ts`
- `src/components/ui/OrientationTransition.tsx`
- `src/components/layout/GameLayout.tsx`

**Testing**:
- [ ] Rotate device
- [ ] Verify transition overlay shows
- [ ] Verify smooth transition
- [ ] No layout flicker

---

### Issue 14: Vietnamese Diacritic Rendering

**Severity**: Major  
**Status**: ✅ Fixed

**Problem**:
Vietnamese diacritics can overlap with other text or get cut off on mobile devices.

**Root Cause**:
Insufficient line height and font rendering issues.

**Symptoms**:
- Diacritics overlap adjacent lines
- Diacritics cut off at top/bottom
- Poor readability

**Fix Implemented**:
```css
/* Ensure adequate line height for Vietnamese text */
body {
  font-family: 'Noto Sans Vietnamese', 'Roboto', sans-serif;
  line-height: 1.6; /* Increased for diacritics */
}

p, span, div {
  line-height: 1.5; /* Minimum for body text */
}

/* Prevent text cutoff */
.vietnamese-text {
  overflow: visible;
  padding-top: 2px;
  padding-bottom: 2px;
}
```

**Files Modified**:
- `src/app/globals.css`
- `tailwind.config.ts`

**Testing**:
- [ ] Check all Vietnamese text
- [ ] Verify diacritics don't overlap
- [ ] Verify diacritics not cut off
- [ ] Test at various font sizes

---

### Issue 15: Performance on Low-End Devices

**Severity**: Major  
**Status**: ⚠️ Ongoing Optimization

**Problem**:
Game performance degrades on low-end mobile devices, especially during animations and map rendering.

**Root Cause**:
Limited CPU/GPU resources on budget devices.

**Symptoms**:
- Dropped frames (<60 FPS)
- Stuttering animations
- Slow map pan/zoom
- Poor user experience

**Optimizations Implemented**:

1. **Debounced Event Handlers**:
```typescript
const debouncedPan = debounce((delta) => {
  updateMapPosition(delta);
}, 16); // ~60 FPS
```

2. **Viewport Culling**:
```typescript
// Only render visible units
const visibleUnits = units.filter(unit => 
  isInViewport(unit.position, viewport)
);
```

3. **RequestAnimationFrame**:
```typescript
const animate = () => {
  // Update game state
  updateGameState(deltaTime);
  
  // Render
  render();
  
  requestAnimationFrame(animate);
};
```

4. **React.memo for Expensive Components**:
```typescript
export const GameMap = React.memo(({ units, buildings }) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.units === nextProps.units &&
         prevProps.buildings === nextProps.buildings;
});
```

5. **Lazy Loading**:
```typescript
const GameMap = lazy(() => import('./GameMap'));
const CombatView = lazy(() => import('./CombatView'));
```

**Files Modified**:
- `src/components/game/GameMap/GameMap.tsx`
- `src/hooks/useGameLoop.ts`
- `src/app/page.tsx`

**Testing**:
- [ ] Test on low-end device (e.g., iPhone SE, budget Android)
- [ ] Monitor frame rate
- [ ] Check for stuttering
- [ ] Verify acceptable performance

---

## Testing Checklist

Use this checklist to verify all fixes are working:

### iOS Safari
- [ ] Issue 1: 100vh with address bar
- [ ] Issue 2: Input zoom on focus
- [ ] Issue 3: Pinch-to-zoom on buttons
- [ ] Issue 4: Safe area insets
- [ ] Issue 5: Rubber band scrolling
- [ ] Issue 6: Touch event delays

### Android Chrome
- [ ] Issue 7: Pull-to-refresh
- [ ] Issue 8: Hardware back button
- [ ] Issue 9: Viewport height
- [ ] Issue 10: Touch event conflicts

### Cross-Browser
- [ ] Issue 11: Touch target size
- [ ] Issue 12: Touch target spacing
- [ ] Issue 13: Orientation change
- [ ] Issue 14: Vietnamese diacritics
- [ ] Issue 15: Performance

---

## Reporting New Issues

When you discover a new mobile browser issue:

1. **Document the Issue**:
   - Severity (Critical, Major, Minor)
   - Device and browser version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots

2. **Investigate Root Cause**:
   - Research the issue
   - Check browser documentation
   - Test on multiple devices

3. **Propose Fix**:
   - Research solutions
   - Test fix on affected devices
   - Document fix in this file

4. **Update This Document**:
   - Add new issue section
   - Include fix implementation
   - Update testing checklist

---

## Resources

- [iOS Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/Introduction/Introduction.html)
- [Chrome Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Can I Use](https://caniuse.com/) - Browser compatibility

---

**Maintained By**: Development Team  
**Last Review**: 2024  
**Next Review**: After each major release
