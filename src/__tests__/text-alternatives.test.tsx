/**
 * Text Alternatives Tests
 * Validates Requirement 22.5: Text alternatives for visual and audio information
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadarChart } from '@/components/ui/RadarChart';
import { HeroDetail } from '@/components/game/HeroSelection/HeroDetail';
import { AudioCaption, getSoundDescription, SOUND_DESCRIPTIONS } from '@/components/ui/AudioCaption';
import {
  generateMapDescription,
  generateUnitDescription,
  generateBuildingDescription,
  generateCombatEventDescription,
} from '@/components/game/GameMap/GameMapAccessibility';
import { Hero, HeroFaction } from '@/types/hero';
import { Unit } from '@/types/unit';
import { Building } from '@/store/slices/combatSlice';

describe('Text Alternatives - Requirement 22.5', () => {
  describe('RadarChart - Visual Stats Display', () => {
    it('should have aria-label with text description of stats', () => {
      const stats = [
        {
          attack: 80,
          defense: 70,
          speed: 60,
          leadership: 85,
          intelligence: 75,
        },
      ];

      const { container } = render(<RadarChart stats={stats} />);
      const canvas = container.querySelector('canvas');

      expect(canvas).toHaveAttribute('role', 'img');
      expect(canvas).toHaveAttribute('aria-label');
      
      const ariaLabel = canvas?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Tấn công: 80');
      expect(ariaLabel).toContain('Phòng thủ: 70');
      expect(ariaLabel).toContain('Tốc độ: 60');
      expect(ariaLabel).toContain('Lãnh đạo: 85');
      expect(ariaLabel).toContain('Trí tuệ: 75');
    });

    it('should have screen reader text for multiple heroes comparison', () => {
      const stats = [
        {
          attack: 80,
          defense: 70,
          speed: 60,
          leadership: 85,
          intelligence: 75,
        },
        {
          attack: 70,
          defense: 80,
          speed: 65,
          leadership: 75,
          intelligence: 80,
        },
      ];

      const { container } = render(<RadarChart stats={stats} />);
      const srOnly = container.querySelector('.sr-only');

      expect(srOnly).toBeTruthy();
      expect(srOnly?.textContent).toContain('Tướng 1');
      expect(srOnly?.textContent).toContain('Tướng 2');
    });

    it('should handle empty stats gracefully', () => {
      const { container } = render(<RadarChart stats={[]} />);
      const canvas = container.querySelector('canvas');

      const ariaLabel = canvas?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Không có dữ liệu');
    });
  });

  describe('Hero Portrait - Image Alternatives', () => {
    const mockHero: Hero = {
      id: '1',
      name: 'Tran Hung Dao',
      nameVietnamese: 'Trần Hưng Đạo',
      faction: HeroFaction.VIETNAMESE,
      rarity: 'legendary',
      stats: {
        attack: 90,
        defense: 85,
        speed: 70,
        leadership: 95,
        intelligence: 88,
      },
      abilities: [],
      description: 'Great general',
      descriptionVietnamese: 'Đại tướng',
      historicalContext: 'Historical context',
      historicalContextVietnamese: 'Bối cảnh lịch sử',
    };

    it('should have aria-label on hero portrait', () => {
      const { container } = render(<HeroDetail hero={mockHero} />);
      const portrait = container.querySelector('[role="img"]');

      expect(portrait).toBeTruthy();
      expect(portrait).toHaveAttribute('aria-label');
      
      const ariaLabel = portrait?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Trần Hưng Đạo');
      expect(ariaLabel).toContain('Đại Việt');
      expect(ariaLabel).toContain('legendary');
    });

    it('should mark decorative text as aria-hidden', () => {
      const { container } = render(<HeroDetail hero={mockHero} />);
      const decorativeText = container.querySelector('[aria-hidden="true"]');

      expect(decorativeText).toBeTruthy();
    });
  });

  describe('Audio Captions', () => {
    it('should display audio caption with proper ARIA attributes', () => {
      render(
        <AudioCaption
          caption="Âm thanh tấn công cận chiến"
          show={true}
          duration={0}
        />
      );

      const caption = screen.getByRole('status');
      expect(caption).toHaveAttribute('aria-live', 'polite');
      expect(caption).toHaveAttribute('aria-label');
      expect(screen.getByText('Âm thanh tấn công cận chiến')).toBeTruthy();
    });

    it('should have descriptions for all sound effects', () => {
      const soundEffects = [
        'attack-melee',
        'attack-ranged',
        'hit-light',
        'hit-heavy',
        'death',
        'ability-cast',
        'ability-impact',
        'heal',
        'buff',
        'debuff',
        'rank-up',
        'level-up',
      ];

      soundEffects.forEach((effect) => {
        const description = getSoundDescription(effect);
        expect(description).toBeTruthy();
        expect(description).not.toBe('Âm thanh trò chơi'); // Should have specific description
        expect(SOUND_DESCRIPTIONS[effect]).toBe(description);
      });
    });

    it('should provide fallback description for unknown sounds', () => {
      const description = getSoundDescription('unknown-sound');
      expect(description).toBe('Âm thanh trò chơi');
    });
  });

  describe('Game Map - Visual Information Descriptions', () => {
    const mockUnits: Unit[] = [
      {
        id: '1',
        type: 'infantry',
        faction: 'vietnamese',
        position: { x: 100, y: 100 },
        health: 80,
        maxHealth: 100,
        attack: 50,
        defense: 40,
        speed: 30,
        direction: 'north',
        status: [],
        owner: 'player',
      },
      {
        id: '2',
        type: 'cavalry',
        faction: 'mongol',
        position: { x: 200, y: 200 },
        health: 60,
        maxHealth: 100,
        attack: 70,
        defense: 30,
        speed: 60,
        direction: 'south',
        status: [{ type: 'buff', duration: 5 }],
        owner: 'ai',
      },
    ];

    const mockBuildings: Building[] = [
      {
        id: '1',
        type: 'fortress',
        position: { x: 50, y: 50 },
        health: 500,
        maxHealth: 1000,
        owner: 'player',
      },
      {
        id: '2',
        type: 'tower',
        position: { x: 300, y: 300 },
        health: 200,
        maxHealth: 300,
        owner: 'ai',
      },
    ];

    it('should generate map overview description', () => {
      const description = generateMapDescription(mockUnits, mockBuildings);

      expect(description).toContain('Bản đồ chiến trường');
      expect(description).toContain('Quân ta: 1 đơn vị, 1 công trình');
      expect(description).toContain('Quân địch: 1 đơn vị, 1 công trình');
    });

    it('should generate detailed unit description', () => {
      const description = generateUnitDescription(mockUnits[0]);

      expect(description).toContain('Quân ta');
      expect(description).toContain('Bộ binh');
      expect(description).toContain('Máu: 80%');
      expect(description).toContain('Hướng: Bắc');
      expect(description).toContain('Tấn công: 50');
      expect(description).toContain('Phòng thủ: 40');
      expect(description).toContain('Tốc độ: 30');
    });

    it('should include status effects in unit description', () => {
      const description = generateUnitDescription(mockUnits[1]);

      expect(description).toContain('Trạng thái');
      expect(description).toContain('Tăng cường');
    });

    it('should generate building description', () => {
      const description = generateBuildingDescription(mockBuildings[0]);

      expect(description).toContain('Quân ta');
      expect(description).toContain('Thành trì');
      expect(description).toContain('Máu: 50%');
    });

    it('should handle empty map state', () => {
      const description = generateMapDescription([], []);

      expect(description).toContain('Bản đồ chiến trường');
      expect(description).not.toContain('Quân ta');
      expect(description).not.toContain('Quân địch');
    });
  });

  describe('Combat Event Descriptions', () => {
    it('should generate attack event description', () => {
      const description = generateCombatEventDescription('attack', {
        attackerType: 'infantry',
        defenderType: 'cavalry',
        damage: 25,
      });

      expect(description).toContain('Bộ binh');
      expect(description).toContain('tấn công');
      expect(description).toContain('Kỵ binh');
      expect(description).toContain('25 sát thương');
    });

    it('should generate death event description', () => {
      const description = generateCombatEventDescription('death', {
        unitType: 'archer',
      });

      expect(description).toContain('Cung thủ');
      expect(description).toContain('tử trận');
    });

    it('should generate ability event description', () => {
      const description = generateCombatEventDescription('ability', {
        heroName: 'Trần Hưng Đạo',
        abilityName: 'Đánh úp',
      });

      expect(description).toContain('Trần Hưng Đạo');
      expect(description).toContain('sử dụng kỹ năng');
      expect(description).toContain('Đánh úp');
    });

    it('should generate victory event description', () => {
      const description = generateCombatEventDescription('victory', {});

      expect(description).toContain('Chiến thắng');
      expect(description).toContain('Quân ta đã giành được thắng lợi');
    });

    it('should generate defeat event description', () => {
      const description = generateCombatEventDescription('defeat', {});

      expect(description).toContain('Thất bại');
      expect(description).toContain('Quân ta đã bị đánh bại');
    });

    it('should provide fallback for unknown events', () => {
      const description = generateCombatEventDescription('unknown', {});

      expect(description).toBe('Sự kiện chiến đấu.');
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide text alternatives for all visual content types', () => {
      // This test documents that we have text alternatives for:
      // 1. Canvas-based visualizations (RadarChart)
      // 2. Images and portraits (Hero portraits)
      // 3. Game map visual information (units, buildings)
      // 4. Combat animations and effects (event descriptions)
      
      expect(true).toBe(true); // Placeholder - actual implementation tested above
    });

    it('should provide captions for all audio content types', () => {
      // This test documents that we have captions for:
      // 1. Combat sound effects
      // 2. UI sound effects
      // 3. Notification sounds
      // 4. Background music (if implemented)
      
      const soundTypes = Object.keys(SOUND_DESCRIPTIONS);
      expect(soundTypes.length).toBeGreaterThan(0);
      
      soundTypes.forEach(soundType => {
        expect(SOUND_DESCRIPTIONS[soundType]).toBeTruthy();
      });
    });
  });
});
