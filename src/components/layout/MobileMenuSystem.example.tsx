'use client';

/**
 * MobileMenuSystem Example
 * 
 * Demonstrates the complete mobile-optimized menu system with:
 * - Hamburger menu navigation
 * - Bottom navigation bar
 * - Full-screen modals on mobile
 * - Responsive behavior
 */

import React, { useState } from 'react';
import { MobileMenuSystem, useMobileMenu } from './MobileMenuSystem';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function MobileMenuSystemExample() {
  const { activeView, setActiveView, openModal, closeModal, modalState } = useMobileMenu();
  const [selectedHero, setSelectedHero] = useState<string | null>(null);

  // Main navigation items for hamburger menu
  const menuItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: '🏠',
      onClick: () => {
        setActiveView('home');
      },
    },
    {
      id: 'game',
      label: 'Chơi game',
      icon: '🎮',
      onClick: () => {
        setActiveView('game');
      },
    },
    {
      id: 'collection',
      label: 'Bộ sưu tập',
      icon: '🏛️',
      onClick: () => {
        setActiveView('collection');
      },
    },
    {
      id: 'profile',
      label: 'Hồ sơ',
      icon: '👤',
      onClick: () => {
        setActiveView('profile');
      },
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      onClick: () => {
        openModal('settings');
      },
    },
    {
      id: 'help',
      label: 'Trợ giúp',
      icon: '❓',
      onClick: () => {
        openModal('help');
      },
    },
  ];

  // Bottom navigation bar items (quick access)
  const bottomBarItems = [
    {
      id: 'map',
      label: 'Bản đồ',
      icon: '🗺️',
      onClick: () => {
        setActiveView('map');
      },
    },
    {
      id: 'combat',
      label: 'Chiến đấu',
      icon: '⚔️',
      onClick: () => {
        setActiveView('combat');
      },
    },
    {
      id: 'resources',
      label: 'Tài nguyên',
      icon: '💰',
      onClick: () => {
        setActiveView('resources');
      },
    },
    {
      id: 'heroes',
      label: 'Tướng',
      icon: '🦸',
      onClick: () => {
        openModal('heroes');
      },
    },
    {
      id: 'quests',
      label: 'Nhiệm vụ',
      icon: '📜',
      onClick: () => {
        setActiveView('quests');
      },
    },
  ];

  // Sample heroes data
  const heroes = [
    { id: 'tran-hung-dao', name: 'Trần Hưng Đạo', faction: 'vietnamese' },
    { id: 'le-loi', name: 'Lê Lợi', faction: 'vietnamese' },
    { id: 'genghis-khan', name: 'Thành Cát Tư Hãn', faction: 'mongol' },
  ];

  return (
    <MobileMenuSystem
      menuItems={menuItems}
      bottomBarItems={bottomBarItems}
      activeItemId={activeView}
    >
      {/* Main Content */}
      <div className="p-4 tablet:p-6">
        <h1 className="text-2xl tablet:text-3xl font-bold text-gray-900 mb-4">
          Đại Chiến Sử Việt
        </h1>
        
        <div className="space-y-4">
          {/* Current View Display */}
          <div className="bg-white rounded-lg shadow-vietnamese p-4">
            <h2 className="text-lg font-semibold text-vietnam-600 mb-2">
              Màn hình hiện tại
            </h2>
            <p className="text-gray-700">
              {activeView || 'Chưa chọn màn hình'}
            </p>
          </div>

          {/* Demo Actions */}
          <div className="bg-white rounded-lg shadow-vietnamese p-4">
            <h2 className="text-lg font-semibold text-vietnam-600 mb-3">
              Thao tác demo
            </h2>
            <div className="space-y-2">
              <Button
                onClick={() => openModal('settings')}
                variant="primary"
                className="w-full"
              >
                Mở cài đặt (Full-screen trên mobile)
              </Button>
              <Button
                onClick={() => openModal('heroes')}
                variant="secondary"
                className="w-full"
              >
                Chọn tướng (Full-screen trên mobile)
              </Button>
              <Button
                onClick={() => openModal('help')}
                variant="ghost"
                className="w-full"
              >
                Xem trợ giúp
              </Button>
            </div>
          </div>

          {/* Responsive Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">Hướng dẫn:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Trên mobile: Nhấn nút hamburger (☰) để mở menu</li>
              <li>Thanh điều hướng dưới cùng cho truy cập nhanh</li>
              <li>Modal hiển thị toàn màn hình trên mobile</li>
              <li>Trên tablet/desktop: Giao diện tự động thay đổi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings Modal - Full-screen on mobile */}
      <Modal
        open={modalState.isOpen && modalState.modalId === 'settings'}
        onOpenChange={(open) => !open && closeModal()}
        fullScreenOnMobile
        title="Cài đặt"
        description="Tùy chỉnh trải nghiệm game của bạn"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Âm lượng
            </label>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Bật hiệu ứng âm thanh</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Bật animation</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Tự động lưu</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1">
              Lưu
            </Button>
            <Button variant="ghost" className="flex-1" onClick={closeModal}>
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Heroes Modal - Full-screen on mobile */}
      <Modal
        open={modalState.isOpen && modalState.modalId === 'heroes'}
        onOpenChange={(open) => !open && closeModal()}
        fullScreenOnMobile
        title="Chọn tướng"
        description="Chọn tướng để bắt đầu trận chiến"
      >
        <div className="space-y-3">
          {heroes.map((hero) => (
            <button
              key={hero.id}
              onClick={() => {
                setSelectedHero(hero.id);
                closeModal();
                setActiveView('game');
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedHero === hero.id
                  ? 'border-vietnam-500 bg-vietnam-50'
                  : 'border-gray-200 hover:border-vietnam-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🦸</div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{hero.name}</div>
                  <div className="text-sm text-gray-600">
                    {hero.faction === 'vietnamese' ? 'Việt Nam' : 'Mông Cổ'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Help Modal - Regular modal */}
      <Modal
        open={modalState.isOpen && modalState.modalId === 'help'}
        onOpenChange={(open) => !open && closeModal()}
        title="Trợ giúp"
        description="Hướng dẫn sử dụng"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Điều hướng:</strong> Sử dụng menu hamburger hoặc thanh điều hướng dưới cùng
          </p>
          <p>
            <strong>Chiến đấu:</strong> Chọn tướng và đơn vị để bắt đầu trận chiến
          </p>
          <p>
            <strong>Tài nguyên:</strong> Thu thập thức ăn, vàng và quân đội để phát triển
          </p>
          <Button variant="primary" className="w-full mt-4" onClick={closeModal}>
            Đã hiểu
          </Button>
        </div>
      </Modal>
    </MobileMenuSystem>
  );
}
