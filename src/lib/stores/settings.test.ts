import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import {
  settingsStore,
  DEFAULT_SETTINGS,
  showKeyboard,
  showHandGuides,
  fontSize,
  typingMode,
  isCoderMode,
  keyboardLayout,
  locale,
  appTheme,
  hasCompletedOnboarding,
  lessonPickerCategory,
  lessonPickerDifficulty,
} from './settings';
import { currentUser } from './user';

describe('Settings Store', () => {
  beforeEach(() => {
    // Reset to defaults
    currentUser.set(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('default settings', () => {
    it('has correct default values', () => {
      const settings = get(settingsStore);

      expect(settings.showVirtualKeyboard).toBe(true);
      expect(settings.showHandGuides).toBe(true);
      expect(settings.showSyntaxHighlighting).toBe(true);
      expect(settings.showProgressPercentage).toBe(true);
      expect(settings.fontSize).toBe(24);
      expect(settings.typingMode).toBe('normal');
      expect(settings.keyboardLayout).toBe('qwerty-us');
      expect(settings.locale).toBe('en');
    });
  });

  describe('display settings', () => {
    it('setShowKeyboard updates correctly', () => {
      settingsStore.setShowKeyboard(false);
      expect(get(showKeyboard)).toBe(false);

      settingsStore.setShowKeyboard(true);
      expect(get(showKeyboard)).toBe(true);
    });

    it('setShowHandGuides updates correctly', () => {
      settingsStore.setShowHandGuides(false);
      expect(get(showHandGuides)).toBe(false);
    });

    it('setFontSize clamps to valid range', () => {
      // Valid value
      settingsStore.setFontSize(30);
      expect(get(fontSize)).toBe(30);

      // Below minimum (16)
      settingsStore.setFontSize(10);
      expect(get(fontSize)).toBe(16);

      // Above maximum (40)
      settingsStore.setFontSize(50);
      expect(get(fontSize)).toBe(40);
    });
  });

  describe('typing mode', () => {
    it('setTypingMode changes mode', () => {
      expect(get(typingMode)).toBe('normal');

      settingsStore.setTypingMode('coder');
      expect(get(typingMode)).toBe('coder');
      expect(get(isCoderMode)).toBe(true);

      settingsStore.setTypingMode('normal');
      expect(get(typingMode)).toBe('normal');
      expect(get(isCoderMode)).toBe(false);
    });

    it('toggleTypingMode switches between modes', () => {
      expect(get(typingMode)).toBe('normal');

      settingsStore.toggleTypingMode();
      expect(get(typingMode)).toBe('coder');

      settingsStore.toggleTypingMode();
      expect(get(typingMode)).toBe('normal');
    });
  });

  describe('keyboard layout', () => {
    it('setKeyboardLayout changes layout', () => {
      settingsStore.setKeyboardLayout('qwertz-de');
      expect(get(keyboardLayout)).toBe('qwertz-de');

      settingsStore.setKeyboardLayout('dvorak');
      expect(get(keyboardLayout)).toBe('dvorak');
    });
  });

  describe('locale', () => {
    it('setLocale changes locale', () => {
      settingsStore.setLocale('de');
      expect(get(locale)).toBe('de');

      settingsStore.setLocale('en');
      expect(get(locale)).toBe('en');
    });
  });

  describe('app theme', () => {
    it('has dark-blue as default theme', () => {
      const settings = get(settingsStore);
      expect(settings.appTheme).toBe('dark-blue');
      expect(get(appTheme)).toBe('dark-blue');
    });

    it('setAppTheme changes theme', () => {
      settingsStore.setAppTheme('dark-gold');
      expect(get(appTheme)).toBe('dark-gold');

      settingsStore.setAppTheme('light');
      expect(get(appTheme)).toBe('light');

      settingsStore.setAppTheme('midnight');
      expect(get(appTheme)).toBe('midnight');

      settingsStore.setAppTheme('dark-blue');
      expect(get(appTheme)).toBe('dark-blue');
    });

    it('persists theme setting', () => {
      currentUser.set({ id: 999, name: 'ThemeTest', avatar: 'cat', createdAt: '', lastActiveAt: null });

      settingsStore.setAppTheme('midnight');

      vi.advanceTimersByTime(300);

      const stored = localStorage.getItem('exceptional-typing-settings-999');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.appTheme).toBe('midnight');
    });

    it('loads theme when user is selected', () => {
      const savedSettings = { ...DEFAULT_SETTINGS, appTheme: 'light' };
      localStorage.setItem('exceptional-typing-settings-888', JSON.stringify(savedSettings));

      currentUser.set({ id: 888, name: 'ThemeLoad', avatar: 'dog', createdAt: '', lastActiveAt: null });

      expect(get(appTheme)).toBe('light');
    });
  });

  describe('bulk update', () => {
    it('updateSettings applies multiple changes', () => {
      settingsStore.updateSettings({
        fontSize: 28,
        typingMode: 'coder',
        locale: 'de',
      });

      const settings = get(settingsStore);
      expect(settings.fontSize).toBe(28);
      expect(settings.typingMode).toBe('coder');
      expect(settings.locale).toBe('de');
      // Others unchanged
      expect(settings.showVirtualKeyboard).toBe(true);
    });
  });

  describe('reset', () => {
    it('reset restores default settings', () => {
      // Change some settings
      settingsStore.setFontSize(36);
      settingsStore.setTypingMode('coder');
      settingsStore.setLocale('de');

      // Reset
      settingsStore.reset();

      const settings = get(settingsStore);
      expect(settings.fontSize).toBe(DEFAULT_SETTINGS.fontSize);
      expect(settings.typingMode).toBe(DEFAULT_SETTINGS.typingMode);
      expect(settings.locale).toBe(DEFAULT_SETTINGS.locale);
    });
  });

  describe('persistence', () => {
    it('saves settings to localStorage after debounce', () => {
      // Set up a mock user
      currentUser.set({ id: 123, name: 'Test', avatar: 'cat', createdAt: '', lastActiveAt: null });

      settingsStore.setFontSize(32);

      // Settings not saved immediately
      expect(localStorage.getItem('exceptional-typing-settings-123')).toBeNull();

      // Fast-forward debounce timer
      vi.advanceTimersByTime(300);

      // Now settings should be saved
      const stored = localStorage.getItem('exceptional-typing-settings-123');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.fontSize).toBe(32);
    });

    it('loads settings when user is selected', () => {
      // Pre-populate localStorage
      const savedSettings = { ...DEFAULT_SETTINGS, fontSize: 36, typingMode: 'coder' };
      localStorage.setItem('exceptional-typing-settings-456', JSON.stringify(savedSettings));

      // Select user
      currentUser.set({ id: 456, name: 'LoadTest', avatar: 'dog', createdAt: '', lastActiveAt: null });

      // Settings should be loaded
      const settings = get(settingsStore);
      expect(settings.fontSize).toBe(36);
      expect(settings.typingMode).toBe('coder');
    });

    it('resets to defaults when user logs out', () => {
      // Set up user and change settings
      currentUser.set({ id: 789, name: 'Logout', avatar: 'fox', createdAt: '', lastActiveAt: null });
      settingsStore.setFontSize(40);

      // Logout
      currentUser.set(null);

      // Settings should be defaults
      const settings = get(settingsStore);
      expect(settings.fontSize).toBe(DEFAULT_SETTINGS.fontSize);
    });
  });

  describe('onboarding', () => {
    it('has onboarding not completed by default', () => {
      const settings = get(settingsStore);
      expect(settings.hasCompletedOnboarding).toBe(false);
      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('completeOnboarding marks onboarding as completed', () => {
      expect(get(hasCompletedOnboarding)).toBe(false);

      settingsStore.completeOnboarding();

      expect(get(hasCompletedOnboarding)).toBe(true);
      const settings = get(settingsStore);
      expect(settings.hasCompletedOnboarding).toBe(true);
    });

    it('resetOnboarding marks onboarding as not completed', () => {
      // First complete onboarding
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Then reset it
      settingsStore.resetOnboarding();

      expect(get(hasCompletedOnboarding)).toBe(false);
      const settings = get(settingsStore);
      expect(settings.hasCompletedOnboarding).toBe(false);
    });

    it('persists onboarding status', () => {
      currentUser.set({ id: 111, name: 'OnboardTest', avatar: 'cat', createdAt: '', lastActiveAt: null });

      settingsStore.completeOnboarding();

      vi.advanceTimersByTime(300);

      const stored = localStorage.getItem('exceptional-typing-settings-111');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.hasCompletedOnboarding).toBe(true);
    });

    it('loads onboarding status when user is selected', () => {
      const savedSettings = { ...DEFAULT_SETTINGS, hasCompletedOnboarding: true };
      localStorage.setItem('exceptional-typing-settings-222', JSON.stringify(savedSettings));

      currentUser.set({ id: 222, name: 'OnboardLoad', avatar: 'dog', createdAt: '', lastActiveAt: null });

      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('new users have onboarding not completed', () => {
      // Make sure no saved settings exist
      localStorage.removeItem('exceptional-typing-settings-333');

      currentUser.set({ id: 333, name: 'NewUser', avatar: 'fox', createdAt: '', lastActiveAt: null });

      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('reset restores onboarding to not completed', () => {
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      settingsStore.reset();

      expect(get(hasCompletedOnboarding)).toBe(DEFAULT_SETTINGS.hasCompletedOnboarding);
      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('onboarding status persists across user sessions', () => {
      // User 1 completes onboarding
      currentUser.set({ id: 1001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // User logs out
      currentUser.set(null);
      expect(get(hasCompletedOnboarding)).toBe(false); // Defaults on logout

      // User logs back in - onboarding should still be completed
      currentUser.set({ id: 1001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('each user has independent onboarding status', () => {
      // User 1 completes onboarding
      currentUser.set({ id: 2001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Switch to User 2 (new user) - should have onboarding not completed
      currentUser.set({ id: 2002, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(false);

      // Switch back to User 1 - should still be completed
      currentUser.set({ id: 2001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Switch to User 2 - still not completed
      currentUser.set({ id: 2002, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(false);

      // User 2 completes onboarding
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Both users now have completed onboarding
      currentUser.set({ id: 2001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(true);

      currentUser.set({ id: 2002, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('rerunning tutorial resets only current user onboarding status', () => {
      // User 1 completes onboarding
      currentUser.set({ id: 3001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);

      // User 2 completes onboarding
      currentUser.set({ id: 3002, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);

      // User 1 wants to rerun tutorial
      currentUser.set({ id: 3001, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      settingsStore.resetOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(false);

      // User 2 should still have completed onboarding
      currentUser.set({ id: 3002, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      expect(get(hasCompletedOnboarding)).toBe(true);
    });
  });

  describe('lesson picker filters', () => {
    it('has correct default lesson picker filter values', () => {
      const settings = get(settingsStore);
      expect(settings.lessonPickerCategory).toBe('home_row');
      expect(settings.lessonPickerDifficulty).toBe('all');
      expect(get(lessonPickerCategory)).toBe('home_row');
      expect(get(lessonPickerDifficulty)).toBe('all');
    });

    it('setLessonPickerCategory updates correctly', () => {
      settingsStore.setLessonPickerCategory('code');
      expect(get(lessonPickerCategory)).toBe('code');

      settingsStore.setLessonPickerCategory('all');
      expect(get(lessonPickerCategory)).toBe('all');

      settingsStore.setLessonPickerCategory('symbols');
      expect(get(lessonPickerCategory)).toBe('symbols');
    });

    it('setLessonPickerDifficulty updates correctly', () => {
      settingsStore.setLessonPickerDifficulty('beginner');
      expect(get(lessonPickerDifficulty)).toBe('beginner');

      settingsStore.setLessonPickerDifficulty('expert');
      expect(get(lessonPickerDifficulty)).toBe('expert');

      settingsStore.setLessonPickerDifficulty('all');
      expect(get(lessonPickerDifficulty)).toBe('all');
    });

    it('persists lesson picker filters', () => {
      currentUser.set({ id: 444, name: 'FilterTest', avatar: 'cat', createdAt: '', lastActiveAt: null });

      settingsStore.setLessonPickerCategory('commands');
      settingsStore.setLessonPickerDifficulty('intermediate');

      vi.advanceTimersByTime(300);

      const stored = localStorage.getItem('exceptional-typing-settings-444');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.lessonPickerCategory).toBe('commands');
      expect(parsed.lessonPickerDifficulty).toBe('intermediate');
    });

    it('loads lesson picker filters when user is selected', () => {
      const savedSettings = {
        ...DEFAULT_SETTINGS,
        lessonPickerCategory: 'sentences',
        lessonPickerDifficulty: 'advanced',
      };
      localStorage.setItem('exceptional-typing-settings-555', JSON.stringify(savedSettings));

      currentUser.set({ id: 555, name: 'FilterLoad', avatar: 'dog', createdAt: '', lastActiveAt: null });

      expect(get(lessonPickerCategory)).toBe('sentences');
      expect(get(lessonPickerDifficulty)).toBe('advanced');
    });

    it('filters persist across user sessions', () => {
      // User sets filters
      currentUser.set({ id: 666, name: 'FilterPersist', avatar: 'fox', createdAt: '', lastActiveAt: null });
      settingsStore.setLessonPickerCategory('words');
      settingsStore.setLessonPickerDifficulty('beginner');
      vi.advanceTimersByTime(300);

      // User logs out
      currentUser.set(null);
      expect(get(lessonPickerCategory)).toBe(DEFAULT_SETTINGS.lessonPickerCategory);
      expect(get(lessonPickerDifficulty)).toBe(DEFAULT_SETTINGS.lessonPickerDifficulty);

      // User logs back in - filters should be restored
      currentUser.set({ id: 666, name: 'FilterPersist', avatar: 'fox', createdAt: '', lastActiveAt: null });
      expect(get(lessonPickerCategory)).toBe('words');
      expect(get(lessonPickerDifficulty)).toBe('beginner');
    });

    it('reset restores default lesson picker filters', () => {
      settingsStore.setLessonPickerCategory('shortcuts');
      settingsStore.setLessonPickerDifficulty('expert');

      settingsStore.reset();

      expect(get(lessonPickerCategory)).toBe(DEFAULT_SETTINGS.lessonPickerCategory);
      expect(get(lessonPickerDifficulty)).toBe(DEFAULT_SETTINGS.lessonPickerDifficulty);
    });
  });
});
