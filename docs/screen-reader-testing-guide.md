# Screen Reader Testing Guide

## Overview

This guide provides comprehensive procedures for testing the game with screen readers to ensure full accessibility for visually impaired users. The game must be fully navigable and playable using screen readers alone.

**Requirement**: 22.8 - THE Game_Application SHALL test with screen readers (NVDA, JAWS, or VoiceOver)

## Supported Screen Readers

### Primary Testing Platforms

1. **NVDA (NonVisual Desktop Access)** - Windows
   - Free and open-source
   - Most popular Windows screen reader
   - Download: https://www.nvaccess.org/

2. **VoiceOver** - macOS/iOS
   - Built into Apple devices
   - Native integration with Safari
   - Activated: Cmd+F5 (macOS) or Settings > Accessibility (iOS)

3. **JAWS (Job Access With Speech)** - Windows (Optional)
   - Commercial screen reader
   - Industry standard for professional use
   - Most comprehensive Windows screen reader

## Testing Environments

### Windows Testing (NVDA)
- **OS**: Windows 10/11
- **Browser**: Chrome, Firefox, Edge
- **Screen Reader**: NVDA 2023.1+
- **Keyboard**: Full keyboard navigation required

### macOS Testing (VoiceOver)
- **OS**: macOS 12+
- **Browser**: Safari (recommended), Chrome
- **Screen Reader**: VoiceOver (built-in)
- **Keyboard**: Full keyboard navigation required

### iOS Testing (VoiceOver)
- **OS**: iOS 15+
- **Browser**: Safari
- **Screen Reader**: VoiceOver (built-in)
- **Touch**: Gesture-based navigation

## Screen Reader Basics

### NVDA Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| NVDA+Q | Quit NVDA |
| NVDA+N | Open NVDA menu |
| NVDA+1 | Toggle input help |
| Insert | NVDA modifier key |
| Tab | Next element |
| Shift+Tab | Previous element |
| Enter | Activate element |
| Space | Activate button/checkbox |
| Arrow Keys | Navigate within elements |
| H | Next heading |
| Shift+H | Previous heading |
| B | Next button |
| Shift+B | Previous button |
| L | Next list |
| I | Next list item |
| F | Next form field |
| D | Next landmark |
| NVDA+F7 | Elements list |
| NVDA+Space | Focus/browse mode toggle |

### VoiceOver Keyboard Shortcuts (macOS)

| Shortcut | Action |
|----------|--------|
| Cmd+F5 | Toggle VoiceOver |
| VO+H | VoiceOver help |
| VO | Control+Option (modifier) |
| VO+A | Start reading |
| VO+Right Arrow | Next item |
| VO+Left Arrow | Previous item |
| VO+Space | Activate item |
| VO+Shift+Down | Interact with item |
| VO+Shift+Up | Stop interacting |
| VO+U | Rotor (navigation menu) |
| VO+H H | Next heading |
| VO+Cmd+H | Heading menu |
| VO+J | Next form control |

### VoiceOver Gestures (iOS)

| Gesture | Action |
|---------|--------|
| Swipe Right | Next item |
| Swipe Left | Previous item |
| Double Tap | Activate item |
| Two-finger Swipe Up | Read from top |
| Two-finger Swipe Down | Read from current |
| Rotor | Rotate two fingers |
| Three-finger Swipe | Scroll |

## Testing Procedures

### 1. Initial Setup Testing

**Objective**: Verify the application loads and announces correctly

#### Test Steps:
1. Start screen reader before opening browser
2. Navigate to game URL
3. Wait for page to load completely

#### Expected Announcements:
- [ ] Page title announced: "Đại Chiến Sử Việt - Hào Khí Đông A"
- [ ] Application role announced: "Vietnamese Historical Strategy Game application"
- [ ] Main landmark identified
- [ ] Loading state announced if applicable

#### Pass Criteria:
- Screen reader announces page structure
- User understands they're in a game application
- No silent loading or confusion

