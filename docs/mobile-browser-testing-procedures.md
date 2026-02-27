# Mobile Browser Testing Procedures

## Overview

This document provides step-by-step procedures for testing the Vietnamese Historical Strategy Game on mobile browsers. Follow these procedures to ensure comprehensive testing coverage.

## Prerequisites

### Required Devices

**Minimum Test Set**:
- 1 iOS device (iPhone or iPad)
- 1 Android device (phone or tablet)

**Recommended Test Set**:
- iPhone SE or similar (small screen)
- iPhone 12/13 or similar (standard screen)
- iPad or similar (tablet)
- Android phone (standard screen)
- Android tablet

### Required Software

- Latest iOS (14+)
- Latest Android (10+)
- Safari on iOS (built-in)
- Chrome on Android (latest version)

### Testing Tools

- Stopwatch or timer (for performance testing)
- Screenshot capability
- Note-taking app
- Test report template

## Testing Procedure

### Phase 1: Initial Setup (15 minutes)

#### Step 1: Prepare Devices

1. **Charge Devices**
   - Ensure all devices are charged to 50%+ battery
   - Connect to power if needed for extended testing

2. **Update Browsers**
   - iOS: Settings > General > Software Update
   - Android: Play Store > My apps & games > Update Chrome

3. **Clear Browser Data**
   - iOS Safari: Settings > Safari > Clear History and Website Data
   - Android Chrome: Settings > Privacy > Clear Browsing Data

4. **Disable Extensions**
   - Ensure clean browser state
   - Disable any ad blockers or extensions

5. **Check Network**
   - Connect to stable WiFi
   - Note WiFi speed for reference
   - Prepare to test on cellular (4G/3G) later

#### Step 2: Prepare Test Environment

1. **Open Test Report Template**
   - Use `docs/mobile-browser-test-report-template.md`
   - Create a copy for this test session
   - Fill in test information section

2. **Open Testing Checklist**
   - Use `docs/mobile-browser-testing-checklist.md`
   - Keep it open for reference

3. **Prepare Screenshot Folder**
   - Create folder for test screenshots
   - Name it with date and device info

### Phase 2: Initial Load Testing (10 minutes per device)

#### Step 1: First Load (WiFi)

1. **Open Browser**
   - iOS: Open Safari
   - Android: Open Chrome

2. **Navigate to Game URL**
   - Enter game URL in address bar
   - Start stopwatch when pressing Go

3. **Measure Load Time**
   - Stop timer when page is interactive
   - Record time in test report
   - Target: <3 seconds on WiFi

4. **Check Console for Errors**
   - iOS: Settings > Safari > Advanced > Web Inspector
   - Android: Chrome > Menu > More tools > Developer tools
   - Note any errors or warnings

5. **Take Screenshot**
   - Capture initial load state
   - Save with filename: `[device]-initial-load.png`

#### Step 2: Subsequent Loads

1. **Refresh Page**
   - Pull down to refresh (or tap refresh button)
   - Measure load time again
   - Should be faster due to caching

2. **Clear Cache and Reload**
   - Clear browser cache
   - Reload page
   - Measure load time
   - Should match first load time

#### Step 3: Slow Network Testing

1. **Switch to 4G**
   - Disable WiFi
   - Enable cellular data (4G)
   - Clear cache

2. **Load Page on 4G**
   - Navigate to game URL
   - Measure load time
   - Target: <5 seconds on 4G
   - Note any loading indicators

3. **Switch to 3G (if possible)**
   - Enable 3G mode in settings
   - Load page
   - Measure load time
   - Note user experience

### Phase 3: Responsive Layout Testing (20 minutes per device)

#### Step 1: Portrait Mode Testing

1. **Hold Device in Portrait**
   - Ensure device is in portrait orientation
   - Note screen dimensions

2. **Check Layout**
   - [ ] No horizontal scrolling
   - [ ] Sidebar hidden (mobile) or visible (tablet)
   - [ ] Hamburger menu visible (mobile) or hidden (tablet)
   - [ ] All content accessible
   - [ ] Text is readable

