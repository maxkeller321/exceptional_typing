import { writable, derived, get } from 'svelte/store';
import type { DailyActivity } from '../types';
import { currentUser } from './user';
import { getStorage } from '../services';

export type { DailyActivity };

// Internal store for daily activity data
const activityInternal = writable<Map<string, DailyActivity>>(new Map());

// Track current user ID
let currentUserId: number | null = null;

// Subscribe to user changes
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadActivity(user.id);
  } else {
    currentUserId = null;
    activityInternal.set(new Map());
  }
});

// Load activity from storage
function loadActivity(userId: number): void {
  if (typeof window === 'undefined') return;

  getStorage().getActivity(userId).then((activity) => {
    activityInternal.set(activity);
  }).catch(() => {
    activityInternal.set(new Map());
  });
}

// Save activity via storage service (fire-and-forget)
function saveActivity(activity: Map<string, DailyActivity>): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  getStorage().saveActivity(currentUserId, activity).catch(console.error);
}

// Get today's date string in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Create the activity store
function createActivityStore() {
  return {
    subscribe: activityInternal.subscribe,

    // Record a practice session
    recordSession(practiceTime: number, characters: number): void {
      if (currentUserId === null) return;

      const today = getTodayString();

      activityInternal.update((map) => {
        const existing = map.get(today) || {
          date: today,
          practiceTime: 0,
          characters: 0,
          sessions: 0,
        };

        existing.practiceTime += practiceTime;
        existing.characters += characters;
        existing.sessions += 1;

        map.set(today, existing);
        saveActivity(map);
        return map;
      });
    },

    // Get activity for a specific date
    getActivity(date: string): DailyActivity | null {
      return get(activityInternal).get(date) || null;
    },

    // Get all activity as array (for heatmap)
    getAllActivity(): DailyActivity[] {
      return Array.from(get(activityInternal).values());
    },

    // Get activity for the last N days
    getRecentActivity(days: number = 365): DailyActivity[] {
      const activity = get(activityInternal);
      const result: DailyActivity[] = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const data = activity.get(dateStr);
        if (data) {
          result.push(data);
        }
      }

      return result;
    },

    // Reset all activity data
    reset(): void {
      if (currentUserId === null) return;
      getStorage().deleteActivity(currentUserId).catch(console.error);
      activityInternal.set(new Map());
    },
  };
}

export const activityStore = createActivityStore();

// Derived store for activity array (for heatmap component)
export const activityData = derived(activityInternal, ($activity) =>
  Array.from($activity.values())
);

// Derived store for today's activity
export const todayActivity = derived(activityInternal, ($activity) => {
  const today = new Date().toISOString().split('T')[0];
  return $activity.get(today) || null;
});

// Derived store for total sessions count
export const totalSessions = derived(activityInternal, ($activity) => {
  let total = 0;
  for (const day of $activity.values()) {
    total += day.sessions;
  }
  return total;
});
