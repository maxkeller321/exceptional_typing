import { writable, derived, get } from 'svelte/store';
import type { AppView, Lesson, UserStats, LessonProgress, TaskResult } from '../types';
import { currentUser } from './user';
import { activityStore } from './activity';

// Current view state
export const currentView = writable<AppView>('home');
export const selectedLesson = writable<Lesson | null>(null);
export const currentTaskIndex = writable<number>(0);

// User statistics
const defaultStats: UserStats = {
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

export const userStats = writable<UserStats>(defaultStats);

// Lesson progress tracking
export const lessonProgress = writable<Map<string, LessonProgress>>(new Map());

// Track current user ID for persistence
let currentUserId: number | null = null;

// Subscribe to user changes to load/save data
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadUserStats(user.id);
    loadLessonProgress(user.id);
  } else {
    currentUserId = null;
    userStats.set({ ...defaultStats, problemKeys: new Map() });
    lessonProgress.set(new Map());
  }
});

// Load user stats from localStorage
function loadUserStats(userId: number): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(`exceptional-typing-stats-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Restore Map from array
      parsed.problemKeys = new Map(parsed.problemKeys || []);
      userStats.set(parsed);
    } catch {
      userStats.set({ ...defaultStats, problemKeys: new Map() });
    }
  } else {
    userStats.set({ ...defaultStats, problemKeys: new Map() });
  }
}

// Save user stats to localStorage
function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  // Convert Map to array for JSON serialization
  const toSave = {
    ...stats,
    problemKeys: Array.from(stats.problemKeys.entries()),
  };
  localStorage.setItem(
    `exceptional-typing-stats-${currentUserId}`,
    JSON.stringify(toSave)
  );
}

// Load lesson progress from localStorage
function loadLessonProgress(userId: number): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(`exceptional-typing-progress-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert array back to Map
      lessonProgress.set(new Map(parsed));
    } catch {
      lessonProgress.set(new Map());
    }
  } else {
    lessonProgress.set(new Map());
  }
}

// Save lesson progress to localStorage
function saveLessonProgress(progress: Map<string, LessonProgress>): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  // Convert Map to array for JSON serialization
  localStorage.setItem(
    `exceptional-typing-progress-${currentUserId}`,
    JSON.stringify(Array.from(progress.entries()))
  );
}

// Navigation functions
export function navigateTo(view: AppView): void {
  currentView.set(view);
}

export function selectLesson(lesson: Lesson): void {
  selectedLesson.set(lesson);
  currentTaskIndex.set(0);
  currentView.set('lesson');
}

export function nextTask(): boolean {
  const lesson = get(selectedLesson);
  if (!lesson) return false;

  const currentIndex = get(currentTaskIndex);
  if (currentIndex < lesson.tasks.length - 1) {
    currentTaskIndex.set(currentIndex + 1);
    return true;
  }
  return false;
}

export function previousTask(): boolean {
  let hasPrev = false;

  currentTaskIndex.update(index => {
    if (index > 0) {
      hasPrev = true;
      return index - 1;
    }
    return index;
  });

  return hasPrev;
}

// Record task completion
export function recordTaskResult(result: TaskResult): void {
  selectedLesson.subscribe(lesson => {
    if (!lesson) return;

    lessonProgress.update(progress => {
      const current = progress.get(lesson.id) || {
        lessonId: lesson.id,
        completedTasks: 0,
        totalTasks: lesson.tasks.length,
        taskResults: [],
        bestWpm: 0,
        averageAccuracy: 0,
      };

      current.taskResults.push(result);
      current.completedTasks = new Set(
        current.taskResults.filter(r => r.passed).map(r => r.taskId)
      ).size;
      current.bestWpm = Math.max(current.bestWpm, result.wpm);
      current.averageAccuracy =
        current.taskResults.reduce((sum, r) => sum + r.accuracy, 0) /
        current.taskResults.length;

      progress.set(lesson.id, current);

      // Persist lesson progress
      saveLessonProgress(progress);

      return progress;
    });

    // Update user stats
    userStats.update(stats => {
      const wordCount = Math.floor(result.duration / 60000 * result.wpm);

      // Update problem keys
      result.errors.forEach(error => {
        const count = stats.problemKeys.get(error.expected) || 0;
        stats.problemKeys.set(error.expected, count + 1);
      });

      const totalSessions = stats.totalWordsTyped > 0
        ? stats.totalPracticeTime / 60000 / (stats.totalWordsTyped / stats.averageWpm || 1)
        : 0;

      // Calculate new true accuracy stats
      const newTotalKeystrokes = stats.totalKeystrokes + (result.totalKeystrokes ?? 0);
      const newTotalBackspaces = stats.totalBackspaces + (result.backspaceCount ?? 0);
      // Correct keystrokes = total keystrokes for this result minus backspaces and errors
      const resultCorrectKeystrokes = (result.totalKeystrokes ?? 0) - (result.backspaceCount ?? 0) - result.errors.length;
      const newTotalCorrectKeystrokes = stats.totalCorrectKeystrokes + Math.max(0, resultCorrectKeystrokes);

      // Calculate new average true accuracy
      const newAverageTrueAccuracy = totalSessions > 0
        ? (stats.averageTrueAccuracy * totalSessions + (result.trueAccuracy ?? result.accuracy)) / (totalSessions + 1)
        : (result.trueAccuracy ?? result.accuracy);

      const newStats = {
        ...stats,
        totalPracticeTime: stats.totalPracticeTime + result.duration,
        totalWordsTyped: stats.totalWordsTyped + wordCount,
        averageWpm: totalSessions > 0
          ? (stats.averageWpm * totalSessions + result.wpm) / (totalSessions + 1)
          : result.wpm,
        averageAccuracy: totalSessions > 0
          ? (stats.averageAccuracy * totalSessions + result.accuracy) / (totalSessions + 1)
          : result.accuracy,
        averageTrueAccuracy: newAverageTrueAccuracy,
        totalKeystrokes: newTotalKeystrokes,
        totalBackspaces: newTotalBackspaces,
        totalCorrectKeystrokes: newTotalCorrectKeystrokes,
      };

      // Persist user stats
      saveUserStats(newStats);

      return newStats;
    });

    // Record activity for heatmap
    const charCount = result.targetText?.length || 0;
    activityStore.recordSession(result.duration, charCount);
  })();
}

// Derived store for current task
export const currentTask = derived(
  [selectedLesson, currentTaskIndex],
  ([$lesson, $index]) => {
    if (!$lesson || $index >= $lesson.tasks.length) return null;
    return $lesson.tasks[$index];
  }
);

// Derived store for lesson completion status
export const isLessonComplete = derived(
  [selectedLesson, lessonProgress],
  ([$lesson, $progress]) => {
    if (!$lesson) return false;
    const progress = $progress.get($lesson.id);
    return progress?.completedTasks === $lesson.tasks.length;
  }
);
