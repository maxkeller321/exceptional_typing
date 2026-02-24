import type { UserSettings } from './types';

// Default settings — extracted here to avoid circular dependencies
// (services/localStorage.ts needs defaults, settings.ts subscribes to currentUser)
export const DEFAULT_SETTINGS: UserSettings = {
  showVirtualKeyboard: true,
  showHandGuides: true,
  showSyntaxHighlighting: true,
  showProgressPercentage: true,
  fontSize: 24,
  typingMode: 'normal',
  appTheme: 'dark-blue',
  codeTheme: 'vscode-dark',
  autoFormatCode: true,
  soundEffectsEnabled: false,
  keyboardLayout: 'auto',
  locale: 'en',
  hasCompletedOnboarding: false,
  lessonPickerCategory: 'home_row',
  lessonPickerDifficulty: 'all',
};
