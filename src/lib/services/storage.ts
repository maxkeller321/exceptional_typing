/**
 * StorageService interface — abstracts persistence backend.
 *
 * Two implementations:
 * - LocalStorageService: wraps browser localStorage (fallback for `npm run dev`)
 * - TauriStorageService: calls Rust/SQLite via Tauri invoke() (primary in Tauri app)
 *
 * All methods return Promises so the interface works with both sync (localStorage)
 * and async (Tauri IPC) backends.
 */

import type {
  UserProfile,
  AvatarType,
  UserSettings,
  UserStats,
  LessonProgress,
  TaskResult,
  CourseProgress,
  CustomSnippet,
  DailyTestResult,
} from '../types';
import type { DailyActivity } from '../types';

export interface StorageService {
  // === Users ===
  getAllUsers(): Promise<UserProfile[]>;
  createUser(name: string, avatar: AvatarType): Promise<UserProfile>;
  updateUser(userId: number, updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'lastActiveAt'>>): Promise<void>;
  deleteUser(userId: number): Promise<void>;

  // === Settings ===
  getSettings(userId: number): Promise<UserSettings | null>;
  saveSettings(userId: number, settings: UserSettings): Promise<void>;

  // === User Stats ===
  getUserStats(userId: number): Promise<UserStats>;
  saveUserStats(userId: number, stats: UserStats): Promise<void>;

  // === Lesson Progress ===
  getAllLessonProgress(userId: number): Promise<Map<string, LessonProgress>>;
  saveLessonProgress(userId: number, progress: Map<string, LessonProgress>): Promise<void>;

  // === Course Progress ===
  getAllCourseProgress(userId: number): Promise<Map<string, CourseProgress>>;
  saveCourseProgress(userId: number, progress: Map<string, CourseProgress>): Promise<void>;
  deleteCourseProgress(userId: number, courseId: string): Promise<void>;
  deleteAllCourseProgress(userId: number): Promise<void>;

  // === Custom Snippets ===
  getSnippets(userId: number): Promise<CustomSnippet[]>;
  saveSnippets(userId: number, snippets: CustomSnippet[]): Promise<void>;

  // === Daily Test Results ===
  getDailyResults(): Promise<DailyTestResult[]>;
  saveDailyResults(results: DailyTestResult[]): Promise<void>;

  // === Daily Activity ===
  getActivity(userId: number): Promise<Map<string, DailyActivity>>;
  saveActivity(userId: number, activity: Map<string, DailyActivity>): Promise<void>;
  deleteActivity(userId: number): Promise<void>;

  // === Migration ===
  isMigrationNeeded(): Promise<boolean>;
  migrateFromLocalStorage(payload: MigrationPayload): Promise<void>;
}

/** Payload for one-time localStorage → SQLite migration */
export interface MigrationPayload {
  users: UserProfile[];
  settings: Record<string, string | null>;     // userId → JSON string
  stats: Record<string, string | null>;         // userId → JSON string
  progress: Record<string, string | null>;      // userId → JSON string
  courses: Record<string, string | null>;       // userId → JSON string
  snippets: Record<string, string | null>;      // userId → JSON string
  activity: Record<string, string | null>;      // userId → JSON string
  dailyResults: DailyTestResult[];
}
