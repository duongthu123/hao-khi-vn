/**
 * Color Contrast Utilities for WCAG Compliance
 * 
 * WCAG 2.1 Level AA Requirements:
 * - Normal text (< 18pt or < 14pt bold): 4.5:1 contrast ratio
 * - Large text (≥ 18pt or ≥ 14pt bold): 3:1 contrast ratio
 * - UI components and graphics: 3:1 contrast ratio
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance according to WCAG formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 4.5 : 7;
  return ratio >= requiredRatio;
}

/**
 * Get WCAG compliance level for a color combination
 */
export function getWCAGLevel(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): 'AAA' | 'AA' | 'Fail' {
  if (meetsWCAGAAA(foreground, background, isLargeText)) {
    return 'AAA';
  }
  if (meetsWCAGAA(foreground, background, isLargeText)) {
    return 'AA';
  }
  return 'Fail';
}

/**
 * Suggest a darker or lighter version of a color to meet contrast requirements
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) throw new Error('Invalid background color');

  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const targetLum = bgLum > 0.5
    ? (bgLum + 0.05) / targetRatio - 0.05  // Darker foreground
    : (bgLum + 0.05) * targetRatio - 0.05; // Lighter foreground

  // Simple approximation - adjust the foreground color
  const fgRgb = hexToRgb(foreground);
  if (!fgRgb) throw new Error('Invalid foreground color');

  const currentLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const adjustment = targetLum / currentLum;

  const newR = Math.min(255, Math.max(0, Math.round(fgRgb.r * adjustment)));
  const newG = Math.min(255, Math.max(0, Math.round(fgRgb.g * adjustment)));
  const newB = Math.min(255, Math.max(0, Math.round(fgRgb.b * adjustment)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Theme color definitions from tailwind.config.ts
 */
export const themeColors = {
  river: {
    50: '#E6F3FF',
    100: '#CCE7FF',
    200: '#99CFFF',
    300: '#66B7FF',
    400: '#339FFF',
    500: '#0066CC',
    600: '#0052A3',
    700: '#003D7A',
    800: '#002952',
    900: '#001429',
  },
  imperial: {
    50: '#FFFBEB',
    100: '#FFF3C6',
    200: '#FFE788',
    300: '#FFD84A',
    400: '#FFC61A',
    500: '#A67C00',
    600: '#8C6900',
    700: '#735600',
    800: '#5A4300',
    900: '#4D3800',
  },
  vietnam: {
    50: '#FEE7E6',
    100: '#FCCFCC',
    200: '#FA9F99',
    300: '#F76F66',
    400: '#F53F33',
    500: '#DA251D',
    600: '#B01E17',
    700: '#851611',
    800: '#5B0F0C',
    900: '#300806',
  },
  bamboo: {
    50: '#F0F9F4',
    100: '#D9F0E3',
    200: '#B3E1C7',
    300: '#8DD2AB',
    400: '#67C38F',
    500: '#2D8B57',
    600: '#257A4A',
    700: '#1E6B3D',
    800: '#1A482E',
    900: '#0D2417',
  },
  lacquer: {
    black: '#1A1A1A',
    red: '#8B0000',
    gold: '#D4AF37',
    brown: '#654321',
  },
  faction: {
    vietnamese: '#DA251D',
    mongol: '#8B0000',
  },
  resource: {
    food: '#257A4A',
    gold: '#A67C00',
    army: '#0066CC',
  },
  rarity: {
    common: '#6B7280',
    rare: '#0066CC',
    epic: '#7C3AED',
    legendary: '#A67C00',
  },
  semantic: {
    success: '#257A4A',
    warning: '#B8860B',
    error: '#DA251D',
    info: '#0066CC',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
};
