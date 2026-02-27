# AI System

This directory contains the AI opponent system for the game, including strategic decision-making and difficulty level management.

## Overview

The AI system controls enemy units, fortress, and general behavior. It makes tactical decisions based on game state, manages resources, and adjusts behavior according to the selected difficulty level.

## Modules

### `difficulty.ts`

Defines AI difficulty levels and behavior modifiers.

**Key Features:**
- Three difficulty levels: Easy, Normal, Hard
- Configurable AI behavior parameters
- Reaction time simulation
- Decision quality modifiers
- Resource generation multipliers
- Unit stat adjustments

**Difficulty Levels:**

| Parameter | Easy | Normal | Hard |
|-----------|------|--------|------|
| Spawn Interval | 15s | 10s | 7s |
| Resource Multiplier | 0.8x | 1.0x | 1.3x |
| Aggressiveness | 0.4 | 0.6 | 0.8 |
| Unit Limit | 15 | 25 | 35 |
| Targeting Range | 300 | 400 | 500 |
| Reaction Time | 1500ms | 800ms | 400ms |
| Decision Quality | 0.6 | 0.8 | 0.95 |
| Strategic Accuracy | 0.7 | 0.85 | 0.95 |
| Unit Stat Multiplier | 0.9x | 1.0x | 1.1x |

**Usage Example:**

```typescript
import { 
  getAIDifficultySettings, 
  applyReactionDelay,
  shouldMakeOptimalDecision,
  calculateResourceGeneration 
} from '@/lib/ai/difficulty';
import { Difficulty } from '@/types/game';

// Get difficulty settings
const settings = getAIDifficultySettings(Difficulty.HARD);
console.log(settings.spawnInterval); // 7

// Apply reaction delay
await applyReactionDelay(Difficulty.EASY); // Waits 1500ms

// Check if AI should make optimal decision
if (shouldMakeOptimalDecision(Difficulty.NORMAL)) {
  // Make best strategic choice
} else {
  // Make suboptimal but reasonable choice
}

// Calculate resource generation
const baseRate = 10;
const adjustedRate = calculateResourceGeneration(baseRate, Difficulty.HARD);
// adjustedRate = 13 (10 * 1.3)
```

### `strategy.ts`

Implements AI strategic decision-making logic.

**Key Features:**
- Unit spawning decisions based on game phase
- Target selection with priority system
- Resource management strategy
- Army composition balancing
- Counter-unit selection
- Flanking position calculation

**Decision Systems:**

1. **Unit Spawning** (`decideUnitSpawn`)
   - Early game: Focus on economy units (infantry)
   - Mid game: Balanced army composition
   - Late game: Counter player's unit composition
   - Respects unit limits and resource availability

2. **Target Selection** (`selectTarget`)
   - Prioritizes low-health enemies
   - Targets high-value units (siege, cavalry)
   - Defends fortress from nearby threats
   - Considers distance and aggressiveness

3. **Resource Management** (`manageResources`)
   - Maintains resource buffer
   - Prioritizes defense when under attack
   - Saves for expensive units when ahead
   - Balances economy and military spending

**Usage Example:**

```typescript
import { 
  decideUnitSpawn, 
  selectTarget, 
  manageResources,
  type AIDecisionContext 
} from '@/lib/ai/strategy';

// Create decision context
const context: AIDecisionContext = {
  aiUnits: [...],
  playerUnits: [...],
  aiResources: { food: 200, gold: 150, army: 10 },
  difficulty: Difficulty.NORMAL,
  elapsedTime: 240,
  fortressPosition: { x: 500, y: 500 },
};

// Decide if AI should spawn a unit
const spawnDecision = decideUnitSpawn(context);
if (spawnDecision.shouldSpawn) {
  console.log(`Spawning ${spawnDecision.unitType} at`, spawnDecision.position);
}

// Select target for an AI unit
const targetDecision = selectTarget(aiUnit, context);
if (targetDecision.targetId) {
  console.log(`Targeting unit ${targetDecision.targetId}`);
}

// Manage resources
const resourceDecision = manageResources(context);
if (!resourceDecision.shouldSave) {
  console.log(`Building ${resourceDecision.targetUnit}`);
}
```

## Integration

The AI system integrates with:

- **Combat System** (`src/lib/combat/`): Executes AI unit actions
- **Resource System** (`src/lib/resources/`): Manages AI economy
- **Game State** (`src/store/`): Reads game state and updates AI units
- **Game Loop** (`src/hooks/useGameLoop.ts`): Runs AI updates each frame

## Testing

Both modules have comprehensive test coverage:

- `__tests__/difficulty.test.ts`: Tests difficulty settings and modifiers
- `__tests__/strategy.test.ts`: Tests AI decision-making logic

Run tests:
```bash
npm test -- src/lib/ai/__tests__/difficulty.test.ts
npm test -- src/lib/ai/__tests__/strategy.test.ts
```

## Requirements Validation

This AI system validates the following requirements:

- **17.1**: AI controls enemy units, fortress, and general
- **17.2**: AI makes tactical decisions based on game state
- **17.3**: AI implements difficulty levels (easy, normal, hard)
- **17.4**: AI spawns units according to strategy
- **17.5**: AI targets player units strategically
- **17.6**: AI manages resources and unit production
- **17.7**: AI runs on separate execution cycle
- **17.8**: AI maintains game balance and fairness

## Future Enhancements

Potential improvements:

1. **Machine Learning**: Train AI on player behavior patterns
2. **Personality Traits**: Different AI commanders with unique strategies
3. **Adaptive Difficulty**: Dynamically adjust difficulty based on player performance
4. **Cooperative AI**: Team-based AI coordination
5. **Advanced Tactics**: Formations, ambushes, feints
6. **Economic Strategies**: Different economic build orders
7. **Hero Abilities**: Smart hero ability usage
8. **Map Awareness**: Terrain-based tactical decisions
