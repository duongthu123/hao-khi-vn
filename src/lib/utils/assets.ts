/**
 * Asset Management Utilities
 * 
 * Helper functions for loading and managing game assets
 * (images, videos, sounds, data files)
 */

import { ASSET_CONFIG } from '@/constants/config';

// ============================================
// Asset Path Helpers
// ============================================

/**
 * Gets the full path for an image asset
 */
export function getImagePath(filename: string): string {
  return `${ASSET_CONFIG.paths.images}/${filename}`;
}

/**
 * Gets the full path for a video asset
 */
export function getVideoPath(filename: string): string {
  return `${ASSET_CONFIG.paths.videos}/${filename}`;
}

/**
 * Gets the full path for a sound asset
 */
export function getSoundPath(filename: string): string {
  return `${ASSET_CONFIG.paths.sounds}/${filename}`;
}

/**
 * Gets the full path for a data file
 */
export function getDataPath(filename: string): string {
  return `${ASSET_CONFIG.paths.data}/${filename}`;
}

// ============================================
// Asset Preloading
// ============================================

/**
 * Preloads an image and returns a promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preloads multiple images
 */
export async function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(preloadImage));
}

/**
 * Preloads a video and returns a promise
 */
export function preloadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadeddata = () => resolve(video);
    video.onerror = reject;
    video.src = src;
    video.load();
  });
}

/**
 * Preloads multiple videos
 */
export async function preloadVideos(sources: string[]): Promise<HTMLVideoElement[]> {
  return Promise.all(sources.map(preloadVideo));
}

/**
 * Preloads an audio file
 */
export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = reject;
    audio.src = src;
    audio.load();
  });
}

/**
 * Preloads multiple audio files
 */
export async function preloadAudioFiles(sources: string[]): Promise<HTMLAudioElement[]> {
  return Promise.all(sources.map(preloadAudio));
}

// ============================================
// Asset Loading with Progress
// ============================================

export interface AssetLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

export type AssetLoadCallback = (progress: AssetLoadProgress) => void;

/**
 * Loads multiple assets with progress tracking
 */
export async function loadAssetsWithProgress(
  assets: { type: 'image' | 'video' | 'audio'; src: string }[],
  onProgress?: AssetLoadCallback
): Promise<(HTMLImageElement | HTMLVideoElement | HTMLAudioElement)[]> {
  const results: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement)[] = [];
  let loaded = 0;

  for (const asset of assets) {
    let loadPromise: Promise<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>;

    switch (asset.type) {
      case 'image':
        loadPromise = preloadImage(asset.src);
        break;
      case 'video':
        loadPromise = preloadVideo(asset.src);
        break;
      case 'audio':
        loadPromise = preloadAudio(asset.src);
        break;
    }

    const result = await loadPromise;
    results.push(result);
    loaded++;

    if (onProgress) {
      onProgress({
        loaded,
        total: assets.length,
        percentage: (loaded / assets.length) * 100,
        currentAsset: asset.src,
      });
    }
  }

  return results;
}

// ============================================
// Game Asset Definitions
// ============================================

/**
 * Core game assets that should be preloaded
 */
export const CORE_ASSETS = {
  images: [
    'anhnen.jpg',
    'anhnen2.jpg',
    'bandol.svg',
    'bobinh.png',
    'haucan.png',
    'kybinh.png',
    'omn.png',
    'thanhtri.png',
    'thd.png',
    'yet.jpg',
  ],
  videos: [
    'gen_bachdang_intro.mp4',
    'gen_bachdang_win.mp4',
    'gen_bachdang_lose.mp4',
    'gen_binhlenguyen_intro.mp4',
    'gen_binhlenguyen_win.mp4',
    'gen_binhlenguyen_lose.mp4',
    'gen_nhunguyet_intro.mp4',
    'gen_nhunguyet_win.mp4',
    'gen_tayket_intro.mp4',
    'gen_tayket_win.mp4',
    'gen_tayket_lose.mp4',
    'han.mp4',
    'song1.mp4',
    'song2.mp4',
    'v1.mp4',
    'v2.mp4',
    'v3.mp4',
  ],
} as const;

/**
 * Gets all core assets formatted for loading
 */
export function getCoreAssets(): { type: 'image' | 'video'; src: string }[] {
  const assets: { type: 'image' | 'video'; src: string }[] = [];

  // Add images
  for (const image of CORE_ASSETS.images) {
    assets.push({
      type: 'image',
      src: getImagePath(image),
    });
  }

  // Add videos
  for (const video of CORE_ASSETS.videos) {
    assets.push({
      type: 'video',
      src: getVideoPath(video),
    });
  }

  return assets;
}

// ============================================
// Asset Cache
// ============================================

/**
 * Simple in-memory asset cache
 */
class AssetCache {
  private cache = new Map<string, HTMLImageElement | HTMLVideoElement | HTMLAudioElement>();

  set(key: string, asset: HTMLImageElement | HTMLVideoElement | HTMLAudioElement): void {
    this.cache.set(key, asset);
  }

  get(key: string): HTMLImageElement | HTMLVideoElement | HTMLAudioElement | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const assetCache = new AssetCache();

/**
 * Loads an asset with caching
 */
export async function loadAssetCached(
  type: 'image' | 'video' | 'audio',
  src: string
): Promise<HTMLImageElement | HTMLVideoElement | HTMLAudioElement> {
  // Check cache first
  const cached = assetCache.get(src);
  if (cached) {
    return cached;
  }

  // Load asset
  let asset: HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
  switch (type) {
    case 'image':
      asset = await preloadImage(src);
      break;
    case 'video':
      asset = await preloadVideo(src);
      break;
    case 'audio':
      asset = await preloadAudio(src);
      break;
  }

  // Cache and return
  assetCache.set(src, asset);
  return asset;
}

// ============================================
// Data File Loading
// ============================================

/**
 * Loads a JSON data file
 */
export async function loadJsonData<T = unknown>(filename: string): Promise<T> {
  const response = await fetch(getDataPath(filename));
  if (!response.ok) {
    throw new Error(`Failed to load data file: ${filename}`);
  }
  return response.json();
}

/**
 * Loads a text data file
 */
export async function loadTextData(filename: string): Promise<string> {
  const response = await fetch(getDataPath(filename));
  if (!response.ok) {
    throw new Error(`Failed to load data file: ${filename}`);
  }
  return response.text();
}