### 2. Landmark Navigation Testing

**Objective**: Verify all page landmarks are properly identified

#### Test Steps:
1. Use landmark navigation (D key in NVDA, VO+U in VoiceOver)
2. Navigate through all landmarks
3. Verify each landmark is announced correctly

#### Expected Landmarks:
- [ ] Banner (header)
- [ ] Main (main content area)
- [ ] Navigation (menu systems)
- [ ] Complementary (sidebar)
- [ ] Contentinfo (footer)

#### Pass Criteria:
- All major page sections have landmarks
- Landmarks have descriptive labels
- User can quickly jump between sections

### 3. Heading Navigation Testing

**Objective**: Verify proper heading hierarchy

#### Test Steps:
1. Use heading navigation (H key in NVDA, VO+Cmd+H in VoiceOver)
2. Navigate through all headings
3. Verify logical hierarchy (H1 → H2 → H3)

#### Expected Headings:
- [ ] H1: Main game title
- [ ] H2: Major section titles (Menu, Resources, Combat, etc.)
- [ ] H3: Subsection titles
- [ ] No skipped heading levels

#### Pass Criteria:
- Heading hierarchy is logical
- No heading levels skipped
- User can understand page structure from headings

### 4. Keyboard Navigation Testing

**Objective**: Verify all interactive elements are keyboard accessible

#### Test Steps:
1. Use Tab key to navigate through all interactive elements
2. Verify focus order is logical
3. Test all keyboard shortcuts

#### Expected Behavior:
- [ ] All buttons are focusable
- [ ] All form fields are focusable
- [ ] All links are focusable
- [ ] Focus order matches visual layout
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Escape key closes modals
- [ ] Enter key activates buttons

#### Pass Criteria:
- Complete keyboard navigation
- Logical tab order
- All shortcuts work as documented

### 5. Button and Control Testing

**Objective**: Verify all buttons announce correctly

#### Test Steps:
1. Navigate to each button using Tab or B key
2. Verify button label and role are announced
3. Activate button and verify result

#### Expected Announcements:
- [ ] Button role: "button"
- [ ] Button label in Vietnamese
- [ ] Button state (pressed, expanded, etc.)
- [ ] Action result announced

#### Test Cases:
- [ ] Menu toggle button
- [ ] Save game button
- [ ] Load game button
- [ ] Hero selection buttons
- [ ] Combat action buttons
- [ ] Settings buttons

#### Pass Criteria:
- All buttons have descriptive labels
- Button states are announced
- Actions provide feedback

### 6. Form and Input Testing

**Objective**: Verify form fields are accessible

#### Test Steps:
1. Navigate to form fields using Tab or F key
2. Verify field label and type are announced
3. Enter data and verify feedback

#### Expected Announcements:
- [ ] Field label
- [ ] Field type (text, checkbox, select, etc.)
- [ ] Required status
- [ ] Current value
- [ ] Error messages (if applicable)

#### Test Cases:
- [ ] Player name input
- [ ] Save slot selection
- [ ] Settings checkboxes
- [ ] Difficulty selection

#### Pass Criteria:
- All fields have labels
- Field types are clear
- Errors are announced
- Help text is available

### 7. Dynamic Content Testing

**Objective**: Verify live regions announce updates

#### Test Steps:
1. Trigger actions that update content
2. Verify announcements are made
3. Check announcement timing and clarity

#### Expected Announcements:
- [ ] Resource changes: "Lương thực tăng lên 150"
- [ ] Combat events: "Bộ binh tấn công Kỵ binh, gây 25 sát thương"
- [ ] Notifications: "Game đã được lưu"
- [ ] Status changes: "Đơn vị bị choáng"
- [ ] Level changes: "Lên cấp 5"

#### Test Cases:
- [ ] Resource generation
- [ ] Combat actions
- [ ] Save/load operations
- [ ] Hero selection
- [ ] Quiz completion
- [ ] Rank progression

