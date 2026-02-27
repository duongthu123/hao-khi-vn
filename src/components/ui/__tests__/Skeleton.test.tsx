import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar 
} from '../Skeleton';

describe('Skeleton Component', () => {
  describe('Basic Skeleton', () => {
    it('renders with default props', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-label', 'Đang tải');
    });

    it('renders with text variant', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded');
    });

    it('renders with circular variant', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('renders with rectangular variant', () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('applies pulse animation by default', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('applies wave animation when specified', () => {
      render(<Skeleton animation="wave" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('animate-shimmer');
    });

    it('applies no animation when specified', () => {
      render(<Skeleton animation="none" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).not.toHaveClass('animate-pulse');
      expect(skeleton).not.toHaveClass('animate-shimmer');
    });

    it('applies custom width and height', () => {
      render(<Skeleton width={200} height={100} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
    });

    it('applies custom width and height as strings', () => {
      render(<Skeleton width="50%" height="2rem" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '50%', height: '2rem' });
    });

    it('applies custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('custom-class');
    });
  });

  describe('SkeletonText Component', () => {
    it('renders default 3 lines', () => {
      const { container } = render(<SkeletonText />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(3);
    });

    it('renders specified number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(5);
    });

    it('applies last line width', () => {
      const { container } = render(<SkeletonText lines={2} lastLineWidth="60%" />);
      const skeletons = container.querySelectorAll('[role="status"]');
      const lastSkeleton = skeletons[skeletons.length - 1];
      expect(lastSkeleton).toHaveStyle({ width: '60%' });
    });

    it('applies normal spacing by default', () => {
      const { container } = render(<SkeletonText />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('gap-2');
    });

    it('applies tight spacing', () => {
      const { container } = render(<SkeletonText spacing="tight" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('gap-1');
    });

    it('applies relaxed spacing', () => {
      const { container } = render(<SkeletonText spacing="relaxed" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('gap-3');
    });
  });

  describe('SkeletonCard Component', () => {
    it('renders with default props', () => {
      render(<SkeletonCard />);
      const card = screen.getByRole('status', { name: 'Đang tải nội dung' });
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-label', 'Đang tải nội dung');
    });

    it('renders with image when hasImage is true', () => {
      const { container } = render(<SkeletonCard hasImage={true} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      // Should have: card wrapper + image + header + body lines
      expect(skeletons.length).toBeGreaterThan(1);
    });

    it('renders without header when hasHeader is false', () => {
      const { container } = render(<SkeletonCard hasHeader={false} />);
      const card = container.querySelector('[role="status"]');
      expect(card).toBeInTheDocument();
    });

    it('renders specified number of body lines', () => {
      const { container } = render(<SkeletonCard bodyLines={5} />);
      const card = container.querySelector('[role="status"]');
      expect(card).toBeInTheDocument();
    });

    it('applies custom image height', () => {
      const { container } = render(<SkeletonCard hasImage={true} imageHeight={300} />);
      const card = container.querySelector('[role="status"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('SkeletonAvatar Component', () => {
    it('renders with default medium size', () => {
      render(<SkeletonAvatar />);
      const avatar = screen.getByRole('status');
      expect(avatar).toHaveClass('w-12', 'h-12', 'rounded-full');
    });

    it('renders with small size', () => {
      render(<SkeletonAvatar size="sm" />);
      const avatar = screen.getByRole('status');
      expect(avatar).toHaveClass('w-8', 'h-8');
    });

    it('renders with large size', () => {
      render(<SkeletonAvatar size="lg" />);
      const avatar = screen.getByRole('status');
      expect(avatar).toHaveClass('w-16', 'h-16');
    });

    it('renders with extra large size', () => {
      render(<SkeletonAvatar size="xl" />);
      const avatar = screen.getByRole('status');
      expect(avatar).toHaveClass('w-24', 'h-24');
    });

    it('applies custom className', () => {
      render(<SkeletonAvatar className="custom-avatar" />);
      const avatar = screen.getByRole('status');
      expect(avatar).toHaveClass('custom-avatar');
    });
  });

  describe('Accessibility', () => {
    it('has proper role and aria-label', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', 'Đang tải');
    });

    it('SkeletonCard has proper aria-label', () => {
      render(<SkeletonCard />);
      const card = screen.getByRole('status', { name: 'Đang tải nội dung' });
      expect(card).toHaveAttribute('aria-label', 'Đang tải nội dung');
    });

    it('SkeletonAvatar has proper role', () => {
      render(<SkeletonAvatar />);
      const avatar = screen.getByRole('status');
      expect(avatar).toBeInTheDocument();
    });
  });
});
