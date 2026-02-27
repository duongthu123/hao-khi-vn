# Design Document

## Overview

This design document specifies the technical architecture for migrating "Đại Chiến Sử Việt - Hào Khí Đông A" from a monolithic vanilla JavaScript application to a modern Next.js 14+ application with TypeScript. The migration transforms a 5000+ line HTML file with embedded JavaScript into a modular, maintainable, and scalable React application while preserving all game functionality, Vietnamese cultural themes, and educational value.

### Design Goals

1. **Preserve Functionality**: Maintain 100% feature parity with the original game
2. **Modernize Architecture**: Implement React best practices with proper component decomposition
3. **Type Safety**: Leverage TypeScript for compile-time error detection
4. **Performance**: Achieve 60 FPS gameplay with optimized rendering and state management
5. **Maintainability**: Create modular, testable code with clear separation of concerns
6. **Extensibility**: Enable future feature additions through clean architecture
7. **Cultural Preservation**: Maintain Vietnamese language, historical accuracy, and Bạch Đằng theme

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (chosen for simplicity and performance)
- **Styling**: Tailwind CSS 3+ with custom theme extensions
- **Animation**: Framer Motion
- **UI Components**: Radix UI (accessible primitives)
- **Validation**: Zod
- **Data Fetching**: React Query (for cloud saves)
- **Testing**: Vitest + React Testing Library
- **Build Tools**: ESLint, Prettier, Husky

### Migration Strategy

The migration follows a phased approach:

1. **Phase 1**: Project setup, configuration, and type definitions
2. **Phase 2**: Core component extraction (Menu, Layout, UI primitives)
3. **Phase 3**: Game system migration (Hero, Map, Combat, Resources)
4. **Phase 4**: Advanced features (Quiz, Collection, AI, Research)
5. **Phase 5**: Save system implementation (local, auto-save, import/export)
6. **Phase 6**: Polish (animations, accessibility, performance optimization)
7. **Phase 7**: Testing and validation

## Architecture

### Application Structure

```
nextjs-game-migration/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Main game page
│   │   ├── globals.css           # Global styles and Tailwind imports
│   │   └── api/                  # API routes (for cloud saves)
│   │       └── saves/
│   │           └── route.ts
│   ├── components/               # React components
│   │   ├── game/                 # Game-specific components
│   │   │   ├── HeroSelection/
│   │   │   ├── GameMap/
│   │   │   ├── CombatView/
│   │   │   ├── ResourceDisplay/
│   │   │   ├── QuizModule/
│   │   │   ├── CollectionView/
│   │   │   ├── ProfileView/
│   │   │   ├── ResearchTree/
│   │   │   └── SaveLoadMenu/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── RadarChart/
│   │   │   └── LoadingSpinner/
│   │   └── layout/               # Layout components
│   │       ├── GameLayout/
│   │       └── MenuLayout/
│   ├── lib/                      # Core game logic
│   │   ├── combat/
│   │   │   ├── engine.ts         # Combat calculations
│   │   │   └── direction.ts     # Direction-based mechanics
│   │   ├── ai/
│   │   │   ├── strategy.ts       # AI decision making
│   │   │   └── difficulty.ts    # Difficulty levels
│   │   ├── resources/
│   │   │   ├── manager.ts        # Resource operations
│   │   │   └── generation.ts    # Resource generation logic
│   │   ├── saves/
│   │   │   ├── local.ts          # Local storage operations
│   │   │   ├── serialization.ts # Save/load serialization
│   │   │   ├── validation.ts    # Save data validation
│   │   │   └── cloud.ts          # Cloud storage integration
│   │   └── utils/
│   │       ├── canvas.ts         # Canvas utilities
│   │       └── vietnamese.ts    # Vietnamese text utilities
│   ├── store/                    # Zustand state management
│   │   ├── index.ts              # Store configuration
│   │   ├── slices/
│   │   │   ├── gameSlice.ts      # Game state
│   │   │   ├── heroSlice.ts      # Hero state
│   │   │   ├── combatSlice.ts    # Combat state
│   │   │   ├── resourceSlice.ts  # Resource state
│   │   │   ├── collectionSlice.ts # Collection state
│   │   │   ├── profileSlice.ts   # Profile state
│   │   │   └── uiSlice.ts        # UI state
│   │   └── middleware/
│   │       ├── logger.ts         # Development logging
│   │       └── persist.ts        # State persistence
│   ├── types/                    # TypeScript type definitions
│   │   ├── game.ts               # Core game types
│   │   ├── hero.ts               # Hero types
│   │   ├── unit.ts               # Unit types
│   │   ├── combat.ts             # Combat types
│   │   ├── resource.ts           # Resource types
│   │   ├── save.ts               # Save system types
│   │   └── index.ts              # Type exports
│   ├── schemas/                  # Zod validation schemas
│   │   ├── save.schema.ts
│   │   ├── hero.schema.ts
│   │   └── quiz.schema.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGameLoop.ts
│   │   ├── useAutoSave.ts
│   │   ├── useKeyboard.ts
│   │   └── useSpeech.ts
│   └── constants/                # Game constants
│       ├── heroes.ts
│       ├── units.ts
│       ├── buildings.ts
│       └── config.ts
├── public/                       # Static assets
│   ├── images/
│   ├── sounds/
│   └── data/
│       └── quiz-questions.json
├── tests/                        # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                         # Documentation
    ├── architecture.md
    ├── migration-checklist.md
    └── vietnamese-context.md
```

