# Screen Reader Quick Reference

**Quick access guide for screen reader testing and usage**

## Screen Reader Shortcuts

### NVDA (Windows)

#### Essential Commands
| Shortcut | Action |
|----------|--------|
| **Insert** or **CapsLock** | NVDA modifier key |
| **NVDA+Q** | Quit NVDA |
| **NVDA+N** | Open NVDA menu |
| **NVDA+1** | Toggle input help mode |
| **NVDA+Space** | Toggle focus/browse mode |

#### Navigation
| Shortcut | Action |
|----------|--------|
| **Tab** | Next focusable element |
| **Shift+Tab** | Previous focusable element |
| **H** | Next heading |
| **Shift+H** | Previous heading |
| **1-6** | Next heading level 1-6 |
| **B** | Next button |
| **Shift+B** | Previous button |
| **F** | Next form field |
| **Shift+F** | Previous form field |
| **L** | Next list |
| **I** | Next list item |
| **D** | Next landmark |
| **Shift+D** | Previous landmark |
| **K** | Next link |
| **Shift+K** | Previous link |

#### Reading
| Shortcut | Action |
|----------|--------|
| **NVDA+Down Arrow** | Read current line |
| **NVDA+Up Arrow** | Read from top |
| **NVDA+A** | Read all |
| **Ctrl** | Stop reading |
| **Insert+T** | Read window title |

#### Lists and Navigation
| Shortcut | Action |
|----------|--------|
| **NVDA+F7** | Elements list (links, headings, etc.) |
| **NVDA+F** | Find text |
| **NVDA+F3** | Find next |

---

### VoiceOver (macOS)

#### Essential Commands
| Shortcut | Action |
|----------|--------|
| **Cmd+F5** | Toggle VoiceOver on/off |
| **VO** | Control+Option (modifier keys) |
| **VO+H** | VoiceOver help |
| **VO+M** | Open menu bar |

#### Navigation
| Shortcut | Action |
|----------|--------|
| **VO+Right Arrow** | Next item |
| **VO+Left Arrow** | Previous item |
| **VO+Space** | Activate item |
| **VO+Shift+Down** | Interact with item |
| **VO+Shift+Up** | Stop interacting |
| **Tab** | Next focusable element |
| **Shift+Tab** | Previous focusable element |

#### Rotor Navigation
| Shortcut | Action |
|----------|--------|
| **VO+U** | Open rotor |
| **Left/Right Arrow** | Change rotor category |
| **Up/Down Arrow** | Navigate within category |
| **VO+Cmd+H** | Headings menu |
| **VO+Cmd+L** | Links menu |
| **VO+Cmd+X** | Form controls menu |

#### Reading
| Shortcut | Action |
|----------|--------|
| **VO+A** | Start reading |
| **Ctrl** | Stop reading |
| **VO+P** | Read paragraph |
| **VO+S** | Read sentence |
| **VO+W** | Read word |

---

### VoiceOver (iOS)

#### Essential Gestures
| Gesture | Action |
|---------|--------|
| **Swipe Right** | Next item |
| **Swipe Left** | Previous item |
| **Double Tap** | Activate item |
| **Triple Tap** | Double-tap item |
| **Two-finger Tap** | Pause/resume speaking |

#### Reading
| Gesture | Action |
|---------|--------|
| **Two-finger Swipe Up** | Read from top |
| **Two-finger Swipe Down** | Read from current position |
| **Three-finger Swipe Up/Down** | Scroll page |
| **Three-finger Swipe Left/Right** | Navigate pages |

#### Rotor
| Gesture | Action |
|---------|--------|
| **Rotate Two Fingers** | Open rotor |
| **Swipe Up/Down** | Navigate by rotor setting |

---

## Game-Specific Navigation

### Main Menu
- **Tab** through menu options
- **Enter** to select
- **Escape** to go back

### Hero Selection
- **Tab** to navigate heroes
- **Enter** to view details
- **Space** to select hero
- **Escape** to cancel

### Combat
- **Tab** to select units
- **1-9** for quick actions
- **Space** to confirm action
- **P** to pause

### Resource Display
- Navigate with **Tab**
- Resources announced automatically
- Use **NVDA+Down** or **VO+A** to read current state

### Game Map
- **Arrow Keys** to pan
- **+/-** to zoom
- **Tab** to select units
- **Enter** to confirm selection

### Quiz
- **Tab** through questions and answers
- **Space** to select answer
- **Enter** to submit
- **Escape** to exit quiz

### Save/Load
- **Tab** through save slots
- **Enter** to select slot
- **Delete** to remove save
- **Escape** to cancel

---

## Expected Announcements

