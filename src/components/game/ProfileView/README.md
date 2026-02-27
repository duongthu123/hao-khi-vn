# ProfileView Component

## Overview

The ProfileView component displays comprehensive player profile information including name, rank, level, statistics, win/loss ratios, achievements, and detailed gameplay statistics.

## Features

- **Player Information**: Displays player name, rank badge, and level with experience progress bar
- **Win/Loss Statistics**: Shows wins, losses, total games, and win rate percentage with visual bar
- **Detailed Statistics**: Displays play time, units defeated, resources gathered, and quizzes completed
- **Achievements**: Shows all achievements with unlock status and unlock dates
- **Responsive Design**: Adapts to different screen sizes with grid layouts
- **Animations**: Smooth entrance animations and progress bar animations using Framer Motion

## Usage

```tsx
import { ProfileView } from '@/components/game/ProfileView';

function MyComponent() {
  return <ProfileView />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes to apply to the root element |

## State Management

The component connects to the Zustand store to access:

- `profile`: Complete player profile data
- `getWinRate()`: Calculated win rate percentage
- `getTotalGames()`: Total number of games played
- `getUnlockedAchievements()`: List of unlocked achievements

## Data Structure

The component displays data from the `ProfileSlice`:

```typescript
interface ProfileSlice {
  profile: {
    playerName: string;
    rank: string;
    level: number;
    experience: number;
    wins: number;
    losses: number;
    achievements: Achievement[];
    statistics: {
      totalPlayTime: number;
      unitsDefeated: number;
      resourcesGathered: number;
      quizzesCompleted: number;
    };
  };
}
```

## Rank System

The component displays rank badges with colors based on the rank:

- **Nguyên Soái** (Marshal): Yellow to Orange gradient
- **Đại Tướng** (Senior General): Purple to Pink gradient
- **Tướng** (General): Blue to Cyan gradient
- **Đội Trưởng** (Squad Leader): Green to Emerald gradient
- **Tân Binh** (Recruit): Gray gradient

## Statistics Display

### Combat Statistics
- Wins (green)
- Losses (red)
- Total games (blue)
- Win rate percentage (yellow)
- Visual win/loss ratio bar

### Detailed Statistics
- **Play Time**: Formatted as hours and minutes
- **Units Defeated**: Total enemy units eliminated
- **Resources Gathered**: Total resources collected
- **Quizzes Completed**: Number of quiz sessions finished

### Achievements
- Achievement icon (emoji or custom)
- Achievement name and description
- Unlock status (locked/unlocked)
- Unlock date for completed achievements

## Styling

The component uses:
- Tailwind CSS for styling
- Slate color palette for dark theme
- Yellow/Gold accents for highlights
- Gradient backgrounds for rank badges
- Framer Motion for animations

## Accessibility

- Semantic HTML structure
- Clear visual hierarchy
- Color-coded statistics for quick scanning
- Readable text with good contrast ratios

## Requirements Satisfied

- **18.1**: Tracks player profile including name, rank, and statistics
- **18.3**: Displays player achievements and milestones
- **18.5**: Calculates and displays win/loss ratios and other statistics
- **18.7**: Displays profile information in a dedicated UI component
- **2.2**: Implements as a discrete Component_Module
- **2.3**: Has a single, well-defined responsibility (profile display)
