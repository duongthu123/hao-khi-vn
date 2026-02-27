# Resource Generation System

Time-based resource generation with building bonuses and cap enforcement.

## Overview

The resource generation system handles automatic resource accumulation over time, with bonuses from buildings and enforcement of resource caps. It provides utilities for:
- Calculating generation rates with building bonuses
- Generating resources over time with cap enforcement
- Checking resource cap status
- Formatting generation rates for display
- Detailed generation breakdowns

## Usage

### Basic Generation

```typescript
import {
  generateResources,
  calculateGenerationRates,
} from '@/lib/resources/generation';

// Current state
const resources = { food: 100, gold: 50, army: 10 };
const caps = { food: 1000, gold: 1000, army: 100 };
const baseGeneration = { foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0 };

// Generate resources over 10 seconds
const deltaTime = 10;
const newResources = generateResources(
  resources,
  caps,
  baseGeneration,
  deltaTime
);
// newResources = { food: 110, gold: 55, army: 10 }
```

### Building Bonuses

Buildings provide multiplicative bonuses to generation rates:
- **Farm**: +50% food generation per farm
- **Gold Mine**: +30% gold generation per mine
- **Barracks**: +20% army generation per barracks

```typescript
import { calculateGenerationRates } from '@/lib/resources/generation';
import { BuildingType } from '@/constants/buildings';

const baseGeneration = { foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0 };
const buildings = {
  [BuildingType.FARM]: 2,        // 2 farms
  [BuildingType.GOLD_MINE]: 1,   // 1 mine
};

const modifiedGeneration = calculateGenerationRates(baseGeneration, buildings);
// modifiedGeneration = {
//   foodPerSecond: 2.0,    // 1 * (1 + 2*0.5) = 2.0
//   goldPerSecond: 0.65,   // 0.5 * (1 + 1*0.3) = 0.65
//   armyPerSecond: 0
// }
```

### Cap Enforcement

Resources automatically stop generating when they reach their caps:

```typescript
import { generateResources, isAtCap } from '@/lib/resources/generation';

const resources = { food: 995, gold: 50, army: 10 };
const caps = { food: 1000, gold: 1000, army: 100 };
const generation = { foodPerSecond: 2, goldPerSecond: 0.5, armyPerSecond: 0 };

// Generate over 10 seconds
const newResources = generateResources(resources, caps, generation, 10);
// newResources = { food: 1000, gold: 55, army: 10 }
// Food is capped at 1000

// Check if at cap
if (isAtCap(newResources.food, caps.food)) {
  console.log('Food storage is full!');
}
```

### Checking Cap Status

```typescript
import { getResourcesAtCap, timeUntilCap } from '@/lib/resources/generation';

const resources = { food: 500, gold: 900, army: 50 };
const caps = { food: 1000, gold: 1000, army: 100 };
const generation = { foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 };

// Check which resources are at cap
const atCap = getResourcesAtCap(resources, caps);
// atCap = { food: false, gold: false, army: false }

// Calculate time until each resource reaches cap
const timeFood = timeUntilCap(resources.food, caps.food, generation.foodPerSecond);
// timeFood = 500 seconds (500 / 1)

const timeGold = timeUntilCap(resources.gold, caps.gold, generation.goldPerSecond);
// timeGold = 200 seconds (100 / 0.5)
```

### Effective Generation Rates

Get the actual generation rates considering caps:

```typescript
import { getEffectiveGenerationRates } from '@/lib/resources/generation';

const resources = { food: 1000, gold: 500, army: 50 };
const caps = { food: 1000, gold: 1000, army: 100 };
const generation = { foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 };

const effectiveRates = getEffectiveGenerationRates(resources, caps, generation);
// effectiveRates = {
//   foodPerSecond: 0,    // At cap, no generation
//   goldPerSecond: 0.5,  // Below cap, normal generation
//   armyPerSecond: 0.1   // Below cap, normal generation
// }
```

### Display Formatting

```typescript
import {
  formatGenerationRate,
  formatAllGenerationRates,
} from '@/lib/resources/generation';

const generation = { foodPerSecond: 1.5, goldPerSecond: 0.75, armyPerSecond: 0 };

// Format individual rate
const foodRate = formatGenerationRate(generation.foodPerSecond);
// foodRate = "+1.5/s"

// Format all rates
const allRates = formatAllGenerationRates(generation);
// allRates = {
//   food: "+1.5/s",
//   gold: "+0.8/s",
//   army: "0/s"
// }

// Custom precision
const preciseRates = formatAllGenerationRates(generation, 2);
// preciseRates = {
//   food: "+1.50/s",
//   gold: "+0.75/s",
//   army: "0/s"
// }
```

### Generation Breakdown

Get detailed information about generation sources:

```typescript
import { getGenerationBreakdown } from '@/lib/resources/generation';
import { BuildingType } from '@/constants/buildings';

const baseGeneration = { foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0 };
const buildings = {
  [BuildingType.FARM]: 2,
  [BuildingType.GOLD_MINE]: 1,
};

const breakdown = getGenerationBreakdown(baseGeneration, buildings);
// breakdown = {
//   food: {
//     base: 1,      // Base generation
//     bonus: 1,     // Bonus from 2 farms (1 * 2 * 0.5)
//     total: 2      // Total generation (1 + 1)
//   },
//   gold: {
//     base: 0.5,
//     bonus: 0.15,  // Bonus from 1 mine (0.5 * 1 * 0.3)
//     total: 0.65
//   },
//   army: {
//     base: 0,
//     bonus: 0,
//     total: 0
//   }
// }
```