3. **Test Typography**
   - [ ] Title text readable (≥16px)
   - [ ] Body text readable (≥14px)
   - [ ] Labels readable (≥12px)
   - [ ] Vietnamese diacritics don't overlap
   - [ ] Line height adequate (1.5-1.6)

4. **Test Grid Layouts**
   - Navigate to Hero Selection
   - [ ] Mobile: 2 columns
   - [ ] Tablet: 3 columns
   - [ ] Desktop: 4 columns
   - Take screenshot

5. **Test Spacing**
   - [ ] Padding appropriate (12-16px)
   - [ ] Gap between elements (8-12px)
   - [ ] Touch targets spaced (8px minimum)
   - [ ] No overlapping elements

#### Step 2: Landscape Mode Testing

1. **Rotate Device to Landscape**
   - Rotate device 90 degrees
   - Wait for orientation transition

2. **Check Layout Adaptation**
   - [ ] Layout adapts smoothly
   - [ ] Transition overlay appears
   - [ ] Message: "Đang điều chỉnh bố cục..."
   - [ ] Transition completes in ~300ms
   - [ ] No layout shift or flicker

3. **Verify Landscape Layout**
   - [ ] All content accessible
   - [ ] No horizontal scrolling
   - [ ] Text remains readable
   - [ ] Touch targets accessible
   - Take screenshot

4. **Test Grid Layouts in Landscape**
   - Navigate to Hero Selection
   - Verify column count adjusts
   - Take screenshot

#### Step 3: Orientation Change Testing

1. **Rapid Orientation Changes**
   - Rotate device portrait → landscape → portrait
   - Repeat 3-5 times quickly
   - [ ] No crashes
   - [ ] No layout issues
   - [ ] State preserved

2. **Orientation During Interaction**
   - Open a modal
   - Rotate device
   - [ ] Modal remains open
   - [ ] Modal adapts to new orientation
   - [ ] Content remains accessible

3. **Orientation During Animation**
   - Start an animation
   - Rotate device during animation
   - [ ] Animation continues or restarts gracefully
   - [ ] No visual glitches

### Phase 4: Touch Controls Testing (30 minutes per device)

#### Step 1: Button Touch Testing

1. **Navigate to Main Menu**
   - Tap all menu buttons
   - [ ] All buttons respond immediately
   - [ ] Visual feedback on tap (scale/color)
   - [ ] No accidental double-taps
   - [ ] No zoom on double-tap

2. **Measure Touch Targets**
   - Use developer tools or visual inspection
   - [ ] All buttons ≥44×44px
   - [ ] Adequate spacing (≥8px)
   - [ ] Easy to tap accurately

3. **Test Touch Feedback**
   - Tap and hold buttons
   - [ ] Pressed state visible
   - [ ] Release cancels action if moved off button
   - [ ] Feedback is immediate (<100ms)

#### Step 2: Map Pan/Zoom Testing

1. **Navigate to Game Map**
   - Open game map view
   - Ensure map is loaded

2. **Test Pan Gesture**
   - Single-finger drag to pan
   - [ ] Pan is smooth (60 FPS)
   - [ ] Pan is responsive (no lag)
   - [ ] Pan respects boundaries
   - [ ] Pan animation is smooth

3. **Test Zoom Gesture**
   - Pinch with two fingers to zoom
   - [ ] Zoom is smooth (60 FPS)
   - [ ] Zoom is responsive (no lag)
   - [ ] Zoom respects min/max limits
   - [ ] Zoom centers on pinch point

4. **Test Combined Gestures**
   - Pan while zooming
   - [ ] Both gestures work simultaneously
   - [ ] No gesture conflicts
   - [ ] Smooth interaction

5. **Test Edge Cases**
   - Pan to map edge
   - [ ] Can't pan beyond boundary
   - [ ] Rubber band effect (iOS) or hard stop (Android)
   - Zoom to maximum
   - [ ] Can't zoom beyond max
   - Zoom to minimum
   - [ ] Can't zoom beyond min

#### Step 3: Swipe Gesture Testing

