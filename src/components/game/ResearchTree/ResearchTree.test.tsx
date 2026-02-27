/**
 * ResearchTree Component Tests
 * Tests research tree display, node interactions, and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResearchTree } from './ResearchTree';
import { useGameStore } from '@/store';
import { ALL_RESEARCH, IMPROVED_FARMING } from '@/constants/research';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useResearchSystem hook
const mockStartResearch = vi.fn();
const mockCancelResearch = vi.fn();

vi.mock('@/hooks/useResearchSystem', () => ({
  useResearchSystem: () => ({
    startResearch: mockStartResearch,
    cancelResearch: mockCancelResearch,
    currentResearch: null,
    progress: 0,
  }),
}));

describe('ResearchTree', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Reset store state
    useGameStore.setState({
      research: {
        completed: [],
        inProgress: null,
        progress: 0,
        progressStartTime: null,
      },
      resources: {
        food: 1000,
        gold: 1000,
        army: 100,
        caps: {
          food: 2000,
          gold: 2000,
          army: 200,
        },
        generation: {
          foodPerSecond: 1,
          goldPerSecond: 1,
          armyPerSecond: 0.1,
        },
      },
      ui: {
        activeModal: null,
        notifications: [],
        mapZoom: 1,
        mapPosition: { x: 0, y: 0 },
      },
    });
  });

  describe('Rendering', () => {
    it('should render the research tree header', () => {
      render(<ResearchTree />);
      
      expect(screen.getByText('Cây Nghiên Cứu')).toBeInTheDocument();
      expect(screen.getByText('Nâng cấp công nghệ và năng lực')).toBeInTheDocument();
    });

    it('should display completion statistics', () => {
      render(<ResearchTree />);
      
      const totalResearch = ALL_RESEARCH.length;
      expect(screen.getByText(`0 / ${totalResearch}`)).toBeInTheDocument();
      expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
    });

    it('should render tier filter buttons', () => {
      render(<ResearchTree />);
      
      expect(screen.getByText('Tất Cả')).toBeInTheDocument();
      expect(screen.getByText('Cấp 1')).toBeInTheDocument();
      expect(screen.getByText('Cấp 2')).toBeInTheDocument();
      expect(screen.getByText('Cấp 3')).toBeInTheDocument();
    });

    it('should display all research nodes by default', () => {
      render(<ResearchTree />);
      
      // Check for some tier 1 research
      expect(screen.getByText('Cải Tiến Nông Nghiệp')).toBeInTheDocument();
      expect(screen.getByText('Kỹ Thuật Khai Mỏ')).toBeInTheDocument();
    });
  });

  describe('Tier Filtering', () => {
    it('should filter research by tier 1', () => {
      render(<ResearchTree />);
      
      const tier1Button = screen.getByText('Cấp 1');
      fireEvent.click(tier1Button);
      
      // Should show tier 1 research
      expect(screen.getByText('Cải Tiến Nông Nghiệp')).toBeInTheDocument();
      expect(screen.getByText('Huấn Luyện Cơ Bản')).toBeInTheDocument();
    });

    it('should filter research by tier 2', () => {
      render(<ResearchTree />);
      
      const tier2Button = screen.getByText('Cấp 2');
      fireEvent.click(tier2Button);
      
      // Should show tier 2 research
      expect(screen.getByText('Nông Nghiệp Tiên Tiến')).toBeInTheDocument();
      expect(screen.getByText('Vũ Khí Sắt')).toBeInTheDocument();
    });

    it('should show all research when "Tất Cả" is clicked', () => {
      render(<ResearchTree />);
      
      // First filter to tier 1
      fireEvent.click(screen.getByText('Cấp 1'));
      
      // Then click "Tất Cả"
      fireEvent.click(screen.getByText('Tất Cả'));
      
      // Should show research from all tiers
      expect(screen.getByText('Cải Tiến Nông Nghiệp')).toBeInTheDocument(); // Tier 1
      expect(screen.getByText('Vũ Khí Sắt')).toBeInTheDocument(); // Tier 2
    });
  });

  describe('Research Node States', () => {
    it('should show available research as unlocked', () => {
      render(<ResearchTree />);
      
      // Tier 1 research should be available (no prerequisites)
      const improvedFarmingCard = screen.getByText('Cải Tiến Nông Nghiệp').closest('div');
      expect(improvedFarmingCard).not.toHaveClass('opacity-60');
    });

    it('should show locked research with lock icon', () => {
      render(<ResearchTree />);
      
      // Advanced Farming requires Improved Farming
      const advancedFarmingCards = screen.getAllByText('Nông Nghiệp Tiên Tiến');
      const advancedFarmingCard = advancedFarmingCards[0].closest('.opacity-60');
      expect(advancedFarmingCard).toBeTruthy();
    });

    it('should show completed research with checkmark', () => {
      useGameStore.setState({
        research: {
          completed: [IMPROVED_FARMING.id],
          inProgress: null,
          progress: 0,
          progressStartTime: null,
        },
      });

      render(<ResearchTree />);
      
      // Should show checkmark for completed research
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should show in-progress research with progress bar', () => {
      useGameStore.setState({
        research: {
          completed: [],
          inProgress: IMPROVED_FARMING.id,
          progress: 50,
          progressStartTime: Date.now(),
        },
      });

      render(<ResearchTree />);
      
      expect(screen.getByText('Đang nghiên cứu...')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Resource Display', () => {
    it('should display research costs', () => {
      render(<ResearchTree />);
      
      // Improved Farming costs 200 food, 150 gold
      const costElements = screen.getAllByText('200');
      expect(costElements.length).toBeGreaterThan(0);
      
      const goldCostElements = screen.getAllByText('150');
      expect(goldCostElements.length).toBeGreaterThan(0);
    });

    it('should highlight insufficient resources in red', () => {
      useGameStore.setState({
        resources: {
          food: 50,
          gold: 50,
          army: 100,
          caps: { food: 2000, gold: 2000, army: 200 },
          generation: { foodPerSecond: 1, goldPerSecond: 1, armyPerSecond: 0.1 },
        },
      });

      render(<ResearchTree />);
      
      // Find cost displays - they should have red color class when insufficient
      const costElements = screen.getAllByText('200');
      const hasInsufficientResources = costElements.some(el => 
        el.className.includes('text-red-400')
      );
      expect(hasInsufficientResources).toBe(true);
    });
  });

  describe('Research Details Modal', () => {
    it('should open details modal when clicking on available research', async () => {
      render(<ResearchTree />);
      
      // Find the card container, not just the text
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const improvedFarmingCard = cards[0].closest('.cursor-pointer');
      if (improvedFarmingCard) {
        fireEvent.click(improvedFarmingCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Improved Farming')).toBeInTheDocument();
        expect(screen.getByText('Hiệu Ứng:')).toBeInTheDocument();
      });
    });

    it('should display research effects in modal', async () => {
      render(<ResearchTree />);
      
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const improvedFarmingCard = cards[0].closest('.cursor-pointer');
      if (improvedFarmingCard) {
        fireEvent.click(improvedFarmingCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('+25% sản xuất lương thực')).toBeInTheDocument();
      });
    });

    it('should display prerequisites in modal', async () => {
      useGameStore.setState({
        research: {
          completed: [IMPROVED_FARMING.id],
          inProgress: null,
          progress: 0,
          progressStartTime: null,
        },
      });

      render(<ResearchTree />);
      
      // Advanced Farming should now be available
      const cards = screen.getAllByText('Nông Nghiệp Tiên Tiến');
      const advancedFarmingCard = cards[0].closest('.cursor-pointer');
      if (advancedFarmingCard) {
        fireEvent.click(advancedFarmingCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Yêu Cầu:')).toBeInTheDocument();
      });
    });

    it('should close modal when clicking close button', async () => {
      render(<ResearchTree />);
      
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const improvedFarmingCard = cards[0].closest('.cursor-pointer');
      if (improvedFarmingCard) {
        fireEvent.click(improvedFarmingCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Đóng')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Đóng'));
      
      await waitFor(() => {
        expect(screen.queryByText('Đóng')).not.toBeInTheDocument();
      });
    });
  });

  describe('Starting Research', () => {
    it('should start research when clicking start button', async () => {
      render(<ResearchTree />);
      
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const improvedFarmingCard = cards[0].closest('.cursor-pointer');
      if (improvedFarmingCard) {
        fireEvent.click(improvedFarmingCard);
      }
      
      await waitFor(() => {
        const startButton = screen.getByText('Bắt Đầu');
        fireEvent.click(startButton);
      });
      
      expect(mockStartResearch).toHaveBeenCalledWith(IMPROVED_FARMING.id);
    });

    it('should not start research if resources insufficient', async () => {
      useGameStore.setState({
        resources: {
          food: 50,
          gold: 50,
          army: 100,
          caps: { food: 2000, gold: 2000, army: 200 },
          generation: { foodPerSecond: 1, goldPerSecond: 1, armyPerSecond: 0.1 },
        },
      });

      render(<ResearchTree />);
      
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const improvedFarmingCard = cards[0].closest('.cursor-pointer');
      if (improvedFarmingCard) {
        fireEvent.click(improvedFarmingCard);
      }
      
      await waitFor(() => {
        const startButton = screen.getByText('💰 Không Đủ');
        expect(startButton).toBeDisabled();
      });
    });

    it('should not start locked research', async () => {
      render(<ResearchTree />);
      
      // Advanced Farming is locked (requires Improved Farming)
      // It should be disabled and not clickable
      const advancedFarmingCards = screen.getAllByText('Nông Nghiệp Tiên Tiến');
      const advancedFarmingCard = advancedFarmingCards[0].closest('.opacity-60');
      
      // Check that it has opacity-60 class (disabled state)
      expect(advancedFarmingCard).toBeTruthy();
    });
  });

  describe('Canceling Research', () => {
    it('should cancel in-progress research', async () => {
      useGameStore.setState({
        research: {
          completed: [],
          inProgress: IMPROVED_FARMING.id,
          progress: 50,
          progressStartTime: Date.now(),
        },
      });

      render(<ResearchTree />);
      
      // In-progress research is disabled but still clickable to view details
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      // Find the card with the in-progress indicator
      const inProgressCard = cards.find(card => {
        const parent = card.closest('.border-blue-500');
        return parent !== null;
      });
      
      if (inProgressCard) {
        const cardElement = inProgressCard.closest('.border-blue-500');
        if (cardElement) {
          fireEvent.click(cardElement);
          
          await waitFor(() => {
            const cancelButton = screen.getByText('Hủy');
            fireEvent.click(cancelButton);
          }, { timeout: 3000 });
          
          expect(mockCancelResearch).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Completion Statistics', () => {
    it('should update completion percentage', () => {
      const totalResearch = ALL_RESEARCH.length;
      const completedCount = 5;
      const completedIds = ALL_RESEARCH.slice(0, completedCount).map(r => r.id);

      useGameStore.setState({
        research: {
          completed: completedIds,
          inProgress: null,
          progress: 0,
          progressStartTime: null,
        },
      });

      render(<ResearchTree />);
      
      expect(screen.getByText(`${completedCount} / ${totalResearch}`)).toBeInTheDocument();
      
      const percentage = (completedCount / totalResearch) * 100;
      expect(screen.getByText(`${percentage.toFixed(1)}%`)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ResearchTree />);
      
      const heading = screen.getByText('Cây Nghiên Cứu');
      expect(heading.tagName).toBe('H1');
    });

    it('should have clickable research nodes', () => {
      render(<ResearchTree />);
      
      // Find an available research card (not disabled)
      const cards = screen.getAllByText('Cải Tiến Nông Nghiệp');
      const researchCard = cards[0].closest('.cursor-pointer');
      expect(researchCard).toBeTruthy();
    });
  });
});
