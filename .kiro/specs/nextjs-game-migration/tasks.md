# Implementation Plan: Next.js Game Migration

## Overview

This implementation plan guides the migration of "Đại Chiến Sử Việt - Hào Khí Đông A" from vanilla HTML/CSS/JavaScript to Next.js 14+ with TypeScript. The migration follows a 7-phase strategy that preserves all game functionality while modernizing the architecture with Zustand state management, Tailwind CSS styling, and comprehensive component decomposition.

The plan covers all 32 requirements including core game systems (hero selection, map, combat, resources), advanced features (quiz, collection, AI, research), save system implementation (local, auto-save, import/export), and quality attributes (performance, accessibility, testing).

## Tasks

- [x] 1. Phase 1: Project Setup and Configuration
  - [x] 1.1 Initialize Next.js 14+ project with TypeScript and App Router
    - Run `npx create-next-app@latest` with TypeScript, ESLint, Tailwind CSS, App Router options
    - Configure `tsconfig.json` with strict mode, path aliases (@/ for src/), and proper compiler options
    - Set up project directory structure (src/app, src/components, src/lib, src/store, src/types, src/schemas, src/hooks, src/constants)
    - _Requirements: 1.1, 1.2, 30.4_

  - [x] 1.2 Configure development tooling and code quality
    - Configure ESLint with Next.js, React, and TypeScript rules
    - Set up Prettier with consistent formatting rules
    - Install and configure Husky with pre-commit hooks
    - Configure lint-staged for pre-commit linting
    - Create .editorconfig for consistent editor settings
    - _Requirements: 30.1, 30.2, 30.3_

  - [x] 1.3 Install and configure core dependencies
    - Install Zustand for state management
    - Install Tailwind CSS and configure with custom theme extensions
    - Install Framer Motion for animations
    - Install Radix UI component primitives (@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, etc.)
    - Install Zod for validation
    - Install React Query (@tanstack/react-query) for async state
    - _Requirements: 3.1, 5.1, 6.1, 22.1, 24.1, 25.1_

  - [x] 1.4 Configure Tailwind CSS with Vietnamese cultural theme
    - Extend Tailwind config with Bạch Đằng theme colors (blues, golds, traditional Vietnamese palette)
    - Configure custom fonts for Vietnamese text display
    - Set up responsive breakpoints (mobile: 320px, tablet: 768px, desktop: 1024px)
    - Configure Tailwind purge settings for production optimization
    - Create globals.css with base styles and CSS custom properties
    - _Requirements: 5.2, 5.3, 5.6, 5.7, 1.7_

  - [x] 1.5 Define TypeScript type system foundation
    - Create src/types/game.ts with core game types (GamePhase, Difficulty, GameState)
    - Create src/types/hero.ts with Hero, Ability, AbilityEffect interfaces
    - Create src/types/unit.ts with Unit, Direction, StatusEffect, Vector2 interfaces
    - Create src/types/combat.ts with CombatResult, CombatEvent interfaces
    - Create src/types/resource.ts with Resources, ResourceCaps, ResourceGeneration, ResourceTransaction interfaces
    - Create src/types/save.ts with SaveMetadata, SaveSlot interfaces
    - Create src/types/index.ts to export all types
    - Use enums for fixed value sets (HeroFaction, UnitType, ResourceType, Direction)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8_

  - [x] 1.6 Create Zod validation schemas
    - Create src/schemas/save.schema.ts with SaveMetadataSchema and GameStateSchema
    - Create src/schemas/hero.schema.ts with HeroSchema and AbilitySchema
    - Create src/schemas/quiz.schema.ts with QuizQuestionSchema
    - Create src/schemas/resource.schema.ts with ResourcesSchema
    - Ensure schemas match TypeScript interfaces for type inference
    - _Requirements: 24.1, 24.2, 24.5, 24.6_

  - [x] 1.7 Configure Next.js for game assets and optimization
    - Configure next.config.js for image optimization
    - Set up static asset handling for game images, sounds, and data files
    - Configure webpack for any custom loaders needed
    - Set up environment variables structure (.env.local template)
    - Configure build output settings for optimal performance
    - _Requirements: 1.5, 1.6, 30.5, 30.7_