#### Pass Criteria:
- Important updates are announced
- Announcements are timely
- Not too many announcements (no spam)
- Announcements are clear and concise

### 8. Game State Announcement Testing

**Objective**: Verify game state changes are communicated

#### Test Steps:
1. Progress through different game states
2. Verify each state change is announced
3. Check that user understands current state

#### Expected Announcements:
- [ ] Game phase changes: "Entering hero selection"
- [ ] Pause/resume: "Game paused" / "Game resumed"
- [ ] Victory/defeat: "Victory! You have won the battle"
- [ ] Level completion: "Level 3 complete"

#### Test Cases:
- [ ] Menu → Hero Selection
- [ ] Hero Selection → Playing
- [ ] Playing → Paused
- [ ] Playing → Game Over
- [ ] Game Over → Menu

#### Pass Criteria:
- All state changes announced
- User always knows current state
- Clear instructions for next action

### 9. Resource Display Testing

**Objective**: Verify resource information is accessible

#### Test Steps:
1. Navigate to resource display
2. Verify resource values are announced
3. Check progress bar accessibility

#### Expected Announcements:
- [ ] Resource name: "Lương thực"
- [ ] Current value: "100"
- [ ] Maximum value: "trên 1000"
- [ ] Progress bar: "Lương thực progress, 10 percent"
- [ ] Generation rate: "+5 mỗi giây"

#### Test Cases:
- [ ] Food resource
- [ ] Gold resource
- [ ] Army resource
- [ ] Resource caps
- [ ] Generation rates

#### Pass Criteria:
- All resource values accessible
- Progress bars have proper ARIA attributes
- User can understand resource state

### 10. Combat System Testing

**Objective**: Verify combat is understandable via screen reader

#### Test Steps:
1. Enter combat scenario
2. Perform combat actions
3. Verify all events are announced

#### Expected Announcements:
- [ ] Unit selection: "Bộ binh được chọn, máu 80/100"
- [ ] Attack action: "Bộ binh tấn công Kỵ binh, gây 25 sát thương"
- [ ] Unit death: "Kỵ binh đã bị tiêu diệt"
- [ ] Ability use: "Trần Hưng Đạo sử dụng Hào Khí Đông A"
- [ ] Status effects: "Đơn vị bị choáng trong 2 giây"

#### Test Cases:
- [ ] Unit selection
- [ ] Basic attacks
- [ ] Hero abilities
- [ ] Unit deaths
- [ ] Status effects
- [ ] Combat victory/defeat

#### Pass Criteria:
- Combat is playable via audio alone
- All actions provide feedback
- User can understand battle state

### 11. Hero Selection Testing

**Objective**: Verify hero selection is accessible

#### Test Steps:
1. Navigate to hero selection screen
2. Browse available heroes
3. Select a hero and confirm

#### Expected Announcements:
- [ ] Hero name: "Trần Hưng Đạo"
- [ ] Hero faction: "Đại Việt"
- [ ] Hero rarity: "legendary"
- [ ] Hero stats: "Tấn công: 80, Phòng thủ: 70..."
- [ ] Lock status: "Đã mở khóa" / "Chưa mở khóa"
- [ ] Selection confirmation: "Đã chọn Trần Hưng Đạo"

#### Test Cases:
- [ ] Browse hero list
- [ ] View hero details
- [ ] Read hero stats (radar chart)
- [ ] Read hero abilities
- [ ] Select hero
- [ ] Confirm selection

#### Pass Criteria:
- All heroes accessible
- Stats are readable
- Selection process is clear

### 12. Quiz Module Testing

**Objective**: Verify quiz is accessible

#### Test Steps:
1. Start quiz
2. Read question and answers
3. Submit answer and receive feedback

#### Expected Announcements:
- [ ] Question text
- [ ] Answer options (A, B, C, D)
- [ ] Selected answer
- [ ] Correct/incorrect feedback
- [ ] Explanation text
- [ ] Score update