## Integration with Game Loop

Typical usage in a game loop:

```typescript
import { useStore } from '@/store';
import { generateResources, calculateGenerationRates } from '@/lib/resources/generation';
import { BuildingType } from '@/constants/buildings';

function useResourceGeneration() {
  const resources = useStore(state => state.resources);
  const setResource = useStore(state => state.setResource);
  
  // Get building counts from game state
  const buildings = {
    [BuildingType.FARM]: 2,
    [BuildingType.GOLD_MINE]: 1,
    [BuildingType.BARRACKS]: 0,
  };
  
  // Calculate generation rates with building bonuses
  const generation = calculateGenerationRates(
    resources.generation,
    buildings
  );
  
  // Update resources every frame
  const updateResources = (deltaTime: number) => {
    const newResources = generateResources(
      resources,
      resources.caps,
      generation,
      deltaTime
    );
    
    setResource('food', newResources.food);
    setResource('gold', newResources.gold);
    setResource('army', newResources.army);
  };
  
  return { updateResources, generation };
}
```

## Building Bonus Configuration

Building bonuses are configured in `src/constants/config.ts`:

```typescript
export const RESOURCE_CONFIG = {
  buildingBonus: {
    farm: 0.5,      // +50% food generation per farm
    mine: 0.3,      // +30% gold generation per mine
    barracks: 0.2,  // +20% army generation per barracks
  },
};
```

## API Reference

### `calculateGenerationRates(baseGeneration, buildings)`
Calculates generation rates with building bonuses applied.

**Parameters:**
- `baseGeneration: ResourceGeneration` - Base generation rates per second
- `buildings: BuildingCounts` - Count of each building type

**Returns:** `ResourceGeneration` - Modified generation rates

### `generateResources(current, caps, generation, deltaTime)`
Generates resources over time with cap enforcement.

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: ResourceCaps` - Resource caps
- `generation: ResourceGeneration` - Generation rates per second
- `deltaTime: number` - Time elapsed in seconds

**Returns:** `Resources` - New resource amounts

### `calculateGeneratedAmount(generation, timeInSeconds)`
Calculates total resources generated over a time period (without caps).

**Parameters:**
- `generation: ResourceGeneration` - Generation rates per second
- `timeInSeconds: number` - Time period in seconds

**Returns:** `Resources` - Total resources generated

### `isAtCap(current, cap)`
Checks if a resource is at or above its cap.

**Parameters:**
- `current: number` - Current resource amount
- `cap: number` - Resource cap

**Returns:** `boolean` - True if at or above cap

### `getResourcesAtCap(current, caps)`
Checks which resources are at their caps.

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: ResourceCaps` - Resource caps

**Returns:** `{ food: boolean; gold: boolean; army: boolean }`

### `timeUntilCap(current, cap, generationRate)`
Calculates time until a resource reaches its cap.

**Parameters:**
- `current: number` - Current resource amount
- `cap: number` - Resource cap
- `generationRate: number` - Generation rate per second

**Returns:** `number` - Time in seconds (Infinity if at cap or no generation)

### `timeUntilAllCaps(current, caps, generation)`
Calculates time until all resources reach their caps.

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: ResourceCaps` - Resource caps
- `generation: ResourceGeneration` - Generation rates per second

**Returns:** `{ food: number; gold: number; army: number }`

### `formatGenerationRate(rate, precision?)`
Formats a generation rate for display.

**Parameters:**
- `rate: number` - Generation rate per second
- `precision: number` - Decimal places (default: 1)

**Returns:** `string` - Formatted rate (e.g., "+1.5/s")

### `formatAllGenerationRates(generation, precision?)`
Formats all generation rates for display.

**Parameters:**
- `generation: ResourceGeneration` - Generation rates per second
- `precision: number` - Decimal places (default: 1)

**Returns:** `{ food: string; gold: string; army: string }`

### `getEffectiveGenerationRates(current, caps, generation)`
Gets effective generation rates considering caps (0 if at cap).

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: ResourceCaps` - Resource caps
- `generation: ResourceGeneration` - Generation rates per second

**Returns:** `ResourceGeneration` - Effective generation rates

### `calculateBuildingBonus(buildingType, count)`
Calculates bonus multiplier from buildings.

**Parameters:**
- `buildingType: BuildingType` - Type of building
- `count: number` - Number of buildings

**Returns:** `number` - Bonus multiplier (e.g., 0.5 = +50%)

### `getGenerationBreakdown(baseGeneration, buildings)`
Gets detailed breakdown of generation sources.

**Parameters:**
- `baseGeneration: ResourceGeneration` - Base generation rates
- `buildings: BuildingCounts` - Building counts

**Returns:** Detailed breakdown with base, bonus, and total for each resource

## Performance Considerations

- All functions are pure and stateless
- No side effects or mutations
- Efficient calculations suitable for every-frame updates
- Cap enforcement prevents resource overflow
- Building bonus calculations are cached-friendly

## Testing

Comprehensive test suite covers:
- Generation rate calculations with various building combinations
- Resource generation over time
- Cap enforcement
- Edge cases (zero time, negative rates, resources at cap)
- Formatting and display utilities
- Integration scenarios

Run tests:
```bash
npm test -- src/lib/resources/__tests__/generation.test.ts
```
