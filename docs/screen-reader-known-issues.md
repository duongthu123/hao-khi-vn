# Screen Reader Known Issues and Fixes

**Document Purpose**: Track known screen reader compatibility issues and their solutions

**Last Updated**: January 2025  
**Status**: Living Document

---

## Overview

This document tracks known issues with screen reader compatibility in the game, along with implemented fixes and workarounds. It serves as a reference for developers and testers to understand common problems and their solutions.

---

## Issue Categories

- **[RESOLVED]** - Issue has been fixed
- **[IN PROGRESS]** - Fix is being implemented
- **[WORKAROUND]** - Temporary solution available
- **[KNOWN LIMITATION]** - Browser/screen reader limitation
- **[INVESTIGATING]** - Issue is being analyzed

---

## Critical Issues (Severity 1)

### None Currently

All critical issues have been resolved. Critical issues are those that completely block screen reader users from accessing core functionality.

---

## High Priority Issues (Severity 2)

### None Currently

All high priority issues have been resolved. High priority issues significantly impact user experience but don't completely block functionality.

---

## Medium Priority Issues (Severity 3)

### [RESOLVED] Canvas Elements Not Accessible

**Issue ID**: SR-001  
**Component**: GameMap, RadarChart  
**Screen Readers Affected**: All  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
Canvas elements (game map, radar charts) were not accessible to screen readers as they only render visual content without semantic information.

**Impact**:
Screen reader users could not access visual game information like unit positions, hero stats, or battlefield state.

**Root Cause**:
Canvas elements are bitmap graphics without inherent accessibility features.

**Solution Implemented**:
1. Added `role="img"` to canvas elements
2. Generated descriptive `aria-label` with complete information
3. Created hidden text descriptions using `.sr-only` class
4. Implemented `GameMapAccessibility` component for dynamic descriptions
5. Added live regions for real-time updates

**Code Example**:
```typescript
<canvas
  role="img"
  aria-label="Biểu đồ radar thống kê tướng. Tấn công: 80, Phòng thủ: 70..."
/>
<div className="sr-only">
  {generateDetailedDescription()}
</div>
```

**Verification**:
- [x] NVDA announces canvas content
- [x] VoiceOver announces canvas content
- [x] Descriptions are comprehensive
- [x] Updates announced in real-time

**Files Modified**:
- `src/components/ui/RadarChart.tsx`
- `src/components/game/GameMap/GameMapAccessibility.tsx`

---

### [RESOLVED] Audio Content Without Captions

**Issue ID**: SR-002  
**Component**: Sound System  
**Screen Readers Affected**: All (benefits deaf/hard of hearing users)  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
Combat sounds, UI sounds, and notifications had no text alternatives, making audio-only information inaccessible.

**Impact**:
Deaf or hard of hearing users missed important audio cues. Screen reader users had no text description of sound events.

**Root Cause**:
Sound effects were played without corresponding text captions or announcements.

**Solution Implemented**:
1. Created `AudioCaption` component for displaying captions
2. Added caption support to `SoundManager`
3. Implemented comprehensive sound descriptions in Vietnamese
4. Added user setting to enable/disable captions
5. Integrated captions with ARIA live regions

**Code Example**:
```typescript
soundManager.enableCaptions((caption) => {
  displayCaption(caption, 3000);
});

// Caption announced and displayed
// "Bộ binh tấn công - Tiếng kiếm chém"
```

**Verification**:
- [x] All sounds have captions
- [x] Captions display visually
- [x] Captions announced by screen readers
- [x] User can toggle captions
- [x] Descriptions are accurate

**Files Modified**:
- `src/components/ui/AudioCaption.tsx`
- `src/lib/audio/soundManager.ts`
- `src/components/game/AccessibilitySettings.tsx`

---

## Low Priority Issues (Severity 4)

### [RESOLVED] Inconsistent Button Labels

