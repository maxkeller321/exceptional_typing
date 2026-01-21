// App constants - Single source of truth for app-wide values

export const APP_NAME = 'Exceptional Typing';
export const APP_VERSION = '0.1.0';

// localStorage keys
export const STORAGE_KEYS = {
  users: 'exceptional-typing-users',
  settings: (userId: number) => `exceptional-typing-settings-${userId}`,
  stats: (userId: number) => `exceptional-typing-stats-${userId}`,
  progress: (userId: number) => `exceptional-typing-progress-${userId}`,
  snippets: (userId: number) => `exceptional-typing-snippets-${userId}`,
  dailyResults: 'exceptional-typing-daily-results',
  courseProgress: (userId: number) => `exceptional-typing-course-${userId}`,
} as const;
