# Core Dependencies Documentation

This document describes the core dependencies installed for the Vietnamese Historical Strategy Game migration project.

## State Management

### Zustand (v5.0.11)
- **Purpose**: Centralized state management for game state, hero data, combat, resources, and UI state
- **Why Zustand**: Lightweight, simple API, excellent TypeScript support, and better performance than Redux
- **Configuration**: Located in `src/store/index.ts` with middleware for devtools and persistence
- **Usage**: Import `useGameStore` hook to access and update state

## Styling

### Tailwind CSS (v3.4.0)
- **Purpose**: Utility-first CSS framework for styling components
- **Configuration**: `tailwind.config.ts` with custom theme extensions for Vietnamese cultural elements
- **Custom Theme**:
  - Bạch Đằng historical colors (primary, secondary, Vietnamese red/gold)
  - Faction colors (Vietnamese, Mongol)
  - Resource colors (food, gold, army)
  - Rarity tiers (common, rare, epic, legendary)
  - Custom animations (fade-in, slide-up, combat-hit, etc.)
  - Extended spacing and border radius utilities

## Animation

### Framer Motion (v12.34.3)
- **Purpose**: Production-ready animation library for React
- **Use Cases**:
  - Unit movements on the map
  - Combat interactions and damage effects
  - Menu transitions and modal appearances
  - Resource changes and notifications
- **Features**: Spring-based animations, gesture support, layout animations

## UI Components

### Radix UI
Accessible, unstyled component primitives:
- **@radix-ui/react-dialog** (v1.1.15): Modal dialogs and overlays
- **@radix-ui/react-dropdown-menu** (v2.1.16): Dropdown menus for game actions
- **@radix-ui/react-select** (v2.2.6): Select components for settings
- **@radix-ui/react-tooltip** (v1.2.8): Tooltips for game information
- **@radix-ui/react-tabs** (v1.1.13): Tab navigation for different game views
- **@radix-ui/react-slider** (v1.3.6): Sliders for settings (volume, difficulty)

**Why Radix UI**: Built-in accessibility (ARIA, keyboard navigation), unstyled (full control with Tailwind), and production-ready.

## Data Validation

### Zod (v4.3.6)
- **Purpose**: Runtime data validation and TypeScript type inference
- **Use Cases**:
  - Save game data validation before loading
  - User input validation in forms
  - API response validation (for cloud saves)
  - Hero and unit data integrity checks
- **Configuration**: Schemas defined in `src/schemas/` directory
- **Benefits**: Type-safe validation, automatic TypeScript type inference, clear error messages

## Async State Management

### React Query / TanStack Query (v5.90.21)
- **Purpose**: Data fetching, caching, and synchronization
- **Use Cases**:
  - Cloud save operations (when implemented)
  - External data fetching
  - Optimistic updates for better UX
  - Automatic cache invalidation
- **Configuration**: Query client configured in `src/lib/query-client.ts`
- **Provider**: Wrapped in `src/components/providers/Providers.tsx`

## Configuration Files

### Key Configuration Files
1. **tailwind.config.ts**: Tailwind CSS theme customization
2. **src/store/index.ts**: Zustand store setup with devtools and persistence
3. **src/lib/query-client.ts**: React Query client configuration
4. **src/schemas/index.ts**: Zod validation schemas
5. **src/components/providers/Providers.tsx**: React Query provider wrapper

## Next Steps

These dependencies provide the foundation for:
- Component development (Phase 2)
- Game system migration (Phase 3)
- Save system implementation (Phase 5)
- Animation and polish (Phase 6)

Refer to the design document (`.kiro/specs/nextjs-game-migration/design.md`) for detailed architecture and implementation plans.
