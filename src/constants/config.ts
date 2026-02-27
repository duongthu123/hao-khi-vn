/**
 * Application Configuration
 * 
 * Centralized configuration using environment variables.
 * All environment variables are validated and typed here.
 */

// ============================================
// Application Info
// ============================================

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Đại Chiến Sử Việt - Hào Khí Đông A',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  environment: process.env.NODE_ENV || 'development',
} as const;

// ============================================
// Game Configuration
// ============================================

export const GAME_CONFIG = {
  // Auto-save interval in milliseconds (default: 5 minutes)
  autoSaveInterval: parseInt(process.env.NEXT_PUBLIC_AUTOSAVE_INTERVAL || '300000', 10),
  
  // Maximum number of save slots
  maxSaveSlots: parseInt(process.env.NEXT_PUBLIC_MAX_SAVE_SLOTS || '5', 10),
  
  // Debug mode
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  
  // Performance monitoring
  enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // Target FPS
  targetFPS: 60,
  
  // Game loop update interval (milliseconds)
  gameLoopInterval: 1000 / 60, // 60 FPS
} as const;

// ============================================
// Map Configuration
// ============================================

export const MAP_CONFIG = {
  // Map dimensions (from original game)
  width: 3000,
  height: 2000,
  
  // Initial camera settings
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 2,
  
  // Pan settings
  panSpeed: 1,
  smoothPanning: true,
  
  // Zoom settings
  zoomSpeed: 0.1,
  smoothZooming: true,
} as const;

// ============================================
// Resource Configuration
// ============================================

export const RESOURCE_CONFIG = {
  // Initial resources (from original game)
  initial: {
    food: 0,
    gold: 500,
    army: 0,
  },
  
  // Default resource caps
  defaultCaps: {
    food: 1000,
    gold: 2000,
    army: 100,
  },
  
  // Base generation rates (per second)
  baseGeneration: {
    foodPerSecond: 1,
    goldPerSecond: 0.5,
    armyPerSecond: 0,
  },
  
  // Resource generation multipliers per building level
  buildingBonus: {
    farm: 0.5, // +50% food generation per farm level
    mine: 0.3, // +30% gold generation per mine level
    barracks: 0.2, // +20% army generation per barracks level
  },
  
  // Trade rates
  trade: {
    riceToGoldRate: 50, // Base rate: 100 food = 50 gold
    riceToGoldAmount: 100, // Amount of food per trade
  },
} as const;

// ============================================
// Combat Configuration
// ============================================

export const COMBAT_CONFIG = {
  // Combat formulas
  formulas: {
    // Base damage calculation: attacker.attack - defender.defense
    baseDamageMin: 0, // Minimum damage even if defense is higher
    
    // Random damage variance (0.9 to 1.1 = ±10%)
    randomFactorMin: 0.9,
    randomFactorMax: 1.1,
  },
  
  // Direction-based damage modifiers
  directionModifiers: {
    front: 1.0,   // Normal damage from front
    side: 1.5,    // +50% damage from side
    rear: 2.0,    // +100% damage from rear
  },
  
  // Unit type advantages (attacker vs defender)
  typeAdvantages: {
    // Cavalry is strong against archers
    cavalry_vs_archer: 1.5,
    // Infantry is strong against cavalry
    infantry_vs_cavalry: 1.3,
    // Archers are strong against infantry
    archer_vs_infantry: 1.2,
    // Default (no advantage)
    default: 1.0,
  },
  
  // Combat mechanics
  attackRange: 5, // Distance units can attack from
  attackChance: 0.05, // 5% chance to attack per frame
  
  // Weapon durability
  weaponDurability: {
    initial: 100,
    max: 100,
    lossPerHit: 1,
  },
  
  // Player vs Enemy HP
  playerHP: {
    initial: 1000,
    max: 1000,
  },
  
  enemyHP: {
    initial: 2000,
    max: 2000,
  },
  
  // Fortress configuration
  fortress: {
    maxHP: 1200,
    regenRange: 15, // % map distance for general regen
  },
} as const;

// ============================================
// Difficulty Configuration
// ============================================

export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'Dễ',
    aiReactionTime: 2000, // ms delay before AI reacts
    aiAccuracy: 0.6, // 60% accuracy
    enemyHealthMultiplier: 0.7, // 70% health
    enemyDamageMultiplier: 0.7, // 70% damage
    resourceGenerationMultiplier: 1.5, // 150% resource generation
    aiSpawnRate: 0.5, // 50% spawn rate
  },
  
  normal: {
    name: 'Bình Thường',
    aiReactionTime: 1000, // ms delay before AI reacts
    aiAccuracy: 0.8, // 80% accuracy
    enemyHealthMultiplier: 1.0, // 100% health
    enemyDamageMultiplier: 1.0, // 100% damage
    resourceGenerationMultiplier: 1.0, // 100% resource generation
    aiSpawnRate: 1.0, // 100% spawn rate
  },
  
  hard: {
    name: 'Khó',
    aiReactionTime: 500, // ms delay before AI reacts
    aiAccuracy: 0.95, // 95% accuracy
    enemyHealthMultiplier: 1.5, // 150% health
    enemyDamageMultiplier: 1.3, // 130% damage
    resourceGenerationMultiplier: 0.8, // 80% resource generation
    aiSpawnRate: 1.5, // 150% spawn rate
  },
} as const;

