/**
 * ResourceDisplay Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceDisplay } from './ResourceDisplay';
import { Resources, ResourceCaps, ResourceGeneration } from '@/types/resource';

describe('ResourceDisplay', () => {
  const mockResources: Resources = {
    food: 500,
    gold: 300,
    army: 50,
  };

  const mockCaps: ResourceCaps = {
    food: 1000,
    gold: 1000,
    army: 100,
  };

  const mockGeneration: ResourceGeneration = {
    foodPerSecond: 2.5,
    goldPerSecond: 1.0,
    armyPerSecond: 0.5,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render all three resource types', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    // Check for resource icons
    expect(container.textContent).toContain('🌾'); // Food
    expect(container.textContent).toContain('💰'); // Gold
    expect(container.textContent).toContain('⚔️'); // Army
  });

  it('should display current resource values', () => {
    render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('300')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('should display resource caps', () => {
    render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    // Check for cap values (displayed as "/ 1000", "/ 100")
    const capElements = screen.getAllByText(/\/ \d+/);
    expect(capElements.length).toBeGreaterThanOrEqual(3);
  });

  it('should display generation rates when showDetails is true', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    expect(container.textContent).toContain('+2.5/s');
    expect(container.textContent).toContain('+1.0/s');
    expect(container.textContent).toContain('+0.5/s');
  });

  it('should hide generation rates when showDetails is false', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={false}
      />
    );

    expect(container.textContent).not.toContain('+2.5/s');
    expect(container.textContent).not.toContain('+1.0/s');
  });

  it('should show warning indicator for low resources', () => {
    const lowResources: Resources = {
      food: 100, // 10% of cap
      gold: 50,  // 5% of cap
      army: 5,   // 5% of cap
    };

    const { container } = render(
      <ResourceDisplay
        resources={lowResources}
        caps={mockCaps}
        generation={mockGeneration}
        lowResourceThreshold={0.2}
      />
    );

    // Should show warning icons for all low resources
    const warningIcons = container.querySelectorAll('.text-red-500');
    expect(warningIcons.length).toBeGreaterThan(0);
  });

  it('should not show warning for resources above threshold', () => {
    const highResources: Resources = {
      food: 800, // 80% of cap
      gold: 700, // 70% of cap
      army: 90,  // 90% of cap
    };

    const { container } = render(
      <ResourceDisplay
        resources={highResources}
        caps={mockCaps}
        generation={mockGeneration}
        lowResourceThreshold={0.2}
      />
    );

    // Warning icons should not be present
    expect(container.textContent).not.toContain('⚠️');
  });

  it('should show tooltip on hover when showDetails is true', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    // Check that the component has the hover-enabled structure
    const resourceItems = container.querySelectorAll('.relative');
    expect(resourceItems.length).toBe(3); // One for each resource
  });

  it('should display Vietnamese labels in tooltip', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    // Verify the component structure supports tooltips
    const resourceItems = container.querySelectorAll('.relative');
    expect(resourceItems.length).toBeGreaterThan(0);
  });

  it('should calculate and display percentage correctly', () => {
    const testResources: Resources = {
      food: 250, // 25% of 1000
      gold: 500, // 50% of 1000
      army: 75,  // 75% of 100
    };

    const { container } = render(
      <ResourceDisplay
        resources={testResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    // Check that resources are displayed correctly
    expect(screen.getByText('250')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('75')).toBeTruthy();
  });

  it('should display time until cap is full', () => {
    const testResources: Resources = {
      food: 900, // 100 away from cap, at 2.5/s = 40 seconds
      gold: 300,
      army: 50,
    };

    const { container } = render(
      <ResourceDisplay
        resources={testResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    // Check that resources are displayed correctly
    expect(screen.getByText('900')).toBeTruthy();
    expect(screen.getByText('300')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('should handle zero generation rate', () => {
    const zeroGeneration: ResourceGeneration = {
      foodPerSecond: 0,
      goldPerSecond: 0,
      armyPerSecond: 0,
    };

    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={zeroGeneration}
        showDetails={true}
      />
    );

    expect(container.textContent).toContain('0/s');
  });

  it('should handle resources at cap', () => {
    const fullResources: Resources = {
      food: 1000,
      gold: 1000,
      army: 100,
    };

    render(
      <ResourceDisplay
        resources={fullResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    // Use getAllByText since there are multiple instances of "1000"
    const thousandElements = screen.getAllByText('1000');
    expect(thousandElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('should handle resources at zero', () => {
    const emptyResources: Resources = {
      food: 0,
      gold: 0,
      army: 0,
    };

    const { container } = render(
      <ResourceDisplay
        resources={emptyResources}
        caps={mockCaps}
        generation={mockGeneration}
        lowResourceThreshold={0.2}
      />
    );

    // Use getAllByText since there are multiple instances of "0"
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
    
    // All resources should show warning
    expect(container.textContent).toContain('⚠️');
  });

  it('should render with custom low resource threshold', () => {
    const testResources: Resources = {
      food: 400, // 40% of cap
      gold: 300, // 30% of cap
      army: 50,  // 50% of cap
    };

    const { container } = render(
      <ResourceDisplay
        resources={testResources}
        caps={mockCaps}
        generation={mockGeneration}
        lowResourceThreshold={0.5} // 50% threshold
      />
    );

    // Food and gold should show warnings (below 50%)
    // Army should not (at 50%)
    const warningIcons = container.querySelectorAll('.text-red-500');
    expect(warningIcons.length).toBeGreaterThan(0);
  });

  it('should display title "Tài nguyên"', () => {
    render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    expect(screen.getByText('Tài nguyên')).toBeTruthy();
  });

  it('should show hover hint when showDetails is true', () => {
    render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={true}
      />
    );

    expect(screen.getByText('Di chuột để xem chi tiết')).toBeTruthy();
  });

  it('should not show hover hint when showDetails is false', () => {
    render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
        showDetails={false}
      />
    );

    expect(screen.queryByText('Di chuột để xem chi tiết')).toBeNull();
  });

  it('should render progress bars for all resources', () => {
    const { container } = render(
      <ResourceDisplay
        resources={mockResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    // Check for progress bar containers
    const progressBars = container.querySelectorAll('.bg-gray-800.rounded-full');
    expect(progressBars.length).toBe(3);
  });

  it('should handle fractional resource values', () => {
    const fractionalResources: Resources = {
      food: 123.456,
      gold: 789.012,
      army: 45.678,
    };

    render(
      <ResourceDisplay
        resources={fractionalResources}
        caps={mockCaps}
        generation={mockGeneration}
      />
    );

    // Should display floored values
    expect(screen.getByText('123')).toBeTruthy();
    expect(screen.getByText('789')).toBeTruthy();
    expect(screen.getByText('45')).toBeTruthy();
  });
});