- [x] 2. Phase 2: Core Component Extraction and Layout
  - [x] 2.1 Create root layout and provider setup
    - Create src/app/layout.tsx with RootLayout component
    - Set up Zustand store provider wrapper
    - Set up React Query QueryClientProvider
    - Configure Framer Motion MotionConfig for global animation settings
    - Add Vietnamese language metadata and SEO tags
    - _Requirements: 1.3, 1.4, 2.6, 26.1, 26.2_

  - [x] 2.2 Create main game page structure
    - Create src/app/page.tsx as main game entry point
    - Implement client component wrapper for interactive game
    - Set up basic layout structure (header, main content, footer)
    - _Requirements: 1.4, 2.1, 2.6_

  - [x] 2.3 Build UI component library foundation
    - Create src/components/ui/Button component with variants (primary, secondary, danger, ghost) and sizes
    - Create src/components/ui/Modal component using Radix Dialog with accessible focus management
    - Create src/components/ui/Card component for content grouping
    - Create src/components/ui/LoadingSpinner component with animation
    - Style all components with Tailwind CSS following theme
    - _Requirements: 2.3, 2.4, 2.5, 5.4, 22.1_

  - [x] 2.4 Create layout components
    - Create src/components/layout/GameLayout component with header, sidebar, and content areas
    - Create src/components/layout/MenuLayout component for menu screens
    - Implement responsive layout behavior for mobile, tablet, and desktop
    - Add navigation structure and menu system
    - _Requirements: 2.6, 2.7, 20.1, 20.7_

  - [x] 2.5 Extract menu system components
    - Create src/components/game/MainMenu component with game start, load game, settings options
    - Create src/components/game/SettingsMenu component for game configuration
    - Implement menu navigation and transitions with Framer Motion
    - Add Vietnamese text for all menu items
    - _Requirements: 2.2, 2.3, 6.4, 1.7_

  - [x] 2.6 Write unit tests for UI components
    - Test Button component variants, states, and click handlers
    - Test Modal component accessibility and focus management
    - Test Card component rendering
    - Use React Testing Library and Vitest
    - _Requirements: 27.7_

- [x] 3. Phase 3: State Management Implementation
  - [x] 3.1 Set up Zustand store structure
    - Create src/store/index.ts with store configuration
    - Set up store with slice pattern for modular state
    - Configure devtools middleware for development
    - Configure persist middleware for state persistence
    - _Requirements: 3.1, 3.6, 3.7, 3.8_

  - [x] 3.2 Implement game state slice
    - Create src/store/slices/gameSlice.ts
    - Define game state (phase, difficulty, currentLevel, isPaused, elapsedTime)
    - Implement actions (setPhase, setDifficulty, pauseGame, resumeGame, incrementTime)
    - Implement selectors for derived state
    - _Requirements: 3.2, 3.3, 3.8_

  - [x] 3.3 Implement hero state slice
    - Create src/store/slices/heroSlice.ts
    - Define hero state (selectedHero, availableHeroes, unlockedHeroes)
    - Implement actions (selectHero, unlockHero, loadHeroes)
    - Implement selectors for hero filtering and lookup
    - _Requirements: 3.2, 3.3, 11.4, 11.6_

  - [x] 3.4 Implement combat state slice
    - Create src/store/slices/combatSlice.ts
    - Define combat state (units, buildings, activeEffects, combatLog)
    - Implement actions (addUnit, removeUnit, updateUnit, addEffect, logCombatEvent)
    - Implement selectors for unit queries and combat status
    - _Requirements: 3.2, 3.3, 13.4_

  - [x] 3.5 Implement resource state slice
    - Create src/store/slices/resourceSlice.ts
    - Define resource state (food, gold, army, caps, generation rates)
    - Implement actions (addResource, subtractResource, setGeneration, updateCaps)
    - Implement resource validation logic (check sufficient resources before transactions)
    - Implement selectors for resource calculations
    - _Requirements: 3.2, 3.3, 14.1, 14.3, 14.6_

  - [x] 3.6 Implement collection state slice
    - Create src/store/slices/collectionSlice.ts
    - Define collection state (heroes, items, completionPercentage)
    - Implement actions (addToCollection, updateCompletion)
    - Implement selectors for collection queries
    - _Requirements: 3.2, 3.3, 16.1, 16.4_

  - [x] 3.7 Implement profile state slice
    - Create src/store/slices/profileSlice.ts
    - Define profile state (playerName, rank, level, wins, losses, achievements, statistics)
    - Implement actions (updateProfile, addAchievement, incrementStats)
    - Implement rank calculation logic
    - _Requirements: 3.2, 3.3, 18.1, 18.4_

  - [x] 3.8 Implement UI state slice
    - Create src/store/slices/uiSlice.ts
    - Define UI state (activeModal, notifications, mapZoom, mapPosition)
    - Implement actions (openModal, closeModal, addNotification, updateMapView)
    - Implement selectors for UI queries
    - _Requirements: 3.2, 3.3, 3.5_

  - [x] 3.9 Write unit tests for state management
    - Test each slice's actions and state updates
    - Test resource validation logic
    - Test rank calculation in profile slice
    - Verify immutable state updates
    - _Requirements: 27.1, 27.3_

- [x] 4. Checkpoint - Verify state management foundation
  - Ensure all tests pass, verify store structure is working correctly, ask the user if questions arise.

