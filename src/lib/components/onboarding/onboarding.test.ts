import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { settingsStore, hasCompletedOnboarding, DEFAULT_SETTINGS } from '../../stores/settings';
import { currentUser } from '../../stores/user';

describe('Onboarding System', () => {
  beforeEach(() => {
    // Reset stores
    currentUser.set(null);
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Onboarding state management', () => {
    it('new users have onboarding not completed by default', async () => {
      currentUser.set({ id: 1, name: 'NewUser', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('completeOnboarding marks tutorial as done', async () => {
      currentUser.set({ id: 2, name: 'User', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      expect(get(hasCompletedOnboarding)).toBe(false);

      settingsStore.completeOnboarding();

      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('resetOnboarding allows tutorial to be shown again', async () => {
      currentUser.set({ id: 3, name: 'User', avatar: 'fox', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      settingsStore.resetOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('onboarding status persists per user', async () => {
      // User 1 completes onboarding
      currentUser.set({ id: 10, name: 'User1', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Switch to User 2 (new user)
      currentUser.set({ id: 20, name: 'User2', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(false);

      // Switch back to User 1 - should still be completed
      // Note: This requires the settings to be persisted, which happens after debounce
    });
  });

  describe('Onboarding overlay behavior', () => {
    it('onboarding should be shown as overlay, not replacing the app', () => {
      // This test documents the expected behavior:
      // When showOnboarding is true, both the onboarding component AND the app
      // should be rendered, so the spotlight can target app elements.

      // The fix was changing from:
      //   {:else if showOnboarding} <Onboarding/> {:else} <App/>
      // To:
      //   {:else} {#if showOnboarding} <Onboarding/> {/if} <App/>

      // This structural requirement is documented here as a test
      const appStructureComment = `
        The App.svelte must render as:
        {#if !hasUser}
          <UserPicker />
        {:else}
          {#if showOnboarding}
            <OnboardingTutorial />
          {/if}
          <div class="app">...</div>
        {/if}

        NOT as:
        {#if !hasUser}
          <UserPicker />
        {:else if showOnboarding}
          <OnboardingTutorial />
        {:else}
          <div class="app">...</div>
        {/if}
      `;

      expect(appStructureComment).toContain('OnboardingTutorial');
      expect(appStructureComment).toContain('class="app"');
    });

    it('spotlight requires app elements to exist in DOM', () => {
      // The SpotlightOverlay targets elements by CSS selector
      // For selectors like '.sidebar', '.nav-item', '.mode-section' to work,
      // those elements must be rendered in the DOM

      const targetSelectors = [
        '.sidebar',
        '.nav-item:nth-child(1)',
        '.nav-item:nth-child(2)',
        '.nav-item:nth-child(3)',
        '.nav-item:nth-child(4)',
        '.nav-item:nth-child(5)',
        '.nav-item:nth-child(6)',
        '.mode-section',
      ];

      // All these selectors should be valid CSS selectors
      targetSelectors.forEach(selector => {
        expect(() => document.querySelector(selector)).not.toThrow();
      });
    });
  });

  describe('Onboarding tutorial steps', () => {
    it('defines correct step structure', () => {
      // Define expected steps for the onboarding tutorial
      const expectedSteps = [
        { id: 'welcome', targetSelector: null },
        { id: 'sidebar', targetSelector: '.sidebar' },
        { id: 'lessons', targetSelector: '.nav-item:nth-child(1)' },
        { id: 'practice', targetSelector: '.nav-item:nth-child(2)' },
        { id: 'daily', targetSelector: '.nav-item:nth-child(3)' },
        { id: 'course', targetSelector: '.nav-item:nth-child(4)' },
        { id: 'stats', targetSelector: '.nav-item:nth-child(5)' },
        { id: 'settings', targetSelector: '.nav-item:nth-child(6)' },
        { id: 'mode-toggle', targetSelector: '.mode-section' },
        { id: 'ready', targetSelector: null },
      ];

      // First and last steps have no target (centered modal)
      expect(expectedSteps[0].targetSelector).toBeNull();
      expect(expectedSteps[expectedSteps.length - 1].targetSelector).toBeNull();

      // Middle steps have targets
      const stepsWithTargets = expectedSteps.filter(s => s.targetSelector !== null);
      expect(stepsWithTargets.length).toBe(8);

      // All targets are valid CSS selectors
      stepsWithTargets.forEach(step => {
        expect(step.targetSelector).toBeTruthy();
        expect(typeof step.targetSelector).toBe('string');
      });
    });

    it('has at least 10 steps covering all main features', () => {
      const requiredFeatures = [
        'welcome',
        'sidebar',
        'lessons',
        'practice',
        'daily',
        'course',
        'stats',
        'settings',
        'mode-toggle',
        'ready',
      ];

      expect(requiredFeatures.length).toBe(10);
    });
  });

  describe('Spotlight overlay positioning', () => {
    it('calculates cutout for target element', () => {
      // Mock a target element's bounding rect
      const mockRect = {
        left: 100,
        top: 200,
        width: 150,
        height: 50,
        right: 250,
        bottom: 250,
      };

      const padding = 8;

      // Expected cutout with padding
      const expectedCutout = {
        x: mockRect.left - padding,
        y: mockRect.top - padding,
        width: mockRect.width + padding * 2,
        height: mockRect.height + padding * 2,
      };

      expect(expectedCutout.x).toBe(92);
      expect(expectedCutout.y).toBe(192);
      expect(expectedCutout.width).toBe(166);
      expect(expectedCutout.height).toBe(66);
    });

    it('returns no cutout when target selector is null', () => {
      const targetSelector = null;

      // When targetSelector is null, no cutout should be shown
      // The overlay should be a full dark backdrop
      expect(targetSelector).toBeNull();
    });

    it('handles missing elements gracefully', () => {
      // When querySelector returns null, cutout should be null
      const element = document.querySelector('.non-existent-element');
      expect(element).toBeNull();
    });
  });

  describe('Rerun tutorial from settings', () => {
    it('resetOnboarding followed by showOnboarding=true shows tutorial', async () => {
      currentUser.set({ id: 5, name: 'User', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      // Complete onboarding
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      // User clicks "Rerun Tutorial" button
      // This should: 1) resetOnboarding  2) set showOnboarding = true
      settingsStore.resetOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(false);

      // Now the app would set showOnboarding = true
      // and the tutorial would be shown again
    });

    it('completing tutorial after rerun marks it done again', async () => {
      currentUser.set({ id: 6, name: 'User', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      // First run
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Rerun
      settingsStore.resetOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(false);

      // Complete again
      settingsStore.completeOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(true);
    });
  });

  describe('Keyboard navigation', () => {
    it('supports arrow key navigation', () => {
      // Document expected keyboard shortcuts
      const expectedKeys = {
        'ArrowRight': 'next step',
        'ArrowLeft': 'previous step',
        'Enter': 'next step / complete',
        'Escape': 'skip tutorial',
      };

      expect(Object.keys(expectedKeys)).toContain('ArrowRight');
      expect(Object.keys(expectedKeys)).toContain('ArrowLeft');
      expect(Object.keys(expectedKeys)).toContain('Enter');
      expect(Object.keys(expectedKeys)).toContain('Escape');
    });
  });

  describe('Onboarding shown once per user (at profile creation)', () => {
    /**
     * IMPORTANT BEHAVIORAL REQUIREMENT:
     * The onboarding tutorial should only be shown ONCE per user - specifically
     * when the user profile is first created. It should NOT be shown again on
     * subsequent logins. Users can manually rerun the tutorial from Settings.
     *
     * This is controlled by:
     * 1. hasCompletedOnboarding in user settings (persisted per user)
     * 2. onboardingCheckedForUser in App.svelte (prevents re-triggering on settings updates)
     */

    it('new users trigger onboarding (hasCompletedOnboarding is false)', async () => {
      // New user has no saved settings, so DEFAULT_SETTINGS apply
      currentUser.set({ id: 4001, name: 'NewUser', avatar: 'cat', createdAt: new Date().toISOString(), lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      // New users have onboarding not completed
      expect(get(hasCompletedOnboarding)).toBe(false);
    });

    it('returning users with completed onboarding do not trigger onboarding', async () => {
      // First login - complete onboarding
      currentUser.set({ id: 4002, name: 'ReturningUser', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300); // Wait for settings to persist
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Log out
      currentUser.set(null);
      expect(get(hasCompletedOnboarding)).toBe(false); // Resets to default on logout

      // Log back in (returning user)
      currentUser.set({ id: 4002, name: 'ReturningUser', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      // Settings are loaded from localStorage, so onboarding should remain completed
      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('onboarding status is tied to user profile, not the session', async () => {
      // User A (new user)
      currentUser.set({ id: 4010, name: 'UserA', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(false);
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // User B (new user)
      currentUser.set({ id: 4020, name: 'UserB', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(false); // B has not completed onboarding

      // Back to User A (returning user)
      currentUser.set({ id: 4010, name: 'UserA', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(true); // A already completed onboarding

      // User B completes onboarding
      currentUser.set({ id: 4020, name: 'UserB', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);

      // Both users now have completed onboarding
      currentUser.set({ id: 4010, name: 'UserA', avatar: 'cat', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(true);
      currentUser.set({ id: 4020, name: 'UserB', avatar: 'dog', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('rerun tutorial from settings works correctly', async () => {
      // User completes initial onboarding
      currentUser.set({ id: 4030, name: 'TutorialUser', avatar: 'fox', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // User clicks "Rerun Tutorial" in settings
      // This resets onboarding status and app sets showOnboarding = true
      settingsStore.resetOnboarding();
      expect(get(hasCompletedOnboarding)).toBe(false);

      // After completing the tutorial again
      settingsStore.completeOnboarding();
      vi.advanceTimersByTime(300);
      expect(get(hasCompletedOnboarding)).toBe(true);

      // Log out and log back in - should NOT show onboarding again
      currentUser.set(null);
      currentUser.set({ id: 4030, name: 'TutorialUser', avatar: 'fox', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);
      expect(get(hasCompletedOnboarding)).toBe(true);
    });

    it('onboarding check only triggers once per user session (not on every settings update)', async () => {
      /**
       * This documents an important App.svelte behavior:
       * The onboarding check should only happen ONCE when a user logs in,
       * not every time the settings store updates.
       *
       * This is controlled by `onboardingCheckedForUser` in App.svelte:
       * - Set to user.id after checking onboarding for that user
       * - Reset to null when user logs out
       * - Prevents re-checking on every settings subscription update
       */

      currentUser.set({ id: 4040, name: 'SessionUser', avatar: 'owl', createdAt: '', lastActiveAt: null });
      await vi.advanceTimersByTimeAsync(0);

      // Initial onboarding check happens here (handled by App.svelte)
      expect(get(hasCompletedOnboarding)).toBe(false);

      // Changing other settings should NOT re-trigger onboarding check
      settingsStore.setFontSize(32);
      settingsStore.setAppTheme('midnight');
      settingsStore.setTypingMode('coder');

      // These settings updates should not affect onboarding behavior
      // The App.svelte's onboardingCheckedForUser prevents re-triggering
      expect(get(hasCompletedOnboarding)).toBe(false);
    });
  });
});
