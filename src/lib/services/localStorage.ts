/**
 * LocalStorageService — implements StorageService using browser localStorage.
 *
 * This extracts the existing persistence logic from each Svelte store into a
 * unified service. It's the fallback when Tauri is not available (npm run dev).
 */

import type { StorageService, MigrationPayload } from './storage';
import type {
  UserProfile,
  AvatarType,
  UserSettings,
  UserStats,
  LessonProgress,
  CourseProgress,
  CustomSnippet,
  DailyTestResult,
} from '../types';
import type { DailyActivity } from '../types';
import { DEFAULT_SETTINGS } from '../defaults';

const KEYS = {
  users: 'exceptional-typing-users',
  settings: (id: number) => `exceptional-typing-settings-${id}`,
  stats: (id: number) => `exceptional-typing-stats-${id}`,
  progress: (id: number) => `exceptional-typing-progress-${id}`,
  courses: (id: number) => `exceptional-typing-all-courses-${id}`,
  courseLegacy: (id: number) => `exceptional-typing-course-${id}`,
  snippets: (id: number) => `exceptional-typing-snippets-${id}`,
  dailyResults: 'exceptional-typing-daily-results',
  activity: (id: number) => `exceptional-typing-activity-${id}`,
};

function getJson<T>(key: string): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalStorageService implements StorageService {
  // === Users ===

  async getAllUsers(): Promise<UserProfile[]> {
    return getJson<UserProfile[]>(KEYS.users) ?? [];
  }

  async createUser(name: string, avatar: AvatarType): Promise<UserProfile> {
    const user: UserProfile = {
      id: Date.now(),
      name: name.trim(),
      avatar,
      createdAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    const users = await this.getAllUsers();
    users.push(user);
    setJson(KEYS.users, users);
    return user;
  }

  async updateUser(userId: number, updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'lastActiveAt'>>): Promise<void> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name.trim();
      if (updates.avatar !== undefined) user.avatar = updates.avatar;
      if (updates.lastActiveAt !== undefined) user.lastActiveAt = updates.lastActiveAt;
      setJson(KEYS.users, users);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const users = await this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    setJson(KEYS.users, filtered);

    // Clean up all per-user data
    localStorage.removeItem(KEYS.settings(userId));
    localStorage.removeItem(KEYS.stats(userId));
    localStorage.removeItem(KEYS.progress(userId));
    localStorage.removeItem(KEYS.courses(userId));
    localStorage.removeItem(KEYS.courseLegacy(userId));
    localStorage.removeItem(KEYS.snippets(userId));
    localStorage.removeItem(KEYS.activity(userId));
  }

  // === Settings ===

  async getSettings(userId: number): Promise<UserSettings | null> {
    const stored = getJson<Partial<UserSettings>>(KEYS.settings(userId));
    if (!stored) return null;
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(userId: number, settings: UserSettings): Promise<void> {
    setJson(KEYS.settings(userId), settings);
  }

  // === User Stats ===

  async getUserStats(userId: number): Promise<UserStats> {
    const stored = getJson<Record<string, unknown>>(KEYS.stats(userId));
    if (!stored) {
      return {
        totalPracticeTime: 0,
        totalWordsTyped: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        averageTrueAccuracy: 0,
        totalKeystrokes: 0,
        totalBackspaces: 0,
        totalCorrectKeystrokes: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        problemKeys: new Map(),
      };
    }
    // Restore Map from array
    const problemKeys = stored.problemKeys;
    return {
      ...stored,
      problemKeys: new Map(Array.isArray(problemKeys) ? problemKeys as [string, number][] : []),
    } as UserStats;
  }

  async saveUserStats(userId: number, stats: UserStats): Promise<void> {
    const toSave = {
      ...stats,
      problemKeys: Array.from(stats.problemKeys.entries()),
    };
    setJson(KEYS.stats(userId), toSave);
  }

  // === Lesson Progress ===

  async getAllLessonProgress(userId: number): Promise<Map<string, LessonProgress>> {
    const stored = getJson<[string, LessonProgress][]>(KEYS.progress(userId));
    if (!stored) return new Map();
    return new Map(stored);
  }

  async saveLessonProgress(userId: number, progress: Map<string, LessonProgress>): Promise<void> {
    setJson(KEYS.progress(userId), Array.from(progress.entries()));
  }

  // === Course Progress ===

  async getAllCourseProgress(userId: number): Promise<Map<string, CourseProgress>> {
    const stored = getJson<[string, CourseProgress][]>(KEYS.courses(userId));
    if (stored) return new Map(stored);

    // Try legacy single-course format
    const legacy = getJson<CourseProgress>(KEYS.courseLegacy(userId));
    if (legacy) {
      const map = new Map<string, CourseProgress>();
      map.set(legacy.courseId, legacy);
      // Migrate to new format
      setJson(KEYS.courses(userId), Array.from(map.entries()));
      return map;
    }

    return new Map();
  }

  async saveCourseProgress(userId: number, progress: Map<string, CourseProgress>): Promise<void> {
    setJson(KEYS.courses(userId), Array.from(progress.entries()));
  }

  async deleteCourseProgress(userId: number, courseId: string): Promise<void> {
    const progress = await this.getAllCourseProgress(userId);
    progress.delete(courseId);
    await this.saveCourseProgress(userId, progress);
  }

  async deleteAllCourseProgress(userId: number): Promise<void> {
    localStorage.removeItem(KEYS.courses(userId));
  }

  // === Custom Snippets ===

  async getSnippets(userId: number): Promise<CustomSnippet[]> {
    return getJson<CustomSnippet[]>(KEYS.snippets(userId)) ?? [];
  }

  async saveSnippets(userId: number, snippets: CustomSnippet[]): Promise<void> {
    setJson(KEYS.snippets(userId), snippets);
  }

  // === Daily Test Results ===

  async getDailyResults(): Promise<DailyTestResult[]> {
    return getJson<DailyTestResult[]>(KEYS.dailyResults) ?? [];
  }

  async saveDailyResults(results: DailyTestResult[]): Promise<void> {
    setJson(KEYS.dailyResults, results);
  }

  // === Daily Activity ===

  async getActivity(userId: number): Promise<Map<string, DailyActivity>> {
    const stored = getJson<[string, DailyActivity][]>(KEYS.activity(userId));
    if (!stored) return new Map();
    return new Map(stored);
  }

  async saveActivity(userId: number, activity: Map<string, DailyActivity>): Promise<void> {
    setJson(KEYS.activity(userId), Array.from(activity.entries()));
  }

  async deleteActivity(userId: number): Promise<void> {
    localStorage.removeItem(KEYS.activity(userId));
  }

  // === Migration (no-op for localStorage) ===

  async isMigrationNeeded(): Promise<boolean> {
    return false;
  }

  async migrateFromLocalStorage(_payload: MigrationPayload): Promise<void> {
    // No-op — already in localStorage
  }
}
