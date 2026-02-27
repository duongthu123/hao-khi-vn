# ResearchTree Component

## Overview

The `ResearchTree` component displays the technology research tree with visual node connections, shows prerequisites and costs, tracks research progress, and integrates with the research constants defined in `src/constants/research.ts`.

## Features

- **Visual Research Tree**: Displays all research nodes organized by tier (1, 2, 3)
- **Node Status Indicators**: Shows completed, in-progress, available, and locked research
- **Prerequisites Display**: Shows which research must be completed before unlocking new nodes
- **Cost Display**: Shows food and gold costs for each research
- **Progress Tracking**: Real-time progress bar for in-progress research
- **Resource Validation**: Disables research that player cannot afford
- **Tier Filtering**: Filter research by tier or view all at once
- **Detailed Modal**: Click on any node to see full details, effects, and prerequisites
- **Vietnamese Localization**: All text displayed in Vietnamese

## Usage

```tsx
import { ResearchTree } from '@/components/game/ResearchTree';

function GamePage() {
  return (
    <div className="h-screen">
      <ResearchTree />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes for the container |

## State Management

The component integrates with the Zustand store:

- **Research State**: `research.completed`, `research.inProgress`, `research.progress`
- **Resources**: `resources.food`, `resources.gold`
- **Actions**: `startResearch()`, `cancelResearch()`, `subtractResources()`
- **Notifications**: `addNotification()` for user feedback

## Research Node States

Each research node can be in one of these states:

1. **Completed** (✓): Research is finished, effects are applied
2. **In Progress** (⏳): Research is currently being conducted
3. **Available**: Prerequisites met, can be started if resources available
4. **Locked** (🔒): Prerequisites not met yet

## Research Tiers

Research is organized into 3 tiers:

- **Tier 1**: Basic improvements (farming, mining, basic training)
- **Tier 2**: Advanced improvements (iron weapons, steel armor, fortification)
- **Tier 3**: Elite improvements (legendary weapons, master farming, special abilities)

## Integration with Research System

The component uses helper functions from `src/constants/research.ts`:

- `arePrerequisitesMet()`: Check if research can be unlocked
- `canAffordResearch()`: Check if player has enough resources
- `getResearchById()`: Get research node details
- `RESEARCH_BY_TIER`: Research organized by tier

## Visual Design

- **Color Coding**:
  - Green: Completed research
  - Blue: In-progress research
  - Yellow: Available and affordable
  - Orange: Available but not affordable
  - Gray: Locked (prerequisites not met)

- **Animations**:
  - Hover effects on available nodes
  - Progress bar animation
  - Modal fade in/out
  - Completion percentage animation

## Requirements Validation

This component validates the following requirements:

- **19.1**: Implement a research tree with technology upgrades
- **19.3**: Track research progress and completion
- **19.6**: Display research options and requirements clearly
- **19.7**: Disable research options when prerequisites are not met
- **2.2**: Component has a single, well-defined responsibility
- **2.3**: Uses React hooks for state and side effects

## Example Research Flow

1. Player views research tree
2. Clicks on an available research node
3. Modal shows details, effects, prerequisites, and costs
4. Player clicks "Bắt Đầu" (Start) button
5. Resources are deducted
6. Research starts with progress tracking
7. When complete, effects are applied and node marked as completed
8. New research nodes may become available

## Accessibility

- Keyboard navigation support through modal
- Clear visual indicators for all states
- Color contrast meets WCAG standards
- Screen reader friendly labels

## Performance

- Memoized calculations for node states
- Efficient filtering by tier
- Optimized re-renders using Zustand selectors
- Lazy loading of modal content