### Component Architecture

The application follows a hierarchical component structure:

**Layout Layer**:
- `RootLayout`: Provides global context (Zustand store, React Query, theme)
- `GameLayout`: Main game container with header, sidebar, and content areas
- `MenuLayout`: Menu screens (main menu, settings, load game)

**Feature Layer**:
- `HeroSelection`: Hero browsing and selection interface
- `GameMap`: Interactive map with pan/zoom and unit rendering
- `CombatView`: Combat visualization and controls
- `ResourceDisplay`: Real-time resource tracking
- `QuizModule`: Educational quiz interface
- `CollectionView`: Hero collection and museum
- `ProfileView`: Player profile and statistics
- `ResearchTree`: Technology research interface
- `SaveLoadMenu`: Save game management

**UI Layer**:
- Reusable components built on Radix UI primitives
- Consistent styling with Tailwind CSS
- Accessible by default

### State Management Architecture

Using Zustand with slice pattern for modular state management:

```typescript
// Store structure
{
  game: {
    phase: 'menu' | 'hero-selection' | 'playing' | 'paused',
    difficulty: 'easy' | 'normal' | 'hard',
    currentLevel: number,
    isPaused: boolean
  },
  hero: {
    selectedHero: Hero | null,
    availableHeroes: Hero[],
    unlockedHeroes: string[]
  },
  combat: {
    units: Unit[],
    buildings: Building[],
    activeEffects: Effect[],
    combatLog: CombatEvent[]
  },
  resources: {
    food: number,
    gold: number,
    army: number,
    foodCap: number,
    goldCap: number,
    armyCap: number,
    generation: ResourceGeneration
  },
  collection: {
    heroes: CollectedHero[],
    items: CollectedItem[],
    completionPercentage: number
  },
  profile: {
    playerName: string,
    rank: string,
    wins: number,
    losses: number,
    achievements: Achievement[]
  },
  ui: {
    activeModal: string | null,
    notifications: Notification[],
    mapZoom: number,
    mapPosition: { x: number, y: number }
  }
}
```

Each slice is responsible for:
- State definition
- Actions (state mutations)
- Selectors (derived state)
- Persistence configuration

### Data Flow

1. **User Interaction** → Component event handler
2. **Component** → Zustand action dispatch
3. **Zustand Action** → State update (immutable)
4. **State Update** → Component re-render (via selector)
5. **Component** → UI update with animation

For async operations:
1. **Component** → React Query mutation/query
2. **React Query** → API call or async operation
3. **Success/Error** → Zustand state update
4. **State Update** → Component re-render

