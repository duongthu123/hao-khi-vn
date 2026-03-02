'use client';

import { useState, memo, useMemo } from 'react';
import { useGameStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { ResourceType } from '@/types/resource';
import { UnitType, Direction, UnitOwner } from '@/types/unit';
import { UNIT_DATA } from '@/constants/units';
import { RESEARCH_BY_TIER, type ResearchNode } from '@/constants/research';

interface LogisticsViewProps {
  onBack: () => void;
}

export const LogisticsView = memo(function LogisticsView({
  onBack,
}: LogisticsViewProps) {
  const resources = useGameStore((s) => s.resources);
  const subtractResource = useGameStore((s) => s.subtractResource);
  const addResource = useGameStore((s) => s.addResource);
  const addUnit = useGameStore((s) => s.addUnit);
  const allUnits = useGameStore(useShallow((s) => s.combat.units));
  const [showTrainingCamp, setShowTrainingCamp] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Research state
  const researchState = useGameStore((s) => s.research);
  const startResearch = useGameStore((s) => s.startResearch);
  const completeResearch = useGameStore((s) => s.completeResearch);
  const cancelResearch = useGameStore((s) => s.cancelResearch);

  // Derive player units from stable reference
  const playerUnits = useMemo(
    () => allUnits.filter((u) => u.owner === 'player'),
    [allUnits]
  );

  // Count units by type
  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const type of Object.values(UnitType)) {
      counts[type] = playerUnits.filter((u) => u.type === type).length;
    }
    return counts;
  }, [playerUnits]);

  const handleTradeRiceForGold = () => {
    if (subtractResource(ResourceType.FOOD, 10)) {
      addResource(ResourceType.GOLD, 1);
    }
  };

  const handleTrainUnit = (type: UnitType) => {
    const unitData = UNIT_DATA[type];
    const canAfford =
      resources.food >= unitData.cost.food &&
      resources.gold >= unitData.cost.gold;

    if (!canAfford) return;

    subtractResource(ResourceType.FOOD, unitData.cost.food);
    subtractResource(ResourceType.GOLD, unitData.cost.gold);
    addResource(ResourceType.ARMY, 1);

    addUnit({
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      faction: 'vietnamese',
      position: { x: 50 + Math.random() * 20, y: 50 + Math.random() * 20 },
      health: unitData.stats.maxHealth,
      maxHealth: unitData.stats.maxHealth,
      attack: unitData.stats.attack,
      defense: unitData.stats.defense,
      speed: unitData.stats.speed,
      direction: Direction.SOUTH,
      status: [],
      owner: UnitOwner.PLAYER,
    });
  };

  const canAffordUnit = (type: UnitType) => {
    const unitData = UNIT_DATA[type];
    return resources.food >= unitData.cost.food && resources.gold >= unitData.cost.gold;
  };

  const handleStartResearch = (node: ResearchNode) => {
    if (researchState.inProgress) return;
    if (researchState.completed.includes(node.id)) return;
    if (resources.food < node.cost.food || resources.gold < node.cost.gold) return;

    subtractResource(ResourceType.FOOD, node.cost.food);
    subtractResource(ResourceType.GOLD, node.cost.gold);
    startResearch(node.id);

    // Auto-complete after duration
    setTimeout(() => {
      completeResearch();
    }, node.duration * 1000);
  };

  const isResearchCompleted = (id: string) => researchState.completed.includes(id);
  const isResearching = (id: string) => researchState.inProgress === id;
  const canAffordResearchNode = (node: ResearchNode) =>
    resources.food >= node.cost.food && resources.gold >= node.cost.gold;
  const prereqsMet = (node: ResearchNode) =>
    node.prerequisites.every((p) => researchState.completed.includes(p));

  // Shop sub-screen
  if (showShop) {
    return (
      <div
        className="fixed inset-0 z-[100] text-white flex flex-col"
        style={{ background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9))' }}
      >
        <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
          <button
            onClick={() => setShowShop(false)}
            className="text-[#f1c40f] font-bold hover:text-white transition-colors mr-6"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            ← QUAY LẠI HẬU CẦN
          </button>
          <div className="flex-1 flex justify-center gap-10 text-[#f1c40f] font-bold text-lg">
            <span>🥩 Lúa: <b>{Math.floor(resources.food)}</b></span>
            <span>💰 Vàng: <b>{Math.floor(resources.gold)}</b></span>
          </div>
        </header>

        <h1
          className="text-4xl text-[#f1c40f] text-center mt-8 mb-8"
          style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 0 10px black' }}
        >
          💰 CỬA HÀNG THƯƠNG MẠI
        </h1>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Đổi Lúa → Vàng */}
            <div className="bg-[rgba(20,20,20,0.95)] border-2 border-[#555] rounded-[10px] p-6 text-center hover:border-[#f1c40f] transition-all">
              <div className="text-4xl mb-3">🌾 ➜ 💰</div>
              <h3 className="text-lg font-bold text-[#f1c40f] mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                BÁN LƯƠNG THỰC
              </h3>
              <p className="text-gray-300 mb-4">10 Lúa ➔ 1 Vàng</p>
              <button
                onClick={handleTradeRiceForGold}
                disabled={resources.food < 10}
                className="bg-[#27ae60] text-white border-none py-2.5 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#2ecc71] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                QUY ĐỔI
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Research sub-screen
  if (showResearch) {
    return (
      <div
        className="fixed inset-0 z-[100] text-white flex flex-col"
        style={{ background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9))' }}
      >
        <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
          <button
            onClick={() => setShowResearch(false)}
            className="text-[#f1c40f] font-bold hover:text-white transition-colors mr-6"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            ← QUAY LẠI HẬU CẦN
          </button>
          <div className="flex-1 flex justify-center gap-10 text-[#f1c40f] font-bold text-lg">
            <span>🥩 Lúa: <b>{Math.floor(resources.food)}</b></span>
            <span>💰 Vàng: <b>{Math.floor(resources.gold)}</b></span>
          </div>
        </header>

        <h1
          className="text-4xl text-[#f1c40f] text-center mt-8 mb-6"
          style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 0 10px black' }}
        >
          📜 VIỆN NGHIÊN CỨU
        </h1>

        {researchState.inProgress && (
          <div className="text-center mb-4 px-4">
            <div className="inline-block bg-purple-900/50 border border-purple-500 rounded-lg px-6 py-3">
              <p className="text-purple-300 font-bold">⏳ Đang nghiên cứu...</p>
              <button
                onClick={cancelResearch}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Hủy nghiên cứu
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {[1, 2, 3].map((tier) => {
            const nodes = RESEARCH_BY_TIER[tier] || [];
            if (nodes.length === 0) return null;
            return (
              <div key={tier} className="mb-8">
                <h2
                  className="text-2xl text-[#f1c40f] mb-4"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {tier === 1 ? '🌱 Cấp 1 — Cơ Bản' : tier === 2 ? '⚡ Cấp 2 — Nâng Cao' : '🔥 Cấp 3 — Tinh Hoa'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                  {nodes.map((node) => {
                    const completed = isResearchCompleted(node.id);
                    const researching = isResearching(node.id);
                    const affordable = canAffordResearchNode(node);
                    const available = prereqsMet(node) && !completed && !researchState.inProgress;

                    return (
                      <div
                        key={node.id}
                        className={`bg-[rgba(20,20,20,0.95)] border-2 rounded-[10px] p-4 transition-all ${
                          completed
                            ? 'border-green-500 opacity-80'
                            : researching
                              ? 'border-purple-500 animate-pulse'
                              : available && affordable
                                ? 'border-[#555] hover:border-[#f1c40f]'
                                : 'border-[#333] opacity-50'
                        }`}
                      >
                        <h3 className="text-base font-bold text-[#f1c40f] mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {node.nameVietnamese}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2">{node.descriptionVietnamese}</p>

                        {/* Effects */}
                        <div className="mb-2">
                          {node.effects.map((eff, i) => (
                            <p key={i} className="text-xs text-green-400">✦ {eff.descriptionVietnamese}</p>
                          ))}
                        </div>

                        {/* Cost & Duration */}
                        <div className="flex gap-3 text-xs mb-2">
                          <span className={resources.food >= node.cost.food ? 'text-green-400' : 'text-red-400'}>
                            🥩 {node.cost.food}
                          </span>
                          <span className={resources.gold >= node.cost.gold ? 'text-green-400' : 'text-red-400'}>
                            💰 {node.cost.gold}
                          </span>
                          <span className="text-gray-400">⏱️ {node.duration}s</span>
                        </div>

                        {/* Prerequisites */}
                        {node.prerequisites.length > 0 && !prereqsMet(node) && (
                          <p className="text-xs text-red-400 mb-2">🔒 Cần nghiên cứu trước</p>
                        )}

                        {/* Button */}
                        {completed ? (
                          <div className="text-center text-green-400 font-bold text-sm py-1">✅ Đã hoàn thành</div>
                        ) : researching ? (
                          <div className="text-center text-purple-400 font-bold text-sm py-1">⏳ Đang nghiên cứu...</div>
                        ) : (
                          <button
                            onClick={() => handleStartResearch(node)}
                            disabled={!available || !affordable}
                            className="bg-[#8e44ad] text-white border-none py-2 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#9b59b6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                          >
                            NGHIÊN CỨU
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Training Camp sub-screen
  if (showTrainingCamp) {
    return (
      <div
        className="fixed inset-0 z-[100] text-white flex flex-col"
        style={{ background: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9))' }}
      >
        {/* Header */}
        <header className="h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
          <button
            onClick={() => setShowTrainingCamp(false)}
            className="text-[#f1c40f] font-bold hover:text-white transition-colors mr-6"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            ← QUAY LẠI HẬU CẦN
          </button>
          <div className="flex-1 flex justify-center gap-10 text-[#f1c40f] font-bold text-lg">
            <span>🥩 Lúa: <b>{Math.floor(resources.food)}</b></span>
            <span>💰 Vàng: <b>{Math.floor(resources.gold)}</b></span>
            <span>⚔️ Quân: <b>{Math.floor(resources.army)}</b></span>
          </div>
        </header>

        {/* Title */}
        <h1
          className="text-4xl text-[#f1c40f] text-center mt-8 mb-8"
          style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 0 10px black' }}
        >
          ⚔️ TRẠI LUYỆN BINH
        </h1>

        {/* Unit cards grid */}
        <div className="flex-1 overflow-y-auto px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Object.values(UnitType).map((type) => {
              const unit = UNIT_DATA[type];
              const affordable = canAffordUnit(type);
              const count = unitCounts[type] || 0;
              const icons: Record<string, string> = {
                [UnitType.INFANTRY]: '🗡️',
                [UnitType.CAVALRY]: '🐎',
                [UnitType.ARCHER]: '🏹',
                [UnitType.SIEGE]: '💣',
              };

              return (
                <div
                  key={type}
                  className="bg-[rgba(20,20,20,0.95)] border-2 border-[#555] rounded-[10px] p-5 flex flex-col items-center hover:border-[#f1c40f] transition-all"
                >
                  {/* Icon */}
                  <div className="text-5xl mb-3">{icons[type]}</div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-[#f1c40f] mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {unit.nameVietnamese}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 text-center mb-3 h-[36px]">
                    {unit.descriptionVietnamese}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-3 mb-3 text-sm">
                    <span title="Tấn công">⚔️ {unit.stats.attack}</span>
                    <span title="Phòng thủ">🛡️ {unit.stats.defense}</span>
                    <span title="Tốc độ">⚡ {unit.stats.speed}</span>
                  </div>

                  {/* Cost */}
                  <div className="flex gap-3 mb-3 text-sm">
                    <span className={resources.food >= unit.cost.food ? 'text-green-400' : 'text-red-400'}>
                      🥩 {unit.cost.food}
                    </span>
                    <span className={resources.gold >= unit.cost.gold ? 'text-green-400' : 'text-red-400'}>
                      💰 {unit.cost.gold}
                    </span>
                  </div>

                  {/* Count */}
                  <p className="text-sm text-gray-300 mb-3">
                    Đã có: <b className="text-white">{count}</b>
                  </p>

                  {/* Train button */}
                  <button
                    onClick={() => handleTrainUnit(type)}
                    disabled={!affordable}
                    className="bg-[#27ae60] text-white border-none py-2 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#2ecc71] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    HUẤN LUYỆN
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main logistics view
  return (
    <div
      className="fixed inset-0 z-[100] text-white flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85))' }}
    >
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 h-[50px] bg-black/85 border-b border-[#f1c40f] flex items-center px-4 z-[900]">
        <div className="flex-1 flex justify-center gap-10 text-[#f1c40f] font-bold text-lg">
          <span>🥩 Lúa: <b>{Math.floor(resources.food)}</b></span>
          <span>💰 Vàng: <b>{Math.floor(resources.gold)}</b></span>
          <span>⚔️ Quân: <b>{Math.floor(resources.army)}</b></span>
        </div>
      </header>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-[20px] right-[20px] bg-[#c0392b] text-white border-2 border-white py-2.5 px-5 font-bold rounded-[5px] cursor-pointer z-[901] hover:bg-[#e74c3c] transition-colors"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        QUAY LẠI CHIẾN TRƯỜNG ➜
      </button>

      {/* Title */}
      <h1
        className="text-5xl text-[#f1c40f] mb-12 mt-16"
        style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 0 10px black' }}
      >
        KHU VỰC HẬU CẦN
      </h1>

      {/* Logistics cards */}
      <div className="flex gap-8 flex-wrap justify-center px-4">
        {/* Doanh Trại */}
        <div className="bg-[rgba(20,20,20,0.9)] border-2 border-[#555] p-5 w-[300px] rounded-[10px] text-center hover:border-[#f1c40f] hover:scale-105 transition-all">
          <h3 className="text-xl font-bold mb-3 text-[#f1c40f]">🛡️ DOANH TRẠI</h3>
          <p className="text-gray-300 mb-2">
            Lực lượng: <b className="text-white">{playerUnits.length}</b>
          </p>
          <div className="text-sm text-gray-400 mb-3">
            <p>Bộ binh: <span className="text-white">{unitCounts[UnitType.INFANTRY] || 0}</span></p>
            <p>Kỵ binh: <span className="text-white">{unitCounts[UnitType.CAVALRY] || 0}</span></p>
            <p>Cung thủ: <span className="text-white">{unitCounts[UnitType.ARCHER] || 0}</span></p>
            <p>Công thành: <span className="text-white">{unitCounts[UnitType.SIEGE] || 0}</span></p>
          </div>
          <button
            onClick={() => setShowTrainingCamp(true)}
            className="bg-[#2980b9] text-white border-none py-2.5 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#3498db] transition-colors"
          >
            VÀO TRẠI LUYỆN BINH
          </button>
        </div>

        {/* Khoa Kỹ & Thương Mại */}
        <div className="bg-[rgba(20,20,20,0.9)] border-2 border-[#555] p-5 w-[300px] rounded-[10px] text-center hover:border-[#f1c40f] hover:scale-105 transition-all">
          <h3 className="text-xl font-bold mb-3 text-[#f1c40f]">🏛️ KHOA KỸ & THƯƠNG MẠI</h3>
          <p className="text-gray-300 mb-4">Phát triển quốc gia</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowShop(true)}
              className="bg-[#27ae60] text-white border-none py-2.5 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#2ecc71] transition-colors"
            >
              💰 Cửa Hàng / Đổi Lúa
            </button>
            <button
              onClick={() => setShowResearch(true)}
              className="bg-[#27ae60] text-white border-none py-2.5 px-4 w-full rounded-[5px] font-bold cursor-pointer hover:bg-[#2ecc71] transition-colors"
            >
              📜 Viện Nghiên Cứu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LogisticsView;
