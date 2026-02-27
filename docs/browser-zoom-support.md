# Browser Zoom Support Documentation

## Overview

This document describes the browser zoom support implementation for the Vietnamese Historical Strategy Game, ensuring the application remains fully functional and accessible at zoom levels up to 200%.

**Requirement:** 22.7 - THE Game_Application SHALL support browser zoom up to 200% without breaking layout

## Implementation Strategy

### 1. Flexible Layout Units

The application uses relative units instead of fixed pixels to ensure content scales properly with browser zoom:

- **rem/em units**: For font sizes, padding, and margins
- **Percentage units**: For widths and flexible layouts
- **Viewport units (vh/vw)**: For full-screen components
- **Tailwind CSS utilities**: Automatically use rem-based spacing

### 2. Responsive Grid and Flexbox

All layouts use CSS Grid and Flexbox, which naturally adapt to zoom levels:

```tsx
// Hero Selection Grid
<div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
  {/* Hero cards */}
</div>

// Resource Display Flexbox
<div className="flex flex-col tablet:flex-row gap-4">
  {/* Resource items */}
</div>
```

### 3. Minimum Touch Target Sizes

All interactive elements maintain minimum touch target sizes (44x44px) that scale with zoom:

```tsx
// Button with minimum height
<Button className="min-h-[44px] h-14 px-6 text-lg w-full">
  Bắt đầu trò chơi
</Button>
```

### 4. No Fixed Widths or Heights

Components avoid fixed dimensions that could cause overflow or cutoff at high zoom:

- Use `max-w-*` instead of `w-*` for containers
- Use `min-h-*` instead of `h-*` for interactive elements
- Allow content to flow naturally

### 5. Scrollable Containers

When content exceeds viewport at high zoom, containers allow scrolling:

```tsx
// MenuLayout with scrollable content
<div className="min-h-screen overflow-y-auto">
  {children}
</div>
```

## Testing Approach

### Automated Tests

The `browser-zoom.test.tsx` file validates zoom support across multiple levels:

1. **100% Zoom (Baseline)**: Verifies normal rendering
2. **150% Zoom**: Tests intermediate zoom level
3. **200% Zoom (Maximum Required)**: Validates maximum zoom support

### Test Categories

#### Layout Integrity
- MenuLayout renders without breaking
- Content is not cut off or hidden
- Layouts maintain proper structure

#### Content Visibility
- All text remains visible and readable
- Vietnamese characters display correctly
- Buttons and interactive elements are accessible

#### Functionality
- Buttons remain clickable
- Hero selection works correctly
- All interactions function normally

#### Responsive Behavior
- Grid layouts adapt properly
- Flexbox containers maintain integrity
- Scrolling works when content exceeds viewport

### Manual Testing Procedure

To manually test browser zoom support:

1. **Open the application** in a modern browser (Chrome, Firefox, Safari, Edge)

2. **Test at 100% zoom** (baseline):
   - Verify all content displays correctly
   - Check that all features work as expected

3. **Zoom to 150%**:
   - Press `Ctrl +` (Windows/Linux) or `Cmd +` (Mac) twice
   - Verify no content is cut off
   - Check that all buttons are clickable
   - Ensure Vietnamese text is readable

4. **Zoom to 200%**:
   - Press `Ctrl +` (Windows/Linux) or `Cmd +` (Mac) two more times
   - Verify layout doesn't break
   - Check that all functionality works
   - Ensure scrolling works if content exceeds viewport
   - Verify touch targets are still accessible

5. **Test key features at 200% zoom**:
   - Main menu navigation
   - Hero selection
   - Resource display
   - Combat view
   - Settings menu
   - Save/load functionality

6. **Test on different screen sizes**:
   - Desktop (1920x1080)
   - Laptop (1366x768)
   - Tablet (768x1024)
   - Mobile (375x667)

## Browser Zoom Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Zoom In | `Ctrl +` | `Cmd +` |
| Zoom Out | `Ctrl -` | `Cmd -` |
| Reset Zoom | `Ctrl 0` | `Cmd 0` |

## Design Principles for Zoom Support

