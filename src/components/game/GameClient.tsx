'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MenuLayout } from '@/components/layout';
import { MainMenu } from '@/components/game/MainMenu';
import { SettingsMenu } from '@/components/game/SettingsMenu';
import { QuizModule } from '@/components/game/QuizModule/QuizModule';
import { CollectionView } from '@/components/game/CollectionView/CollectionView';
import { GachaSystem } from '@/components/game/GachaSystem/GachaSystem';
import { ProfileView } from '@/components/game/ProfileView/ProfileView';
import { MuseumView } from '@/components/game/MuseumView';
import { HeroSelection } from '@/components/game/HeroSelection/HeroSelection';
import { GameErrorBoundary } from '@/components/ui';
import { LogisticsView } from '@/components/game/LogisticsView';
import { useGameStore } from '@/store';
import { ResourceType } from '@/types/resource';

type GamePhase = 'menu' | 'hero-selection' | 'playing' | 'logistics' | 'training' | 'collection' | 'museum' | 'gacha' | 'profile' | 'settings';

interface StrongholdPosition {
  x: number; // percentage 0-100
  y: number;
}

const DRAG_THRESHOLD = 5; // px - movement beyond this = drag, not click

export function GameClient() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [pendingPosition, setPendingPosition] = useState<StrongholdPosition | null>(null);
  const [stronghold, setStronghold] = useState<StrongholdPosition | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const resources = useGameStore((s) => s.resources);

  // Auto-generate: mỗi nông dân +1 lúa/giây
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'logistics') return;
    const interval = setInterval(() => {
      const store = useGameStore.getState();
      const peasants = store.resources.peasants ?? 0;
      if (peasants > 0) {
        store.addResource(ResourceType.FOOD, peasants);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Pan/drag state
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [mapScale, setMapScale] = useState(1);
  const [isAnimatingMap, setIsAnimatingMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    hasMoved: false,
  });

  // Clamp offset so the map never leaves the viewport
  const clampOffset = useCallback((ox: number, oy: number, scale: number) => {
    const container = containerRef.current;
    if (!container) return { x: ox, y: oy };
    const rect = container.getBoundingClientRect();
    // Scaled map size vs container size
    const mapW = rect.width * scale;
    const mapH = rect.height * scale;
    // At scale=1, offset must be 0. At scale>1, allow panning within bounds.
    const minX = -(mapW - rect.width) / 2;
    const maxX = (mapW - rect.width) / 2;
    const minY = -(mapH - rect.height) / 2;
    const maxY = (mapH - rect.height) / 2;
    return {
      x: Math.max(minX, Math.min(maxX, ox)),
      y: Math.max(minY, Math.min(maxY, oy)),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start drag on confirmation modal
    if ((e.target as HTMLElement).closest('[data-modal]')) return;
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: mapOffset.x,
      startOffsetY: mapOffset.y,
      hasMoved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [mapOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.hasMoved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragState.current.hasMoved = true;
    }
    if (dragState.current.hasMoved) {
      const raw = {
        x: dragState.current.startOffsetX + dx,
        y: dragState.current.startOffsetY + dy,
      };
      setMapOffset(clampOffset(raw.x, raw.y, mapScale));
    }
  }, [clampOffset, mapScale]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const wasDrag = dragState.current.hasMoved;
    dragState.current.isDragging = false;
    dragState.current.hasMoved = false;

    // Only place stronghold on click (not drag)
    if (!wasDrag && !stronghold) {
      const mapEl = mapRef.current;
      if (!mapEl) return;
      const rect = mapEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        setPendingPosition({ x, y });
      }
    }
  }, [stronghold]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    // Cursor position relative to container center
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    setMapScale((prev) => {
      const next = Math.min(3, Math.max(1, prev + (e.deltaY < 0 ? 0.15 : -0.15)));
      const ratio = 1 - next / prev;

      setMapOffset((prevOffset) => {
        // Adjust offset so the point under the cursor stays fixed
        const newX = prevOffset.x + (cursorX - prevOffset.x) * ratio;
        const newY = prevOffset.y + (cursorY - prevOffset.y) * ratio;
        return clampOffset(newX, newY, next);
      });

      return next;
    });
  }, [clampOffset]);

  const confirmStronghold = useCallback(() => {
    if (pendingPosition) {
      setStronghold(pendingPosition);
      setPendingPosition(null);

      // Smooth zoom into the stronghold position
      const container = containerRef.current;
      if (container) {
        const zoomLevel = 2;
        const rect = container.getBoundingClientRect();
        const targetX = (pendingPosition.x / 100) * rect.width;
        const targetY = (pendingPosition.y / 100) * rect.height;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rawOffset = {
          x: (centerX - targetX) * zoomLevel,
          y: (centerY - targetY) * zoomLevel,
        };
        setIsAnimatingMap(true);
        setMapScale(zoomLevel);
        setMapOffset(clampOffset(rawOffset.x, rawOffset.y, zoomLevel));
        setTimeout(() => setIsAnimatingMap(false), 600);
      }
    }
  }, [pendingPosition, clampOffset]);

  const cancelStronghold = useCallback(() => {
    setPendingPosition(null);
  }, []);

  const handleBack = () => {
    setPhase('menu');
    setStronghold(null);
    setPendingPosition(null);
    setMapOffset({ x: 0, y: 0 });
    setMapScale(1);
  };

  if (phase === 'training') {
    return (
      <GameErrorBoundary section="training">
        <div className="fixed inset-0 bg-[#1a1a1a] text-white flex flex-col">
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← QUAY LẠI
            </button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <QuizModule mode="training" />
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  if (phase === 'collection') {
    return (
      <GameErrorBoundary section="collection">
        <div className="fixed inset-0 bg-[#1a1a1a] text-white flex flex-col">
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← QUAY LẠI
            </button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <CollectionView />
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  if (phase === 'museum') {
    return (
      <GameErrorBoundary section="museum">
        <MuseumView onClose={handleBack} />
      </GameErrorBoundary>
    );
  }

  if (phase === 'gacha') {
    return (
      <GameErrorBoundary section="gacha">
        <GachaSystem onClose={handleBack} />
      </GameErrorBoundary>
    );
  }

  if (phase === 'profile') {
    return (
      <GameErrorBoundary section="profile">
        <div className="fixed inset-0 bg-[#1a1a1a] text-white flex flex-col">
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← QUAY LẠI
            </button>
          </header>
          <main className="flex-1 overflow-y-auto flex items-start justify-center">
            <ProfileView className="w-full max-w-4xl" />
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  if (phase === 'settings') {
    return (
      <GameErrorBoundary section="settings">
        <div className="fixed inset-0 bg-[#1a1a1a] text-white flex flex-col">
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← QUAY LẠI
            </button>
          </header>
          <main className="flex-1 overflow-y-auto flex items-start justify-center py-6">
            <SettingsMenu onClose={handleBack} />
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  if (phase === 'hero-selection') {
    return (
      <GameErrorBoundary section="hero-selection">
        <div className="fixed inset-0 bg-[#1a1a1a] text-white flex flex-col">
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← QUAY LẠI
            </button>
          </header>
          <main className="flex-1 overflow-y-auto flex items-start justify-center">
            <HeroSelection onConfirm={() => setPhase('playing')} />
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  if (phase === 'logistics') {
    return (
      <GameErrorBoundary section="logistics">
        <LogisticsView
          onBack={() => setPhase('playing')}
        />
      </GameErrorBoundary>
    );
  }

  if (phase === 'playing') {
    return (
      <GameErrorBoundary section="game">
        <div className="fixed inset-0 bg-black text-white flex flex-col">
          {/* HUD Bar */}
          <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]" role="banner">
            <button
              onClick={handleBack}
              className="text-[#f1c40f] font-bold hover:text-white transition-colors mr-6"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ← THOÁT
            </button>
            <div className="flex-1 flex justify-center gap-10 text-[#f1c40f] font-bold text-lg">
              <span>🥩 Lúa: <b>{Math.floor(resources.food)}</b></span>
              <span>💰 Vàng: <b>{Math.floor(resources.gold)}</b></span>
              <span>⚔️ Quân: <b>{Math.floor(resources.army)}</b></span>
            </div>
          </header>

          {/* Main Game Area - Bach Dang Map */}
          <main className="flex-1 relative overflow-hidden" role="main" aria-label="Chiến trường">
            <div
              ref={containerRef}
              className="absolute inset-0"
              style={{ cursor: dragState.current.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            >
              <div
                ref={mapRef}
                className="absolute bg-[#425e2b]"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
                  transformOrigin: 'center center',
                  transition: isAnimatingMap ? 'transform 0.5s ease-out' : 'none',
                }}
              >
                {/* SVG Map */}
                <img
                  src="/images/bachdang.svg"
                  alt="Bản đồ sông Bạch Đằng"
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* Stronghold marker */}
                {stronghold && (
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${stronghold.x}%`, top: `${stronghold.y}%` }}
                  >
                    <div className="text-4xl animate-pulse" title="Thành trì của bạn">🏰</div>
                  </div>
                )}

                {/* Pending position marker */}
                {pendingPosition && !stronghold && (
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pendingPosition.x}%`, top: `${pendingPosition.y}%` }}
                  >
                    <div className="text-3xl animate-bounce">📍</div>
                  </div>
                )}

                {/* Instruction overlay - before stronghold placed */}
                {!stronghold && !pendingPosition && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center bg-black/60 rounded-lg p-8 border border-[#f1c40f]/30">
                      <h2 className="text-3xl font-bold text-[#f1c40f] mb-3" style={{ fontFamily: "'Oswald', sans-serif", textShadow: '2px 2px 0 #000' }}>
                        ⚔️ Chiến Trường Bạch Đằng
                      </h2>
                      <p className="text-lg text-gray-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Kéo để di chuyển bản đồ · Nhấn để chọn vị trí đóng quân
                      </p>
                    </div>
                  </div>
                )}

                {/* After stronghold placed */}
                {stronghold && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="text-center bg-black/70 rounded-lg px-6 py-3 border border-[#f1c40f]/50">
                      <p className="text-[#f1c40f] font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        🏰 Đã xây thành trì — Nhấn đúp chuột để điều quân
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logistics Button - shows after stronghold is placed */}
            {stronghold && (
              <button
                onClick={() => setPhase('logistics')}
                className="absolute bottom-5 right-5 z-[1000] bg-black/80 border-2 border-[#27ae60] rounded-[10px] p-3 flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
                title="Vào Hậu Cần"
              >
                <span className="text-5xl">🏛️</span>
                <span
                  className="text-[#f1c40f] font-bold text-sm mt-1"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  HẬU CẦN
                </span>
              </button>
            )}

            {/* Confirmation Modal - outside the transform container */}
            {pendingPosition && !stronghold && (
              <div className="absolute inset-0 flex items-center justify-center z-[3000]" data-modal>
                <div className="bg-black/80 absolute inset-0" onClick={cancelStronghold} />
                <div className="relative bg-[#2c3e50] border-2 border-white rounded-[10px] p-8 text-center max-w-md z-10">
                  <h3 className="text-2xl text-[#f1c40f] font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Xây thành trì ở đây?
                  </h3>
                  <p className="text-gray-300 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Chọn vị trí này làm căn cứ đóng quân
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={cancelStronghold}
                      className="bg-[#555] text-white border-none py-3 px-8 rounded-[5px] font-bold hover:bg-[#666] transition-colors"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      HỦY
                    </button>
                    <button
                      onClick={confirmStronghold}
                      className="bg-[#27ae60] text-white border-none py-3 px-8 rounded-[5px] font-bold hover:bg-[#2ecc71] transition-colors"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      XÂY THÀNH
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </GameErrorBoundary>
    );
  }

  return (
    <GameErrorBoundary section="menu">
      <MenuLayout>
        <MainMenu
          onStartGame={() => setPhase('hero-selection')}
          onTraining={() => setPhase('training')}
          onCollection={() => setPhase('collection')}
          onMuseum={() => setPhase('museum')}
          onGacha={() => setPhase('gacha')}
          onProfile={() => setPhase('profile')}
          onSettings={() => setPhase('settings')}
        />
      </MenuLayout>
    </GameErrorBoundary>
  );
}
