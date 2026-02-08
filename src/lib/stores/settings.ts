import { writable, derived, get } from 'svelte/store';
import type { UserSettings, TypingMode, KeyboardLayoutId, Locale, AppTheme, LessonCategory, Difficulty } from '../types';
import { currentUser } from './user';
import { getStorage } from '../services';
import { DEFAULT_SETTINGS } from '../defaults';

// Re-export for backwards compatibility
export { DEFAULT_SETTINGS };

// Internal store
const settingsInternal = writable<UserSettings>(DEFAULT_SETTINGS);

// Track current user ID for storage key
let currentUserId: number | null = null;

// Subscribe to user changes to load/save settings
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadSettings(user.id);
  } else {
    currentUserId = null;
    settingsInternal.set(DEFAULT_SETTINGS);
  }
});

// Load settings from storage
function loadSettings(userId: number): void {
  if (typeof window === 'undefined') return;

  getStorage().getSettings(userId).then((settings) => {
    settingsInternal.set(settings ?? DEFAULT_SETTINGS);
  }).catch(() => {
    settingsInternal.set(DEFAULT_SETTINGS);
  });
}

// Save settings via storage service
function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  getStorage().saveSettings(currentUserId, settings).catch(console.error);
}

// Debounce save to prevent excessive writes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(settings: UserSettings): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveSettings(settings);
  }, 300);
}

// Create the settings store with update methods
function createSettingsStore() {
  const { subscribe, set, update } = settingsInternal;

  // Generic update function with auto-save
  function updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    update((s) => {
      const newSettings = { ...s, [key]: value };
      scheduleSave(newSettings);
      return newSettings;
    });
  }

  return {
    subscribe,

    // Display settings
    setShowKeyboard: (v: boolean) => updateSetting('showVirtualKeyboard', v),
    setShowHandGuides: (v: boolean) => updateSetting('showHandGuides', v),
    setShowSyntaxHighlighting: (v: boolean) => updateSetting('showSyntaxHighlighting', v),
    setShowProgress: (v: boolean) => updateSetting('showProgressPercentage', v),
    setFontSize: (v: number) => updateSetting('fontSize', Math.max(16, Math.min(40, v))),

    // Mode
    setTypingMode: (v: TypingMode) => updateSetting('typingMode', v),
    toggleTypingMode: () => {
      update((s) => {
        const newMode: TypingMode = s.typingMode === 'normal' ? 'coder' : 'normal';
        const newSettings = { ...s, typingMode: newMode };
        scheduleSave(newSettings);
        return newSettings;
      });
    },

    // Theme settings
    setAppTheme: (v: AppTheme) => updateSetting('appTheme', v),

    // Code settings
    setCodeTheme: (v: string) => updateSetting('codeTheme', v),
    setAutoFormat: (v: boolean) => updateSetting('autoFormatCode', v),

    // Other settings
    setSoundEffects: (v: boolean) => updateSetting('soundEffectsEnabled', v),
    setKeyboardLayout: (v: KeyboardLayoutId) => updateSetting('keyboardLayout', v),
    setLocale: (v: Locale) => updateSetting('locale', v),

    // Bulk update
    updateSettings: (updates: Partial<UserSettings>) => {
      update((s) => {
        const newSettings = { ...s, ...updates };
        scheduleSave(newSettings);
        return newSettings;
      });
    },

    // Onboarding
    completeOnboarding: () => updateSetting('hasCompletedOnboarding', true),
    resetOnboarding: () => updateSetting('hasCompletedOnboarding', false),

    // Lesson Picker Filters
    setLessonPickerCategory: (v: LessonCategory | 'all') => updateSetting('lessonPickerCategory', v),
    setLessonPickerDifficulty: (v: Difficulty | 'all') => updateSetting('lessonPickerDifficulty', v),

    // Reset to defaults
    reset: () => {
      set(DEFAULT_SETTINGS);
      scheduleSave(DEFAULT_SETTINGS);
    },
  };
}

export const settingsStore = createSettingsStore();

// Derived stores for individual settings (convenient for subscriptions)
export const showKeyboard = derived(settingsInternal, ($s) => $s.showVirtualKeyboard);
export const showHandGuides = derived(settingsInternal, ($s) => $s.showHandGuides);
export const showSyntaxHighlighting = derived(settingsInternal, ($s) => $s.showSyntaxHighlighting);
export const showProgress = derived(settingsInternal, ($s) => $s.showProgressPercentage);
export const fontSize = derived(settingsInternal, ($s) => $s.fontSize);
export const typingMode = derived(settingsInternal, ($s) => $s.typingMode);
export const isCoderMode = derived(settingsInternal, ($s) => $s.typingMode === 'coder');
export const codeTheme = derived(settingsInternal, ($s) => $s.codeTheme);
export const autoFormatCode = derived(settingsInternal, ($s) => $s.autoFormatCode);
export const soundEffectsEnabled = derived(settingsInternal, ($s) => $s.soundEffectsEnabled);
export const keyboardLayout = derived(settingsInternal, ($s) => $s.keyboardLayout);
export const locale = derived(settingsInternal, ($s) => $s.locale);
export const appTheme = derived(settingsInternal, ($s) => $s.appTheme);
export const hasCompletedOnboarding = derived(settingsInternal, ($s) => $s.hasCompletedOnboarding);
export const lessonPickerCategory = derived(settingsInternal, ($s) => $s.lessonPickerCategory);
export const lessonPickerDifficulty = derived(settingsInternal, ($s) => $s.lessonPickerDifficulty);
