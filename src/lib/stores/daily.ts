import { writable, derived, get } from 'svelte/store';
import type { DailyTestResult } from '../types';
import { currentUser } from './user';
import { getStorage } from '../services';
import { getDateString, hasCompletedToday, getTodayResult, getStreak, getBestResult } from '../utils/dailyTest';

// Internal store for all daily results
const resultsInternal = writable<DailyTestResult[]>([]);

// Track current user ID
let currentUserId: number | null = null;

// Subscribe to user changes
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadResults();
  } else {
    currentUserId = null;
  }
});

// Load results from storage (global, not per-user, since we filter by userId)
function loadResults(): void {
  if (typeof window === 'undefined') return;

  getStorage().getDailyResults().then((results) => {
    resultsInternal.set(results);
  }).catch(() => {
    resultsInternal.set([]);
  });
}

// Save results via storage service (fire-and-forget)
function saveResults(results: DailyTestResult[]): void {
  if (typeof window === 'undefined') return;
  getStorage().saveDailyResults(results).catch(console.error);
}

// Create the daily test store
function createDailyStore() {
  return {
    results: { subscribe: resultsInternal.subscribe },

    // Record a daily test result
    recordResult(wpm: number, accuracy: number, trueAccuracy: number, duration: number): DailyTestResult | null {
      if (currentUserId === null) return null;

      const today = getDateString();
      const results = get(resultsInternal);

      // Check if already completed today
      if (hasCompletedToday(results, currentUserId)) {
        return null;
      }

      const result: DailyTestResult = {
        userId: currentUserId,
        date: today,
        wpm,
        accuracy,
        trueAccuracy,
        duration,
        completedAt: Date.now(),
      };

      resultsInternal.update((list) => {
        const updated = [...list, result];
        saveResults(updated);
        return updated;
      });

      return result;
    },

    // Check if today's test is completed
    isCompletedToday(): boolean {
      if (currentUserId === null) return false;
      return hasCompletedToday(get(resultsInternal), currentUserId);
    },

    // Get today's result
    getTodayResult(): DailyTestResult | null {
      if (currentUserId === null) return null;
      return getTodayResult(get(resultsInternal), currentUserId);
    },

    // Get current streak
    getStreak(): number {
      if (currentUserId === null) return 0;
      return getStreak(get(resultsInternal), currentUserId);
    },

    // Get best result
    getBestResult(): DailyTestResult | null {
      if (currentUserId === null) return null;
      return getBestResult(get(resultsInternal), currentUserId);
    },

    // Get all results for current user
    getUserResults(): DailyTestResult[] {
      if (currentUserId === null) return [];
      return get(resultsInternal).filter(r => r.userId === currentUserId);
    },
  };
}

export const dailyStore = createDailyStore();

// Derived stores
export const completedToday = derived(
  [resultsInternal, currentUser],
  ([$results, $user]) => {
    if (!$user) return false;
    return hasCompletedToday($results, $user.id);
  }
);

export const currentStreak = derived(
  [resultsInternal, currentUser],
  ([$results, $user]) => {
    if (!$user) return 0;
    return getStreak($results, $user.id);
  }
);

export const todayResult = derived(
  [resultsInternal, currentUser],
  ([$results, $user]) => {
    if (!$user) return null;
    return getTodayResult($results, $user.id);
  }
);
