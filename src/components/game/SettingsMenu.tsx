'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardBody, CardFooter } from '@/components/ui';
import { useGameStore } from '@/store';

export interface SettingsMenuProps {
  onClose: () => void;
}

// Stagger container for settings sections
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Individual setting section animation
const sectionVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const updateSettings = useGameStore((state) => state.updateSettings);
  const storeSettings = useGameStore((state) => state.ui.settings);
  
  const [settings, setSettings] = useState(storeSettings);
  
  // Sync with store settings when they change
  useEffect(() => {
    setSettings(storeSettings);
  }, [storeSettings]);

  const handleSave = () => {
    updateSettings(settings);
    onClose();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };
  
  const setAutoSaveIntervalMinutes = (minutes: number) => {
    setSettings((prev) => ({
      ...prev,
      autoSaveInterval: minutes * 60 * 1000,
    }));
  };
  
  const getAutoSaveIntervalMinutes = () => {
    return Math.floor(settings.autoSaveInterval / (60 * 1000));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const
      }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="shadow-lacquer">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.1, 
              duration: 0.3,
              ease: 'easeOut' as const
            }}
          >
            <h2 className="text-2xl font-bold text-[#f1c40f]" style={{ fontFamily: "'Oswald', sans-serif" }}>Thiết Lập</h2>
            <p className="text-sm text-gray-400 mt-1">Settings</p>
          </motion.div>
        </CardHeader>

        <CardBody className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Audio Settings */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f1c40f]">Âm thanh / Audio</h3>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Hiệu ứng âm thanh / Sound Effects</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => toggleSetting('soundEnabled')}
                  className="w-5 h-5 text-river-500 rounded focus:ring-2 focus:ring-river-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Nhạc nền / Background Music</span>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={() => toggleSetting('musicEnabled')}
                  className="w-5 h-5 text-river-500 rounded focus:ring-2 focus:ring-river-500"
                />
              </label>
            </motion.div>

            {/* Visual Settings */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f1c40f]">Hình ảnh / Visual</h3>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Hiệu ứng chuyển động / Animations</span>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={() => toggleSetting('animationsEnabled')}
                  className="w-5 h-5 text-river-500 rounded focus:ring-2 focus:ring-river-500"
                />
              </label>
            </motion.div>

            {/* Auto-save Settings */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f1c40f]">Tự động lưu / Auto-save</h3>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Bật tự động lưu / Enable auto-save</span>
                <input
                  type="checkbox"
                  checked={settings.autoSaveEnabled}
                  onChange={() => toggleSetting('autoSaveEnabled')}
                  className="w-5 h-5 text-river-500 rounded focus:ring-2 focus:ring-river-500"
                />
              </label>
              
              {settings.autoSaveEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 pl-4 border-l-2 border-[#555]"
                >
                  <label className="block text-sm text-gray-300">
                    Khoảng thời gian / Interval
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={getAutoSaveIntervalMinutes() === 3 ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAutoSaveIntervalMinutes(3)}
                    >
                      3 phút
                    </Button>
                    <Button
                      variant={getAutoSaveIntervalMinutes() === 5 ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAutoSaveIntervalMinutes(5)}
                    >
                      5 phút
                    </Button>
                    <Button
                      variant={getAutoSaveIntervalMinutes() === 10 ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAutoSaveIntervalMinutes(10)}
                    >
                      10 phút
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Game sẽ tự động lưu vào ô 1 mỗi {getAutoSaveIntervalMinutes()} phút
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Language Settings */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f1c40f]">Ngôn ngữ / Language</h3>
              
              <div className="flex gap-2">
                <Button
                  variant={settings.language === 'vi' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, language: 'vi' }))}
                >
                  Tiếng Việt
                </Button>
                <Button
                  variant={settings.language === 'en' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, language: 'en' }))}
                >
                  English
                </Button>
              </div>
            </motion.div>

            {/* Difficulty Settings */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f1c40f]">Độ khó / Difficulty</h3>
              
              <div className="flex gap-2">
                <Button
                  variant={settings.difficulty === 'easy' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, difficulty: 'easy' }))}
                >
                  Dễ / Easy
                </Button>
                <Button
                  variant={settings.difficulty === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, difficulty: 'normal' }))}
                >
                  Bình thường / Normal
                </Button>
                <Button
                  variant={settings.difficulty === 'hard' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, difficulty: 'hard' }))}
                >
                  Khó / Hard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </CardBody>

        <CardFooter className="flex gap-3 justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: 0.4,
              ease: 'easeOut' as const
            }}
            className="flex gap-3"
          >
            <Button variant="ghost" onClick={onClose}>
              Hủy / Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu / Save
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