- [x] 5. Phase 4: Game Constants and Data
  - [x] 5.1 Create hero data constants
    - Create src/constants/heroes.ts with all Vietnamese and Mongol heroes
    - Define hero stats, abilities, portraits, descriptions, and historical context
    - Ensure all Vietnamese text is properly encoded
    - Include unlock conditions for each hero
    - _Requirements: 11.1, 11.2, 11.7_

  - [x] 5.2 Create unit data constants
    - Create src/constants/units.ts with unit type definitions
    - Define stats for infantry, cavalry, archer, and siege units
    - Include unit costs and build times
    - Define unit type advantages matrix
    - _Requirements: 13.1, 13.8_

  - [x] 5.3 Create building and research data constants
    - Create src/constants/buildings.ts with building definitions
    - Create src/constants/research.ts with research tree data
    - Define research prerequisites, costs, durations, and effects
    - _Requirements: 19.1, 19.2, 19.6_

  - [x] 5.4 Create quiz data and migrate questions
    - Create public/data/quiz-questions.json with all quiz questions
    - Organize questions by category (history, strategy, culture) and difficulty
    - Ensure Vietnamese text is properly formatted
    - Include explanations and correct answers
    - _Requirements: 15.1, 15.5_

  - [x] 5.5 Create game configuration constants
    - Create src/constants/config.ts with game configuration values
    - Define map dimensions, resource generation rates, combat formulas
    - Define difficulty modifiers
    - Define auto-save intervals and other configurable values
    - _Requirements: 8.2, 14.5, 17.3_

- [x] 6. Phase 5: Hero System and Map Implementation
  - [x] 6.1 Implement HeroSelection component
    - Create src/components/game/HeroSelection/HeroSelection.tsx
    - Implement hero grid layout with faction filtering
    - Add hero portrait rendering with lock/unlock indicators
    - Implement hero selection interaction
    - Connect to hero state slice
    - _Requirements: 11.3, 11.7, 11.8, 2.2, 2.3_

  - [x] 6.2 Implement HeroDetail component
    - Create src/components/game/HeroSelection/HeroDetail.tsx
    - Display hero stats, abilities, and historical context
    - Implement radar chart for stat visualization (create RadarChart component)
    - Add ability descriptions in Vietnamese
    - Implement hero comparison mode
    - _Requirements: 11.5, 29.1, 29.2, 29.5_

  - [x] 6.3 Create RadarChart component
    - Create src/components/ui/RadarChart.tsx using HTML5 Canvas
    - Implement radar chart rendering with hero stats (attack, defense, speed, leadership, intelligence)
    - Add animation for chart rendering
    - Make chart responsive to container size
    - Support multi-hero comparison
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.6, 29.7, 29.8_

  - [x] 6.4 Implement GameMap component foundation
    - Create src/components/game/GameMap/GameMap.tsx
    - Set up HTML5 Canvas rendering
    - Implement canvas layers (terrain, buildings, units, effects)
    - Set up coordinate system and viewport management
    - _Requirements: 12.3, 12.4, 2.2, 2.3_

  - [x] 6.5 Implement map pan and zoom controls
    - Add mouse drag event handlers for panning
    - Add mouse wheel event handlers for zooming
    - Add touch gesture support for mobile (pinch zoom, drag pan)
    - Implement smooth camera transitions
    - Add map boundary constraints
    - Connect to UI state slice for map position/zoom
    - _Requirements: 12.1, 12.2, 12.5, 12.6, 20.4_

  - [x] 6.6 Implement map rendering optimization
    - Implement viewport culling to render only visible entities
    - Implement quadtree spatial indexing for efficient collision detection
    - Optimize render loop to only redraw changed elements
    - Implement frame rate management (target 60 FPS)
    - _Requirements: 12.7, 12.8, 21.7_

  - [x] 6.7 Implement unit rendering on map
    - Create unit visual representation system
    - Render units from combat state on map
    - Implement unit selection and highlighting
    - Add unit health bars and status indicators
    - _Requirements: 12.4, 13.5_

  - [x] 6.8 Write unit tests for map utilities
    - Test coordinate conversion functions (worldToScreen, screenToWorld)
    - Test viewport culling logic
    - Test boundary constraint calculations
    - _Requirements: 27.1_

