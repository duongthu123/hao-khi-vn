'use client';

import { motion, type Variants } from 'framer-motion';

export interface MainMenuProps {
  onStartGame: () => void;
  onTraining: () => void;
  onCollection: () => void;
  onMuseum: () => void;
  onGacha: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function MainMenu({ onStartGame, onTraining, onCollection, onMuseum, onGacha, onProfile, onSettings }: MainMenuProps) {
  return (
    <section className="flex flex-col items-center gap-4" aria-labelledby="main-menu-title">
      {/* Title - Dancing Script like original */}
      <motion.header
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
        className="text-center mb-6"
      >
        <h1
          id="main-menu-title"
          className="text-[3.5rem] leading-tight mb-2"
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: '#ffd700',
            textShadow: '0 0 15px rgba(255, 69, 0, 0.8)',
          }}
        >
          Hào Khí Đông A
          <small className="block text-2xl text-white mt-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Bạch Đằng Giang
          </small>
        </h1>
      </motion.header>

      {/* Button group */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4"
        aria-label="Main menu navigation"
      >
        {/* XUẤT KÍCH - hexagonal gold button */}
        <motion.div variants={itemVariants}>
          <button
            onClick={onStartGame}
            className="btn-hex-start"
            aria-label="Xuất kích - Bắt đầu trò chơi"
          >
            XUẤT KÍCH
          </button>
        </motion.div>

        {/* LUYỆN BINH */}
        <motion.div variants={itemVariants}>
          <button onClick={onTraining} className="btn-brown" aria-label="Luyện binh">
            LUYỆN BINH
          </button>
        </motion.div>

        {/* KHO TƯỚNG */}
        <motion.div variants={itemVariants}>
          <button onClick={onCollection} className="btn-brown" aria-label="Kho tướng">
            KHO TƯỚNG
          </button>
        </motion.div>

        {/* BẢO TÀNG */}
        <motion.div variants={itemVariants}>
          <button onClick={onMuseum} className="btn-brown" aria-label="Bảo tàng">
            BẢO TÀNG
          </button>
        </motion.div>

        {/* KHO BÁU */}
        <motion.div variants={itemVariants}>
          <button onClick={onGacha} className="btn-brown" aria-label="Kho báu">
            KHO BÁU
          </button>
        </motion.div>

        {/* Settings row */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center">
          <button
            onClick={onProfile}
            className="btn-round"
            style={{ borderColor: '#2ecc71', color: '#2ecc71' }}
            aria-label="Hồ sơ"
          >
            👤
          </button>
          <button onClick={onSettings} className="btn-round" aria-label="Cài đặt">
            ⚙
          </button>
        </motion.div>
      </motion.nav>
    </section>
  );
}