#### Test Cases:
- [ ] Question presentation
- [ ] Answer selection
- [ ] Submit answer
- [ ] Receive feedback
- [ ] View explanation
- [ ] Complete quiz

#### Pass Criteria:
- Questions are readable
- Answers are selectable
- Feedback is clear
- User can complete quiz independently

### 13. Save/Load System Testing

**Objective**: Verify save system is accessible

#### Test Steps:
1. Navigate to save menu
2. Save game to slot
3. Load game from slot
4. Verify all information is accessible

#### Expected Announcements:
- [ ] Save slot number: "Slot 1"
- [ ] Save metadata: "Saved on [date], Level 5, 45% complete"
- [ ] Save action: "Game saved to slot 1"
- [ ] Load action: "Game loaded from slot 1"
- [ ] Empty slot: "Empty save slot"

#### Test Cases:
- [ ] View save slots
- [ ] Save to slot
- [ ] Load from slot
- [ ] Delete save
- [ ] Auto-save notification

#### Pass Criteria:
- All save operations accessible
- Metadata is readable
- User can manage saves independently

### 14. Settings Menu Testing

**Objective**: Verify settings are accessible

#### Test Steps:
1. Open settings menu
2. Navigate through settings
3. Change settings and verify feedback

#### Expected Announcements:
- [ ] Setting name
- [ ] Setting type (checkbox, select, slider)
- [ ] Current value
- [ ] Value change: "Audio captions enabled"

#### Test Cases:
- [ ] Accessibility settings
- [ ] Audio settings
- [ ] Difficulty settings
- [ ] Keyboard shortcuts
- [ ] Language settings

#### Pass Criteria:
- All settings accessible
- Changes are announced
- Settings persist correctly

### 15. Modal Dialog Testing

**Objective**: Verify modals are accessible

#### Test Steps:
1. Open modal dialog
2. Verify focus is trapped
3. Navigate within modal
4. Close modal and verify focus returns

#### Expected Behavior:
- [ ] Focus moves to modal on open
- [ ] Modal role announced: "dialog"
- [ ] Modal title announced
- [ ] Tab cycles within modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger on close

#### Test Cases:
- [ ] Save/load modal
- [ ] Settings modal
- [ ] Hero detail modal
- [ ] Confirmation dialogs
- [ ] Help modal

#### Pass Criteria:
- Focus is trapped in modal
- Modal is announced correctly
- User can close modal easily
- Focus management is correct

### 16. Error Handling Testing

**Objective**: Verify errors are communicated

#### Test Steps:
1. Trigger various error conditions
2. Verify error messages are announced
3. Check error recovery options

#### Expected Announcements:
- [ ] Error message text
- [ ] Error severity (alert role)
- [ ] Recovery instructions
- [ ] Success after recovery

#### Test Cases:
- [ ] Invalid save file
- [ ] Insufficient resources
- [ ] Network error (if applicable)
- [ ] Form validation errors

#### Pass Criteria:
- Errors are announced immediately
- Error messages are clear
- Recovery options are provided

### 17. Notification System Testing

**Objective**: Verify notifications are accessible

#### Test Steps:
1. Trigger various notifications
2. Verify announcements
3. Check notification dismissal

#### Expected Announcements:
- [ ] Notification message
- [ ] Notification type (success, warning, error)
- [ ] Auto-dismiss timing (if applicable)

#### Test Cases:
- [ ] Save success notification
- [ ] Resource warning
- [ ] Achievement unlocked
- [ ] Level up notification
- [ ] Auto-save notification

#### Pass Criteria:
- Notifications are announced
- Type is communicated
- User can dismiss notifications

### 18. Audio Caption Testing

**Objective**: Verify audio captions work correctly

#### Test Steps:
1. Enable audio captions in settings
2. Trigger various sound effects
3. Verify captions appear and are announced

#### Expected Behavior:
- [ ] Caption text appears visually
- [ ] Caption is announced by screen reader
- [ ] Caption describes sound accurately
- [ ] Caption timing is appropriate

