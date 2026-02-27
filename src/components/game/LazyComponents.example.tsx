'use client';

/**
 * Example usage of lazy-loaded components
 * Demonstrates best practices for code splitting and lazy loading
 */

import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { 
  LazyGameMap, 
  LazyCombatView, 
  LazyCollectionView,
  preloadGameMap,
  preloadCombatView,
  preloadCollectionView
} from '@/components/game/LazyComponents';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store';

type GameView = 'menu' | 'map' | 'combat' | 'collection';

/**
 * Example 1: Basic lazy loading with view switching
 */
export function BasicLazyLoadingExample() {
  const [currentView, setCurrentView] = useState<GameView>('menu');

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4 flex gap-2">
        <Button onClick={() => setCurrentView('menu')}>Menu</Button>
        <Button onClick={() => setCurrentView('map')}>Map</Button>
        <Button onClick={() => setCurrentView('combat')}>Combat</Button>
        <Button onClick={() => setCurrentView('collection')}>Collection</Button>
      </nav>

      {/* Content - Components load only when view is active */}
      <div className="flex-1">
        {currentView === 'menu' && (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-4xl font-bold">Main Menu</h1>
          </div>
        )}

        {currentView === 'map' && (
          <LazyGameMap
            units={[]}
            buildings={[]}
            width={800}
            height={600}
          />
        )}

        {currentView === 'combat' && (
          <LazyCombatView
            units={[]}
            combatLog={[]}
            selectedUnit={null}
            selectedHero={null}
            onUnitSelect={() => {}}
            onAttack={() => {}}
            onMove={() => {}}
            onDefend={() => {}}
            onAbilityActivate={() => {}}
          />
        )}

        {currentView === 'collection' && (
          <LazyCollectionView />
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Preloading on user intent (hover)
 */
export function PreloadOnHoverExample() {
  const [currentView, setCurrentView] = useState<GameView>('menu');

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-gray-800 p-4 flex gap-2">
        <Button 
          onClick={() => setCurrentView('map')}
          onMouseEnter={() => preloadGameMap()} // Preload on hover
        >
          Map
        </Button>
        <Button 
          onClick={() => setCurrentView('combat')}
          onMouseEnter={() => preloadCombatView()}
        >
          Combat
        </Button>
        <Button 
          onClick={() => setCurrentView('collection')}
          onMouseEnter={() => preloadCollectionView()}
        >
          Collection
        </Button>
      </nav>

      <div className="flex-1">
        {currentView === 'map' && <LazyGameMap units={[]} buildings={[]} />}
        {currentView === 'combat' && (
          <LazyCombatView
            units={[]}
            combatLog={[]}
            selectedUnit={null}
            selectedHero={null}
            onUnitSelect={() => {}}
            onAttack={() => {}}
            onMove={() => {}}
            onDefend={() => {}}
            onAbilityActivate={() => {}}
          />
        )}
        {currentView === 'collection' && <LazyCollectionView />}
      </div>
    </div>
  );
}

/**
 * Example 3: Preloading based on game phase
 */
export function PreloadOnPhaseExample() {
  const gamePhase = useGameStore((state) => state.game.phase);
  const [currentView, setCurrentView] = useState<GameView>('menu');

  // Preload components when entering playing phase
  useEffect(() => {
    if (gamePhase === 'playing') {
      // Preload all game components in parallel
      Promise.all([
        preloadGameMap(),
        preloadCombatView(),
        preloadCollectionView(),
      ]).then(() => {
        console.log('All game components preloaded');
      });
    }
  }, [gamePhase]);

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-gray-800 p-4 flex gap-2">
        <Button onClick={() => setCurrentView('map')}>Map</Button>
        <Button onClick={() => setCurrentView('combat')}>Combat</Button>
        <Button onClick={() => setCurrentView('collection')}>Collection</Button>
      </nav>

      <div className="flex-1">
        {currentView === 'map' && <LazyGameMap units={[]} buildings={[]} />}
        {currentView === 'combat' && (
          <LazyCombatView
            units={[]}
            combatLog={[]}
            selectedUnit={null}
            selectedHero={null}
            onUnitSelect={() => {}}
            onAttack={() => {}}
            onMove={() => {}}
            onDefend={() => {}}
            onAbilityActivate={() => {}}
          />
        )}
        {currentView === 'collection' && <LazyCollectionView />}
      </div>
    </div>
  );
}

/**
 * Example 4: Conditional lazy loading with store data
 */
export function ConditionalLazyLoadingExample() {
  const units = useGameStore((state) => state.combat.units);
  const buildings = useGameStore((state) => state.combat.buildings);
  const combatLog = useGameStore((state) => state.combat.combatLog);
  const selectedHero = useGameStore((state) => state.hero.selectedHero);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showCombat, setShowCombat] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-gray-800 p-4 flex gap-2">
        <Button onClick={() => setShowMap(!showMap)}>
          Toggle Map
        </Button>
        <Button onClick={() => setShowCombat(!showCombat)}>
          Toggle Combat
        </Button>
      </nav>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Map loads only when toggled on */}
        {showMap && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <LazyGameMap
              units={units}
              buildings={buildings}
              onUnitClick={(unit) => setSelectedUnit(unit)}
            />
          </div>
        )}

        {/* Combat view loads only when toggled on */}
        {showCombat && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <LazyCombatView
              units={units}
              combatLog={combatLog}
              selectedUnit={selectedUnit}
              selectedHero={selectedHero}
              onUnitSelect={setSelectedUnit}
              onAttack={(unitId, targetId) => {
                console.log('Attack:', unitId, targetId);
              }}
              onMove={(unitId, x, y) => {
                console.log('Move:', unitId, x, y);
              }}
              onDefend={(unitId) => {
                console.log('Defend:', unitId);
              }}
              onAbilityActivate={(abilityId, x, y) => {
                console.log('Ability:', abilityId, x, y);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Tab-based navigation with lazy loading
 */
export function TabNavigationExample() {
  const [activeTab, setActiveTab] = useState<'map' | 'combat' | 'collection'>('map');

  // Preload next tab on current tab mount
  useEffect(() => {
    const preloadNext = () => {
      if (activeTab === 'map') {
        preloadCombatView();
      } else if (activeTab === 'combat') {
        preloadCollectionView();
      } else if (activeTab === 'collection') {
        preloadGameMap();
      }
    };

    // Preload after a short delay
    const timer = setTimeout(preloadNext, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="h-screen flex flex-col">
      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'combat'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚔️ Combat
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'collection'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏛️ Collection
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {activeTab === 'map' && (
          <LazyGameMap units={[]} buildings={[]} />
        )}
        {activeTab === 'combat' && (
          <LazyCombatView
            units={[]}
            combatLog={[]}
            selectedUnit={null}
            selectedHero={null}
            onUnitSelect={() => {}}
            onAttack={() => {}}
            onMove={() => {}}
            onDefend={() => {}}
            onAbilityActivate={() => {}}
          />
        )}
        {activeTab === 'collection' && (
          <LazyCollectionView />
        )}
      </div>
    </div>
  );
}

/**
 * Example 6: Full game integration with lazy loading
 */
export function FullGameExample() {
  const gamePhase = useGameStore((state) => state.game.phase);
  const units = useGameStore((state) => state.combat.units);
  const buildings = useGameStore((state) => state.combat.buildings);
  const combatLog = useGameStore((state) => state.combat.combatLog);
  const selectedHero = useGameStore((state) => state.hero.selectedHero);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'combat' | 'collection'>('map');

  // Preload components when game starts
  useEffect(() => {
    if (gamePhase === 'playing') {
      preloadGameMap();
      preloadCombatView();
    }
  }, [gamePhase]);

  if (gamePhase !== 'playing') {
    return <div>Game not started</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar navigation */}
      <aside className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setActiveView('map')}
          onMouseEnter={() => preloadGameMap()}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeView === 'map' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title="Map"
        >
          🗺️
        </button>
        <button
          onClick={() => setActiveView('combat')}
          onMouseEnter={() => preloadCombatView()}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeView === 'combat' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title="Combat"
        >
          ⚔️
        </button>
        <button
          onClick={() => setActiveView('collection')}
          onMouseEnter={() => preloadCollectionView()}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeView === 'collection' ? 'bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title="Collection"
        >
          🏛️
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {activeView === 'map' && (
          <LazyGameMap
            units={units}
            buildings={buildings}
            onUnitClick={setSelectedUnit}
          />
        )}
        {activeView === 'combat' && (
          <LazyCombatView
            units={units}
            combatLog={combatLog}
            selectedUnit={selectedUnit}
            selectedHero={selectedHero}
            onUnitSelect={setSelectedUnit}
            onAttack={(unitId, targetId) => {
              console.log('Attack:', unitId, targetId);
            }}
            onMove={(unitId, x, y) => {
              console.log('Move:', unitId, x, y);
            }}
            onDefend={(unitId) => {
              console.log('Defend:', unitId);
            }}
            onAbilityActivate={(abilityId, x, y) => {
              console.log('Ability:', abilityId, x, y);
            }}
          />
        )}
        {activeView === 'collection' && (
          <LazyCollectionView />
        )}
      </main>
    </div>
  );
}
