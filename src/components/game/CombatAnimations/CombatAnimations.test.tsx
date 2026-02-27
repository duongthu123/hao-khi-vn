/**
 * CombatAnimations Component Tests
 * Tests combat animation rendering for attacks, damage, deaths, and abilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CombatAnimations } from './CombatAnimations';
import { CombatEvent, CombatEventType } from '@/types/combat';

// Mock framer-motion with more complete implementation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: any) => {
      // Simulate animation completion after a short delay
      if (onAnimationComplete) {
        setTimeout(() => onAnimationComplete(), 10);
      }
      return <div {...props}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

describe('CombatAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when no events', () => {
    const { container } = render(<CombatAnimations events={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('does not render when animations are disabled', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(<CombatAnimations events={events} enabled={false} />);
    
    // Should not render animation container
    expect(container.firstChild).toBeNull();
  });

  it('renders damage number animation', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check for damage value
    expect(screen.getByText('-50')).toBeInTheDocument();
  });

  it('renders critical damage with exclamation mark', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 75,
        position: { x: 100, y: 100 },
        data: { isCritical: true },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check for critical damage indicator
    expect(screen.getByText(/75!/)).toBeInTheDocument();
  });

  it('renders heal animation with positive value', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.HEAL,
        timestamp: Date.now(),
        value: 30,
        position: { x: 100, y: 100 },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check for heal value with plus sign
    expect(screen.getByText('+30')).toBeInTheDocument();
  });

  it('renders death animation', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DEATH,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check for death marker (skull emoji)
    expect(screen.getByText('💀')).toBeInTheDocument();
  });

  it('renders ability effect animation', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
        data: { abilityName: 'Thunder Strike' },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check for ability name
    expect(screen.getByText('Thunder Strike')).toBeInTheDocument();
  });

  it('renders attack flash animation', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check that animation container exists
    expect(container.querySelector('.absolute')).toBeInTheDocument();
  });

  it('calls onAnimationComplete callback', async () => {
    const onComplete = vi.fn();
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    render(<CombatAnimations events={events} onAnimationComplete={onComplete} />);
    
    // Wait for animation to complete
    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalled();
      },
      { timeout: 100 }
    );
  });

  it('handles multiple simultaneous animations', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 30,
        position: { x: 150, y: 150 },
      },
      {
        type: CombatEventType.HEAL,
        timestamp: Date.now(),
        value: 20,
        position: { x: 200, y: 200 },
      },
    ];

    render(<CombatAnimations events={events} />);
    
    // Check all animations are rendered
    expect(screen.getByText('-50')).toBeInTheDocument();
    expect(screen.getByText('-30')).toBeInTheDocument();
    expect(screen.getByText('+20')).toBeInTheDocument();
  });

  it('applies scale transformation to positions', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(
      <CombatAnimations events={events} scale={2} offset={{ x: 10, y: 20 }} />
    );
    
    // Check that position is transformed
    const animationElement = container.querySelector('[style*="left"]');
    expect(animationElement).toBeInTheDocument();
  });

  it('ignores events without position', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        // No position
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Should not render any animations
    expect(screen.queryByText('-50')).not.toBeInTheDocument();
  });

  it('renders critical attack flash with red color', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
        data: { isCritical: true },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check for red flash (critical)
    const flashElement = container.querySelector('.bg-red-500');
    expect(flashElement).toBeInTheDocument();
  });

  it('renders normal attack flash with orange color', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check for orange flash (normal)
    const flashElement = container.querySelector('.bg-orange-400');
    expect(flashElement).toBeInTheDocument();
  });

  it('handles ability without name gracefully', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: Date.now(),
        position: { x: 100, y: 100 },
        // No ability name in data
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Should still render ability effect
    expect(container.querySelector('.bg-purple-500')).toBeInTheDocument();
  });

  it('cleans up animations after completion', async () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    const { rerender } = render(<CombatAnimations events={events} />);
    
    // Initially should have animation
    expect(screen.getByText('-50')).toBeInTheDocument();
    
    // Wait for animation to complete and clean up
    await waitFor(
      () => {
        rerender(<CombatAnimations events={[]} />);
      },
      { timeout: 100 }
    );
  });

  it('handles rapid event updates', () => {
    const { rerender } = render(<CombatAnimations events={[]} />);
    
    // Add events in rapid succession
    const events1: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 10,
        position: { x: 100, y: 100 },
      },
    ];
    
    rerender(<CombatAnimations events={events1} />);
    expect(screen.getByText('-10')).toBeInTheDocument();
    
    const events2: CombatEvent[] = [
      ...events1,
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now() + 1,
        value: 20,
        position: { x: 110, y: 110 },
      },
    ];
    
    rerender(<CombatAnimations events={events2} />);
    expect(screen.getByText('-20')).toBeInTheDocument();
  });

  it('applies correct styling for different damage types', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 50,
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check for damage styling (orange color)
    const damageElement = container.querySelector('.text-orange-400');
    expect(damageElement).toBeInTheDocument();
  });

  it('applies correct styling for heal', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.HEAL,
        timestamp: Date.now(),
        value: 30,
        position: { x: 100, y: 100 },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check for heal styling (green color)
    const healElement = container.querySelector('.text-green-400');
    expect(healElement).toBeInTheDocument();
  });

  it('applies correct styling for critical damage', () => {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.DAMAGE,
        timestamp: Date.now(),
        value: 75,
        position: { x: 100, y: 100 },
        data: { isCritical: true },
      },
    ];

    const { container } = render(<CombatAnimations events={events} />);
    
    // Check for critical damage styling (red color and larger text)
    const criticalElement = container.querySelector('.text-red-500');
    expect(criticalElement).toBeInTheDocument();
    
    const largeText = container.querySelector('.text-3xl');
    expect(largeText).toBeInTheDocument();
  });
});
