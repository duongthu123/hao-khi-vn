'use client';

import { motion } from 'framer-motion';

interface Artifact {
  id: string;
  name: string;
  icon: string;
  description: string;
  lore: string;
  requiredFragments: number;
}

const ARTIFACTS: Artifact[] = [
  {
    id: 'cocgo',
    name: 'Cọc Gỗ Bạch Đằng',
    icon: '🪵',
    description: 'Cọc gỗ cắm dưới lòng sông Bạch Đằng',
    lore: '"Giang sơn bừng sáng..."',
    requiredFragments: 5,
  },
  {
    id: 'hich',
    name: 'Hịch Tướng Sĩ',
    icon: '📜',
    description: 'Bài hịch nổi tiếng của Trần Hưng Đạo',
    lore: '"Ta thường tới bữa quên ăn..."',
    requiredFragments: 3,
  },
];

interface MuseumViewProps {
  onClose?: () => void;
}

export function MuseumView({ onClose }: MuseumViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-3xl mx-4 bg-gradient-to-b from-[#2c1810] to-[#1a0f0a] rounded-lg border border-[#f1c40f]/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#f1c40f]/20 text-center">
          <h2
            className="text-3xl font-bold text-[#ffd700]"
            style={{ fontFamily: "'Oswald', sans-serif", textShadow: '2px 2px 0 #000' }}
          >
            BẢO TÀNG LỊCH SỬ
          </h2>
        </div>

        {/* Artifacts Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTIFACTS.map((artifact) => (
            <motion.div
              key={artifact.id}
              className="bg-black/40 border border-[#f1c40f]/20 rounded-lg p-5 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-5xl mb-3 opacity-50">{artifact.icon}</div>
              <h3
                className="text-xl font-bold text-[#ffd700] mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {artifact.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3">{artifact.description}</p>
              <p className="text-gray-500 text-sm mb-4">
                Mảnh: 0/{artifact.requiredFragments}
              </p>
              <button
                className="px-4 py-2 bg-[#5d4037] hover:bg-[#6d4c41] text-[#ffd700] rounded font-bold text-sm border border-[#f1c40f]/30 transition-colors"
                onClick={() => {
                  // TODO: Implement crafting when artifact store is added
                }}
              >
                Ghép (Cần {artifact.requiredFragments} mảnh)
              </button>
              <div className="mt-3 text-gray-500 italic text-sm hidden">
                {artifact.lore}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="p-4 border-t border-[#f1c40f]/20 text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#c0392b] hover:bg-[#e74c3c] text-white font-bold rounded transition-colors"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ĐÓNG
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
