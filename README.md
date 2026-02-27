# Đại Chiến Sử Việt - Hào Khí Đông A

**Vietnamese Historical Strategy Game - Battle of Bach Dang River**

A modern Next.js 14+ strategy game that brings Vietnamese history to life through engaging gameplay. Experience the Trần Dynasty's heroic resistance against Mongol invasions in the 13th century.

---

## 📖 About

"Đại Chiến Sử Việt - Hào Khí Đông A" is an educational strategy game that combines historical accuracy with engaging gameplay mechanics. Players command Vietnamese forces, manage resources, deploy heroes, and defend against Mongol invasions while learning about one of Vietnam's most significant historical periods.

### Key Features

- **Historical Heroes**: Command legendary Vietnamese and Mongol heroes with unique abilities
- **Strategic Combat**: Direction-based combat system with tactical depth
- **Resource Management**: Balance food, gold, and army resources to build your forces
- **Educational Quizzes**: Learn Vietnamese history through integrated quiz modules
- **Hero Collection**: Unlock and collect heroes through gameplay and gacha mechanics
- **Save System**: Multiple save slots with auto-save and import/export capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG-compliant with keyboard navigation and screen reader support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm equivalent)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dai-chien-su-viet

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing.

### Environment Variables (Optional)

For advanced features like cloud saves, create a `.env.local` file:

```bash
# Optional: Cloud save configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_CLOUD_SAVES=false
NEXT_PUBLIC_AUTO_SAVE_INTERVAL=300000
```

---

## 🛠️ Development Commands

### Core Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

### Testing

```bash
# Run all tests (single run)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Watch mode with coverage
npm run test:coverage:watch
```

---

## 📁 Project Structure

```
dai-chien-su-viet/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Main game page
│   │   ├── globals.css           # Global styles
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   │   ├── game/                 # Game-specific components
│   │   │   ├── HeroSelection/    # Hero selection interface
│   │   │   ├── GameMap/          # Interactive map with pan/zoom
│   │   │   ├── CombatView/       # Combat visualization
│   │   │   ├── ResourceDisplay/  # Resource tracking UI
│   │   │   ├── QuizModule/       # Educational quiz system
│   │   │   ├── CollectionView/   # Hero collection & museum
│   │   │   ├── ProfileView/      # Player profile & stats
│   │   │   ├── ResearchTree/     # Technology research
│   │   │   ├── SaveLoadMenu/     # Save/load interface
│   │   │   └── GachaSystem/      # Hero gacha mechanics
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button/           # Button component
│   │   │   ├── Modal/            # Modal dialogs
│   │   │   ├── RadarChart/       # Hero stats visualization
│   │   │   ├── Skeleton/         # Loading skeletons
│   │   │   ├── ErrorBoundary/    # Error handling
│   │   │   └── ...               # Other UI primitives
│   │   └── layout/               # Layout components
│   │       ├── GameLayout/       # Main game layout
│   │       ├── MenuLayout/       # Menu layout
│   │       └── MobileNavigation/ # Mobile-optimized navigation
│   ├── lib/                      # Core game logic
│   │   ├── combat/               # Combat engine & calculations
│   │   ├── ai/                   # AI opponent logic
│   │   ├── resources/            # Resource management
│   │   ├── saves/                # Save/load system
│   │   ├── gacha/                # Gacha mechanics
│   │   ├── audio/                # Sound management
│   │   ├── seo/                  # SEO utilities
│   │   ├── validation/           # Data validation
│   │   └── utils/                # Utility functions
│   ├── store/                    # Zustand state management
│   │   ├── index.ts              # Store configuration
│   │   └── slices/               # State slices
│   │       ├── gameSlice.ts      # Game state
│   │       ├── heroSlice.ts      # Hero state
│   │       ├── combatSlice.ts    # Combat state
│   │       ├── resourceSlice.ts  # Resource state
│   │       └── ...               # Other slices
│   ├── types/                    # TypeScript definitions
│   │   ├── game.ts               # Core game types
│   │   ├── hero.ts               # Hero types
│   │   ├── unit.ts               # Unit types
│   │   └── ...                   # Other type definitions
│   ├── schemas/                  # Zod validation schemas
│   │   ├── save.schema.ts        # Save data validation
│   │   ├── hero.schema.ts        # Hero data validation
│   │   └── quiz.schema.ts        # Quiz data validation
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGameLoop.ts        # Game loop management
│   │   ├── useAutoSave.ts        # Auto-save functionality
│   │   ├── useKeyboard.ts        # Keyboard shortcuts
│   │   ├── useSpeech.ts          # Web Speech API
│   │   └── ...                   # Other custom hooks
│   ├── constants/                # Game constants & data
│   │   ├── heroes.ts             # Hero definitions
│   │   ├── units.ts              # Unit definitions
│   │   ├── buildings.ts          # Building definitions
│   │   ├── research.ts           # Research tree
│   │   └── config.ts             # Game configuration
│   └── test/                     # Test utilities
│       ├── setup.ts              # Test setup
│       ├── test-utils.tsx        # Testing utilities
│       └── README.md             # Testing documentation
├── public/                       # Static assets
│   ├── images/                   # Image assets
│   ├── sounds/                   # Audio files
│   ├── videos/                   # Video assets
│   └── data/                     # Static data files
│       └── quiz-questions.json   # Quiz questions
├── docs/                         # Documentation
│   ├── configuration.md          # Configuration guide
│   ├── keyboard-navigation.md    # Keyboard shortcuts
│   ├── responsive-design.md      # Responsive design guide
│   └── ...                       # Additional documentation
└── .kiro/                        # Kiro spec files
    └── specs/
        └── nextjs-game-migration/
            ├── requirements.md   # Project requirements
            ├── design.md         # Technical design
            └── tasks.md          # Implementation tasks
```

