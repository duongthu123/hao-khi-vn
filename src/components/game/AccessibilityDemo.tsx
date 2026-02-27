'use client';

/**
 * AccessibilityDemo Component
 * Demonstrates the text alternatives implementation
 * Shows how all accessibility features work together
 */

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RadarChart } from '@/components/ui/RadarChart';
import { AudioCaption, useAudioCaption, getSoundDescription } from '@/components/ui/AudioCaption';
import { soundManager, SoundEffect } from '@/lib/audio/soundManager';
import {
  generateMapDescription,
  generateUnitDescription,
  generateCombatEventDescription,
} from '@/components/game/GameMap/GameMapAccessibility';
import { Unit, UnitType, Direction, StatusEffectType, UnitOwner } from '@/types/unit';

/**
 * Demo component showing text alternatives in action
 */
export function AccessibilityDemo() {
  const [_activeDemo, setActiveDemo] = useState<string | null>(null);
  const { caption, showCaption, displayCaption } = useAudioCaption();

  // Sample data
  const sampleStats = [
    {
      attack: 85,
      defense: 75,
      speed: 65,
      leadership: 90,
      intelligence: 80,
    },
  ];

  const sampleUnit: Unit = {
    id: '1',
    type: UnitType.INFANTRY,
    faction: 'vietnamese',
    position: { x: 100, y: 100 },
    health: 80,
    maxHealth: 100,
    attack: 50,
    defense: 40,
    speed: 30,
    direction: Direction.NORTH,
    status: [{ type: StatusEffectType.BUFF, duration: 5 }],
    owner: UnitOwner.PLAYER,
  };

  const handleAudioCaptionDemo = () => {
    setActiveDemo('audio');
    displayCaption(getSoundDescription('attack-melee'), 3000);
    
    // Play sound if initialized
    if (soundManager.isInitialized()) {
      soundManager.play(SoundEffect.ATTACK_MELEE);
    }
  };

  const handleVisualDescriptionDemo = () => {
    setActiveDemo('visual');
    const description = generateUnitDescription(sampleUnit);
    alert(description);
  };

  const handleCombatEventDemo = () => {
    setActiveDemo('combat');
    const description = generateCombatEventDescription('attack', {
      attackerType: 'infantry',
      defenderType: 'cavalry',
      damage: 25,
    });
    displayCaption(description, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">
            Trình diễn tính năng trợ năng
          </h1>
          <p className="text-gray-600 mt-2">
            Khám phá các tính năng văn bản thay thế cho nội dung hình ảnh và âm thanh
          </p>
        </CardHeader>

        <CardBody>
          <div className="space-y-8">
            {/* Visual Content Demo */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Văn bản thay thế cho hình ảnh
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Biểu đồ radar thống kê
                  </h3>
                  <RadarChart stats={sampleStats} />
                  <p className="text-sm text-gray-600 mt-3">
                    ✓ Canvas có role="img" và aria-label mô tả đầy đủ các chỉ số
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Chân dung tướng
                  </h3>
                  <div
                    className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                    role="img"
                    aria-label="Chân dung Trần Hưng Đạo, tướng Đại Việt, độ hiếm legendary"
                  >
                    <span className="text-5xl text-white" aria-hidden="true">
                      T
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    ✓ Hình ảnh có aria-label mô tả tên, phe, và độ hiếm
                  </p>
                </div>
              </div>

              <Button
                onClick={handleVisualDescriptionDemo}
                className="mt-4"
                variant="secondary"
              >
                Xem mô tả văn bản đơn vị
              </Button>
            </section>

            {/* Audio Content Demo */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Phụ đề cho nội dung âm thanh
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Tất cả hiệu ứng âm thanh đều có phụ đề văn bản:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                  <li>Âm thanh tấn công (cận chiến, tầm xa)</li>
                  <li>Âm thanh trúng đòn (nhẹ, nặng)</li>
                  <li>Âm thanh tử trận, hồi máu</li>
                  <li>Âm thanh kỹ năng và hiệu ứng</li>
                  <li>Âm thanh giao diện (thăng cấp, thông báo)</li>
                </ul>
                
                <Button onClick={handleAudioCaptionDemo}>
                  Phát âm thanh với phụ đề
                </Button>
              </div>
            </section>

            {/* Combat Events Demo */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Mô tả sự kiện chiến đấu
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Các sự kiện chiến đấu được mô tả bằng văn bản:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                  <li>Tấn công: "Bộ binh tấn công Kỵ binh, gây 25 sát thương"</li>
                  <li>Tử trận: "Cung thủ đã tử trận"</li>
                  <li>Kỹ năng: "Trần Hưng Đạo sử dụng kỹ năng Đánh úp"</li>
                  <li>Chiến thắng/Thất bại: Thông báo kết quả trận đấu</li>
                </ul>
                
                <Button onClick={handleCombatEventDemo}>
                  Xem mô tả sự kiện
                </Button>
              </div>
            </section>

            {/* Map Information Demo */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Thông tin bản đồ
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Trạng thái bản đồ được mô tả chi tiết:
                </p>
                <div className="bg-white rounded p-4 border border-gray-200">
                  <p className="text-sm text-gray-800 font-mono">
                    {generateMapDescription(
                      [sampleUnit],
                      [
                        {
                          id: '1',
                          type: 'fortress',
                          position: { x: 50, y: 50 },
                          health: 500,
                          maxHealth: 1000,
                          owner: 'player',
                        },
                      ]
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  ✓ Tổng quan quân lực, số lượng đơn vị và công trình
                </p>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Lợi ích của văn bản thay thế
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">👁️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Người khiếm thị
                  </h3>
                  <p className="text-sm text-gray-600">
                    Truy cập đầy đủ thông tin game qua trình đọc màn hình
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">👂</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Người khiếm thính
                  </h3>
                  <p className="text-sm text-gray-600">
                    Phụ đề văn bản cho tất cả nội dung âm thanh
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Khuyết tật nhận thức
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mô tả rõ ràng giúp hiểu game dễ dàng hơn
                  </p>
                </div>
              </div>
            </section>

            {/* WCAG Compliance */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tuân thủ WCAG 2.1
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-900 mb-2">
                      Đạt chuẩn WCAG 2.1 Level A
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ 1.1.1 Non-text Content</li>
                      <li>✓ 1.2.1 Audio-only and Video-only</li>
                      <li>✓ 1.3.1 Info and Relationships</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </CardBody>
      </Card>

      {/* Audio Caption Display */}
      {showCaption && (
        <AudioCaption
          caption={caption}
          show={showCaption}
          duration={0}
          position="bottom"
        />
      )}
    </div>
  );
}
