/**
 * Tests for FloatingText component
 * Validates Requirements 6.8 and 22.6 (animation disable for accessibility)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloatingText, FloatingTextItem } from '../FloatingText';
import { ResourceType } from '@/types/resource';
import * as useAnimationsHook from '@/hooks/useAnimations';

// Mock the useAnimations hook
vi.mock('@/hooks/useAnimations', () => ({
  useAnimations: vi.fn(),
}));

describe('FloatingText - Animation Disable', () => {
  const mockOnComplete = vi.fn();

  const sampleItems: FloatingTextItem[] = [
    {
      id: '1',
      text: '100',
      type: 'gain',
      resourceType: ResourceType.GOLD,
      x: 100,
      y: 100,
    },
    {
      id: '2',
      text: '50',
      type: 'loss',
      resourceType: ResourceType.FOOD,
      x: 200,
      y: 200,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render floating text when animations are enabled', () => {
    // Mock animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);

    const { container } = render(
      <FloatingText items={sampleItems} onComplete={mockOnComplete} />
    );

    // Should render the container
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('should not render floating text when animations are disabled', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    const { container } = render(
      <FloatingText items={sampleItems} onComplete={mockOnComplete} />
    );

    // Should not render anything
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('should render multiple floating text items when animations are enabled', () => {
    // Mock animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);

    const { container } = render(
      <FloatingText items={sampleItems} onComplete={mockOnComplete} />
    );

    // Should render both items
    const floatingElements = container.querySelectorAll('.absolute.pointer-events-none');
    expect(floatingElements.length).toBeGreaterThan(0);
  });

  it('should return null when animations are disabled', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    const { container } = render(
      <FloatingText items={sampleItems} onComplete={mockOnComplete} />
    );

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should handle empty items array when animations are enabled', () => {
    // Mock animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);

    const { container } = render(
      <FloatingText items={[]} onComplete={mockOnComplete} />
    );

    // Should render container but no items
    expect(container.querySelector('.fixed')).toBeInTheDocument();
    const floatingElements = container.querySelectorAll('.absolute.pointer-events-none');
    expect(floatingElements.length).toBe(0);
  });

  it('should handle empty items array when animations are disabled', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    const { container } = render(
      <FloatingText items={[]} onComplete={mockOnComplete} />
    );

    // Should not render anything
    expect(container.firstChild).toBeNull();
  });
});