### Key Directories

- **`src/app/`**: Next.js 14 App Router pages and layouts
- **`src/components/`**: React components organized by feature and reusability
- **`src/lib/`**: Pure TypeScript game logic (framework-agnostic)
- **`src/store/`**: Zustand state management with slice pattern
- **`src/types/`**: TypeScript type definitions and interfaces
- **`src/hooks/`**: Custom React hooks for reusable logic
- **`src/constants/`**: Game data and configuration constants

---

## 🎮 Game Systems

### Combat System
Direction-based tactical combat with unit types, hero abilities, and status effects. Combat calculations consider attack direction, unit positioning, and type advantages.

### Resource Management
Manage three core resources:
- **Food**: Sustains your army
- **Gold**: Builds structures and researches technology
- **Army**: Your military strength

### Hero System
Recruit and command legendary heroes from Vietnamese and Mongol history. Each hero has unique stats, abilities, and historical context.

### Save System
- **Multiple Save Slots**: 3-5 manual save slots
- **Auto-Save**: Configurable automatic saves (default: 5 minutes)
- **Import/Export**: Backup and transfer saves between devices
- **Cloud Saves**: Optional cloud storage integration (Supabase/Firebase)

### Quiz Module
Educational quizzes about the Trần Dynasty and Mongol invasions. Earn rewards by answering correctly and learning Vietnamese history.

### Collection System
Unlock heroes through gameplay and gacha mechanics. View your collection in the museum with detailed historical information.

---

## 🌐 Vietnamese Cultural Context

This game is deeply rooted in Vietnamese history and culture:

### Historical Period
The game focuses on the **Trần Dynasty (1225-1400)** and specifically the resistance against **Mongol invasions** in the 13th century. Three major Mongol invasions were successfully repelled by Vietnamese forces:
- **First Invasion (1258)**: Led by Uriyangkhadai
- **Second Invasion (1285)**: Led by Toghan
- **Third Invasion (1287-1288)**: Culminating in the Battle of Bach Dang River