**Issue ID**: SR-003  
**Component**: Various UI components  
**Screen Readers Affected**: All  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
Some buttons had generic labels like "button" or inconsistent Vietnamese/English mixing.

**Impact**:
Users couldn't understand button purpose without visual context.

**Root Cause**:
Missing or incomplete `aria-label` attributes on icon buttons and controls.

**Solution Implemented**:
1. Audited all buttons in the application
2. Added descriptive `aria-label` in Vietnamese
3. Ensured consistency across similar buttons
4. Added button state announcements (pressed, expanded)

**Code Example**:
```typescript
// Before
<button>
  <MenuIcon />
</button>

// After
<button aria-label="Mở menu" aria-expanded={isOpen}>
  <MenuIcon aria-hidden="true" />
</button>
```

**Verification**:
- [x] All buttons have labels
- [x] Labels are descriptive
- [x] Labels in Vietnamese
- [x] States announced correctly

**Files Modified**:
- Multiple component files

---

### [RESOLVED] Progress Bars Missing ARIA Attributes

**Issue ID**: SR-004  
**Component**: ResourceDisplay  
**Screen Readers Affected**: All  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
Resource progress bars were visual-only without proper ARIA attributes.

**Impact**:
Screen reader users couldn't determine resource levels or progress.

**Root Cause**:
Progress bars implemented as styled divs without semantic roles.

**Solution Implemented**:
1. Added `role="progressbar"` to all progress indicators
2. Implemented `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
3. Added descriptive `aria-label` for each resource
4. Ensured values update dynamically

**Code Example**:
```typescript
<div
  role="progressbar"
  aria-valuenow={food}
  aria-valuemin={0}
  aria-valuemax={foodCap}
  aria-label={`Lương thực: ${food} trên ${foodCap}`}
>
  {/* Visual progress bar */}