### Rendering Strategy

**Server Components** (static content):
- Menu screens
- Hero information pages
- Quiz question loading
- Documentation pages

**Client Components** (interactive):
- Game map (Canvas-based)
- Combat view
- Resource displays
- All game controls
- Save/load interface

**Hybrid Approach**:
- Server component shells with client component islands
- Lazy loading for heavy components (map, combat engine)
- Code splitting by route and feature

## Components and Interfaces

### Core Components

#### GameMap Component

**Purpose**: Renders the interactive battlefield with pan/zoom capabilities

**Props**:
```typescript
interface GameMapProps {
  units: Unit[];
  buildings: Building[];
  terrain: TerrainData;
  onUnitClick: (unit: Unit) => void;
  onTileClick: (x: number, y: number) => void;
  zoom: number;
  position: { x: number; y: number };
}
```

**Implementation**:
- HTML5 Canvas for rendering
- Separate layers for terrain, buildings, units, effects
- Quadtree spatial indexing for efficient collision detection
- Viewport culling to render only visible entities
- Touch and mouse event handling for pan/zoom
- Debounced re-renders on zoom/pan

**Key Methods**:
- `renderFrame()`: Main render loop
- `handlePan(delta: Vector2)`: Pan camera
- `handleZoom(delta: number)`: Zoom camera
- `worldToScreen(pos: Vector2)`: Coordinate conversion
- `screenToWorld(pos: Vector2)`: Coordinate conversion

#### CombatEngine Service

**Purpose**: Handles all combat calculations and unit interactions

**Interface**:
```typescript
interface CombatEngine {
  calculateDamage(attacker: Unit, defender: Unit, direction: Direction): number;
  processAttack(attacker: Unit, defender: Unit): CombatResult;
  checkUnitDeath(unit: Unit): boolean;
  applyStatusEffects(unit: Unit): void;
  resolveAbility(unit: Unit, ability: Ability, targets: Unit[]): AbilityResult;
}
```

**Implementation**:
- Direction-based damage modifiers (front, side, rear attacks)
- Unit type advantages (cavalry vs archers, etc.)
- Hero ability integration
- Status effect system (stun, poison, buff, debuff)
- Combat event generation for animation triggers

**Combat Formula**:
```
baseDamage = attacker.attack - defender.defense
directionModifier = getDirectionModifier(attackDirection)
typeModifier = getTypeAdvantage(attacker.type, defender.type)
finalDamage = baseDamage * directionModifier * typeModifier * randomFactor(0.9, 1.1)
```

#### SaveSystem Service

**Purpose**: Manages all save/load operations

**Interface**:
```typescript
interface SaveSystem {
  // Local saves
  saveToSlot(slot: number, state: GameState): Promise<void>;
  loadFromSlot(slot: number): Promise<GameState>;
  getSaveMetadata(slot: number): SaveMetadata | null;
  deleteSave(slot: number): Promise<void>;
  
  // Auto-save
  enableAutoSave(interval: number): void;
  disableAutoSave(): void;
  
  // Import/Export
  exportSave(slot: number): Promise<Blob>;
  importSave(file: File, slot: number): Promise<void>;
  
  // Cloud (optional)
  syncToCloud(state: GameState): Promise<void>;
  loadFromCloud(): Promise<GameState>;
  resolveConflict(local: GameState, cloud: GameState): Promise<GameState>;
}
```

**Implementation**:
- JSON serialization with compression (LZ-string)
- Schema validation before save/load
- Versioning for backward compatibility
- Metadata tracking (timestamp, progress, resources)
- Auto-save with configurable interval
- Conflict resolution UI for cloud sync

#### HeroSelection Component

**Purpose**: Hero browsing and selection interface

**Props**:
```typescript
interface HeroSelectionProps {
  heroes: Hero[];
  unlockedHeroes: string[];
  selectedHero: Hero | null;
  onHeroSelect: (hero: Hero) => void;
  onConfirm: () => void;
}
```

