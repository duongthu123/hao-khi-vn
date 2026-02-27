# Color Contrast Quick Reference Guide

## ✅ Safe Colors for Normal Text on White Background

Use these colors confidently for any text size:

| Color | Hex | Contrast | Usage |
|-------|-----|----------|-------|
| `river-500` | `#0066CC` | 5.57:1 ✅ | Info, links, army resource |
| `river-600` | `#0052A3` | 7.68:1 ✅ | Darker blue text |
| `river-700` | `#003D7A` | 10.78:1 ✅ | Very dark blue |
| `imperial-600` | `#8C6900` | 5.08:1 ✅ | Gold text |
| `imperial-700` | `#735600` | 6.86:1 ✅ | Darker gold |
| `vietnam-500` | `#DA251D` | 4.93:1 ✅ | Primary red, error |
| `vietnam-600` | `#B01E17` | 6.90:1 ✅ | Darker red |
| `bamboo-600` | `#257A4A` | 5.30:1 ✅ | Success, food resource |
| `bamboo-700` | `#1E6B3D` | 7.43:1 ✅ | Darker green |
| `gray-500` | `#6B7280` | 4.61:1 ✅ | Common rarity |
| `gray-600` | `#4B5563` | 7.00:1 ✅ | Body text |
| `gray-700` | `#374151` | 10.70:1 ✅ | Dark text |

## ⚠️ Large Text Only (≥ 18pt or ≥ 14pt bold)

Use these colors only for headings and large text:

| Color | Hex | Contrast | Usage |
|-------|-----|----------|-------|
| `imperial-500` | `#A67C00` | 3.82:1 ⚠️ | Large headings only |
| `bamboo-500` | `#2D8B57` | 4.25:1 ⚠️ | Large text only |
| `warning` | `#B8860B` | 3.25:1 ⚠️ | Large warnings only |

## 🎨 Color Combinations

### White Text on Colored Backgrounds

| Background | Contrast | Status |
|------------|----------|--------|
| `bg-river-500` | 5.57:1 | ✅ AA |
| `bg-vietnam-500` | 4.93:1 | ✅ AA |
| `bg-bamboo-600` | 5.30:1 | ✅ AA |
| `bg-imperial-600` | 5.08:1 | ✅ AA |

### Dark Text on Light Backgrounds

| Combination | Contrast | Status |
|-------------|----------|--------|
| `text-river-800` on `bg-river-50` | 11.2:1 | ✅ AAA |
| `text-vietnam-700` on `bg-vietnam-50` | 9.8:1 | ✅ AAA |
| `text-bamboo-800` on `bg-bamboo-50` | 10.5:1 | ✅ AAA |

## 📋 Common Use Cases

### Resource Display
```tsx
<span className="text-bamboo-600">🌾 Food</span>
<span className="text-imperial-600">💰 Gold</span>
<span className="text-river-500">⚔️ Army</span>
```

### Rarity Badges
```tsx
<span className="text-gray-500">Common</span>
<span className="text-river-500">Rare</span>
<span className="text-[#7C3AED]">Epic</span>
<span className="text-imperial-600">Legendary</span>
```

### Semantic Messages
```tsx
<div className="text-bamboo-600">✓ Success</div>
<div className="text-river-500">ℹ Info</div>
<div className="text-vietnam-500">✗ Error</div>
<div className="text-xl text-warning">⚠ Warning (large text)</div>
```

### Buttons
```tsx
<button className="bg-river-500 text-white">Primary</button>
<button className="bg-vietnam-500 text-white">Danger</button>
<button className="bg-bamboo-600 text-white">Success</button>
```

## 🚫 Avoid These Combinations

| Combination | Contrast | Issue |
|-------------|----------|-------|
| `text-imperial-500` (normal text) | 3.82:1 | Too light |
| `text-bamboo-500` (normal text) | 4.25:1 | Borderline |
| `text-warning` (normal text) | 3.25:1 | Too light |
| `text-river-400` | 3.12:1 | Too light |
| `text-imperial-400` | 2.45:1 | Too light |

## 🔧 Testing Your Colors

Use the provided utility:

```typescript
import { getContrastRatio, meetsWCAGAA } from '@/lib/utils/colorContrast';

// Check contrast ratio
const ratio = getContrastRatio('#0066CC', '#FFFFFF');
console.log(ratio); // 5.57

// Check WCAG AA compliance
const passes = meetsWCAGAA('#0066CC', '#FFFFFF', false);
console.log(passes); // true
```

## 📱 Mobile Considerations

On mobile devices, prefer higher contrast colors:
- Use 600-700 variants instead of 500
- Increase font sizes for better readability
- Test in bright sunlight conditions

## 🌙 Dark Mode (Future)

When implementing dark mode, retest all colors:
- Light colors on dark backgrounds need different ratios
- Some colors may need separate dark mode variants
- Run the test suite with dark backgrounds

## ✨ Quick Tips

1. **When in doubt, go darker** - Use 600 or 700 variants
2. **Test with real content** - Don't rely on color swatches alone
3. **Consider context** - Small text needs higher contrast
4. **Use the tests** - Run `npm test color-contrast.test.ts`
5. **Preserve theme** - Darker doesn't mean less Vietnamese!

---

**Last Updated**: Task 15.3 completion  
**WCAG Level**: AA (4.5:1 normal, 3:1 large)  
**Compliance**: 100%
