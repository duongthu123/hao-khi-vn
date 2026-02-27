# Browser Zoom Support - Quick Reference

## Quick Test Checklist

### Desktop Testing (5 minutes)

1. **Open application** in browser
2. **Zoom to 200%**: Press `Ctrl +` (or `Cmd +` on Mac) 4 times
3. **Check these items**:
   - [ ] Main menu buttons are visible and clickable
   - [ ] Vietnamese text is readable
   - [ ] No content is cut off
   - [ ] Scrolling works if needed
   - [ ] Hero selection grid displays correctly
   - [ ] Resource display is readable
   - [ ] All interactive elements work

### Mobile Testing (3 minutes)

1. **Open application** on mobile device
2. **Pinch to zoom** to maximum
3. **Check these items**:
   - [ ] Content reflows properly
   - [ ] Touch targets are accessible
   - [ ] Text remains readable
   - [ ] No horizontal scrolling required

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Zoom In | `Ctrl +` | `Cmd +` |
| Zoom Out | `Ctrl -` | `Cmd -` |
| Reset Zoom | `Ctrl 0` | `Cmd 0` |

## Design Rules

### ✅ DO

- Use `rem`, `em`, `%` for sizes
- Use `max-w-*` instead of `w-*`
- Use `min-h-[44px]` for buttons
- Use Flexbox and Grid layouts
- Allow `overflow-y: auto` for scrolling
- Test at 100%, 150%, and 200% zoom

### ❌ DON'T

- Use fixed pixel widths/heights
- Use `overflow: hidden` on main containers
- Use absolute positioning for layout
- Use small font sizes (<14px base)
- Assume viewport size
- Forget to test on mobile

## Common Patterns

### Responsive Container
```tsx
<div className="w-full max-w-7xl mx-auto p-6">
  {/* Content */}
</div>
```

### Accessible Button
```tsx
<Button className="min-h-[44px] h-14 px-6 text-lg w-full">
  Button Text
</Button>
```

### Flexible Grid
```tsx
<div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

### Scrollable Content
```tsx
<div className="overflow-y-auto max-h-screen">
  {/* Long content */}
</div>
```

## Testing Commands

```bash
# Run zoom tests
npm test -- browser-zoom.test.tsx --run

# Run all accessibility tests
npm test -- accessibility --run

# Run specific test
npm test -- "should render MainMenu with all content visible at 200% zoom" --run
```

## Browser DevTools

### Chrome/Edge
1. Open DevTools: `F12`
2. Device Toolbar: `Ctrl + Shift + M`
3. Set zoom level in dropdown

### Firefox
1. Open DevTools: `F12`
2. Responsive Design Mode: `Ctrl + Shift + M`
3. Set zoom level in toolbar

### Safari
1. Open Web Inspector: `Cmd + Option + I`
2. Enter Responsive Design Mode: `Cmd + Ctrl + R`
3. Set zoom level in toolbar

## Quick Fixes

### Problem: Content cut off
**Fix**: Remove fixed widths, add `max-w-*` and `overflow-auto`

### Problem: Buttons too small
**Fix**: Add `min-h-[44px]` class

### Problem: Text overlaps
**Fix**: Use `gap-*` utilities, increase line-height

### Problem: Layout breaks
**Fix**: Use Flexbox/Grid, avoid absolute positioning

## Validation Checklist

Before marking task complete:

- [ ] All automated tests pass
- [ ] Manual testing at 100%, 150%, 200% zoom
- [ ] No content cutoff or overlap
- [ ] All buttons clickable
- [ ] Vietnamese text readable
- [ ] Scrolling works when needed
- [ ] Touch targets ≥44x44px
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices
- [ ] Documentation updated

## Resources

- Full documentation: `docs/browser-zoom-support.md`
- Test file: `src/__tests__/browser-zoom.test.tsx`
- WCAG 2.1 Reflow: https://www.w3.org/WAI/WCAG21/Understanding/reflow.html

## Support

If you encounter zoom-related issues:

1. Check component uses relative units
2. Verify no fixed dimensions
3. Test with browser DevTools
4. Run automated tests
5. Review full documentation