**Features**:
- Grid layout with hero portraits
- Faction filtering (Vietnamese, Mongol)
- Hero detail view with stats radar chart
- Lock/unlock status indicators
- Ability descriptions in Vietnamese
- Smooth transitions between views

#### ResourceDisplay Component

**Purpose**: Real-time resource tracking

**Props**:
```typescript
interface ResourceDisplayProps {
  resources: Resources;
  generation: ResourceGeneration;
  showDetails?: boolean;
}
```

**Features**:
- Animated counter updates
- Resource cap indicators
- Generation rate display
- Warning states for low resources
- Tooltip with detailed breakdown

#### QuizModule Component

**Purpose**: Educational quiz interface

**Props**:
```typescript
interface QuizModuleProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onReward: (reward: Reward) => void;
}
```

**Features**:
- Question presentation with timer
- Multiple choice answer selection
- Immediate feedback on answers
- Historical context display
- Progress tracking
- Reward animation on completion

### UI Component Library

Built on Radix UI primitives with custom styling:

**Button**:
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- States: default, hover, active, disabled
- Loading state with spinner

**Modal**:
- Accessible dialog with focus trap
- Backdrop with blur effect
- Smooth enter/exit animations
- Responsive sizing

**Card**:
- Container for grouped content
- Optional header, body, footer
- Elevation variants

**RadarChart**:
- Canvas-based stat visualization
- Animated rendering
- Multi-hero comparison
- Responsive sizing

### Custom Hooks

**useGameLoop**:
```typescript
function useGameLoop(callback: (deltaTime: number) => void, fps: number = 60): void
```
- Manages game update loop with requestAnimationFrame
- Provides delta time for frame-independent updates
- Automatic cleanup on unmount

**useAutoSave**:
```typescript
function useAutoSave(interval: number, enabled: boolean): void
```
- Triggers auto-save at specified interval
- Debounces during active combat
- Shows save notification

**useKeyboard**:
```typescript
function useKeyboard(bindings: KeyBindings): void
```
- Keyboard shortcut management
- Configurable key bindings
- Prevents conflicts with browser shortcuts

**useSpeech**:
```typescript
function useSpeech(): {
  speak: (text: string, lang: string) => void;
  listen: (callback: (text: string) => void) => void;
  supported: boolean;
}
```
- Web Speech API wrapper
- Vietnamese language support
- Graceful degradation

## Data Models

### Core Types

#### Hero
```typescript
interface Hero {
  id: string;
  name: string;
  nameVietnamese: string;
  faction: 'vietnamese' | 'mongol';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack: number;
    defense: number;
    speed: number;
    leadership: number;
    intelligence: number;
  };
  abilities: Ability[];
  portrait: string;
  description: string;
  historicalContext: string;
  unlockCondition?: UnlockCondition;
}

interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost: number;
  effect: AbilityEffect;
}

type AbilityEffect = 
  | { type: 'damage'; value: number; radius: number }
  | { type: 'heal'; value: number; radius: number }
  | { type: 'buff'; stat: keyof UnitStats; value: number; duration: number }
  | { type: 'debuff'; stat: keyof UnitStats; value: number; duration: number };
```

#### Unit
```typescript
interface Unit {
  id: string;
  type: 'infantry' | 'cavalry' | 'archer' | 'siege';
  faction: 'vietnamese' | 'mongol';
  position: Vector2;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  direction: Direction;
  status: StatusEffect[];
  owner: 'player' | 'ai';
}

type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

interface StatusEffect {
  type: 'stun' | 'poison' | 'buff' | 'debuff';
  duration: number;
  value?: number;
  stat?: keyof UnitStats;
}

interface Vector2 {
  x: number;
  y: number;
}
```

#### Resources
```typescript
interface Resources {
  food: number;
  gold: number;
  army: number;
}

interface ResourceCaps {
  food: number;
  gold: number;
  army: number;
}

interface ResourceGeneration {
  foodPerSecond: number;
  goldPerSecond: number;
  armyPerSecond: number;
}

interface ResourceTransaction {
  type: 'add' | 'subtract';
  resource: keyof Resources;
  amount: number;
  reason: string;
  timestamp: number;
}
```