1. **Test Drawer Swipe**
   - Swipe from left edge
   - [ ] Drawer opens smoothly
   - [ ] Swipe is responsive
   - [ ] Threshold is appropriate

2. **Test Drawer Close**
   - Swipe right on open drawer
   - [ ] Drawer closes smoothly
   - [ ] Can also tap backdrop to close
   - [ ] Can also tap close button

3. **Test Swipe Conflicts**
   - Try to swipe on map
   - [ ] Map pan doesn't trigger drawer
   - [ ] Gestures are distinct

#### Step 4: Form Input Testing

1. **Navigate to Settings or Profile**
   - Find text input fields

2. **Test Text Input**
   - Tap input field
   - [ ] Keyboard appears
   - [ ] Input scrolls into view above keyboard
   - [ ] Input value visible
   - [ ] Keyboard type appropriate (text/number/email)

3. **Test Input Zoom**
   - Tap input with small font
   - [ ] iOS doesn't zoom if font ≥16px
   - [ ] Input remains usable

4. **Test Select/Dropdown**
   - Tap select element
   - [ ] Native picker appears
   - [ ] Options readable
   - [ ] Selection works correctly

### Phase 5: Mobile UI Testing (30 minutes per device)

#### Step 1: Collapsible Sidebar Testing

1. **Test on Mobile (<768px)**
   - [ ] Sidebar hidden by default
   - [ ] Hamburger button visible (44×44px)
   - [ ] Tap hamburger opens drawer
   - [ ] Drawer slides from left
   - [ ] Drawer animation smooth (300ms)
   - [ ] Backdrop overlay visible

2. **Test Drawer Close Methods**
   - [ ] Close button works (44×44px)
   - [ ] Swipe right closes
   - [ ] Tap backdrop closes
   - [ ] Escape key closes (if keyboard)

3. **Test on Tablet (≥768px)**
   - [ ] Sidebar visible at fixed width
   - [ ] Hamburger button hidden
   - [ ] Sidebar always accessible

#### Step 2: Collapsible Panels Testing

1. **Navigate to Combat View**
   - Open combat view

2. **Test on Mobile**
   - [ ] Combat log accessible via button
   - [ ] Abilities accessible via button
   - [ ] Buttons are 44×44px
   - [ ] Panels open as full-screen overlays
   - [ ] Panels can be closed easily

3. **Test Panel Interactions**
   - Open combat log panel
   - [ ] Panel slides in smoothly
   - [ ] Content is readable
   - [ ] Can scroll if needed
   - Close panel
   - [ ] Panel closes smoothly
   - [ ] Main content visible again

#### Step 3: Resource Display Testing

1. **Navigate to Resource Display**
   - View resource display component

2. **Check Mobile Optimization**
   - [ ] Compact layout
   - [ ] Icons sized appropriately (20-24px)
   - [ ] Values readable (16-18px)
   - [ ] Progress bars visible (60-80px)
   - [ ] Tooltip hint hidden on mobile
   - [ ] No horizontal scrolling

3. **Test Responsive Behavior**
   - Rotate device
   - [ ] Layout adapts
   - [ ] All resources visible
   - [ ] Values remain readable

#### Step 4: Modal Testing

1. **Open Various Modals**
   - Settings modal
   - Save/Load modal
   - Hero detail modal

2. **Test Mobile Modals**
   - [ ] Full-screen on mobile
   - [ ] Rounded corners removed
   - [ ] Uses full viewport height
   - [ ] Content scrollable if needed
   - [ ] Close button accessible (44×44px)
   - [ ] Smooth animations

3. **Test Tablet Modals**
   - [ ] Centered modal (not full-screen)
   - [ ] Rounded corners present
   - [ ] Backdrop visible
   - [ ] Appropriate size

### Phase 6: Mobile Menu System Testing (20 minutes per device)

#### Step 1: Hamburger Menu Testing

1. **Test Menu Button**
   - [ ] Button visible on mobile
   - [ ] Button 44×44px minimum
   - [ ] Clear icon (☰)
   - [ ] Visual feedback on tap

