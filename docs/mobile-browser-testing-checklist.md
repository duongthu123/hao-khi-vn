# Mobile Browser Testing Checklist

## Overview

This checklist provides comprehensive testing procedures for the Vietnamese Historical Strategy Game on mobile browsers. All mobile features have been implemented (responsive breakpoints, touch controls, UI optimization, mobile menu, orientation handling) and now require validation on actual mobile devices.

**Target Browsers**:
- iOS Safari 14+
- Android Chrome 90+

**Target Devices**:
- iPhone SE (320×568px) - Smallest supported
- iPhone 12/13 (390×844px) - Common size
- iPhone 12 Pro Max (414×896px) - Large phone
- iPad (768×1024px) - Tablet
- Android phones (360×640px typical)
- Android tablets (800×1280px typical)

## Testing Categories

1. [Responsive Layout](#responsive-layout)
2. [Touch Controls](#touch-controls)
3. [Mobile UI Optimization](#mobile-ui-optimization)
4. [Mobile Menu System](#mobile-menu-system)
5. [Orientation Handling](#orientation-handling)
6. [Performance](#performance)
7. [Vietnamese Text](#vietnamese-text)
8. [Accessibility](#accessibility)
9. [Browser-Specific Issues](#browser-specific-issues)

---

## Responsive Layout

### Mobile (320px - 767px)

#### Layout Structure
- [ ] Page renders without horizontal scrolling
- [ ] All content is accessible without zooming
- [ ] Sidebar is hidden by default
- [ ] Hamburger menu button is visible (44×44px minimum)
- [ ] Bottom navigation bar is visible (if implemented)
- [ ] Content area uses full width

#### Typography
- [ ] Title text is readable (minimum 16px)
- [ ] Body text is readable (minimum 14px)
- [ ] Labels are readable (minimum 12px)
- [ ] Vietnamese diacritics don't overlap
- [ ] Line height is adequate (1.5-1.6)
- [ ] No text is cut off or truncated inappropriately

#### Spacing
- [ ] Padding is appropriate (12-16px)
- [ ] Gap between elements is adequate (8-12px)
- [ ] Touch targets have proper spacing (8px minimum)
- [ ] No elements overlap

#### Grid Layouts
- [ ] Hero selection shows 2 columns on mobile
- [ ] Unit lists show 1-2 columns appropriately
- [ ] Resource displays stack vertically or wrap properly
- [ ] Cards and panels fit within viewport

### Tablet (768px - 1023px)

#### Layout Structure
- [ ] Sidebar is visible at fixed width (256px)
- [ ] Hamburger menu is hidden
- [ ] Bottom navigation bar is hidden
- [ ] Split-screen layout works properly
- [ ] Content area has appropriate width

#### Typography
- [ ] Text sizes scale up from mobile
- [ ] All text remains readable
- [ ] Vietnamese diacritics render correctly

#### Grid Layouts
- [ ] Hero selection shows 3 columns
- [ ] Unit lists show 2-3 columns
- [ ] Resource displays use horizontal layout

### Desktop (1024px+)

#### Layout Structure
- [ ] Sidebar is visible at full width (320px)
- [ ] All desktop features are accessible
- [ ] Layout uses available space efficiently

#### Typography
- [ ] Text sizes are at maximum scale
- [ ] All text is crisp and readable

#### Grid Layouts
- [ ] Hero selection shows 4 columns
- [ ] All grids use optimal column counts

---

## Touch Controls

### Map Controls

#### Pan Gesture
- [ ] Single-finger drag pans the map smoothly
- [ ] Pan is responsive (no lag)
- [ ] Pan respects map boundaries
- [ ] Pan animation is smooth (60 FPS)
- [ ] Pan works in both portrait and landscape

#### Zoom Gesture
- [ ] Pinch-to-zoom works smoothly
- [ ] Zoom is responsive (no lag)
- [ ] Zoom respects min/max limits
- [ ] Zoom centers on pinch point
- [ ] Zoom animation is smooth (60 FPS)
- [ ] Zoom works in both portrait and landscape

#### Combined Gestures
- [ ] Can pan and zoom simultaneously
- [ ] Gestures don't conflict with each other
- [ ] Gestures don't conflict with browser gestures

### Button Interactions

#### Touch Targets
- [ ] All buttons are at least 44×44px
- [ ] Buttons have adequate spacing (8px minimum)
- [ ] Buttons provide visual feedback on touch
- [ ] Buttons don't trigger accidentally
- [ ] Double-tap doesn't zoom on buttons

#### Touch Feedback
- [ ] Buttons show pressed state immediately
- [ ] Buttons show hover state on touch
- [ ] Buttons scale or change color on press
- [ ] Feedback is visible and clear

### Swipe Gestures

#### Drawer Swipe
- [ ] Swipe from left edge opens drawer
- [ ] Swipe right closes drawer
- [ ] Swipe is smooth and responsive
- [ ] Swipe threshold is appropriate
- [ ] Swipe doesn't conflict with pan gestures

#### Navigation Swipe
- [ ] Swipe gestures work for navigation (if implemented)
- [ ] Swipe direction is intuitive
- [ ] Swipe provides visual feedback

### Form Inputs

#### Text Inputs
- [ ] Keyboard appears when input is focused
- [ ] Input is scrolled into view when keyboard appears
- [ ] Input value is visible above keyboard
- [ ] Keyboard type is appropriate (text, number, email)
- [ ] Autocomplete works correctly

#### Select/Dropdown
- [ ] Native select picker appears on mobile
- [ ] Options are readable and selectable
- [ ] Selected value is displayed correctly

---

## Mobile UI Optimization

### Collapsible Sidebars

#### GameLayout Sidebar
- [ ] Sidebar is hidden on mobile by default
- [ ] Hamburger button opens sidebar drawer
- [ ] Drawer slides in from left smoothly
- [ ] Drawer can be closed by:
  - [ ] Close button (44×44px)
  - [ ] Swipe right gesture
  - [ ] Tap on backdrop
  - [ ] Escape key (if keyboard available)
- [ ] Drawer content is fully accessible
- [ ] Drawer doesn't cause layout shift

### Collapsible Panels

#### CombatView Panels
- [ ] Combat log is accessible via button
- [ ] Abilities panel is accessible via button
- [ ] Panels open as full-screen overlays
- [ ] Panels can be closed easily
- [ ] Panel toggle buttons are 44×44px minimum
- [ ] Main content remains visible when panels closed

### Resource Display

#### Mobile Optimization
- [ ] Resources display in compact layout
- [ ] Icons are appropriately sized (20-24px)
- [ ] Values are readable (16-18px)
- [ ] Progress bars are visible (60-80px minimum)
- [ ] Tooltip hint is hidden on mobile
- [ ] No horizontal scrolling

### Component Scaling

#### Cards and Panels
- [ ] Cards fit within viewport width
- [ ] Card content is readable
- [ ] Card images scale appropriately
- [ ] Card padding is adequate

#### Modals
- [ ] Modals are full-screen on mobile
- [ ] Modal content is scrollable if needed
- [ ] Modal close button is accessible (44×44px)
- [ ] Modal doesn't cause layout issues

---

## Mobile Menu System

### Hamburger Menu

#### Button
- [ ] Hamburger button is visible on mobile
- [ ] Button is 44×44px minimum
- [ ] Button has clear icon (☰)
- [ ] Button provides visual feedback on tap
- [ ] Button is positioned consistently

#### Drawer
- [ ] Drawer opens from left edge
- [ ] Drawer slides in smoothly (300ms)
- [ ] Drawer has backdrop overlay
- [ ] Drawer can be closed by:
  - [ ] Close button
  - [ ] Swipe right
  - [ ] Tap backdrop
  - [ ] Escape key
- [ ] Drawer content is fully visible
- [ ] Drawer doesn't block critical UI

#### Menu Items
- [ ] All menu items are visible
- [ ] Menu items are 44×44px minimum height
- [ ] Menu items have clear labels
- [ ] Menu items have icons (if applicable)
- [ ] Active menu item is highlighted
- [ ] Menu items respond to tap immediately

### Bottom Navigation Bar

#### Bar Structure
- [ ] Bottom bar is fixed at bottom of screen
- [ ] Bottom bar is visible on mobile
- [ ] Bottom bar is hidden on tablet+
- [ ] Bottom bar doesn't overlap content
- [ ] Content has bottom padding for bar

#### Navigation Items
- [ ] Items are evenly spaced
- [ ] Items are 44×44px minimum
- [ ] Items have clear icons
- [ ] Items have labels
- [ ] Active item is highlighted
- [ ] Items respond to tap immediately
- [ ] Maximum 5 items (recommended)

### Full-Screen Modals

#### Modal Behavior
- [ ] Modals are full-screen on mobile
- [ ] Modals have rounded corners removed
- [ ] Modals use full viewport height
- [ ] Modals are scrollable if content overflows
- [ ] Modals have close button (44×44px)
- [ ] Modals animate smoothly

#### Modal Content
- [ ] Content is readable
- [ ] Content has adequate padding
- [ ] Content doesn't overflow
- [ ] Interactive elements are accessible

---

## Orientation Handling

### Portrait Mode

#### Layout
- [ ] Layout adapts to portrait orientation
- [ ] All content is accessible
- [ ] No horizontal scrolling
- [ ] Sidebar drawer works correctly
- [ ] Bottom bar is visible (if implemented)

#### Content
- [ ] Text is readable
- [ ] Images scale appropriately
- [ ] Grids use appropriate column count
- [ ] Touch targets are accessible

### Landscape Mode

#### Layout
- [ ] Layout adapts to landscape orientation
- [ ] All content is accessible
- [ ] No horizontal scrolling
- [ ] Sidebar drawer works correctly
- [ ] Bottom bar is visible (if implemented)

#### Content
- [ ] Text is readable
- [ ] Images scale appropriately
- [ ] Grids use appropriate column count
- [ ] Touch targets are accessible

### Orientation Change

#### Transition
- [ ] Transition overlay appears during rotation
- [ ] Overlay shows "Đang điều chỉnh bố cục..." message
- [ ] Overlay has rotating device icon
- [ ] Overlay disappears after 300ms
- [ ] Transition is smooth

#### State Preservation
- [ ] Game state is preserved during rotation
- [ ] User input is preserved
- [ ] Scroll position is maintained (or reset appropriately)
- [ ] Modal state is preserved
- [ ] Drawer closes during rotation (to prevent layout issues)

#### Layout Adaptation
- [ ] Flex direction changes (portrait: column, landscape: row)
- [ ] Grid columns adjust appropriately
- [ ] Text sizes remain readable
- [ ] Touch targets remain accessible
- [ ] No layout shift or flicker

---

## Performance

### Load Time

#### Initial Load
- [ ] Page loads within 3 seconds on 4G
- [ ] Page loads within 5 seconds on 3G
- [ ] Loading indicators are shown
- [ ] Critical content loads first

#### Lazy Loading
- [ ] Heavy components load on demand
- [ ] Images load progressively
- [ ] Code splitting works correctly

### Frame Rate

#### Animations
- [ ] All animations run at 60 FPS
- [ ] No dropped frames during transitions
- [ ] No jank during scrolling
- [ ] Map pan/zoom is smooth

#### Game Loop
- [ ] Game loop maintains 60 FPS
- [ ] Resource updates are smooth
- [ ] Combat animations are smooth
- [ ] No performance degradation over time

### Memory Usage

#### Memory Leaks
- [ ] No memory leaks during extended play
- [ ] Memory usage is stable
- [ ] No crashes due to memory issues

#### Resource Cleanup
- [ ] Event listeners are cleaned up
- [ ] Timers are cleared properly
- [ ] Components unmount cleanly

### Network

#### API Calls
- [ ] API calls are efficient
- [ ] Failed requests are retried
- [ ] Loading states are shown
- [ ] Errors are handled gracefully

#### Asset Loading
- [ ] Images are optimized
- [ ] Fonts load quickly
- [ ] Sounds load on demand

---

## Vietnamese Text

### Rendering

#### Diacritics
- [ ] All Vietnamese diacritics render correctly
- [ ] Diacritics don't overlap with other text
- [ ] Diacritics don't get cut off
- [ ] Diacritics are visible at all font sizes

#### Font
- [ ] Vietnamese font (Noto Sans Vietnamese) loads correctly
- [ ] Font fallbacks work if primary font fails
- [ ] Font weight is appropriate
- [ ] Font is crisp and readable

### Readability

#### Font Sizes
- [ ] Minimum body text: 14px
- [ ] Minimum label text: 12px
- [ ] Titles are appropriately sized
- [ ] Text scales with screen size

#### Line Height
- [ ] Line height is 1.5-1.6 for body text
- [ ] Lines don't overlap
- [ ] Diacritics have adequate space

#### Text Wrapping
- [ ] Text wraps at word boundaries
- [ ] No awkward line breaks
- [ ] No text overflow
- [ ] Hyphenation is appropriate (if used)

### Content

#### Labels and Buttons
- [ ] All labels are in Vietnamese
- [ ] Button text is clear and concise
- [ ] Menu items are properly labeled
- [ ] Error messages are in Vietnamese

#### Game Content
- [ ] Hero names are in Vietnamese
- [ ] Hero descriptions are in Vietnamese
- [ ] Quiz questions are in Vietnamese
- [ ] Historical context is in Vietnamese
- [ ] All game text is properly translated

---

## Accessibility

### Touch Targets

#### Size
- [ ] All interactive elements are 44×44px minimum
- [ ] Touch targets meet WCAG 2.1 Level AA
- [ ] Touch targets are easy to tap

#### Spacing
- [ ] Touch targets have 8px minimum spacing
- [ ] No accidental taps due to proximity
- [ ] Adequate space for finger taps

### Keyboard Navigation

#### Focus Management
- [ ] Focus is visible on all interactive elements
- [ ] Focus order is logical
- [ ] Focus is trapped in modals
- [ ] Focus returns to trigger after modal close

#### Keyboard Shortcuts
- [ ] Escape closes modals and drawers
- [ ] Tab navigates through elements
- [ ] Enter activates buttons
- [ ] Arrow keys navigate lists (if applicable)

### Screen Readers

#### ARIA Labels
- [ ] All interactive elements have ARIA labels
- [ ] Images have alt text
- [ ] Icons have accessible names
- [ ] Status messages are announced

#### Semantic HTML
- [ ] Proper heading hierarchy
- [ ] Buttons use `<button>` element
- [ ] Links use `<a>` element
- [ ] Forms use proper labels

### Visual

#### Color Contrast
- [ ] Text has 4.5:1 contrast ratio minimum
- [ ] Interactive elements have 3:1 contrast ratio
- [ ] Focus indicators are visible

#### Motion
- [ ] Animations can be disabled
- [ ] Respects prefers-reduced-motion
- [ ] No motion sickness triggers

---

## Browser-Specific Issues

### iOS Safari

#### Known Issues to Test
- [ ] Viewport height with address bar (100vh issue)
- [ ] Touch event handling
- [ ] Pinch-to-zoom on buttons (should be disabled)
- [ ] Rubber band scrolling
- [ ] Safe area insets (notch on iPhone X+)
- [ ] Input zoom on focus (should be prevented with 16px font)

#### iOS-Specific Features
- [ ] Add to Home Screen works
- [ ] PWA manifest is correct
- [ ] Icons are appropriate sizes
- [ ] Splash screen displays correctly

#### iOS Versions
- [ ] iOS 14 (minimum supported)
- [ ] iOS 15
- [ ] iOS 16
- [ ] iOS 17 (latest)

### Android Chrome

#### Known Issues to Test
- [ ] Viewport height with address bar
- [ ] Touch event handling
- [ ] Pinch-to-zoom on buttons (should be disabled)
- [ ] Pull-to-refresh (should be disabled in game)
- [ ] Back button behavior
- [ ] Hardware back button

#### Android-Specific Features
- [ ] Add to Home Screen works
- [ ] PWA manifest is correct
- [ ] Icons are appropriate sizes
- [ ] Splash screen displays correctly

#### Android Versions
- [ ] Android 10
- [ ] Android 11
- [ ] Android 12
- [ ] Android 13
- [ ] Android 14 (latest)

### Cross-Browser Issues

#### Rendering Differences
- [ ] Layout is consistent across browsers
- [ ] Fonts render consistently
- [ ] Colors are consistent
- [ ] Animations are consistent

#### Feature Support
- [ ] All features work on both browsers
- [ ] Fallbacks work for unsupported features
- [ ] No browser-specific bugs

---

## Testing Procedure

### 1. Pre-Testing Setup

1. **Clear Browser Cache**
   - iOS Safari: Settings > Safari > Clear History and Website Data
   - Android Chrome: Settings > Privacy > Clear Browsing Data

2. **Disable Browser Extensions**
   - Test with clean browser state

3. **Check Network Connection**
   - Test on WiFi (fast connection)
   - Test on 4G (typical mobile connection)
   - Test on 3G (slow connection)

4. **Prepare Test Devices**
   - Charge devices to 50%+ battery
   - Update browsers to latest version
   - Enable developer tools if needed

### 2. Testing Workflow

For each device and browser combination:

1. **Initial Load**
   - Open game URL
   - Note load time
   - Check for errors in console

2. **Navigate Through App**
   - Test main menu
   - Test hero selection
   - Test game map
   - Test combat view
   - Test resource display
   - Test quiz module
   - Test collection view
   - Test profile view
   - Test settings menu

3. **Test Touch Interactions**
   - Tap all buttons
   - Test swipe gestures
   - Test map pan/zoom
   - Test drawer open/close
   - Test modal open/close

4. **Test Orientation Changes**
   - Rotate device to landscape
   - Verify layout adapts
   - Rotate back to portrait
   - Verify layout adapts

5. **Test Edge Cases**
   - Test with very long text
   - Test with many items
   - Test with slow network
   - Test with no network (offline)

6. **Document Issues**
   - Take screenshots
   - Note device and browser version
   - Describe steps to reproduce
   - Note severity (critical, major, minor)

### 3. Post-Testing

1. **Compile Test Results**
   - Create test report
   - List all issues found
   - Prioritize issues

2. **Create Bug Tickets**
   - One ticket per issue
   - Include reproduction steps
   - Include screenshots
   - Assign priority

3. **Verify Fixes**
   - Retest after fixes
   - Verify issue is resolved
   - Check for regressions

---

## Test Report Template

See `docs/mobile-browser-test-report-template.md` for the test report template.

---

## Known Issues and Workarounds

### iOS Safari

#### Issue: 100vh with Address Bar
**Problem**: `100vh` includes address bar, causing content to be cut off  
**Workaround**: Use `100dvh` (dynamic viewport height) or JavaScript calculation  
**Status**: Implemented in layout components

#### Issue: Input Zoom on Focus
**Problem**: iOS zooms in when input font size is < 16px  
**Workaround**: Use 16px font size for inputs  
**Status**: Implemented in form components

#### Issue: Pinch-to-Zoom on Buttons
**Problem**: Double-tap on buttons can trigger zoom  
**Workaround**: Add `touch-action: manipulation` CSS  
**Status**: Implemented in button components

### Android Chrome

#### Issue: Pull-to-Refresh in Game
**Problem**: Pull-to-refresh can interrupt gameplay  
**Workaround**: Disable with `overscroll-behavior: none`  
**Status**: Implemented in game layout

#### Issue: Hardware Back Button
**Problem**: Back button can exit game unexpectedly  
**Workaround**: Handle back button with JavaScript  
**Status**: To be implemented if needed

---

## Success Criteria

The mobile browser testing is considered successful when:

- [ ] All critical features work on iOS Safari 14+
- [ ] All critical features work on Android Chrome 90+
- [ ] No critical bugs are found
- [ ] All major bugs are documented and prioritized
- [ ] Performance meets targets (60 FPS, <3s load time)
- [ ] Vietnamese text is readable on all devices
- [ ] Touch controls are responsive and accurate
- [ ] Orientation changes work smoothly
- [ ] Accessibility requirements are met
- [ ] Test report is completed and reviewed

---

## Next Steps

After completing mobile browser testing:

1. **Fix Critical Issues**: Address any critical bugs found
2. **Fix Major Issues**: Address major bugs based on priority
3. **Document Minor Issues**: Create backlog for minor issues
4. **Update Documentation**: Update docs with any findings
5. **Prepare for Release**: Ensure app is ready for production
6. **User Testing**: Conduct user testing with real players
7. **Monitor Analytics**: Track usage and performance metrics
8. **Iterate**: Continue improving based on feedback

---

## Resources

- [iOS Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/Introduction/Introduction.html)
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Web Best Practices](https://www.w3.org/TR/mobile-bp/)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Ready for Testing
