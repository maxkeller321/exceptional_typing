/**
 * TauriStorageService — implements StorageService using Tauri invoke() → Rust → SQLite.
 *
 * Each method maps to a corresponding Tauri command defined in main.rs.
 * Handles type conversions between Rust row types and TypeScript domain types:
 * - problemKeys: Vec<(String, i64)> ↔ Map<string, number>
 * - taskResultsJson: String ↔ TaskResult[]
 * - completedStagesJson/skippedStagesJson: String ↔ string[]
 * - Vec<DailyActivityRow> ↔ Map<string, DailyActivity>
 */

import { invoke } from '@tauri-apps/api/core';
import type { StorageService, MigrationPayload } from './storage';
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
  DailyActivity,
} from '../types';
import { DEFAULT_SETTINGS } from '../defaults';

// ── Rust row types (matching models.rs with camelCase) ───────────────

interface UserStatsRow {
  totalPracticeTime: number;
  totalWordsTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  averageTrueAccuracy: number;
  totalKeystrokes: number;
  totalBackspaces: number;
  totalCorrectKeystrokes: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  problemKeys: [string, number][];
}

interface LessonProgressRow {
  lessonId: string;
  completedTasks: number;
  totalTasks: number;
  bestWpm: number;
  averageAccuracy: number;
  lastTaskIndex: number | null;
  taskResultsJson: string;
}

interface CourseProgressRow {
  courseId: string;
  currentStageId: string | null;
  completedStagesJson: string;
  skippedStagesJson: string;
  enrolledAt: string;
  completedAt: string | null;
}

interface CustomSnippetRow {
  id: string;
  userId: number;
  name: string;
  content: string;
  language: string | null;
  mode: string;
  createdAt: string;
  practiceCount: number;
  bestWpm: number | null;
  bestAccuracy: number | null;
}

interface DailyActivityRow {
  date: string;
  practiceTime: number;
  characters: number;
  sessions: number;
}

// ── Conversions ──────────────────────────────────────────────────────

function statsRowToUserStats(row: UserStatsRow): UserStats {
  return {
    totalPracticeTime: row.totalPracticeTime,
    totalWordsTyped: row.totalWordsTyped,
    averageWpm: row.averageWpm,
    averageAccuracy: row.averageAccuracy,
    averageTrueAccuracy: row.averageTrueAccuracy,
    totalKeystrokes: row.totalKeystrokes,
    totalBackspaces: row.totalBackspaces,
    totalCorrectKeystrokes: row.totalCorrectKeystrokes,
    lessonsCompleted: row.lessonsCompleted,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastPracticeDate: row.lastPracticeDate,
    problemKeys: new Map(row.problemKeys),
  };
}

function userStatsToRow(stats: UserStats): UserStatsRow {
  return {
    totalPracticeTime: stats.totalPracticeTime,
    totalWordsTyped: stats.totalWordsTyped,
    averageWpm: stats.averageWpm,
    averageAccuracy: stats.averageAccuracy,
    averageTrueAccuracy: stats.averageTrueAccuracy,
    totalKeystrokes: stats.totalKeystrokes,
    totalBackspaces: stats.totalBackspaces,
    totalCorrectKeystrokes: stats.totalCorrectKeystrokes,
    lessonsCompleted: stats.lessonsCompleted,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastPracticeDate: stats.lastPracticeDate,
    problemKeys: Array.from(stats.problemKeys.entries()),
  };
}

function progressRowToLessonProgress(row: LessonProgressRow): LessonProgress {
  let taskResults: TaskResult[] = [];
  try {
    taskResults = JSON.parse(row.taskResultsJson);
  } catch {
    // ignore malformed JSON
  }
  return {
    lessonId: row.lessonId,
    completedTasks: row.completedTasks,
    totalTasks: row.totalTasks,
    bestWpm: row.bestWpm,
    averageAccuracy: row.averageAccuracy,
    lastTaskIndex: row.lastTaskIndex ?? undefined,
    taskResults,
  };
}

function lessonProgressToRow(p: LessonProgress): LessonProgressRow {
  return {
    lessonId: p.lessonId,
    completedTasks: p.completedTasks,
    totalTasks: p.totalTasks,
    bestWpm: p.bestWpm,
    averageAccuracy: p.averageAccuracy,
    lastTaskIndex: p.lastTaskIndex ?? null,
    taskResultsJson: JSON.stringify(p.taskResults),
  };
}

function courseRowToProgress(row: CourseProgressRow): CourseProgress {
  let completedStages: string[] = [];
  let skippedStages: string[] = [];
  try { completedStages = JSON.parse(row.completedStagesJson); } catch { /* ignore */ }
  try { skippedStages = JSON.parse(row.skippedStagesJson); } catch { /* ignore */ }
  return {
    courseId: row.courseId,
    currentStageId: row.currentStageId,
    completedStages,
    skippedStages,
    enrolledAt: row.enrolledAt,
    completedAt: row.completedAt,
  };
}

function courseProgressToRow(p: CourseProgress): CourseProgressRow {
  return {
    courseId: p.courseId,
    currentStageId: p.currentStageId,
    completedStagesJson: JSON.stringify(p.completedStages),
    skippedStagesJson: JSON.stringify(p.skippedStages),
    enrolledAt: p.enrolledAt,
    completedAt: p.completedAt,
  };
}

