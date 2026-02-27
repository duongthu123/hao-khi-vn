/**
 * UI state slice
 * Manages UI state including modals, notifications, and map view
 */

import { StateCreator } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  createdAt: number;
}

export interface MapView {
  zoom: number;
  position: { x: number; y: number };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  language: 'vi' | 'en';
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface UISlice {
  ui: {
    activeModal: string | null;
    notifications: Notification[];
    mapZoom: number;
    mapPosition: { x: number; y: number };
    settings: GameSettings;
    rankUpAnimation: {
      isVisible: boolean;
      newRank: string | null;
    };
  };
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Map view actions
  updateMapView: (view: Partial<MapView>) => void;
  setMapZoom: (zoom: number) => void;
  setMapPosition: (position: { x: number; y: number }) => void;
  resetMapView: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  toggleAutoSave: () => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Rank-up animation actions
  showRankUpAnimation: (newRank: string) => void;
  hideRankUpAnimation: () => void;
  
  // Selectors
  isModalOpen: (modalId: string) => boolean;
  getNotifications: () => Notification[];
}

const initialUIState = {
  activeModal: null,
  notifications: [],
  mapZoom: 1,
  mapPosition: { x: 0, y: 0 },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
    autoSaveEnabled: true,
    autoSaveInterval: 5 * 60 * 1000, // 5 minutes
    language: 'vi' as const,
    difficulty: 'normal' as const,
  },
  rankUpAnimation: {
    isVisible: false,
    newRank: null,
  },
};

const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 seconds

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  ui: initialUIState,
  
  // Modal actions
  openModal: (modalId) =>
    set((state) => ({
      ui: { ...state.ui, activeModal: modalId },
    })),
  
  closeModal: () =>
    set((state) => ({
      ui: { ...state.ui, activeModal: null },
    })),
  
  // Notification actions
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
      duration: notification.duration || DEFAULT_NOTIFICATION_DURATION,
    };
    
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [...state.ui.notifications, newNotification],
      },
    }));
    
    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (notificationId) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== notificationId),
      },
    })),
  
  clearNotifications: () =>
    set((state) => ({
      ui: { ...state.ui, notifications: [] },
    })),
  
  // Map view actions
  updateMapView: (view) =>
    set((state) => ({
      ui: {
        ...state.ui,
        ...(view.zoom !== undefined && { mapZoom: view.zoom }),
        ...(view.position !== undefined && { mapPosition: view.position }),
      },
    })),
  
  setMapZoom: (zoom) =>
    set((state) => ({
      ui: { ...state.ui, mapZoom: Math.max(0.5, Math.min(3, zoom)) },
    })),
  
  setMapPosition: (position) =>
    set((state) => ({
      ui: { ...state.ui, mapPosition: position },
    })),
  
  resetMapView: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        mapZoom: 1,
        mapPosition: { x: 0, y: 0 },
      },
    })),
  
  // Settings actions
  updateSettings: (settings) =>
    set((state) => ({
      ui: {
        ...state.ui,
        settings: { ...state.ui.settings, ...settings },
      },
    })),
  
  toggleAutoSave: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        settings: {
          ...state.ui.settings,
          autoSaveEnabled: !state.ui.settings.autoSaveEnabled,
        },
      },
    })),
  
  setAutoSaveInterval: (interval) =>
    set((state) => ({
      ui: {
        ...state.ui,
        settings: {
          ...state.ui.settings,
          autoSaveInterval: Math.max(60 * 1000, interval), // Minimum 1 minute
        },
      },
    })),
  
  // Rank-up animation actions
  showRankUpAnimation: (newRank) =>
    set((state) => ({
      ui: {
        ...state.ui,
        rankUpAnimation: {
          isVisible: true,
          newRank,
        },
      },
    })),
  
  hideRankUpAnimation: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        rankUpAnimation: {
          isVisible: false,
          newRank: null,
        },
      },
    })),
  
  // Selectors
  isModalOpen: (modalId) => {
    const state = get();
    return state.ui.activeModal === modalId;
  },
  
  getNotifications: () => {
    const state = get();
    return state.ui.notifications;
  },
});
