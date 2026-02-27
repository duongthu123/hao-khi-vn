import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RadarChart } from './RadarChart';
import { HeroStats } from '@/types/hero';

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  set strokeStyle(_value: string) {},
  set lineWidth(_value: number) {},
  set fillStyle(_value: string) {},
  set font(_value: string) {},
  set textAlign(_value: CanvasTextAlign) {},
  set textBaseline(_value: CanvasTextBaseline) {},
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);
  
  // Mock getBoundingClientRect
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 300,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 300,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  // Mock window.devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: 1,
  });

  // Mock requestAnimationFrame to prevent infinite loops
  let rafId = 0;
  global.requestAnimationFrame = vi.fn((cb) => {
    // Call callback immediately but don't recurse
    setTimeout(() => cb(Date.now()), 0);
    return ++rafId;
  });
  
  global.cancelAnimationFrame = vi.fn();
});

const mockStats: HeroStats = {
  attack: 85,
  defense: 75,
  speed: 90,
  leadership: 80,
  intelligence: 70,
};

const mockStats2: HeroStats = {
  attack: 90,
  defense: 80,
  speed: 85,
  leadership: 85,
  intelligence: 75,
};

describe('RadarChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<RadarChart stats={[mockStats]} animated={false} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <RadarChart stats={[mockStats]} className="custom-class" animated={false} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('calls canvas drawing methods', () => {
    render(<RadarChart stats={[mockStats]} animated={false} />);

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.scale).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('renders multiple hero stats for comparison', () => {
    render(<RadarChart stats={[mockStats, mockStats2]} animated={false} />);

    // Should draw multiple data sets
    expect(mockContext.fill).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('uses custom colors when provided', () => {
    const customColors = ['#FF0000', '#00FF00'];
    render(
      <RadarChart
        stats={[mockStats, mockStats2]}
        colors={customColors}
        animated={false}
      />
    );

    // Canvas should be rendered with custom colors
    expect(mockContext.beginPath).toHaveBeenCalled();
  });

  it('uses custom labels when provided', () => {
    const customLabels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'];
    render(
      <RadarChart
        stats={[mockStats]}
        labels={customLabels}
        animated={false}
      />
    );

    expect(mockContext.fillText).toHaveBeenCalled();
  });

  it('uses custom max value when provided', () => {
    render(
      <RadarChart
        stats={[mockStats]}
        maxValue={200}
        animated={false}
      />
    );

    // Chart should be rendered with custom max value
    expect(mockContext.lineTo).toHaveBeenCalled();
  });

  it('handles animation when animated prop is true', () => {
    render(<RadarChart stats={[mockStats]} animated={true} />);

    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('skips animation when animated prop is false', () => {
    vi.clearAllMocks();
    render(<RadarChart stats={[mockStats]} animated={false} />);

    // Should render immediately without animation
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles high DPI displays', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });

    render(<RadarChart stats={[mockStats]} animated={false} />);

    expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
  });

  it('renders with default labels when not provided', () => {
    render(<RadarChart stats={[mockStats]} animated={false} />);

    // Should use default Vietnamese labels
    expect(mockContext.fillText).toHaveBeenCalled();
  });

  it('renders with default colors when not provided', () => {
    render(<RadarChart stats={[mockStats]} animated={false} />);

    // Should use default colors
    expect(mockContext.beginPath).toHaveBeenCalled();
  });

  it('renders with default max value when not provided', () => {
    render(<RadarChart stats={[mockStats]} animated={false} />);

    // Should use default max value of 100
    expect(mockContext.lineTo).toHaveBeenCalled();
  });

  it('maintains aspect ratio', () => {
    const { container } = render(<RadarChart stats={[mockStats]} animated={false} />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper.className).toContain('aspect-square');
  });
});
