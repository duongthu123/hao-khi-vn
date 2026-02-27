/**
 * ProfileView Component
 * Displays player profile including name, rank, level, statistics,
 * win/loss ratios, achievements, and detailed gameplay statistics
 */

'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store';
import { useState, useEffect } from 'react';
import { RankUpAnimation } from '@/components/ui/RankUpAnimation';

interface ProfileViewProps {
  className?: string;
}

export function ProfileView({ className = '' }: ProfileViewProps) {
  const profile = useGameStore((state) => state.profile);
  const getWinRate = useGameStore((state) => state.getWinRate);
  const getTotalGames = useGameStore((state) => state.getTotalGames);
  const getUnlockedAchievements = useGameStore((state) => state.getUnlockedAchievements);
  const getNextRankThreshold = useGameStore((state) => state.getNextRankThreshold);

  const [showRankUpAnimation, setShowRankUpAnimation] = useState(false);
  const [rankUpRank, setRankUpRank] = useState('');
  const [previousRank, setPreviousRank] = useState(profile.rank);

  // Watch for rank changes to trigger animation
  useEffect(() => {
    if (profile.rank !== previousRank && previousRank !== '') {
      setRankUpRank(profile.rank);
      setShowRankUpAnimation(true);
    }
    setPreviousRank(profile.rank);
  }, [profile.rank, previousRank]);

  const winRate = getWinRate();
  const totalGames = getTotalGames();
  const unlockedAchievements = getUnlockedAchievements();
  const nextRank = getNextRankThreshold();

  // Calculate level progress
  const experiencePerLevel = 1000;
  const currentLevelExp = profile.experience % experiencePerLevel;
  const levelProgress = (currentLevelExp / experiencePerLevel) * 100;

  // Format play time
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get rank color
  const getRankColor = (rank: string): string => {
    if (rank.includes('Nguyên Soái')) return 'from-yellow-500 to-orange-500';
    if (rank.includes('Đại Tướng')) return 'from-purple-500 to-pink-500';
    if (rank.includes('Tướng')) return 'from-blue-500 to-cyan-500';
    if (rank.includes('Đội Trưởng')) return 'from-green-500 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={`flex flex-col min-h-full bg-[#1e272e] text-white mx-auto ${className}`} style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')" }}>
      {/* Rank-up animation overlay */}
      {showRankUpAnimation && (
        <RankUpAnimation
          newRank={rankUpRank}
          onComplete={() => setShowRankUpAnimation(false)}
        />
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">Hồ Sơ Chiến Binh</h1>
        <p className="text-slate-400 text-sm">Thông tin và thành tích của bạn</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Player Info Card */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Avatar placeholder */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-4xl flex-shrink-0">
                  🛡️
                </div>

                <div className="flex-1">
                  {/* Name and Level */}
                  <h2 className="text-2xl font-bold text-white mb-1">{profile.playerName}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getRankColor(profile.rank)} text-white`}>
                      {profile.rank}
                    </span>
                    <span className="text-slate-400 text-sm">Cấp {profile.level}</span>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Kinh nghiệm</span>
                      <span>{currentLevelExp} / {experiencePerLevel} XP</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Next Rank Info */}
                  {nextRank && (
                    <div className="mt-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Cấp bậc tiếp theo:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-semibold">{nextRank.rank}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">Cấp {nextRank.level}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Còn {nextRank.level - profile.level} cấp nữa
                      </div>
                    </div>
                  )}
                  {!nextRank && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-2 text-xs text-yellow-400">
                        <span>👑</span>
                        <span className="font-semibold">Đã đạt cấp bậc cao nhất!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Win/Loss Statistics */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Thống Kê Chiến Đấu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{profile.wins}</div>
                <div className="text-sm text-slate-400 mt-1">Thắng</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{profile.losses}</div>
                <div className="text-sm text-slate-400 mt-1">Thua</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{totalGames}</div>
                <div className="text-sm text-slate-400 mt-1">Tổng trận</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{winRate.toFixed(1)}%</div>
                <div className="text-sm text-slate-400 mt-1">Tỷ lệ thắng</div>
              </div>
            </div>

            {/* Win Rate Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Tỷ lệ thắng/thua</span>
                <span>{profile.wins}W - {profile.losses}L</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                <motion.div
                  className="bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalGames > 0 ? (profile.wins / totalGames) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                />
                <motion.div
                  className="bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalGames > 0 ? (profile.losses / totalGames) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Detailed Statistics */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Thống Kê Chi Tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Thời gian chơi</div>
                    <div className="text-lg font-semibold text-white">
                      {formatPlayTime(profile.statistics.totalPlayTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl">
                    ⚔️
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Đơn vị tiêu diệt</div>
                    <div className="text-lg font-semibold text-white">
                      {profile.statistics.unitsDefeated.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Tài nguyên thu thập</div>
                    <div className="text-lg font-semibold text-white">
                      {profile.statistics.resourcesGathered.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                    📚
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Câu đố hoàn thành</div>
                    <div className="text-lg font-semibold text-white">
                      {profile.statistics.quizzesCompleted}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Thành Tựu</h3>
              <span className="text-sm text-slate-400">
                {unlockedAchievements.length} / {profile.achievements.length}
              </span>
            </div>

            {profile.achievements.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">🏆</div>
                <p>Chưa có thành tựu nào</p>
                <p className="text-sm mt-1">Hãy chiến đấu để mở khóa thành tựu!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`rounded-lg p-4 border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-slate-900/50 border-yellow-500/50'
                        : 'bg-slate-900/30 border-slate-700 opacity-60'
                    }`}
                    whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon || '🏆'}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-400">
                            ✓ Mở khóa: {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                        {!achievement.unlocked && (
                          <p className="text-xs text-slate-500">🔒 Chưa mở khóa</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