### Battle of Bach Dang River (1288)
The climactic naval battle where General Trần Hưng Đạo used wooden stakes planted in the riverbed to destroy the Mongol fleet. This brilliant tactical victory is one of Vietnam's most celebrated military achievements.

### Cultural Themes
- **Patriotism**: The spirit of defending the homeland
- **Strategic Brilliance**: Tactical innovation and guerrilla warfare
- **Unity**: Vietnamese people united against foreign invasion
- **Historical Education**: Learning through gameplay

### Language
The game features Vietnamese language throughout:
- Hero names and descriptions in Vietnamese
- Historical context and educational content
- Quiz questions about Vietnamese history
- Cultural references and terminology

---

## 🎨 Technology Stack

### Core Framework
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Strict type safety
- **React 18**: Latest React features

### Styling & UI
- **Tailwind CSS 3+**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Radix UI**: Accessible component primitives
- **Custom Theme**: Bạch Đằng visual theme

### State & Data
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Zod**: Runtime type validation
- **LZ-String**: Save data compression

### Development Tools
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks

### Performance
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js Image component
- **Canvas Rendering**: Optimized map rendering
- **Memoization**: React.memo, useMemo, useCallback

---

## ♿ Accessibility

This game is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Text Alternatives**: Alt text for all visual information
- **Motion Control**: Option to disable animations
- **Browser Zoom**: Supports up to 200% zoom
- **Touch Targets**: Minimum 44x44px touch targets for mobile

See [Keyboard Navigation Guide](docs/keyboard-navigation.md) for shortcuts.

---

## 📱 Responsive Design

The game adapts to different screen sizes:

- **Mobile**: 320px+ (portrait and landscape)
- **Tablet**: 768px+
- **Desktop**: 1024px+

Mobile-specific features:
- Touch controls and swipe gestures
- Optimized UI layout
- Mobile menu system
- Orientation handling

---

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Core game logic (combat, resources, AI)
- **Component Tests**: React component behavior
- **Integration Tests**: Feature workflows
- **Accessibility Tests**: WCAG compliance

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Organization
- Unit tests: `src/**/__tests__/*.test.ts`
- Component tests: `src/**/__tests__/*.test.tsx`
- Integration tests: `src/__tests__/*.integration.test.tsx`

---

## 🚢 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm start
```

### Deployment Platforms

This Next.js application can be deployed to:

- **Vercel**: Recommended (zero-config deployment)
- **Netlify**: Full Next.js support
- **Self-hosted**: Node.js server or Docker container

### Environment Variables

Set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`: Cloud save database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Cloud save API key
- `NEXT_PUBLIC_ENABLE_CLOUD_SAVES`: Enable/disable cloud saves

---

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- [Configuration Guide](docs/configuration.md) - Environment variables and settings
- [Keyboard Navigation](docs/keyboard-navigation.md) - Keyboard shortcuts
- [Responsive Design](docs/responsive-design.md) - Responsive breakpoints
- [Testing Infrastructure](docs/task-20.1-testing-infrastructure-summary.md) - Testing setup
- [Performance Optimization](docs/performance-optimization-quick-reference.md) - Performance tips
- [SEO Implementation](docs/task-19.6-lighthouse-seo-audit-summary.md) - SEO features

---

## 🤝 Contributing

This is an educational project focused on preserving Vietnamese cultural heritage. Contributions that enhance historical accuracy, improve accessibility, or add educational value are welcome.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Format code: `npm run format`
7. Submit a pull request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive tests for new features
- Accessibility compliance

---

## 📄 License

[To be determined]

---

## 🙏 Acknowledgments

This game honors the Vietnamese people's resistance against foreign invasion and celebrates the strategic brilliance of General Trần Hưng Đạo and the Trần Dynasty.

### Historical Sources
- Vietnamese historical records of the Trần Dynasty
- Documentation of the Mongol invasions (1258, 1285, 1287-1288)
- Battle of Bach Dang River historical accounts

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review the spec files in `.kiro/specs/nextjs-game-migration/`

---

**Hào Khí Đông A** - *The Spirit of East Asia*
