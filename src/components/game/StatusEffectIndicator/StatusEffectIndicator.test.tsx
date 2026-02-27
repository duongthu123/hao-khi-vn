/**
 * StatusEffectIndicator Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusEffectIndicator } from './StatusEffectIndicator';
import { StatusEffect, StatusEffectType } from '@/types/unit';

describe('StatusEffectIndicator', () => {
  it('should render nothing when no effects are present', () => {
    const { container } = render(<StatusEffectIndicator effects={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render a single status effect', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} />);
    expect(container.querySelector('.flex')).toBeTruthy();
  });

  it('should render multiple status effects', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      },
      {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-2',
      },
      {
        type: StatusEffectType.BUFF,
        duration: 4,
        value: 0.5,
        stat: 'attack',
        source: 'ability-3',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} />);
    const effectElements = container.querySelectorAll('.rounded-full');
    
    // Each effect has multiple rounded-full elements (container, duration badge, pulse animation)
    // So we check that we have at least as many as effects
    expect(effectElements.length).toBeGreaterThanOrEqual(effects.length);
  });

  it('should display duration when showDuration is true', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.POISON,
        duration: 5.7, // Should round up to 6
        value: 10,
        source: 'ability-1',
      },
    ];

    render(<StatusEffectIndicator effects={effects} showDuration={true} />);
    expect(screen.getByText('6s')).toBeTruthy();
  });

  it('should hide duration when showDuration is false', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} showDuration={false} />);
    expect(screen.queryByText('5s')).toBeNull();
  });

  it('should apply correct size classes for small size', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} size="sm" />);
    const effectElement = container.querySelector('.w-6');
    expect(effectElement).toBeTruthy();
  });

  it('should apply correct size classes for medium size', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} size="md" />);
    const effectElement = container.querySelector('.w-8');
    expect(effectElement).toBeTruthy();
  });

  it('should apply correct size classes for large size', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} size="lg" />);
    const effectElement = container.querySelector('.w-10');
    expect(effectElement).toBeTruthy();
  });

  it('should render all status effect types correctly', () => {
    const effects: StatusEffect[] = [
      { type: StatusEffectType.STUN, duration: 3, source: 'test-1' },
      { type: StatusEffectType.POISON, duration: 5, value: 10, source: 'test-2' },
      { type: StatusEffectType.BUFF, duration: 4, value: 0.5, stat: 'attack', source: 'test-3' },
      { type: StatusEffectType.DEBUFF, duration: 3, value: 0.3, stat: 'defense', source: 'test-4' },
      { type: StatusEffectType.SLOW, duration: 2, value: 0.5, stat: 'speed', source: 'test-5' },
      { type: StatusEffectType.HASTE, duration: 6, value: 0.5, stat: 'speed', source: 'test-6' },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} />);
    const effectElements = container.querySelectorAll('.rounded-full');
    
    // Should have rendered all effects
    expect(effectElements.length).toBeGreaterThanOrEqual(effects.length);
  });

  it('should handle effects with same type but different sources', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 10,
        source: 'ability-1',
      },
      {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 15,
        source: 'ability-2',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} />);
    const effectElements = container.querySelectorAll('.rounded-full');
    
    // Should render both poison effects
    expect(effectElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should round up duration to nearest second', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 2.1, // Should round up to 3
        source: 'ability-1',
      },
    ];

    render(<StatusEffectIndicator effects={effects} showDuration={true} />);
    expect(screen.getByText('3s')).toBeTruthy();
  });

  it('should handle zero duration gracefully', () => {
    const effects: StatusEffect[] = [
      {
        type: StatusEffectType.STUN,
        duration: 0,
        source: 'ability-1',
      },
    ];

    const { container } = render(<StatusEffectIndicator effects={effects} showDuration={true} />);
    // Should still render the effect even with 0 duration
    expect(container.querySelector('.flex')).toBeTruthy();
  });
});
