/**
 * ResearchTree Component
 * Displays the technology research tree with visual node connections,
 * shows prerequisites and costs, tracks research progress, and integrates
 * with the research constants
 * 
 * Validates Requirements: 19.1, 19.3, 19.6, 19.7, 2.2, 2.3
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store';
import { useState, useMemo } from 'react';
import { 
  ALL_RESEARCH, 
  RESEARCH_BY_TIER,
  ResearchNode,
  getResearchById,
  arePrerequisitesMet,
  canAffordResearch
} from '@/constants/research';
import { useResearchSystem } from '@/hooks/useResearchSystem';

interface ResearchTreeProps {
  className?: string;
}

interface ResearchNodeCardProps {
  node: ResearchNode;
  isCompleted: boolean;
  isInProgress: boolean;
  isAvailable: boolean;
  canAfford: boolean;
  progress: number;
  onStartResearch: (researchId: string) => void;
  onCancelResearch: () => void;
}

/**
 * Individual research node card component
 */
function ResearchNodeCard({
  node,
  isCompleted,
  isInProgress,
  isAvailable,
  canAfford,
  progress,
  onStartResearch,
  onCancelResearch,
}: ResearchNodeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-500 bg-green-500/10';
    if (isInProgress) return 'border-blue-500 bg-blue-500/10';
    if (isAvailable && canAfford) return 'border-yellow-500 bg-yellow-500/5';
    if (isAvailable) return 'border-orange-500 bg-orange-500/5';
    return 'border-slate-700 bg-slate-900/30';
  };

  const getStatusIcon = () => {
    if (isCompleted) return '✓';
    if (isInProgress) return '⏳';
    if (!isAvailable) return '🔒';
    return '';
  };

  const isDisabled = !isAvailable || isCompleted;
  const isClickable = !isDisabled || isInProgress; // Allow clicking in-progress to cancel

  return (
    <motion.div
      className={`relative rounded-lg border-2 p-4 transition-all ${getStatusColor()} ${
        isDisabled && !isInProgress ? 'opacity-60' : isClickable ? 'cursor-pointer hover:scale-105' : 'opacity-60'
      }`}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      onClick={() => isClickable && setShowDetails(true)}
    >
      {/* Status Badge */}
      {(isCompleted || isInProgress || !isAvailable) && (
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border-2 border-current flex items-center justify-center text-sm">
          {getStatusIcon()}
        </div>
      )}

      {/* Node Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-white text-sm leading-tight">
            {node.nameVietnamese}
          </h4>
          <span className="text-xs text-slate-400 flex-shrink-0">T{node.tier}</span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2">
          {node.descriptionVietnamese}
        </p>

        {/* Cost */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">🌾</span>
            <span className={canAfford || isCompleted ? 'text-slate-300' : 'text-red-400'}>
              {node.cost.food}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">💰</span>
            <span className={canAfford || isCompleted ? 'text-slate-300' : 'text-red-400'}>
              {node.cost.gold}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400">⏱️</span>
            <span className="text-slate-300">{node.duration}s</span>
          </div>
        </div>

        {/* Progress Bar (if in progress) */}
        {isInProgress && (
          <div className="space-y-1">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-400">Đang nghiên cứu...</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-lg border-2 border-slate-700 p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-1">
                    {node.nameVietnamese}
                  </h3>
                  <p className="text-sm text-slate-400">{node.name}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-slate-300">{node.descriptionVietnamese}</p>
                </div>

                {/* Effects */}
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">Hiệu Ứng:</h4>
                  <div className="space-y-1">
                    {node.effects.map((effect, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-400">•</span>
                        <span className="text-slate-300">{effect.descriptionVietnamese}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                {node.prerequisites.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Yêu Cầu:</h4>
                    <div className="space-y-1">
                      {node.prerequisites.map((prereqId) => {
                        const prereq = getResearchById(prereqId);
                        return prereq ? (
                          <div key={prereqId} className="flex items-center gap-2 text-sm">
                            <span className={isCompleted ? 'text-green-400' : 'text-slate-400'}>
                              {isCompleted ? '✓' : '○'}
                            </span>
                            <span className="text-slate-300">{prereq.nameVietnamese}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Cost and Duration */}
                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Chi phí:</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span>🌾</span>
                        <span className={canAfford || isCompleted ? 'text-white' : 'text-red-400'}>
                          {node.cost.food}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span className={canAfford || isCompleted ? 'text-white' : 'text-red-400'}>
                          {node.cost.gold}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Thời gian:</span>
                    <span className="text-white">{node.duration} giây</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isCompleted && (
                    <div className="flex-1 bg-green-500/20 border border-green-500 rounded-lg py-2 px-4 text-center text-green-400 font-semibold">
                      ✓ Đã Hoàn Thành
                    </div>
                  )}
                  {isInProgress && (
                    <>
                      <div className="flex-1 bg-blue-500/20 border border-blue-500 rounded-lg py-2 px-4 text-center">
                        <div className="text-blue-400 font-semibold">Đang Nghiên Cứu</div>
                        <div className="text-xs text-slate-400 mt-1">{Math.round(progress)}%</div>
                      </div>
                      <button
                        onClick={() => {
                          onCancelResearch();
                          setShowDetails(false);
                        }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                  {!isCompleted && !isInProgress && (
                    <>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => {
                          if (isAvailable && canAfford) {
                            onStartResearch(node.id);
                            setShowDetails(false);
                          }
                        }}
                        disabled={!isAvailable || !canAfford}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isAvailable && canAfford
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {!isAvailable ? '🔒 Chưa Mở Khóa' : !canAfford ? '💰 Không Đủ' : 'Bắt Đầu'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Main ResearchTree component
 */
export function ResearchTree({ className = '' }: ResearchTreeProps) {
  const research = useGameStore((state) => state.research);
  const resources = useGameStore((state) => state.resources);
  const { startResearch, cancelResearch } = useResearchSystem();

  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');

  // Calculate which nodes are available and affordable
  const nodeStates = useMemo(() => {
    const states = new Map<string, {
      isCompleted: boolean;
      isInProgress: boolean;
      isAvailable: boolean;
      canAfford: boolean;
    }>();

    ALL_RESEARCH.forEach((node) => {
      const isCompleted = research.completed.includes(node.id);
      const isInProgress = research.inProgress === node.id;
      const isAvailable = arePrerequisitesMet(node.id, research.completed);
      const canAfford = canAffordResearch(node.id, { food: resources.food, gold: resources.gold });

      states.set(node.id, {
        isCompleted,
        isInProgress,
        isAvailable,
        canAfford,
      });
    });

    return states;
  }, [research.completed, research.inProgress, resources.food, resources.gold]);

  // Filter research by tier
  const displayedResearch = useMemo(() => {
    if (selectedTier === 'all') {
      return ALL_RESEARCH;
    }
    return RESEARCH_BY_TIER[selectedTier] || [];
  }, [selectedTier]);

  // Handle starting research
  const handleStartResearch = (researchId: string) => {
    startResearch(researchId);
  };

  // Handle canceling research
  const handleCancelResearch = () => {
    cancelResearch();
  };

  // Calculate statistics
  const totalResearch = ALL_RESEARCH.length;
  const completedCount = research.completed.length;
  const completionPercentage = (completedCount / totalResearch) * 100;

  return (
    <div className={`flex flex-col h-full bg-[#3e2723] text-white ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Cây Nghiên Cứu</h1>
            <p className="text-slate-400 text-sm">Nâng cấp công nghệ và năng lực</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {completedCount} / {totalResearch}
            </div>
            <div className="text-xs text-slate-400">Đã hoàn thành</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tiến độ nghiên cứu</span>
            <span>{completionPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedTier === 'all'
                ? 'bg-yellow-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tất Cả
          </button>
          {[1, 2, 3].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedTier === tier
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Cấp {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Research Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedResearch.map((node) => {
            const state = nodeStates.get(node.id);
            if (!state) return null;

            return (
              <ResearchNodeCard
                key={node.id}
                node={node}
                isCompleted={state.isCompleted}
                isInProgress={state.isInProgress}
                isAvailable={state.isAvailable}
                canAfford={state.canAfford}
                progress={research.progress}
                onStartResearch={handleStartResearch}
                onCancelResearch={handleCancelResearch}
              />
            );
          })}
        </div>

        {displayedResearch.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-2">🔬</div>
            <p>Không có nghiên cứu nào trong cấp này</p>
          </div>
        )}
      </div>
    </div>
  );
}