- [x] 7. Phase 6: Combat System Implementation
  - [x] 7.1 Implement combat engine core
    - Create src/lib/combat/engine.ts
    - Implement calculateDamage function with direction-based modifiers
    - Implement unit type advantage calculations
    - Implement processAttack function for unit interactions
    - Implement checkUnitDeath function
    - _Requirements: 13.1, 13.2, 13.3, 13.6, 13.8_

  - [x] 7.2 Implement direction-based combat mechanics
    - Create src/lib/combat/direction.ts
    - Implement direction calculation between units
    - Implement direction modifier system (front, side, rear attack bonuses)
    - Implement unit facing and rotation logic
    - _Requirements: 13.1, 13.3_

  - [x] 7.3 Implement status effect system
    - Add status effect application logic to combat engine
    - Implement status effect duration tracking
    - Implement applyStatusEffects function for periodic effects
    - Add status effect visual indicators
    - _Requirements: 13.5_

  - [x] 7.4 Implement hero ability system
    - Implement resolveAbility function in combat engine
    - Add ability cooldown tracking
    - Add ability cost validation
    - Implement area-of-effect ability targeting
    - Connect abilities to hero data
    - _Requirements: 11.2, 13.5_

  - [x] 7.5 Implement CombatView component
    - Create src/components/game/CombatView/CombatView.tsx
    - Display combat interface with unit controls
    - Show combat log with recent events
    - Add ability activation buttons
    - Display unit selection and targeting UI
    - _Requirements: 2.2, 13.5_

  - [x] 7.6 Integrate combat animations
    - Add Framer Motion animations for unit attacks
    - Implement damage number animations
    - Add death animations for units
    - Implement ability effect animations
    - Ensure animations maintain 60 FPS
    - _Requirements: 6.2, 6.3, 6.7, 13.5_

  - [x] 7.7 Implement combat sound effects
    - Create src/lib/audio/soundManager.ts using Web Audio API
    - Add attack, hit, death, and ability sound effects
    - Implement sound effect pooling for performance
    - Add volume controls and mute option
    - _Requirements: 13.7_

  - [x] 7.8 Write unit tests for combat engine
    - Test damage calculation with various unit types and directions
    - Test unit type advantage matrix
    - Test status effect application and duration
    - Test hero ability effects
    - Verify combat balance matches original game
    - _Requirements: 27.2, 31.5_

- [x] 8. Phase 7: Resource Management System
  - [x] 8.1 Implement resource manager core logic
    - Create src/lib/resources/manager.ts
    - Implement resource transaction functions (add, subtract, validate)
    - Implement atomic transaction handling
    - Add transaction logging for debugging
    - _Requirements: 14.2, 14.3, 14.6_

  - [x] 8.2 Implement resource generation system
    - Create src/lib/resources/generation.ts
    - Implement time-based resource generation
    - Add building-based generation bonuses
    - Implement resource cap enforcement
    - _Requirements: 14.2, 14.5_

  - [x] 8.3 Implement ResourceDisplay component
    - Create src/components/game/ResourceDisplay/ResourceDisplay.tsx
    - Display current resources with animated counters
    - Show resource caps and generation rates
    - Add warning indicators for low resources
    - Implement detailed tooltip with resource breakdown
    - _Requirements: 14.4, 2.2, 2.3_

  - [x] 8.4 Implement resource generation game loop
    - Create useGameLoop custom hook in src/hooks/useGameLoop.ts
    - Integrate resource generation into game loop
    - Update resource state at regular intervals
    - Ensure frame-independent updates using delta time
    - _Requirements: 14.2, 21.7_

  - [x] 8.5 Implement resource transaction UI feedback
    - Add notification system for resource changes
    - Implement floating text for resource gains/losses
    - Add error messages for insufficient resources
    - Animate resource display updates
    - _Requirements: 14.4, 14.7, 23.3_

  - [x] 8.6 Write unit tests for resource manager
    - Test resource transaction validation
    - Test resource cap enforcement
    - Test generation calculations
    - Test atomic transaction handling
    - _Requirements: 27.3_

- [x] 9. Checkpoint - Verify core game systems
  - Ensure all tests pass, verify hero selection, map, combat, and resources work correctly, ask the user if questions arise.