// ============================================
// Research Configuration
// ============================================

export const RESEARCH_CONFIG = {
  // Base costs for research
  baseCosts: {
    military: 500,
    weapon: 500,
    farming: 500,
  },
  
  // Bonus per level
  bonuses: {
    military: 0.2, // +20% per level
    weapon: 0.1,   // +10% per level
    farming: 0.5,  // +50% per level
  },
  
  // Cost multiplier per level
  costMultiplier: 1.0, // Cost = baseCost * (level + 1) * multiplier
} as const;

// ============================================
// Unit Configuration
// ============================================

export const UNIT_CONFIG = {
  // Unit costs (from original game)
  costs: {
    infantry: 150,
    archer: 300,
    cavalry: 500,
    peasant: 0,
  },
  
  // Unit stats
  stats: {
    infantry: { attack: 10, defense: 5, speed: 4 },
    archer: { attack: 15, defense: 2, speed: 3 },
    cavalry: { attack: 20, defense: 10, speed: 8 },
    peasant: { attack: 1, defense: 1, speed: 2 },
  },
  
  // AI unit behavior
  ai: {
    idleWanderChance: 0.02, // 2% chance to wander when idle
    wanderRange: 15, // Distance units can wander
    attackChance: 0.05, // 5% chance to attack per frame
  },
} as const;

// ============================================
// Animation Configuration
// ============================================

export const ANIMATION_CONFIG = {
  // Transition durations (milliseconds)
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easing functions
  easing: {
    default: 'ease-in-out',
    spring: 'spring(1, 100, 10, 0)',
  },
  
  // Notification settings
  notification: {
    duration: 3000, // 3 seconds
    maxVisible: 5,
  },
} as const;

// ============================================
// Cloud Storage Configuration
// ============================================

export const CLOUD_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SAVES === 'true',
  
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Firebase
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },
} as const;

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
  webSpeech: process.env.NEXT_PUBLIC_ENABLE_WEB_SPEECH === 'true',
  multiplayer: process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER === 'true',
  leaderboard: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD === 'true',
  cloudSaves: CLOUD_CONFIG.enabled,
} as const;

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
} as const;

// ============================================
// Development Tools
// ============================================

export const DEV_TOOLS = {
  reactQueryDevTools: process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
  zustandDevTools: process.env.NEXT_PUBLIC_ENABLE_ZUSTAND_DEVTOOLS === 'true',
} as const;

// ============================================
// Asset Configuration
// ============================================

export const ASSET_CONFIG = {
  cdnUrl: process.env.NEXT_PUBLIC_ASSET_CDN_URL || '',
  imageQuality: parseInt(process.env.NEXT_PUBLIC_IMAGE_QUALITY || '85', 10),
  
  // Asset paths
  paths: {
    images: '/hinh',
    videos: '/hinh',
    sounds: '/sounds',
    data: '/data',
  },
} as const;

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  saveSlotPrefix: 'game_save_slot_',
  autoSave: 'game_auto_save',
  settings: 'game_settings',
  profile: 'game_profile',
  collection: 'game_collection',
} as const;

// ============================================
// Analytics
// ============================================

export const ANALYTICS_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
} as const;

// ============================================
// Validation
// ============================================

/**
 * Validates that required environment variables are set
 * Throws an error if critical configuration is missing
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate cloud storage if enabled
  if (CLOUD_CONFIG.enabled) {
    if (!CLOUD_CONFIG.supabase.url && !CLOUD_CONFIG.firebase.apiKey) {
      errors.push('Cloud saves enabled but no storage provider configured');
    }
  }

  // Validate save slots
  if (GAME_CONFIG.maxSaveSlots < 1 || GAME_CONFIG.maxSaveSlots > 10) {
    errors.push('Max save slots must be between 1 and 10');
  }

  // Validate auto-save interval
  if (GAME_CONFIG.autoSaveInterval < 30000) {
    errors.push('Auto-save interval must be at least 30 seconds');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Gets the full URL for an asset
 */
export function getAssetUrl(path: string): string {
  if (ASSET_CONFIG.cdnUrl) {
    return `${ASSET_CONFIG.cdnUrl}${path}`;
  }
  return path;
}

/**
 * Checks if running in development mode
 */
export function isDevelopment(): boolean {
  return APP_CONFIG.environment === 'development';
}

/**
 * Checks if running in production mode
 */
export function isProduction(): boolean {
  return APP_CONFIG.environment === 'production';
}

/**
 * Checks if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}