### Page Load
```
"Đại Chiến Sử Việt - Hào Khí Đông A"
"Vietnamese Historical Strategy Game application"
"Main content region"
```

### Hero Selection
```
"Trần Hưng Đạo"
"Đại Việt faction"
"Legendary rarity"
"Button, select hero"
```

### Combat
```
"Bộ binh selected, health 80 out of 100"
"Bộ binh attacks Kỵ binh, deals 25 damage"
"Kỵ binh defeated"
```

### Resources
```
"Lương thực: 100 trên 1000"
"Lương thực progress, 10 percent"
"Generation rate: +5 mỗi giây"
```

### Notifications
```
"Game saved successfully"
"Low food warning"
"Level up! Now level 5"
```

---

## Common Issues and Quick Fixes

### Issue: Element Not Announced
**Quick Fix**: Check if element has `aria-label` or text content

### Issue: Wrong Information Announced
**Quick Fix**: Verify `aria-label` matches visual content

### Issue: Updates Not Announced
**Quick Fix**: Check for `aria-live` region

### Issue: Can't Navigate to Element
**Quick Fix**: Ensure element is focusable (tabindex)

### Issue: Keyboard Trap
**Quick Fix**: Press **Escape** or **Shift+Tab** repeatedly

### Issue: Too Many Announcements
**Quick Fix**: Use **Ctrl** to stop reading, navigate manually

---

## Testing Quick Checklist

### Before Testing
- [ ] Screen reader running
- [ ] Browser updated
- [ ] Application loaded
- [ ] Input help mode off (NVDA+1)

### Core Tests (5 minutes)
- [ ] Page title announced
- [ ] Navigate by headings (H key)
- [ ] Navigate by landmarks (D key)
- [ ] Tab through interactive elements
- [ ] Test one button activation
- [ ] Test one form field
- [ ] Trigger one notification

### Game Tests (10 minutes)
- [ ] Navigate main menu
- [ ] Select a hero
- [ ] View resources
- [ ] Perform one combat action
- [ ] Answer one quiz question
- [ ] Save game
- [ ] Load game

### Pass Criteria
- [ ] All elements have labels
- [ ] Navigation is logical
- [ ] Actions provide feedback
- [ ] No keyboard traps
- [ ] Updates are announced

---

## Troubleshooting

### NVDA Not Speaking
1. Check volume settings
2. Restart NVDA (NVDA+Q, then restart)
3. Check synthesizer settings (NVDA+Ctrl+S)
4. Try different browser

### VoiceOver Not Speaking
1. Check volume settings
2. Toggle VoiceOver off/on (Cmd+F5)
3. Check VoiceOver Utility settings
4. Restart browser

### Focus Not Visible
1. Check browser zoom level
2. Verify focus indicators in CSS
3. Try different browser
4. Check high contrast mode

### Announcements Delayed
1. Check system performance
2. Close other applications
3. Reduce animation settings
4. Try different browser

---

## Resources

### Downloads
- **NVDA**: https://www.nvaccess.org/download/
- **JAWS Trial**: https://www.freedomscientific.com/downloads/jaws/
- **VoiceOver**: Built into macOS/iOS

### Documentation
- **NVDA User Guide**: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- **VoiceOver Guide**: https://support.apple.com/guide/voiceover/welcome/mac
- **WebAIM**: https://webaim.org/articles/screenreader_testing/

### Testing Tools
- **WAVE**: https://wave.webaim.org/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Accessibility Insights**: https://accessibilityinsights.io/

---

## Quick Tips

### For Testers
1. **Learn the shortcuts** - Efficiency matters
2. **Test systematically** - Follow a checklist
3. **Document everything** - Screenshots and notes
4. **Test edge cases** - Not just happy path
5. **Think like a user** - Would this make sense?

### For Developers
1. **Use semantic HTML** - Native elements first
2. **Add ARIA carefully** - Only when needed
3. **Test early** - Don't wait until the end
4. **Focus management** - Always know where focus is
5. **Descriptive labels** - Be clear and concise

### For Everyone
1. **Accessibility is not optional** - It's a requirement
2. **Real users matter** - Test with actual screen reader users
3. **Stay updated** - Screen readers evolve
4. **Ask for help** - Accessibility community is helpful
5. **Keep learning** - There's always more to learn

---

## Contact and Support

### Internal Resources
- **Accessibility Lead**: [Contact]
- **Development Team**: [Contact]
- **Testing Team**: [Contact]

### External Resources
- **WebAIM Forum**: https://webaim.org/discussion/
- **A11y Slack**: https://web-a11y.slack.com/
- **NVDA Users List**: https://nvda.groups.io/

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: Development Team