2. **Test Menu Drawer**
   - Tap hamburger button
   - [ ] Drawer opens from left
   - [ ] Slides in smoothly (300ms)
   - [ ] Backdrop overlay visible
   - [ ] All menu items visible

3. **Test Menu Items**
   - [ ] Items are 44×44px height minimum
   - [ ] Clear labels in Vietnamese
   - [ ] Icons present (if applicable)
   - [ ] Active item highlighted
   - [ ] Tap responds immediately

4. **Test Menu Close**
   - [ ] Close button works
   - [ ] Swipe right closes
   - [ ] Tap backdrop closes
   - [ ] Selecting item closes menu

#### Step 2: Bottom Navigation Bar Testing

1. **Check Bar Visibility**
   - [ ] Visible on mobile
   - [ ] Hidden on tablet+
   - [ ] Fixed at bottom
   - [ ] Doesn't overlap content

2. **Test Navigation Items**
   - [ ] Items evenly spaced
   - [ ] Items 44×44px minimum
   - [ ] Clear icons
   - [ ] Labels visible
   - [ ] Active item highlighted
   - [ ] Tap responds immediately

3. **Test Content Padding**
   - Scroll to bottom of page
   - [ ] Content has bottom padding
   - [ ] Last item not hidden by bar

#### Step 3: Full-Screen Modal Testing

1. **Open Modal on Mobile**
   - [ ] Modal is full-screen
   - [ ] No rounded corners
   - [ ] Uses full viewport
   - [ ] Content scrollable

2. **Open Modal on Tablet**
   - [ ] Modal is centered (not full-screen)
   - [ ] Rounded corners present
   - [ ] Appropriate size
   - [ ] Backdrop visible

### Phase 7: Performance Testing (20 minutes per device)

#### Step 1: Load Time Testing

1. **Measure Initial Load (WiFi)**
   - Clear cache
   - Navigate to game URL
   - Start timer
   - Stop when interactive
   - Record time
   - Target: <3 seconds

2. **Measure Initial Load (4G)**
   - Switch to 4G
   - Clear cache
   - Navigate to game URL
   - Measure time
   - Target: <5 seconds

3. **Measure Subsequent Loads**
   - Refresh page
   - Measure time
   - Should be faster (cached)

#### Step 2: Frame Rate Testing

1. **Test Animation Frame Rate**
   - Trigger various animations
   - Observe smoothness
   - [ ] Animations at 60 FPS
   - [ ] No dropped frames
   - [ ] No stuttering

2. **Test Map Pan/Zoom Frame Rate**
   - Pan map continuously
   - [ ] Smooth at 60 FPS
   - Zoom map continuously
   - [ ] Smooth at 60 FPS

3. **Test Game Loop Frame Rate**
   - Play game for 5 minutes
   - [ ] Maintains 60 FPS
   - [ ] No performance degradation

4. **Test Scroll Performance**
   - Scroll long lists
   - [ ] Smooth scrolling
   - [ ] No jank
   - [ ] 60 FPS maintained

#### Step 3: Memory Testing

1. **Monitor Initial Memory**
   - Use browser dev tools
   - Note initial memory usage

2. **Play for 5 Minutes**
   - Interact with game
   - Note memory usage

3. **Play for 15 Minutes**
   - Continue playing
   - Note memory usage
   - [ ] Memory stable
   - [ ] No significant increase

4. **Check for Memory Leaks**
   - Navigate between views multiple times
   - [ ] Memory doesn't continuously increase
   - [ ] No crashes

### Phase 8: Vietnamese Text Testing (15 minutes per device)

#### Step 1: Diacritic Rendering

1. **Check All Text Elements**
   - Titles, labels, buttons, body text
   - [ ] All diacritics render correctly
   - [ ] No missing or broken diacritics
   - [ ] Diacritics don't overlap text
   - [ ] Diacritics not cut off

2. **Test at Different Sizes**
   - Small text (12px)
   - Medium text (14-16px)
   - Large text (18px+)
   - [ ] Diacritics visible at all sizes

#### Step 2: Font Loading

