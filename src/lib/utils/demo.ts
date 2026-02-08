/**
 * Demo mode utilities.
 *
 * Demo mode is activated by running `npm run demo`, which sets VITE_DEMO_MODE=true
 * as a process environment variable. main.ts converts this into a self-cleaning
 * localStorage flag so it survives page navigation but not app restarts.
 */

import type { UserProfile, UserSettings, UserStats, DailyTestResult, CourseProgress } from '../types';
import { STORAGE_KEYS } from '../constants';
import { DEFAULT_SETTINGS } from '../stores/settings';
import { users, currentUser } from '../stores/user';

const DEMO_FLAG_KEY = 'exceptional-typing-demo-mode';
const DEMO_USER_ID = 999999;

/**
 * Check if demo mode is active and consume the flag.
 * The flag is deleted immediately so that a subsequent normal startup
 * won't enter demo mode — even if the demo process was force-killed.
 */
export function checkAndConsumeDemoFlag(): boolean {
  if (typeof window === 'undefined') return false;

  const flag = localStorage.getItem(DEMO_FLAG_KEY);
  if (flag === 'true') {
    localStorage.removeItem(DEMO_FLAG_KEY);
    return true;
  }
  return false;
}

/**
 * Called from main.ts at build time — sets the localStorage flag
 * if the VITE_DEMO_MODE env var is present.
 */
export function setDemoFlagFromEnv(): void {
  // @ts-expect-error - Vite injects import.meta.env
  if (import.meta.env?.VITE_DEMO_MODE === 'true') {
    localStorage.setItem(DEMO_FLAG_KEY, 'true');
  }
}

/**
 * Initialize demo mode: create a demo user with pre-populated data
 * and auto-login.
 */
export function initializeDemoMode(): void {
  const demoUser: UserProfile = {
    id: DEMO_USER_ID,
    name: 'Demo User',
    avatar: 'robot',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  // Save demo user to user list
  const userList = [demoUser];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(userList));
  users.set(userList);

  // Save demo settings (onboarding completed so tutorial doesn't show)
  const demoSettings: UserSettings = {
    ...DEFAULT_SETTINGS,
    hasCompletedOnboarding: true,
  };
  localStorage.setItem(
    STORAGE_KEYS.settings(DEMO_USER_ID),
    JSON.stringify(demoSettings)
  );

  // Save demo stats
  const demoStats: UserStats & { problemKeys: [string, number][] } = {
    totalPracticeTime: 3_600_000,
    totalWordsTyped: 2500,
    averageWpm: 52,
    averageAccuracy: 94.5,
    averageTrueAccuracy: 91.2,
    totalKeystrokes: 15000,
    totalBackspaces: 450,
    totalCorrectKeystrokes: 14550,
    lessonsCompleted: 12,
    currentStreak: 5,
    longestStreak: 8,
    lastPracticeDate: new Date().toISOString().split('T')[0],
    problemKeys: [['q', 8], ['z', 6], ['x', 5], [';', 4]],
  };
  localStorage.setItem(
    STORAGE_KEYS.stats(DEMO_USER_ID),
    JSON.stringify(demoStats)
  );

  // Save some daily test results
  const dailyResults: DailyTestResult[] = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyResults.push({
      userId: DEMO_USER_ID,
      date: date.toISOString().split('T')[0],
      wpm: 45 + Math.floor(Math.random() * 20),
      accuracy: 90 + Math.random() * 8,
      trueAccuracy: 87 + Math.random() * 8,
      duration: 55000 + Math.floor(Math.random() * 10000),
      completedAt: date.getTime(),
    });
  }
  localStorage.setItem(STORAGE_KEYS.dailyResults, JSON.stringify(dailyResults));

  // Save course progress (started 10-finger course, completed first 2 stages)
  const courseProgress: CourseProgress[] = [{
    courseId: 'ten-finger',
    currentStageId: 'stage-3',
    completedStages: ['stage-1', 'stage-2'],
    skippedStages: [],
    enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  }];
  localStorage.setItem(
    `exceptional-typing-all-courses-${DEMO_USER_ID}`,
    JSON.stringify(courseProgress)
  );

  // Auto-login the demo user
  currentUser.set(demoUser);
}