- [x] 10. Phase 8: Advanced Game Features
  - [x] 10.1 Implement AI system foundation
    - Create src/lib/ai/strategy.ts
    - Implement AI decision-making logic for unit spawning
    - Implement AI targeting logic for attacks
    - Implement AI resource management
    - _Requirements: 17.1, 17.2, 17.4, 17.6_

  - [x] 10.2 Implement AI difficulty levels
    - Create src/lib/ai/difficulty.ts
    - Define difficulty modifiers (easy, normal, hard)
    - Implement difficulty-based AI behavior changes
    - Adjust AI reaction times and decision quality by difficulty
    - _Requirements: 17.3_

  - [x] 10.3 Integrate AI into game loop
    - Add AI update cycle to game loop
    - Implement AI execution on separate timing from UI updates
    - Ensure AI doesn't block rendering
    - Add AI state to combat slice
    - _Requirements: 17.7, 17.8_

  - [x] 10.4 Implement QuizModule component
    - Create src/components/game/QuizModule/QuizModule.tsx
    - Load quiz questions from JSON data
    - Implement question presentation with timer
    - Add multiple choice answer selection
    - Show immediate feedback on answers
    - Display explanations and historical context
    - _Requirements: 15.1, 15.2, 15.5, 2.2, 2.3_

  - [x] 10.5 Implement quiz progression and rewards
    - Track quiz progress in state
    - Implement reward system for correct answers
    - Update profile statistics on quiz completion
    - Add quiz completion animations
    - _Requirements: 15.3, 15.4, 15.8_

  - [x] 10.6 Implement training mode
    - Add training mode option to quiz module
    - Implement practice combat scenarios
    - Add tutorial hints and guidance
    - _Requirements: 15.6_

  - [x] 10.7 Validate quiz data structure
    - Use Zod schema to validate quiz questions on load
    - Handle validation errors gracefully
    - Display error messages for malformed quiz data
    - _Requirements: 15.7, 24.3, 24.7_

  - [x] 10.8 Implement CollectionView component
    - Create src/components/game/CollectionView/CollectionView.tsx
    - Display hero collection grid with unlock status
    - Show collection completion percentage
    - Implement museum interface for viewing collected heroes
    - Display hero lore and historical information
    - _Requirements: 16.1, 16.3, 16.6, 2.2, 2.3_

  - [x] 10.9 Implement gacha system
    - Implement probability-based hero acquisition
    - Define rarity tiers and drop rates
    - Add gacha pull animation
    - Handle duplicate hero acquisition
    - Update collection state on new hero acquisition
    - _Requirements: 16.2, 16.5, 16.7, 16.8_

  - [x] 10.10 Implement ProfileView component
    - Create src/components/game/ProfileView/ProfileView.tsx
    - Display player name, rank, and level
    - Show win/loss statistics and ratios
    - Display achievements with unlock status
    - Show detailed statistics (play time, units defeated, etc.)
    - _Requirements: 18.1, 18.3, 18.5, 18.7, 2.2, 2.3_

  - [x] 10.11 Implement rank progression system
    - Implement rank calculation based on experience
    - Award rank promotions automatically
    - Display rank-up animations and notifications
    - Update profile display on rank changes
    - _Requirements: 18.2, 18.6, 18.8_

  - [x] 10.12 Implement ResearchTree component
    - Create src/components/game/ResearchTree/ResearchTree.tsx
    - Display research tree with node connections
    - Show research requirements and costs
    - Implement research progress tracking
    - Disable unavailable research options
    - _Requirements: 19.1, 19.3, 19.6, 19.7, 2.2, 2.3_

  - [x] 10.13 Implement research system logic
    - Validate resource costs before starting research
    - Track research progress over time
    - Apply research effects on completion
    - Show research completion notifications
    - Persist research state
    - _Requirements: 19.2, 19.4, 19.5, 19.8_

  - [x] 10.14 Write unit tests for quiz validation
    - Test quiz question schema validation
    - Test quiz progress tracking
    - Test reward calculation
    - _Requirements: 27.5_

- [~] 11. Phase 9: Save System Implementation
  - [x] 11.1 Implement save data serialization
    - Create src/lib/saves/serialization.ts
    - Implement serializeGameState function to convert state to JSON
    - Implement deserializeGameState function to restore state from JSON
    - Add compression using LZ-string for smaller save files
    - Implement save versioning for backward compatibility
    - _Requirements: 7.2, 9.8_

  - [x] 11.2 Implement save data validation
    - Create src/lib/saves/validation.ts
    - Use Zod schemas to validate save data structure
    - Implement integrity checks for save data
    - Handle corrupted save data gracefully
    - _Requirements: 7.6, 7.7, 24.2_

  - [x] 11.3 Implement local storage save system
    - Create src/lib/saves/local.ts
    - Implement saveToSlot function for saving to localStorage
    - Implement loadFromSlot function for loading from localStorage
    - Implement getSaveMetadata function to read save info without full load
    - Implement deleteSave function
    - Support 3-5 save slots
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [x] 11.4 Implement SaveLoadMenu component
    - Create src/components/game/SaveLoadMenu/SaveLoadMenu.tsx
    - Display save slots with metadata (timestamp, progress, resources)
    - Implement save button with slot selection
    - Implement load button with slot selection
    - Implement delete save confirmation dialog
    - Show save/load success/error notifications
    - _Requirements: 7.8, 2.2, 2.3_

  - [x] 11.5 Implement auto-save system
    - Create useAutoSave custom hook in src/hooks/useAutoSave.ts
    - Implement configurable auto-save interval (default 5 minutes)
    - Use dedicated auto-save slot separate from manual saves
    - Debounce auto-save during active combat
    - Show non-intrusive auto-save notification
    - Add settings toggle to enable/disable auto-save
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [x] 11.6 Implement critical event auto-save triggers
    - Trigger auto-save on level completion
    - Trigger auto-save on hero acquisition
    - Trigger auto-save on major milestones
    - Prevent auto-save during animations
    - _Requirements: 8.7, 8.8_

  - [x] 11.7 Implement save import/export functionality
    - Implement exportSave function to download save as JSON file
    - Name exported files with timestamp and player identifier
    - Implement importSave function to accept uploaded JSON files
    - Validate imported save data before loading
    - Show descriptive error messages for invalid imports
    - Implement overwrite confirmation dialog
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 11.8 Implement cloud storage integration (optional)
    - Create src/lib/saves/cloud.ts
    - Integrate with Supabase or Firebase as storage provider
    - Implement authentication requirement for cloud saves
    - Implement syncToCloud function
    - Implement loadFromCloud function
    - Implement conflict detection between local and cloud saves
    - Implement conflict resolution UI
    - Add save data encryption before upload
    - Handle offline mode with sync on reconnection
    - Display sync status indicator
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 11.9 Write unit tests for save system
    - Test serialization and deserialization
    - Test save data validation with valid and invalid data
    - Test localStorage operations
    - Test auto-save timing and debouncing
    - Test import/export file handling
    - _Requirements: 27.4_

