'use client';

/**
 * AccessibilitySettings Component
 * Provides controls for accessibility features including text alternatives
 * Validates Requirement 22.5: Text alternatives for visual and audio information
 */

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { soundManager } from '@/lib/audio/soundManager';

export interface AccessibilitySettingsProps {
  onClose?: () => void;
}

interface AccessibilityPreferences {
  audioCaptions: boolean;
  visualDescriptions: boolean;
  combatAnnouncements: boolean;
  resourceAnnouncements: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  audioCaptions: false,
  visualDescriptions: false,
  combatAnnouncements: false,
  resourceAnnouncements: false,
  reducedMotion: false,
  highContrast: false,
};

/**
 * AccessibilitySettings component for managing text alternatives and other accessibility features
 */
export function AccessibilitySettings({ onClose }: AccessibilitySettingsProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('accessibility-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility preferences:', error);
      }
    }
  }, []);

  // Apply preferences
  useEffect(() => {
    // Audio captions
    if (preferences.audioCaptions) {
      soundManager.enableCaptions((caption) => {
        // Caption will be displayed by AudioCaption component
        console.log('Audio caption:', caption);
      });
    } else {
      soundManager.disableCaptions();
    }

    // Reduced motion
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // High contrast
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [preferences]);

  const handleToggle = (key: keyof AccessibilityPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    setHasChanges(false);
    
    // Show confirmation
    alert('Đã lưu cài đặt trợ năng');
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Cài đặt trợ năng
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Tùy chỉnh các tính năng trợ năng để cải thiện trải nghiệm chơi game
        </p>
      </CardHeader>

      <CardBody>
        <div className="space-y-6">
          {/* Text Alternatives Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Văn bản thay thế
            </h3>
            <div className="space-y-4">
              <SettingToggle
                label="Phụ đề âm thanh"
                description="Hiển thị mô tả văn bản cho các hiệu ứng âm thanh trong game"
                checked={preferences.audioCaptions}
                onChange={() => handleToggle('audioCaptions')}
              />
              
              <SettingToggle
                label="Mô tả hình ảnh"
                description="Cung cấp mô tả văn bản cho các yếu tố hình ảnh trên bản đồ"
                checked={preferences.visualDescriptions}
                onChange={() => handleToggle('visualDescriptions')}
              />
              
              <SettingToggle
                label="Thông báo chiến đấu"
                description="Đọc to các sự kiện chiến đấu quan trọng"
                checked={preferences.combatAnnouncements}
                onChange={() => handleToggle('combatAnnouncements')}
              />
              
              <SettingToggle
                label="Thông báo tài nguyên"
                description="Thông báo khi tài nguyên thay đổi đáng kể"
                checked={preferences.resourceAnnouncements}
                onChange={() => handleToggle('resourceAnnouncements')}
              />
            </div>
          </section>

          {/* Visual Preferences Section */}
          <section className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tùy chọn hiển thị
            </h3>
            <div className="space-y-4">
              <SettingToggle
                label="Giảm chuyển động"
                description="Giảm hoặc tắt các hiệu ứng chuyển động và hoạt ảnh"
                checked={preferences.reducedMotion}
                onChange={() => handleToggle('reducedMotion')}
              />
              
              <SettingToggle
                label="Độ tương phản cao"
                description="Tăng độ tương phản màu sắc để dễ nhìn hơn"
                checked={preferences.highContrast}
                onChange={() => handleToggle('highContrast')}
              />
            </div>
          </section>

          {/* Information Section */}
          <section className="pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Về các tính năng trợ năng</p>
                  <p>
                    Game này được thiết kế để hỗ trợ người chơi khuyết tật. 
                    Các tính năng trợ năng giúp cải thiện khả năng tiếp cận 
                    cho người khiếm thị, khiếm thính, và những người có nhu cầu đặc biệt khác.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              Lưu cài đặt
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              className="flex-1"
            >
              Đặt lại mặc định
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <label className="block">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </label>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? 'Tắt' : 'Bật'} ${label}`}
        onClick={onChange}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-vietnam-500 focus:ring-offset-2
          ${checked ? 'bg-vietnam-500' : 'bg-gray-200'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

/**
 * Hook for accessing accessibility preferences
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = localStorage.getItem('accessibility-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility preferences:', error);
      }
    }
  }, []);

  return preferences;
}