#### Test Cases:
- [ ] Combat sounds
- [ ] UI sounds
- [ ] Notification sounds
- [ ] Background music (if applicable)

#### Pass Criteria:
- All sounds have captions
- Captions are accurate
- Captions are announced
- User can understand audio events

### 19. Map Navigation Testing

**Objective**: Verify game map is accessible

#### Test Steps:
1. Navigate to game map
2. Explore map using keyboard
3. Verify map state is described

#### Expected Announcements:
- [ ] Map description: "Battlefield with 5 units, 3 buildings"
- [ ] Selected unit: "Bộ binh, máu 80/100, hướng Bắc"
- [ ] Map position changes
- [ ] Zoom level changes

#### Test Cases:
- [ ] Map overview
- [ ] Unit selection
- [ ] Building selection
- [ ] Pan map
- [ ] Zoom map

#### Pass Criteria:
- Map state is described
- Units are selectable
- User can understand battlefield

### 20. Performance Testing

**Objective**: Verify screen reader performance

#### Test Steps:
1. Use screen reader during active gameplay
2. Monitor announcement lag
3. Check for announcement conflicts

#### Expected Behavior:
- [ ] Announcements are timely (< 500ms delay)
- [ ] No announcement spam
- [ ] Important announcements not interrupted
- [ ] Smooth navigation

#### Test Cases:
- [ ] Active combat
- [ ] Resource generation
- [ ] Multiple simultaneous events
- [ ] Rapid navigation

#### Pass Criteria:
- No significant lag
- Announcements are prioritized correctly
- User experience is smooth

## Common Issues and Fixes

### Issue 1: Silent Elements

**Problem**: Element is visible but not announced

**Diagnosis**:
- Check if element has proper role
- Verify aria-label or text content exists
- Check if element is in tab order

**Fix**:
- Add appropriate ARIA role
- Add aria-label or visible text
- Ensure element is focusable (tabindex)

### Issue 2: Incorrect Announcements

**Problem**: Screen reader announces wrong information

**Diagnosis**:
- Check aria-label vs. text content
- Verify ARIA attributes are correct
- Check for conflicting ARIA

**Fix**:
- Correct aria-label text
- Fix ARIA attribute values
- Remove redundant ARIA

### Issue 3: Missing Live Region Updates

**Problem**: Dynamic content changes not announced

**Diagnosis**:
- Check if aria-live is set
- Verify politeness level
- Check if content actually changes

**Fix**:
- Add aria-live="polite" or "assertive"
- Ensure content updates trigger re-render
- Use LiveRegion component

### Issue 4: Keyboard Trap

**Problem**: User cannot navigate away from element

**Diagnosis**:
- Check focus management
- Verify Tab key behavior
- Check for JavaScript preventing default

**Fix**:
- Implement proper focus trap for modals
- Allow Tab to move focus
- Remove problematic event handlers

### Issue 5: Announcement Spam

**Problem**: Too many announcements overwhelming user

**Diagnosis**:
- Check aria-live usage
- Verify update frequency
- Check for redundant announcements

**Fix**:
- Use aria-live="polite" instead of "assertive"
- Debounce rapid updates
- Consolidate related announcements

### Issue 6: Missing Button Labels

**Problem**: Buttons announced as "button" without description

**Diagnosis**:
- Check for aria-label
- Verify button text content
- Check for aria-labelledby

**Fix**:
- Add aria-label with description
- Add visible text content
- Use aria-labelledby to reference label

### Issue 7: Incorrect Heading Hierarchy

**Problem**: Headings skip levels or are out of order

**Diagnosis**:
- Navigate by headings
- Check heading levels in code
- Verify visual vs. semantic hierarchy

**Fix**:
- Adjust heading levels (H1 → H2 → H3)
- Don't skip levels
- Match visual importance to semantic level

### Issue 8: Progress Bar Not Announced

**Problem**: Progress bars are silent