- [x] 12. Checkpoint - Verify save system functionality
  - Ensure all tests pass, verify save/load/auto-save/import/export work correctly, ask the user if questions arise.

- [x] 13. Phase 10: Polish and Animations
  - [x] 13.1 Implement menu transition animations
    - Add Framer Motion animations for menu screen transitions
    - Implement fade and slide animations for modals
    - Add stagger animations for menu items
    - Ensure smooth 60 FPS animations
    - _Requirements: 6.4, 6.7_

  - [x] 13.2 Implement resource change animations
    - Animate resource counter updates with number transitions
    - Add floating text for resource gains/losses
    - Implement pulse animations for low resource warnings
    - _Requirements: 6.5, 14.4_

  - [x] 13.3 Implement notification system animations
    - Add toast notifications with enter/exit animations
    - Implement notification queue management
    - Add different notification types (success, error, info, warning)
    - Auto-dismiss notifications after timeout
    - _Requirements: 6.5, 23.3_

  - [x] 13.4 Implement hero acquisition animations
    - Add dramatic reveal animation for new heroes
    - Implement rarity-based animation effects (common, rare, epic, legendary)
    - Add particle effects for legendary heroes
    - _Requirements: 16.7_

  - [x] 13.5 Implement rank-up animations
    - Add celebration animation for rank promotions
    - Display new rank badge with animation
    - Add sound effects for rank-up
    - _Requirements: 18.6_

  - [x] 13.6 Add animation disable option for accessibility
    - Add settings toggle to disable animations
    - Implement prefers-reduced-motion media query support
    - Ensure all features work without animations
    - _Requirements: 6.8, 22.6_

- [x] 14. Phase 11: Responsive Design and Mobile Support
  - [x] 14.1 Implement responsive layout breakpoints
    - Configure responsive behavior for mobile (320px+)
    - Configure responsive behavior for tablet (768px+)
    - Configure responsive behavior for desktop (1024px+)
    - Test layout on various screen sizes
    - _Requirements: 20.1_

  - [x] 14.2 Implement mobile touch controls
    - Add touch event handlers for map pan/zoom
    - Implement touch-friendly button sizes (minimum 44x44px)
    - Add swipe gestures for navigation
    - Optimize touch target spacing
    - _Requirements: 20.2, 20.4_

  - [x] 14.3 Optimize UI for small screens
    - Scale UI elements appropriately for mobile
    - Implement collapsible sidebars for mobile
    - Ensure Vietnamese text remains readable on small screens
    - Adjust font sizes for mobile readability
    - _Requirements: 20.3, 20.5_

  - [x] 14.4 Implement mobile-optimized menu system
    - Create hamburger menu for mobile navigation
    - Implement bottom navigation bar for mobile
    - Add full-screen modals for mobile
    - _Requirements: 20.8_

  - [x] 14.5 Handle screen orientation changes
    - Detect orientation change events
    - Adapt layout for portrait and landscape modes
    - Maintain game state during orientation changes
    - _Requirements: 20.7_

  - [x] 14.6 Test on mobile browsers
    - Test on iOS Safari
    - Test on Android Chrome
    - Fix any mobile-specific issues
    - Verify touch controls work correctly
    - _Requirements: 20.6_

- [x] 15. Phase 12: Accessibility Implementation
  - [x] 15.1 Implement keyboard navigation
    - Add keyboard shortcuts for common actions
    - Implement tab navigation for all interactive elements
    - Add visible focus indicators
    - Create useKeyboard custom hook for key binding management
    - _Requirements: 22.2, 2.4_

  - [x] 15.2 Add ARIA labels and semantic HTML
    - Add ARIA labels to all interactive elements
    - Use semantic HTML elements (nav, main, section, article)
    - Add ARIA live regions for dynamic content updates
    - Implement proper heading hierarchy
    - _Requirements: 22.3_

  - [x] 15.3 Ensure color contrast compliance
    - Verify all text meets WCAG 4.5:1 contrast ratio
    - Test with color contrast analyzer tools
    - Adjust colors if needed while maintaining theme
    - _Requirements: 22.4_

  - [x] 15.4 Provide text alternatives
    - Add alt text for all images
    - Provide text descriptions for visual game information
    - Add captions for audio content
    - _Requirements: 22.5_

  - [x] 15.5 Test with screen readers
    - Test with NVDA on Windows
    - Test with VoiceOver on macOS/iOS
    - Fix any screen reader navigation issues
    - Ensure game state changes are announced
    - _Requirements: 22.8_

  - [x] 15.6 Support browser zoom
    - Test layout at 200% zoom
    - Ensure no content is cut off or overlapping
    - Verify all functionality works at high zoom levels
    - _Requirements: 22.7_