1. **Check Font**
   - [ ] Vietnamese font loads (Noto Sans Vietnamese)
   - [ ] Font is crisp and readable
   - [ ] Fallback works if primary fails

#### Step 3: Readability

1. **Check Font Sizes**
   - [ ] Body text ≥14px
   - [ ] Labels ≥12px
   - [ ] Titles appropriately sized

2. **Check Line Height**
   - [ ] Line height 1.5-1.6
   - [ ] Lines don't overlap
   - [ ] Adequate space for diacritics

3. **Check Text Wrapping**
   - [ ] Text wraps at word boundaries
   - [ ] No awkward breaks
   - [ ] No text overflow

#### Step 4: Content Verification

1. **Check All Vietnamese Content**
   - [ ] Hero names in Vietnamese
   - [ ] Hero descriptions in Vietnamese
   - [ ] Quiz questions in Vietnamese
   - [ ] Menu items in Vietnamese
   - [ ] Error messages in Vietnamese
   - [ ] All game text translated

### Phase 9: Accessibility Testing (20 minutes per device)

#### Step 1: Touch Target Testing

1. **Measure Touch Targets**
   - Use visual inspection or dev tools
   - [ ] All interactive elements ≥44×44px
   - [ ] Meets WCAG 2.1 Level AA

2. **Test Touch Target Spacing**
   - [ ] Minimum 8px spacing
   - [ ] No accidental taps
   - [ ] Easy to tap intended target

#### Step 2: Keyboard Navigation Testing

1. **Connect Bluetooth Keyboard (if available)**
   - Pair keyboard with device

2. **Test Focus Management**
   - Tab through elements
   - [ ] Focus visible on all elements
   - [ ] Focus order logical
   - [ ] Focus indicators clear

3. **Test Keyboard Shortcuts**
   - [ ] Escape closes modals
   - [ ] Escape closes drawers
   - [ ] Tab navigates elements
   - [ ] Enter activates buttons

#### Step 3: Screen Reader Testing

1. **Enable Screen Reader**
   - iOS: VoiceOver (Settings > Accessibility)
   - Android: TalkBack (Settings > Accessibility)

2. **Navigate with Screen Reader**
   - [ ] All elements have labels
   - [ ] Images have alt text
   - [ ] Buttons have accessible names
   - [ ] Status messages announced

3. **Test Interactive Elements**
   - [ ] Buttons announce role and label
   - [ ] Links announce destination
   - [ ] Form inputs announce label and value

#### Step 4: Visual Accessibility

1. **Check Color Contrast**
   - Use contrast checker tool
   - [ ] Text contrast ≥4.5:1
   - [ ] Interactive elements ≥3:1

2. **Test Focus Indicators**
   - Tab through elements
   - [ ] Focus indicators visible
   - [ ] Focus indicators clear
   - [ ] Sufficient contrast

3. **Test Motion Settings**
   - Enable "Reduce Motion" in device settings
   - [ ] Animations disabled or reduced
   - [ ] App remains functional
   - [ ] No motion sickness triggers

### Phase 10: Browser-Specific Testing (15 minutes per browser)

#### iOS Safari Specific

1. **Test 100vh Issue**
   - [ ] Content not cut off by address bar
   - [ ] Layout adapts when address bar hides/shows

2. **Test Input Zoom**
   - Tap input fields
   - [ ] No zoom if font ≥16px
   - [ ] Input remains usable

3. **Test Pinch-to-Zoom on Buttons**
   - Double-tap buttons
   - [ ] No zoom on buttons
   - [ ] `touch-action: manipulation` working

4. **Test Safe Area Insets**
   - On iPhone X or newer
   - [ ] Content not hidden by notch
   - [ ] Content not hidden by home indicator

5. **Test Add to Home Screen**
   - Safari menu > Add to Home Screen
   - [ ] Icon appears on home screen
   - [ ] App opens in standalone mode
   - [ ] Splash screen displays

#### Android Chrome Specific

1. **Test Pull-to-Refresh**
   - Pull down on page
   - [ ] Pull-to-refresh disabled in game
   - [ ] Doesn't interrupt gameplay

