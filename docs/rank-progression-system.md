# Rank Progression System

## Overview

The rank progression system automatically calculates and awards rank promotions based on player experience. It integrates with the profile slice and triggers visual feedback when ranks change.

**Validates Requirements:**
- 18.2: Implement ranking system based on victories and progress
- 18.6: Award rank promotions based on performance
- 18.8: Update displays immediately

## Components

### 1. Profile Slice Enhancement

The profile slice (`src/store/slices/profileSlice.ts`) has been enhanced with:

- **Automatic Rank Calculation**: When experience is added, the system automatically checks for level-ups and rank promotions
- **Notification Integration**: Rank promotions trigger notifications through a callback system
- **Rank Thresholds**: Predefined rank thresholds based on player level

#### Rank Thresholds

| Level | Rank |
|-------|------|
| 1 | Tân Binh (Recruit) |
| 5 | Chiến Binh (Warrior) |
| 10 | Đội Trưởng (Squad Leader) |
| 15 | Tiểu Đội Trưởng (Platoon Leader) |
| 20 | Đại Đội Trưởng (Company Commander) |
| 25 | Tiểu Tướng (Junior General) |
| 30 | Trung Tướng (Middle General) |
| 35 | Đại Tướng (Senior General) |
| 40 | Nguyên Soái (Marshal) |

#### New Methods

- `addExperience(amount, addNotification?)`: Adds experience and triggers rank calculation with optional notifications
- `calculateRank(addNotification?)`: Calculates current rank based on level and triggers notifications on promotion
- `getRankForLevel(level)`: Returns the rank for a given level
- `getNextRankThreshold()`: Returns the next rank threshold or null if at max rank

### 2. RankUpAnimation Component

A celebration animation component (`src/components/ui/RankUpAnimation.tsx`) that displays when a player achieves a new rank.

**Features:**
- Full-screen overlay with backdrop blur
- Animated rank badge with glow effect
- Celebration particles
- Decorative stars
- Rank-specific colors and icons
- Auto-dismisses after duration
- Smooth enter/exit animations

**Props:**
```typescript
interface RankUpAnimationProps {
  newRank: string;           // The new rank name
  onComplete?: () => void;   // Callback when animation completes
  duration?: number;         // Duration in ms (default: 3000)
}
```

**Rank Icons:**
- 👑 Nguyên Soái (Marshal)
- ⭐ Đại Tướng (Senior General)
- 🎖️ Tướng ranks (Generals)
- 🛡️ Đội Trưởng ranks (Leaders)
- 🎯 Default

### 3. ProfileView Component Enhancement

The ProfileView component (`src/components/game/ProfileView/ProfileView.tsx`) has been enhanced with:

- **Rank-up Animation Trigger**: Automatically shows RankUpAnimation when rank changes
- **Next Rank Display**: Shows the next rank threshold and levels remaining
- **Max Rank Indicator**: Special display when player reaches maximum rank

### 4. useRankProgression Hook

A custom hook (`src/hooks/useRankProgression.ts`) that provides rank progression functionality with automatic notifications.

**Features:**
- Integrates profile slice with UI slice for notifications
- Provides convenient methods for adding experience, wins, and losses
- Automatically awards experience for wins (500 XP) and losses (100 XP)
- Triggers appropriate notifications for each action

**Usage:**
```typescript
const {
  addExperience,
  addWin,
  addLoss,
  currentRank,
  currentLevel,
  experience,
  nextRankThreshold,
  getRankForLevel
} = useRankProgression();

// Add experience with automatic notifications
addExperience(250);

// Add a win (automatically adds 500 XP and shows notification)
addWin();

// Add a loss (automatically adds 100 XP and shows notification)
addLoss();
```

## Experience and Leveling

- **Experience per Level**: 1000 XP
- **Level Calculation**: `level = floor(experience / 1000) + 1`
- **Level Progress**: Current level experience is `experience % 1000`

## Notification Messages

### Rank Promotion
- **Type**: Success
- **Message**: "🏆 Chúc mừng! Bạn đã thăng cấp bậc {rank}!"

### Level Up (No Rank Change)
- **Type**: Info
- **Message**: "⬆️ Lên cấp {level}! (+{amount} kinh nghiệm)"

### Win
- **Type**: Success
- **Message**: "🎉 Chiến thắng! +500 kinh nghiệm"

### Loss
- **Type**: Info
- **Message**: "💪 Tiếp tục cố gắng! +100 kinh nghiệm"

## Integration Example

```typescript
import { useRankProgression } from '@/hooks/useRankProgression';

function GameComponent() {
  const { addWin, addLoss } = useRankProgression();
  
  const handleBattleEnd = (won: boolean) => {
    if (won) {
      addWin(); // Adds win, awards 500 XP, shows notifications
    } else {
      addLoss(); // Adds loss, awards 100 XP, shows notifications
    }
  };
  
  return (
    // ... component JSX
  );
}
```

## Testing

Comprehensive tests have been written for all components:

1. **Profile Slice Tests** (`src/store/slices/__tests__/rankProgression.test.ts`):
   - Rank calculation logic
   - Experience and level progression
   - Rank promotion detection
   - Next rank threshold calculation
   - Win/loss integration
   - Edge cases

2. **RankUpAnimation Tests** (`src/components/ui/__tests__/RankUpAnimation.test.tsx`):
   - Rendering with different ranks
   - Correct icons and gradients
   - Celebration particles and decorative elements

3. **useRankProgression Hook Tests** (`src/hooks/__tests__/useRankProgression.test.ts`):
   - Experience addition with notifications
   - Win/loss handling
   - Rank threshold queries
   - Multiple operations

All tests pass successfully.

## Future Enhancements

Potential improvements for the rank progression system:

1. **Rank Badges**: Visual rank badges displayed next to player name
2. **Rank Rewards**: Unlock special items or abilities at certain ranks
3. **Rank History**: Track rank progression over time
4. **Leaderboards**: Compare ranks with other players
5. **Rank Decay**: Optional system where ranks can decrease with inactivity
6. **Custom Rank Names**: Allow players to customize rank titles
7. **Rank Achievements**: Special achievements for reaching certain ranks
8. **Rank Milestones**: Celebrate major rank milestones (e.g., first general rank)