- [x] 16. Phase 13: Performance Optimization
  - [x] 16.1 Implement code splitting and lazy loading
    - Configure Next.js dynamic imports for heavy components
    - Lazy load GameMap component
    - Lazy load CombatView component
    - Lazy load CollectionView component
    - Implement loading states for lazy-loaded components
    - _Requirements: 21.1, 21.2, 23.7_

  - [x] 16.2 Optimize image assets
    - Use Next.js Image component for all images
    - Configure image optimization in next.config.js
    - Implement responsive images with srcset
    - Use appropriate image formats (WebP with fallbacks)
    - _Requirements: 21.3_

  - [x] 16.3 Optimize component rendering
    - Wrap expensive components with React.memo
    - Use useMemo for expensive calculations
    - Use useCallback for event handlers passed as props
    - Implement virtualization for long lists (hero collection)
    - _Requirements: 21.4, 21.5_

  - [x] 16.4 Run Lighthouse performance audit
    - Run Lighthouse on desktop
    - Achieve performance score of 80+
    - Address any performance recommendations
    - Optimize First Contentful Paint and Time to Interactive
    - _Requirements: 21.6, 21.8_

  - [x] 16.5 Optimize game loop performance
    - Profile game loop execution time
    - Optimize canvas rendering operations
    - Reduce unnecessary state updates
    - Ensure consistent 60 FPS during gameplay
    - _Requirements: 21.7_

- [x] 17. Phase 14: Error Handling and Loading States
  - [x] 17.1 Implement React Error Boundaries
    - Create error boundary component
    - Wrap major sections with error boundaries
    - Display user-friendly error messages in Vietnamese
    - Provide recovery options (reload, return to menu)
    - _Requirements: 23.1, 23.2, 23.5_

  - [x] 17.2 Implement loading states
    - Add loading spinners for async operations
    - Implement skeleton screens for content loading
    - Add loading states for save/load operations
    - Add loading states for quiz question loading
    - _Requirements: 23.3, 23.4_

  - [x] 17.3 Implement error logging
    - Log errors to console in development mode
    - Add error context information (component, action, state)
    - Implement error reporting for production (optional)
    - _Requirements: 23.6_

  - [x] 17.4 Handle network errors gracefully
    - Detect network failures for cloud saves
    - Display retry options for failed requests
    - Implement offline mode detection
    - Show appropriate error messages
    - _Requirements: 23.8_

- [x] 18. Phase 15: Additional Features
  - [x] 18.1 Implement Web Speech API integration
    - Create useSpeech custom hook in src/hooks/useSpeech.ts
    - Detect browser support for Web Speech API
    - Implement speech synthesis for Vietnamese text
    - Implement speech recognition for Vietnamese
    - Gracefully degrade to text-only if not supported
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_

  - [x] 18.2 Add speech features to quiz module
    - Add option to read quiz questions aloud
    - Add option to speak answers
    - Implement voice answer selection
    - Add settings toggle for speech features
    - Handle speech recognition errors gracefully
    - _Requirements: 28.6, 28.7, 28.8_

  - [x] 18.3 Implement React Query for cloud saves
    - Configure React Query client
    - Create queries for loading cloud saves
    - Create mutations for saving to cloud
    - Implement query invalidation for stale data
    - Add optimistic updates for better UX
    - Configure retry logic for failed requests
    - Implement prefetching for anticipated actions
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

- [x] 19. Phase 16: SEO and Metadata
  - [x] 19.1 Implement Next.js metadata API
    - Add metadata to root layout
    - Configure page titles in Vietnamese and English
    - Add meta descriptions for SEO
    - Configure viewport and charset metadata
    - _Requirements: 26.1, 26.2, 26.6_

  - [x] 19.2 Add Open Graph tags
    - Add OG title, description, and image
    - Configure OG tags for social sharing
    - Add Twitter Card metadata
    - Test social sharing preview
    - _Requirements: 26.3_

  - [x] 19.3 Generate sitemap
    - Create sitemap.xml generation
    - Include all public pages
    - Configure sitemap in next.config.js
    - _Requirements: 26.4_

  - [x] 19.4 Add structured data
    - Implement JSON-LD structured data for game information
    - Add VideoGame schema markup
    - Include rating and review information if applicable
    - _Requirements: 26.5_

  - [x] 19.5 Implement canonical URLs
    - Add canonical URL tags to all pages
    - Ensure consistent URL structure
    - _Requirements: 26.7_

  - [x] 19.6 Run Lighthouse SEO audit
    - Run Lighthouse SEO audit
    - Achieve SEO score of 90+
    - Address any SEO recommendations
    - _Requirements: 26.8_