2. **Test Hardware Back Button**
   - Press back button
   - [ ] Appropriate behavior (close modal, go back, etc.)
   - [ ] Doesn't exit app unexpectedly

3. **Test Add to Home Screen**
   - Chrome menu > Add to Home Screen
   - [ ] Icon appears on home screen
   - [ ] App opens correctly
   - [ ] Splash screen displays

### Phase 11: Edge Case Testing (15 minutes per device)

#### Step 1: Long Content Testing

1. **Test with Long Text**
   - Find or create long text content
   - [ ] Text wraps correctly
   - [ ] No overflow
   - [ ] Scrollable if needed

2. **Test with Many Items**
   - View lists with many items
   - [ ] List scrolls smoothly
   - [ ] Performance maintained
   - [ ] No layout issues

#### Step 2: Network Issues

1. **Test Slow Network**
   - Throttle network to 3G
   - [ ] Loading indicators shown
   - [ ] App remains responsive
   - [ ] Graceful degradation

2. **Test No Network**
   - Enable airplane mode
   - [ ] Offline message shown
   - [ ] App doesn't crash
   - [ ] Can retry when online

3. **Test Network Recovery**
   - Disable then re-enable network
   - [ ] App recovers gracefully
   - [ ] Data syncs correctly

#### Step 3: Interruption Testing

1. **Test Phone Call**
   - Receive phone call during gameplay
   - [ ] Game pauses
   - [ ] State preserved
   - [ ] Resumes correctly after call

2. **Test App Switching**
   - Switch to another app
   - Return to game
   - [ ] State preserved
   - [ ] No data loss

3. **Test Lock Screen**
   - Lock device during gameplay
   - Unlock device
   - [ ] State preserved
   - [ ] Resumes correctly

### Phase 12: Final Verification (10 minutes per device)

#### Step 1: Complete Checklist Review

1. **Review Testing Checklist**
   - Go through `docs/mobile-browser-testing-checklist.md`
   - Mark all items as tested
   - Note any items that failed

#### Step 2: Screenshot Collection

1. **Organize Screenshots**
   - Ensure all required screenshots captured
   - Name files descriptively
   - Organize by device and category

#### Step 3: Issue Documentation

1. **Document All Issues**
   - Use test report template
   - Include severity, description, steps to reproduce
   - Attach screenshots
   - Suggest fixes

#### Step 4: Performance Metrics

1. **Compile Performance Data**
   - Load times (WiFi, 4G, 3G)
   - Frame rates (animations, map, game loop)
   - Memory usage (initial, 5 min, 15 min)

## Post-Testing

### Step 1: Complete Test Report

1. **Fill in Test Report**
   - Use `docs/mobile-browser-test-report-template.md`
   - Complete all sections
   - Include all metrics and screenshots

### Step 2: Prioritize Issues

1. **Categorize Issues**
   - Critical: Prevents core functionality
   - Major: Significant impact, has workaround
   - Minor: Minimal impact

2. **Create Bug Tickets**
   - One ticket per issue
   - Include all details from test report

### Step 3: Share Results

1. **Review with Team**
   - Present findings
   - Discuss priorities
   - Plan fixes

2. **Update Documentation**
   - Document any new findings
   - Update known issues list
   - Update testing procedures if needed

## Tips for Effective Testing

### General Tips

- Test in a quiet environment
- Take breaks every hour
- Document issues immediately
- Take screenshots liberally
- Test systematically, don't skip steps

### Device Tips

- Keep devices charged
- Use stable network connection
- Clear cache between major tests
- Restart device if issues occur

### Documentation Tips

- Be specific in issue descriptions
- Include exact steps to reproduce
- Note device and browser versions
- Attach screenshots for visual issues

### Time Management

- Allocate 2-3 hours per device
- Take 10-minute breaks every hour
- Don't rush through tests
- Focus on quality over speed

## Conclusion

Following these procedures ensures comprehensive mobile browser testing. The goal is to identify and document all issues so they can be prioritized and fixed before release.

**Remember**: The user experience on mobile is critical. Take the time to test thoroughly and document issues clearly.