#### GameState
```typescript
interface GameState {
  version: string;
  metadata: SaveMetadata;
  game: {
    phase: GamePhase;
    difficulty: Difficulty;
    currentLevel: number;
    elapsedTime: number;
  };
  hero: {
    selectedHero: Hero | null;
    unlockedHeroes: string[];
  };
  combat: {
    units: Unit[];
    buildings: Building[];
    activeEffects: Effect[];
  };
  resources: Resources & ResourceCaps & { generation: ResourceGeneration };
  collection: {
    heroes: string[];
    items: string[];
    completionPercentage: number;
  };
  profile: PlayerProfile;
  research: ResearchState;
  quiz: QuizProgress;
}

type GamePhase = 'menu' | 'hero-selection' | 'playing' | 'paused' | 'game-over';
type Difficulty = 'easy' | 'normal' | 'hard';
```

#### SaveMetadata
```typescript
interface SaveMetadata {
  slot: number;
  timestamp: number;
  playerName: string;
  progress: number; // 0-100
  resources: Resources;
  level: number;
  playTime: number; // seconds
  version: string;
}
```

#### PlayerProfile
```typescript
interface PlayerProfile {
  name: string;
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
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}
```

#### Quiz
```typescript
interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'history' | 'strategy' | 'culture';
}

interface QuizProgress {
  questionsAnswered: number;
  correctAnswers: number;
  completedCategories: string[];
  rewards: Reward[];
}

interface Reward {
  type: 'hero' | 'item' | 'resource' | 'achievement';
  id: string;
  amount?: number;
}
```

#### Research
```typescript
interface ResearchState {
  completed: string[];
  inProgress: string | null;
  progress: number; // 0-100
  available: string[];
}

interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: Resources;
  duration: number; // seconds
  prerequisites: string[];
  effects: ResearchEffect[];
}

type ResearchEffect =
  | { type: 'unit-stat'; unitType: string; stat: string; value: number }
  | { type: 'resource-generation'; resource: string; value: number }
  | { type: 'unlock-unit'; unitType: string }
  | { type: 'unlock-ability'; abilityId: string };
```

### Validation Schemas

Using Zod for runtime validation:

```typescript
// Save data schema
const SaveMetadataSchema = z.object({
  slot: z.number().int().min(0).max(4),
  timestamp: z.number().int().positive(),
  playerName: z.string().min(1).max(50),
  progress: z.number().min(0).max(100),
  resources: ResourcesSchema,
  level: z.number().int().positive(),
  playTime: z.number().int().nonnegative(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/)
});

const GameStateSchema = z.object({
  version: z.string(),
  metadata: SaveMetadataSchema,
  game: z.object({
    phase: z.enum(['menu', 'hero-selection', 'playing', 'paused', 'game-over']),
    difficulty: z.enum(['easy', 'normal', 'hard']),
    currentLevel: z.number().int().positive(),
    elapsedTime: z.number().nonnegative()
  }),
  // ... additional fields
});

// Hero schema
const HeroSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  nameVietnamese: z.string().min(1),
  faction: z.enum(['vietnamese', 'mongol']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  stats: z.object({
    attack: z.number().int().min(0).max(100),
    defense: z.number().int().min(0).max(100),
    speed: z.number().int().min(0).max(100),
    leadership: z.number().int().min(0).max(100),
    intelligence: z.number().int().min(0).max(100)
  }),
  abilities: z.array(AbilitySchema),
  portrait: z.string().url(),
  description: z.string(),
  historicalContext: z.string()
});
```

### Type Inference

TypeScript types are inferred from Zod schemas:

```typescript
type GameState = z.infer<typeof GameStateSchema>;
type Hero = z.infer<typeof HeroSchema>;
type SaveMetadata = z.infer<typeof SaveMetadataSchema>;
```

This ensures runtime validation and compile-time type safety are always in sync.