</div>
```

**Verification**:
- [x] Progress bars have proper roles
- [x] Values announced correctly
- [x] Updates announced
- [x] Labels descriptive

**Files Modified**:
- `src/components/game/ResourceDisplay/ResourceDisplay.tsx`

---

## Browser-Specific Issues

### [KNOWN LIMITATION] VoiceOver + Chrome Compatibility

**Issue ID**: SR-005  
**Component**: Various  
**Screen Readers Affected**: VoiceOver on macOS with Chrome  
**Status**: Known Limitation

**Description**:
Some ARIA live regions don't announce consistently in Chrome with VoiceOver, but work correctly in Safari.

**Impact**:
Dynamic content updates may not be announced reliably in Chrome on macOS.

**Root Cause**:
Known compatibility issue between Chrome and VoiceOver. Safari has better VoiceOver integration as both are Apple products.

**Workaround**:
Recommend Safari for macOS users with VoiceOver.

**Recommendation**:
Document in user guide that Safari is the recommended browser for VoiceOver users.

**Tracking**:
- Chromium bug: [Link if available]
- Monitoring for updates

---

### [KNOWN LIMITATION] NVDA + Firefox Focus Mode

**Issue ID**: SR-006  
**Component**: Game Map  
**Screen Readers Affected**: NVDA with Firefox  
**Status**: Known Limitation

**Description**:
NVDA sometimes gets stuck in focus mode on the game map canvas, requiring manual toggle to browse mode.

**Impact**:
Users need to manually switch modes (NVDA+Space) to navigate away from canvas.

**Root Cause**:
Canvas elements with keyboard interaction can trigger focus mode in NVDA.

**Workaround**:
1. Press NVDA+Space to toggle to browse mode
2. Use Tab to navigate away from canvas
3. Documented in user guide

**Recommendation**:
Add hint text near canvas: "Press NVDA+Space if navigation is stuck"

**Tracking**:
- Monitoring NVDA updates for improvements

---

## Performance Issues

### [RESOLVED] Announcement Lag During Combat

**Issue ID**: SR-007  
**Component**: Combat System  
**Screen Readers Affected**: All  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
During intense combat with many simultaneous events, screen reader announcements were delayed or queued up.

**Impact**:
Users received outdated information or overwhelming announcement spam.

**Root Cause**:
Too many rapid updates to ARIA live regions without debouncing or prioritization.

**Solution Implemented**:
1. Implemented announcement debouncing (300ms)
2. Prioritized critical announcements (unit death, player actions)
3. Consolidated related announcements
4. Used `aria-live="polite"` for non-critical updates
5. Limited announcement frequency

**Code Example**:
```typescript
const debouncedAnnounce = useMemo(
  () => debounce((message: string) => {
    setAnnouncement(message);
  }, 300),
  []
);
```

**Verification**:
- [x] No announcement lag
- [x] Critical events announced immediately
- [x] No announcement spam
- [x] Smooth user experience

**Files Modified**:
- `src/components/game/GameMap/GameMapAccessibility.tsx`
- `src/hooks/useMapAnnouncements.ts`

---

## Vietnamese Language Issues

### [RESOLVED] Diacritics Not Pronounced Correctly

**Issue ID**: SR-008  
**Component**: All text content  
**Screen Readers Affected**: NVDA (Windows)  
**Reported**: [Date]  
**Resolved**: [Date]

**Description**:
Vietnamese diacritics (á, à, ả, ã, ạ, etc.) were not pronounced correctly by NVDA's default voice.

**Impact**:
Vietnamese text was difficult to understand or mispronounced.

**Root Cause**:
Default NVDA voice (eSpeak) has limited Vietnamese support.

**Solution Implemented**:
1. Documented recommended NVDA voice settings
2. Added language attribute `lang="vi"` to Vietnamese content
3. Created setup guide for Vietnamese voice installation
4. Tested with Vietnamese-capable voices

**Workaround**:
Install Vietnamese voice pack for NVDA:
1. Open NVDA menu (NVDA+N)
2. Preferences > Settings > Speech
3. Select Vietnamese-capable voice (e.g., Microsoft Hoa)
4. Set language to Vietnamese

**Verification**:
- [x] Language attributes present
- [x] Setup guide created
- [x] Tested with Vietnamese voices
- [x] Pronunciation acceptable

**Files Modified**:
- `src/app/layout.tsx` (added lang="vi")
- `docs/screen-reader-testing-guide.md` (added setup instructions)

---

## Mobile-Specific Issues

### [INVESTIGATING] VoiceOver iOS Gesture Conflicts

**Issue ID**: SR-009  
**Component**: Game Map (touch controls)  
**Screen Readers Affected**: VoiceOver on iOS  
**Status**: Investigating

**Description**:
Some game gestures (swipe to pan, pinch to zoom) conflict with VoiceOver navigation gestures.

**Impact**:
VoiceOver users on iOS may have difficulty with map navigation.

**Root Cause**:
Touch gestures overlap with VoiceOver's gesture commands.

**Investigation**:
- Testing alternative control schemes
- Exploring VoiceOver pass-through gestures
- Considering dedicated accessibility mode for mobile

**Temporary Workaround**:
Use VoiceOver rotor to switch to "Direct Touch" mode for map interaction.

**Next Steps**:
1. Complete mobile accessibility testing
2. Implement alternative control scheme if needed
3. Document mobile-specific instructions

---

## Fixes Implemented

### Summary of Accessibility Improvements

#### Phase 1: Core Accessibility (Completed)
- [x] Keyboard navigation system
- [x] ARIA labels and semantic HTML
- [x] Color contrast compliance
- [x] Text alternatives for visual content
- [x] Audio captions system

#### Phase 2: Screen Reader Optimization (Completed)
- [x] Canvas accessibility
- [x] Live region announcements
- [x] Progress bar ARIA attributes
- [x] Button label consistency
- [x] Modal focus management

#### Phase 3: Performance and Polish (Completed)
- [x] Announcement debouncing
- [x] Prioritized announcements
- [x] Vietnamese language support
- [x] Comprehensive testing

---

## Testing Results

### NVDA (Windows)
- **Version Tested**: 2023.3
- **Browser**: Chrome 120, Firefox 121, Edge 120
- **Status**: ✅ All core features accessible
- **Known Issues**: None critical

### VoiceOver (macOS)
- **Version Tested**: macOS 14.2
- **Browser**: Safari 17, Chrome 120
- **Status**: ✅ All core features accessible
- **Known Issues**: Chrome compatibility (minor)

### VoiceOver (iOS)
- **Version Tested**: iOS 17.2
- **Device**: iPhone 14
- **Status**: ⚠️ Mostly accessible, gesture conflicts under investigation
- **Known Issues**: Map gesture conflicts (investigating)

---

## Best Practices Established

### For Developers

1. **Always add aria-label to icon buttons**
   ```typescript
   <button aria-label="Descriptive action">
     <Icon aria-hidden="true" />
   </button>
   ```

2. **Use semantic HTML first, ARIA second**
   ```typescript
   // Good
   <button>Click me</button>
   
   // Only if necessary
   <div role="button" tabIndex={0}>Click me</div>
   ```

3. **Implement proper live regions**
   ```typescript
   <div aria-live="polite" aria-atomic="false">
     {dynamicContent}
   </div>
   ```

4. **Provide text alternatives for visual content**
   ```typescript
   <canvas role="img" aria-label="Detailed description">
   <div className="sr-only">{textAlternative}</div>
   ```

5. **Test with actual screen readers**
   - Don't rely solely on automated tools
   - Test with NVDA and VoiceOver minimum
   - Test keyboard navigation thoroughly

### For Testers

1. **Test systematically using checklist**
2. **Document exact screen reader output**
3. **Test with multiple browsers**
4. **Verify Vietnamese pronunciation**
5. **Test dynamic content updates**
6. **Check performance under load**

---

## Future Improvements

### Planned Enhancements

1. **Enhanced Mobile Support**
   - Resolve iOS gesture conflicts
   - Optimize for mobile screen readers
   - Add mobile-specific accessibility mode

2. **Voice Control Integration**
   - Explore voice command support
   - Integrate with Web Speech API
   - Add voice navigation option

3. **Customizable Announcements**
   - Allow users to configure verbosity
   - Customize announcement priorities
   - Add announcement history

4. **Improved Vietnamese Support**
   - Better voice recommendations
   - Pronunciation guides
   - Regional dialect support

5. **Accessibility Analytics**
   - Track screen reader usage
   - Identify common issues
   - Measure accessibility improvements

---

## Reporting New Issues

### How to Report

1. **Check this document** - Issue may already be known
2. **Use issue template** - See `screen-reader-testing-guide.md`
3. **Include details**:
   - Screen reader and version
   - Browser and version
   - Operating system
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Screen reader output

### Issue Tracking

All screen reader issues are tracked in:
- **GitHub Issues**: [Link to repository]
- **Internal Tracker**: [Link if applicable]
- **This Document**: Updated regularly

---

## Resources

### Documentation
- [Screen Reader Testing Guide](./screen-reader-testing-guide.md)
- [Screen Reader Testing Checklist](./screen-reader-testing-checklist.md)
- [Screen Reader Quick Reference](./screen-reader-quick-reference.md)

### External Resources
- **NVDA**: https://www.nvaccess.org/
- **WebAIM**: https://webaim.org/articles/screenreader_testing/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

---

## Changelog

### January 2025
- Initial document created
- Documented all resolved issues
- Added known limitations
- Established best practices

---

**Document Maintained By**: Development Team  
**Review Frequency**: Monthly  
**Last Review**: January 2025  
**Next Review**: February 2025

---

**Note**: This is a living document. As new issues are discovered and resolved, this document will be updated to reflect the current state of screen reader accessibility.