- [x] 20. Phase 17: Testing and Validation
  - [x] 20.1 Set up testing infrastructure
    - Configure Vitest with React Testing Library
    - Set up test utilities and helpers
    - Configure test coverage reporting
    - Add test scripts to package.json
    - _Requirements: 27.1_

  - [x] 20.2 Write component tests
    - Test all UI components (Button, Modal, Card, etc.)
    - Test game components (HeroSelection, GameMap, CombatView, etc.)
    - Test component props and state changes
    - Test user interactions and event handlers
    - _Requirements: 27.7_

  - [x] 20.3 Write integration tests
    - Test hero selection flow
    - Test combat flow
    - Test save/load flow
    - Test quiz completion flow
    - _Requirements: 27.1_

  - [x] 20.4 Achieve code coverage targets
    - Run coverage report
    - Achieve at least 70% coverage for game logic
    - Identify and test critical paths
    - _Requirements: 27.6_

  - [x] 20.5 Verify test suite performance
    - Ensure test suite completes in under 30 seconds
    - Optimize slow tests
    - Use test parallelization if needed
    - _Requirements: 27.8_

  - [x] 20.6 Create migration validation checklist
    - Document all features from legacy code
    - Create checklist for feature parity verification
    - Track completion status for each feature
    - _Requirements: 31.1, 31.7_

  - [x] 20.7 Validate game mechanics parity
    - Verify all hero abilities work identically to original
    - Verify combat calculations produce same results
    - Verify resource generation matches original rates
    - Test all game systems against legacy code behavior
    - _Requirements: 31.2, 31.4, 31.5, 31.6, 31.8_

  - [x] 20.8 Validate Vietnamese content preservation
    - Verify all Vietnamese text is preserved
    - Verify cultural elements are maintained
    - Verify historical context is accurate
    - Test Vietnamese text rendering on all browsers
    - _Requirements: 31.3, 1.7_

- [x] 21. Checkpoint - Final validation
  - Ensure all tests pass, verify complete feature parity with legacy code, ask the user if questions arise.

- [x] 22. Phase 18: Documentation and Finalization
  - [x] 22.1 Write comprehensive README.md
    - Add project overview and description
    - Document setup instructions (Node.js version, npm install, etc.)
    - Document development commands (dev, build, test, lint)
    - Document project structure
    - Add screenshots and demo links
    - Document Vietnamese cultural context
    - _Requirements: 32.3, 30.8_

  - [x] 22.2 Add JSDoc comments to code
    - Add JSDoc comments to all public functions
    - Add JSDoc comments to all components
    - Document function parameters and return types
    - Add usage examples in comments
    - _Requirements: 32.1_

  - [x] 22.3 Document complex game logic
    - Add inline comments for combat calculations
    - Document direction-based combat mechanics
    - Explain AI decision-making logic
    - Document resource generation formulas
    - _Requirements: 32.2_

  - [x] 22.4 Document state management architecture
    - Create documentation for Zustand store structure
    - Document each slice and its responsibilities
    - Document state update patterns
    - Provide examples of accessing state
    - _Requirements: 32.4_

  - [x] 22.5 Document save system data format
    - Document save file JSON structure
    - Document save metadata format
    - Document versioning scheme
    - Provide example save files
    - _Requirements: 32.5_

  - [x] 22.6 Create architecture documentation
    - Document component hierarchy and relationships
    - Create architecture diagrams
    - Document data flow patterns
    - Explain rendering strategy (Server vs Client Components)
    - _Requirements: 32.6_

  - [x] 22.7 Document Vietnamese cultural references
    - Document historical context for heroes
    - Explain Trần Dynasty and Mongol invasion history
    - Document cultural themes and symbolism
    - Provide references for educational content
    - _Requirements: 32.7_

  - [x] 22.8 Create and maintain CHANGELOG.md
    - Document migration from vanilla JS to Next.js
    - Track feature additions and changes
    - Document breaking changes
    - Follow semantic versioning
    - _Requirements: 32.8_

  - [x] 22.9 Configure production build
    - Optimize next.config.js for production
    - Configure environment variables for production
    - Test production build locally
    - Verify all features work in production mode
    - _Requirements: 1.6, 30.7_

  - [x] 22.10 Final code review and cleanup
    - Remove console.logs and debug code
    - Remove unused imports and dead code
    - Ensure consistent code style
    - Run final linting and formatting
    - Verify no TypeScript errors or warnings
    - _Requirements: 1.8, 30.1_

- [x] 23. Final Checkpoint - Production readiness
  - Ensure all tests pass, documentation is complete, production build works correctly, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The migration preserves 100% feature parity with the original game while modernizing the codebase
- All Vietnamese cultural themes, historical content, and educational value are maintained throughout
- TypeScript is used throughout for type safety and better developer experience
- The implementation follows Next.js 14+ best practices with App Router, Server Components, and modern React patterns

## Implementation Strategy

When executing these tasks:
1. Build incrementally - each task should result in working, testable code
2. Test frequently - run tests after completing related tasks
3. Validate early - use checkpoints to verify systems work before moving forward
4. Preserve functionality - always compare behavior with the original game
5. Maintain quality - follow TypeScript strict mode, ESLint rules, and accessibility standards
6. Document as you go - add comments and documentation while code is fresh in mind

The migration transforms a 5000+ line monolithic application into a modern, maintainable, and scalable Next.js application while honoring the game's Vietnamese cultural heritage and educational mission.
