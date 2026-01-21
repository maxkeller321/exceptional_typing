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
    it('has dark-gold as default theme', () => {
      const settings = get(settingsStore);
      expect(settings.appTheme).toBe('dark-gold');
      expect(get(appTheme)).toBe('dark-gold');
    });

    it('setAppTheme changes theme', () => {
      settingsStore.setAppTheme('dark-blue');
      expect(get(appTheme)).toBe('dark-blue');

      settingsStore.setAppTheme('light');
      expect(get(appTheme)).toBe('light');

      settingsStore.setAppTheme('midnight');
      expect(get(appTheme)).toBe('midnight');

      settingsStore.setAppTheme('dark-gold');
      expect(get(appTheme)).toBe('dark-gold');
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
});