### 1. Use Relative Units
```css
/* Good */
.container {
  padding: 1rem;
  font-size: 1.125rem;
}

/* Avoid */
.container {
  padding: 16px;
  font-size: 18px;
}
```

### 2. Avoid Fixed Dimensions
```css
/* Good */
.card {
  max-width: 32rem;
  min-height: 20rem;
}

/* Avoid */
.card {
  width: 512px;
  height: 320px;
}
```

### 3. Use Flexbox and Grid
```css
/* Good */
.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Avoid */
.layout {
  float: left;
  margin-right: 16px;
}
```

### 4. Allow Overflow Scrolling
```css
/* Good */
.content {
  overflow-y: auto;
  max-height: 100vh;
}

/* Avoid */
.content {
  overflow: hidden;
  height: 100vh;
}
```

## Component-Specific Considerations

### MainMenu
- Uses flexible spacing with Tailwind utilities
- Buttons scale with zoom
- Vietnamese text remains readable
- Card container adapts to zoom level

### HeroSelection
- Grid layout adjusts columns based on available space
- Hero cards maintain aspect ratio
- Touch targets remain accessible
- Scrolling enabled for overflow

### ResourceDisplay
- Flexbox layout adapts to zoom
- Numbers and icons scale proportionally
- Tooltips remain visible
- Progress bars maintain functionality

### CombatView
- Canvas elements scale with container
- Controls remain accessible
- Combat log scrolls when needed
- Unit selection works at all zoom levels

### GameMap
- Canvas rendering scales with zoom
- Pan and zoom controls work independently of browser zoom
- Units and buildings remain visible
- Touch/click targets scale appropriately

## Known Limitations

1. **Canvas Rendering**: Canvas elements may appear slightly pixelated at very high zoom levels (>200%). This is a browser limitation and doesn't affect functionality.

2. **Animation Performance**: Some animations may appear slightly slower at 200% zoom due to increased rendering workload. This is expected and doesn't break functionality.

3. **Third-Party Components**: Some third-party UI components may have their own zoom limitations. We've tested all Radix UI components and they work correctly.

## Accessibility Benefits

Browser zoom support provides significant accessibility benefits:

1. **Visual Impairment**: Users with low vision can zoom to read content more easily
2. **Reading Comfort**: Users can adjust zoom to their preferred reading size
3. **Mobile Devices**: Pinch-to-zoom works naturally on touch devices
4. **WCAG Compliance**: Meets WCAG 2.1 Level AA requirement for reflow at 200% zoom

## Browser Compatibility

Tested and verified on:

- ✅ Chrome 120+ (Windows, Mac, Linux)
- ✅ Firefox 121+ (Windows, Mac, Linux)
- ✅ Safari 17+ (Mac, iOS)
- ✅ Edge 120+ (Windows, Mac)

## Troubleshooting

### Issue: Content is cut off at high zoom

**Solution**: Check for fixed widths or heights. Replace with max-width/min-height and allow overflow scrolling.

### Issue: Buttons are too small to click at 200% zoom

**Solution**: Ensure buttons have `min-h-[44px]` class for minimum touch target size.

### Issue: Text overlaps at high zoom

**Solution**: Use flexible spacing (gap, padding) instead of fixed margins. Ensure line-height is appropriate.

### Issue: Layout breaks on small screens at 200% zoom

**Solution**: Test responsive breakpoints. Ensure mobile layouts work at 200% zoom on small viewports.

## Future Enhancements

1. **Zoom Persistence**: Remember user's zoom preference across sessions
2. **Zoom Controls**: Add in-app zoom controls for users who don't know keyboard shortcuts
3. **Zoom Indicator**: Show current zoom level in settings
4. **Optimized Rendering**: Further optimize canvas rendering at high zoom levels

## References

- [WCAG 2.1 Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
- [MDN: CSS Values and Units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Accessibility: Browser Zoom](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)

## Conclusion

The application fully supports browser zoom up to 200% without breaking layout or functionality. All components use flexible layouts, relative units, and responsive design principles to ensure accessibility and usability at all zoom levels.
