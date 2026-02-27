/**
 * Tests for touch target utilities
 */

import {
  MIN_TOUCH_TARGET_SIZE,
  TOUCH_TARGET_SPACING,
  isTouchTargetCompliant,
  calculateTouchTargetPadding,
  hasAdequateSpacing,
  getTouchButtonClasses,
  getTouchSpacingClasses,
} from '../touchTargets';

describe('Touch Target Utilities', () => {
  describe('Constants', () => {
    it('should have correct minimum touch target size', () => {
      expect(MIN_TOUCH_TARGET_SIZE).toBe(44);
    });

    it('should have correct touch target spacing', () => {
      expect(TOUCH_TARGET_SPACING).toBe(8);
    });
  });

  describe('isTouchTargetCompliant', () => {
    it('should return true for compliant touch targets', () => {
      expect(isTouchTargetCompliant(44, 44)).toBe(true);
      expect(isTouchTargetCompliant(48, 48)).toBe(true);
      expect(isTouchTargetCompliant(50, 60)).toBe(true);
    });

    it('should return false for non-compliant touch targets', () => {
      expect(isTouchTargetCompliant(40, 40)).toBe(false);
      expect(isTouchTargetCompliant(44, 40)).toBe(false);
      expect(isTouchTargetCompliant(40, 44)).toBe(false);
      expect(isTouchTargetCompliant(30, 30)).toBe(false);
    });

    it('should handle edge case of exactly minimum size', () => {
      expect(isTouchTargetCompliant(44, 44)).toBe(true);
    });
  });

  describe('calculateTouchTargetPadding', () => {
    it('should calculate correct padding for small content', () => {
      const result = calculateTouchTargetPadding(20, 20);
      expect(result.paddingX).toBe(12); // (44 - 20) / 2
      expect(result.paddingY).toBe(12);
    });

    it('should return zero padding for compliant content', () => {
      const result = calculateTouchTargetPadding(44, 44);
      expect(result.paddingX).toBe(0);
      expect(result.paddingY).toBe(0);
    });

    it('should return zero padding for oversized content', () => {
      const result = calculateTouchTargetPadding(60, 60);
      expect(result.paddingX).toBe(0);
      expect(result.paddingY).toBe(0);
    });

    it('should handle different width and height', () => {
      const result = calculateTouchTargetPadding(30, 50);
      expect(result.paddingX).toBe(7); // (44 - 30) / 2
      expect(result.paddingY).toBe(0); // 50 > 44, no padding needed
    });
  });

  describe('hasAdequateSpacing', () => {
    it('should return true for adequately spaced elements horizontally', () => {
      const element1 = { x: 0, y: 0, width: 44, height: 44 };
      const element2 = { x: 52, y: 0, width: 44, height: 44 }; // 8px gap
      expect(hasAdequateSpacing(element1, element2)).toBe(true);
    });

    it('should return true for adequately spaced elements vertically', () => {
      const element1 = { x: 0, y: 0, width: 44, height: 44 };
      const element2 = { x: 0, y: 52, width: 44, height: 44 }; // 8px gap
      expect(hasAdequateSpacing(element1, element2)).toBe(true);
    });

    it('should return false for elements with insufficient spacing', () => {
      const element1 = { x: 0, y: 0, width: 44, height: 44 };
      const element2 = { x: 48, y: 0, width: 44, height: 44 }; // 4px gap
      expect(hasAdequateSpacing(element1, element2)).toBe(false);
    });

    it('should return false for overlapping elements', () => {
      const element1 = { x: 0, y: 0, width: 44, height: 44 };
      const element2 = { x: 20, y: 20, width: 44, height: 44 }; // Overlapping
      expect(hasAdequateSpacing(element1, element2)).toBe(false);
    });

    it('should handle elements at different positions', () => {
      const element1 = { x: 100, y: 100, width: 44, height: 44 };
      const element2 = { x: 152, y: 100, width: 44, height: 44 }; // 8px gap
      expect(hasAdequateSpacing(element1, element2)).toBe(true);
    });
  });

  describe('getTouchButtonClasses', () => {
    it('should return correct classes for small size', () => {
      const classes = getTouchButtonClasses('sm');
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('min-w-[44px]');
      expect(classes).toContain('min-h-[44px]');
    });

    it('should return correct classes for medium size (default)', () => {
      const classes = getTouchButtonClasses();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('min-w-[44px]');
      expect(classes).toContain('min-h-[44px]');
    });

    it('should return correct classes for large size', () => {
      const classes = getTouchButtonClasses('lg');
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('min-w-[44px]');
      expect(classes).toContain('min-h-[44px]');
    });
  });

  describe('getTouchSpacingClasses', () => {
    it('should return minimum spacing classes', () => {
      const classes = getTouchSpacingClasses('min');
      expect(classes).toBe('gap-2');
    });

    it('should return comfortable spacing classes (default)', () => {
      const classes = getTouchSpacingClasses();
      expect(classes).toBe('gap-3');
    });

    it('should return generous spacing classes', () => {
      const classes = getTouchSpacingClasses('generous');
      expect(classes).toBe('gap-4');
    });
  });
});
