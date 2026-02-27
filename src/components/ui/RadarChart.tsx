'use client';

import { useEffect, useRef, useState, memo, useMemo } from 'react';
import { HeroStats } from '@/types/hero';
import { cn } from '@/lib/utils';

export interface RadarChartProps {
  stats: HeroStats[];
  labels?: string[];
  colors?: string[];
  maxValue?: number;
  className?: string;
  animated?: boolean;
}

const DEFAULT_LABELS = ['Tấn công', 'Phòng thủ', 'Tốc độ', 'Lãnh đạo', 'Trí tuệ'];
const DEFAULT_COLORS = ['#0087FF', '#DA251D', '#FFB800', '#41B373', '#A855F7'];
const DEFAULT_MAX_VALUE = 100;

export const RadarChart = memo(function RadarChart({
  stats,
  labels = DEFAULT_LABELS,
  colors = DEFAULT_COLORS,
  maxValue = DEFAULT_MAX_VALUE,
  className,
  animated = true,
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(animated ? 0 : 1);

  // Generate text description for screen readers - memoized
  const textDescription = useMemo(() => {
    if (stats.length === 0) return 'Không có dữ liệu thống kê';
    
    const descriptions = stats.map((heroStats, index) => {
      const statValues = [
        `Tấn công: ${heroStats.attack}`,
        `Phòng thủ: ${heroStats.defense}`,
        `Tốc độ: ${heroStats.speed}`,
        `Lãnh đạo: ${heroStats.leadership}`,
        `Trí tuệ: ${heroStats.intelligence}`,
      ];
      
      const heroLabel = stats.length > 1 ? `Tướng ${index + 1}: ` : '';
      return `${heroLabel}${statValues.join(', ')}`;
    });
    
    return `Biểu đồ radar thống kê tướng. ${descriptions.join('. ')}`;
  }, [stats]);

  useEffect(() => {
    if (!animated) return;

    const startTime = Date.now();
    const duration = 600; // 600ms animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated, stats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate center and radius
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw radar chart
    drawRadarGrid(ctx, centerX, centerY, radius, labels.length);
    drawRadarLabels(ctx, centerX, centerY, radius, labels);
    
    // Draw each hero's stats
    stats.forEach((heroStats, index) => {
      const color = colors[index % colors.length];
      drawRadarData(ctx, centerX, centerY, radius, heroStats, maxValue, color, animationProgress);
    });
  }, [stats, labels, colors, maxValue, animationProgress]);

  return (
    <div className={cn('relative w-full aspect-square', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        role="img"
        aria-label={textDescription}
      />
      {/* Hidden text alternative for screen readers */}
      <div className="sr-only">
        {textDescription}
      </div>
    </div>
  );
});

function drawRadarGrid(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  numAxes: number
) {
  const levels = 5;

  // Draw concentric polygons
  for (let level = 1; level <= levels; level++) {
    const levelRadius = (radius / levels) * level;
    
    ctx.beginPath();
    ctx.strokeStyle = level === levels ? '#D1D5DB' : '#E5E7EB';
    ctx.lineWidth = level === levels ? 2 : 1;

    for (let i = 0; i <= numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * levelRadius;
      const y = centerY + Math.sin(angle) * levelRadius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;

  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function drawRadarLabels(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  labels: string[]
) {
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const labelRadius = radius + 20;

  labels.forEach((label, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;

    // Adjust text alignment based on position
    if (Math.abs(x - centerX) < 5) {
      ctx.textAlign = 'center';
    } else if (x > centerX) {
      ctx.textAlign = 'left';
    } else {
      ctx.textAlign = 'right';
    }

    if (Math.abs(y - centerY) < 5) {
      ctx.textBaseline = 'middle';
    } else if (y > centerY) {
      ctx.textBaseline = 'top';
    } else {
      ctx.textBaseline = 'bottom';
    }

    ctx.fillText(label, x, y);
  });
}

function drawRadarData(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  stats: HeroStats,
  maxValue: number,
  color: string,
  animationProgress: number
) {
  const statValues = [
    stats.attack,
    stats.defense,
    stats.speed,
    stats.leadership,
    stats.intelligence,
  ];

  const numAxes = statValues.length;

  // Draw filled polygon
  ctx.beginPath();
  ctx.fillStyle = hexToRgba(color, 0.2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  statValues.forEach((value, i) => {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const normalizedValue = (value / maxValue) * animationProgress;
    const distance = radius * normalizedValue;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw data points
  ctx.fillStyle = color;
  statValues.forEach((value, i) => {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const normalizedValue = (value / maxValue) * animationProgress;
    const distance = radius * normalizedValue;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