**Diagnosis**:
- Check for role="progressbar"
- Verify aria-valuenow, aria-valuemin, aria-valuemax
- Check for aria-label

**Fix**:
- Add role="progressbar"
- Add all required ARIA attributes
- Add descriptive aria-label

## Testing Checklist

### Pre-Testing Setup
- [ ] Screen reader installed and configured
- [ ] Browser updated to latest version
- [ ] Test environment prepared
- [ ] Testing documentation ready

### Core Functionality
- [ ] Page loads and announces correctly
- [ ] All landmarks identified
- [ ] Heading hierarchy is logical
- [ ] Complete keyboard navigation
- [ ] All buttons have labels
- [ ] All form fields have labels
- [ ] Focus indicators visible

### Dynamic Content
- [ ] Live regions announce updates
- [ ] Game state changes announced
- [ ] Resource changes announced
- [ ] Combat events announced
- [ ] Notifications announced

### Game Features
- [ ] Hero selection accessible
- [ ] Combat system accessible
- [ ] Quiz module accessible
- [ ] Save/load system accessible
- [ ] Settings menu accessible
- [ ] Map navigation accessible

### Error Handling
- [ ] Errors announced
- [ ] Error messages clear
- [ ] Recovery options provided

### Performance
- [ ] No significant lag
- [ ] No announcement spam
- [ ] Smooth user experience

## Reporting Issues

### Issue Report Template

```markdown
## Screen Reader Issue Report

**Date**: [Date]
**Tester**: [Name]
**Screen Reader**: [NVDA/VoiceOver/JAWS] [Version]
**Browser**: [Browser] [Version]
**OS**: [Operating System]

### Issue Description
[Clear description of the problem]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screen Reader Announcement
[Exact text announced by screen reader]

### Severity
- [ ] Critical (blocks usage)
- [ ] High (major functionality affected)
- [ ] Medium (minor functionality affected)
- [ ] Low (cosmetic or minor issue)

### Screenshots/Video
[If applicable]

### Suggested Fix
[If known]
```

## Best Practices

### For Developers

1. **Test Early and Often**: Don't wait until the end to test with screen readers
2. **Use Semantic HTML**: Prefer native elements over custom ARIA
3. **Provide Context**: Ensure all elements have descriptive labels
4. **Manage Focus**: Always know where focus is and where it should go
5. **Test with Real Users**: Nothing beats testing with actual screen reader users
6. **Document Accessibility**: Keep accessibility documentation up to date
7. **Automate Where Possible**: Use automated tools to catch common issues
8. **Stay Updated**: Screen readers evolve, keep testing with latest versions

### For Testers

1. **Learn the Screen Reader**: Become proficient with keyboard shortcuts
2. **Test Systematically**: Follow testing procedures methodically
3. **Document Everything**: Record all issues with clear reproduction steps
4. **Prioritize Issues**: Focus on critical accessibility barriers first
5. **Verify Fixes**: Re-test after fixes are implemented
6. **Think Like a User**: Consider the actual user experience
7. **Test Edge Cases**: Don't just test the happy path
8. **Provide Feedback**: Clear, actionable feedback helps developers

## Resources

### Screen Reader Downloads
- **NVDA**: https://www.nvaccess.org/download/
- **JAWS**: https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver**: Built into macOS/iOS

### Documentation
- **NVDA User Guide**: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- **VoiceOver User Guide**: https://support.apple.com/guide/voiceover/welcome/mac
- **JAWS Documentation**: https://www.freedomscientific.com/training/jaws/

### Testing Tools
- **WAVE**: https://wave.webaim.org/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Lighthouse**: Built into Chrome DevTools

### Standards
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

## Conclusion

Comprehensive screen reader testing is essential for ensuring the game is accessible to all users. By following these procedures and addressing issues systematically, we can create an inclusive gaming experience that meets WCAG 2.1 standards and provides equal access to Vietnamese historical education and entertainment.

Remember: Accessibility is not a feature, it's a fundamental requirement for inclusive design.