function snippetRowToSnippet(row: CustomSnippetRow): CustomSnippet {
  return row as unknown as CustomSnippet;
}

function snippetToRow(s: CustomSnippet): CustomSnippetRow {
  return s as unknown as CustomSnippetRow;
}

// ── Service ──────────────────────────────────────────────────────────

export class TauriStorageService implements StorageService {
  // === Users ===

  async getAllUsers(): Promise<UserProfile[]> {
    return invoke<UserProfile[]>('get_all_users');
  }

  async createUser(name: string, avatar: AvatarType): Promise<UserProfile> {
    const id = Date.now();
    const createdAt = new Date().toISOString();
    await invoke('create_user', { id, name: name.trim(), avatar, createdAt });
    return { id, name: name.trim(), avatar, createdAt, lastActiveAt: null };
  }

  async updateUser(
    userId: number,
    updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'lastActiveAt'>>,
  ): Promise<void> {
    await invoke('update_user', {
      userId,
      name: updates.name ?? null,
      avatar: updates.avatar ?? null,
      lastActiveAt: updates.lastActiveAt ?? null,
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await invoke('delete_user', { userId });
  }

  // === Settings ===

  async getSettings(userId: number): Promise<UserSettings | null> {
    const json = await invoke<string | null>('get_settings', { userId });
    if (!json) return null;
    try {
      const stored = JSON.parse(json) as Partial<UserSettings>;
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch {
      return null;
    }
  }

  async saveSettings(userId: number, settings: UserSettings): Promise<void> {
    await invoke('save_settings', { userId, settingsJson: JSON.stringify(settings) });
  }

  // === User Stats ===

  async getUserStats(userId: number): Promise<UserStats> {
    const row = await invoke<UserStatsRow | null>('get_user_stats', { userId });
    if (!row) {
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
    return statsRowToUserStats(row);
  }

  async saveUserStats(userId: number, stats: UserStats): Promise<void> {
    await invoke('save_user_stats', { userId, stats: userStatsToRow(stats) });
  }

  // === Lesson Progress ===

  async getAllLessonProgress(userId: number): Promise<Map<string, LessonProgress>> {
    const rows = await invoke<LessonProgressRow[]>('get_all_lesson_progress', { userId });
    const map = new Map<string, LessonProgress>();
    for (const row of rows) {
      map.set(row.lessonId, progressRowToLessonProgress(row));
    }
    return map;
  }

  async saveLessonProgress(userId: number, progress: Map<string, LessonProgress>): Promise<void> {
    const rows = Array.from(progress.values()).map(lessonProgressToRow);
    await invoke('save_lesson_progress', { userId, progress: rows });
  }

  // === Course Progress ===

  async getAllCourseProgress(userId: number): Promise<Map<string, CourseProgress>> {
    const rows = await invoke<CourseProgressRow[]>('get_all_course_progress', { userId });
    const map = new Map<string, CourseProgress>();
    for (const row of rows) {
      map.set(row.courseId, courseRowToProgress(row));
    }
    return map;
  }

  async saveCourseProgress(userId: number, progress: Map<string, CourseProgress>): Promise<void> {
    const rows = Array.from(progress.values()).map(courseProgressToRow);
    await invoke('save_course_progress', { userId, progress: rows });
  }

  async deleteCourseProgress(userId: number, courseId: string): Promise<void> {
    await invoke('delete_course_progress', { userId, courseId });
  }

  async deleteAllCourseProgress(userId: number): Promise<void> {
    await invoke('delete_all_course_progress', { userId });
  }

  // === Custom Snippets ===

  async getSnippets(userId: number): Promise<CustomSnippet[]> {
    const rows = await invoke<CustomSnippetRow[]>('get_snippets', { userId });
    return rows.map(snippetRowToSnippet);
  }

  async saveSnippets(userId: number, snippets: CustomSnippet[]): Promise<void> {
    await invoke('save_snippets', { userId, snippets: snippets.map(snippetToRow) });
  }

  // === Daily Test Results ===

  async getDailyResults(): Promise<DailyTestResult[]> {
    return invoke<DailyTestResult[]>('get_daily_results');
  }

  async saveDailyResults(results: DailyTestResult[]): Promise<void> {
    await invoke('save_daily_results', { results });
  }

  // === Daily Activity ===

  async getActivity(userId: number): Promise<Map<string, DailyActivity>> {
    const rows = await invoke<DailyActivityRow[]>('get_activity', { userId });
    const map = new Map<string, DailyActivity>();
    for (const row of rows) {
      map.set(row.date, row);
    }
    return map;
  }

  async saveActivity(userId: number, activity: Map<string, DailyActivity>): Promise<void> {
    const rows = Array.from(activity.values());
    await invoke('save_activity', { userId, activity: rows });
  }

  async deleteActivity(userId: number): Promise<void> {
    await invoke('delete_activity', { userId });
  }

  // === Migration ===

  async isMigrationNeeded(): Promise<boolean> {
    return invoke<boolean>('is_migration_needed');
  }

  async migrateFromLocalStorage(payload: MigrationPayload): Promise<void> {
    await invoke('migrate_from_localstorage', { payload });
  }
}
