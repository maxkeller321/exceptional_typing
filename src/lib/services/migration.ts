/**
 * One-time migration from localStorage to SQLite (via Tauri).
 *
 * On first Tauri launch, gathers all user data from localStorage keys,
 * packages it into a MigrationPayload, and sends to the Rust backend
 * which inserts everything in a single SQLite transaction.
 *
 * localStorage data is preserved as a safety net (not deleted).
 * A flag key prevents re-running the migration.
 */

import type { MigrationPayload } from './storage';
import type { UserProfile, DailyTestResult } from '../types';
import { getStorage } from './index';

const MIGRATION_FLAG = 'exceptional-typing-migrated';

/**
 * Run the one-time migration if needed.
 * Call this after initStorageService() and only when running inside Tauri.
 */
export async function migrateIfNeeded(): Promise<void> {
  // Already migrated in a previous session
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  const storage = getStorage();

  // Ask the backend if it needs data
  const needed = await storage.isMigrationNeeded();
  if (!needed) {
    // Backend already has data — mark as done
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
    return;
  }

  // Check if there's any localStorage data to migrate
  const users = getJsonFromLocalStorage<UserProfile[]>('exceptional-typing-users');
  if (!users || users.length === 0) {
    // No localStorage data to migrate — mark as done
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
    return;
  }

  // Gather all data
  const payload = gatherMigrationPayload(users);

  // Send to Rust backend (single transaction)
  await storage.migrateFromLocalStorage(payload);

  // Mark migration complete (keep localStorage data as backup)
  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
}

function gatherMigrationPayload(users: UserProfile[]): MigrationPayload {
  const settings: Record<string, string | null> = {};
  const stats: Record<string, string | null> = {};
  const progress: Record<string, string | null> = {};
  const courses: Record<string, string | null> = {};
  const snippets: Record<string, string | null> = {};
  const activity: Record<string, string | null> = {};

  for (const user of users) {
    const id = String(user.id);
    settings[id] = localStorage.getItem(`exceptional-typing-settings-${user.id}`);
    stats[id] = localStorage.getItem(`exceptional-typing-stats-${user.id}`);
    progress[id] = localStorage.getItem(`exceptional-typing-progress-${user.id}`);
    snippets[id] = localStorage.getItem(`exceptional-typing-snippets-${user.id}`);
    activity[id] = localStorage.getItem(`exceptional-typing-activity-${user.id}`);

    // Try new multi-course format first, then legacy
    const coursesData = localStorage.getItem(`exceptional-typing-all-courses-${user.id}`);
    if (coursesData) {
      courses[id] = coursesData;
    } else {
      // Legacy single-course format: wrap in array-of-entries format
      const legacy = localStorage.getItem(`exceptional-typing-course-${user.id}`);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (parsed && parsed.courseId) {
            courses[id] = JSON.stringify([[parsed.courseId, parsed]]);
          }
        } catch {
          // ignore malformed data
        }
      }
    }
  }

  // Daily results are global (not per-user keyed)
  const dailyResultsRaw = localStorage.getItem('exceptional-typing-daily-results');
  let dailyResults: DailyTestResult[] = [];
  if (dailyResultsRaw) {
    try {
      dailyResults = JSON.parse(dailyResultsRaw);
    } catch {
      // ignore
    }
  }

  return {
    users,
    settings,
    stats,
    progress,
    courses,
    snippets,
    activity,
    dailyResults,
  };
}

function getJsonFromLocalStorage<T>(key: string): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}
