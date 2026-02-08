/**
 * Storage service factory — returns the correct StorageService implementation
 * based on the runtime environment.
 *
 * - Tauri app (npm run tauri dev): uses TauriStorageService → SQLite
 * - Browser (npm run dev): uses LocalStorageService → localStorage
 */

import type { StorageService } from './storage';
import { LocalStorageService } from './localStorage';

let _instance: StorageService | null = null;

/**
 * Initialize the storage service. Must be called once before any store accesses storage.
 * Uses dynamic import for TauriStorageService to avoid bundling @tauri-apps/api in browser builds.
 */
export async function initStorageService(): Promise<StorageService> {
  if (_instance) return _instance;

  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    try {
      const { TauriStorageService } = await import('./tauriStorage');
      _instance = new TauriStorageService();
    } catch {
      // Fallback if Tauri import fails
      _instance = new LocalStorageService();
    }
  } else {
    _instance = new LocalStorageService();
  }

  return _instance;
}

/**
 * Get the initialized storage service.
 * Throws if called before initStorageService().
 */
export function getStorage(): StorageService {
  if (!_instance) {
    // Auto-fallback to localStorage if not initialized (e.g., in tests)
    _instance = new LocalStorageService();
  }
  return _instance;
}
