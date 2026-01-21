import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createHintState,
  updateHintState,
  getHint,
  markHintShown,
  resetHintState,
  getHintI18nKey,
  getHintParams,
} from './hintEngine';

describe('Hint Engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createHintState', () => {
    it('creates initial state with correct defaults', () => {
      const state = createHintState();

      expect(state.totalKeystrokes).toBe(0);
      expect(state.errorCount).toBe(0);
      expect(state.consecutiveCorrect).toBe(0);
      expect(state.keyErrorCounts.size).toBe(0);
      expect(state.sessionStartTime).toBeGreaterThan(0);
      expect(state.lastHintTime).toBe(0);
      expect(state.shownHints.size).toBe(0);
    });
  });

  describe('updateHintState', () => {
    it('increments totalKeystrokes on each call', () => {
      let state = createHintState();
      state = updateHintState(state, true);
      state = updateHintState(state, true);
      state = updateHintState(state, false);

      expect(state.totalKeystrokes).toBe(3);
    });

    it('increments consecutiveCorrect on correct keystroke', () => {
      let state = createHintState();
      state = updateHintState(state, true);
      state = updateHintState(state, true);
      state = updateHintState(state, true);

      expect(state.consecutiveCorrect).toBe(3);
    });

    it('resets consecutiveCorrect on error', () => {
      let state = createHintState();
      state = updateHintState(state, true);
      state = updateHintState(state, true);
      state = updateHintState(state, false);

      expect(state.consecutiveCorrect).toBe(0);
    });

    it('tracks error count', () => {
      let state = createHintState();
      state = updateHintState(state, false);
      state = updateHintState(state, false);

      expect(state.errorCount).toBe(2);
    });

    it('decays error count slowly on correct keystrokes', () => {
      let state = createHintState();
      state = updateHintState(state, false); // errorCount = 1
      state = updateHintState(state, true);  // errorCount = 0.5

      expect(state.errorCount).toBe(0.5);
    });

    it('tracks problematic keys', () => {
      let state = createHintState();
      state = updateHintState(state, false, 'a', 'x');
      state = updateHintState(state, false, 'a', 'y');
      state = updateHintState(state, false, 'b', 'z');

      expect(state.keyErrorCounts.get('a')).toBe(2);
      expect(state.keyErrorCounts.get('b')).toBe(1);
    });
  });

  describe('getHint', () => {
    it('returns null within cooldown period', () => {
      let state = createHintState();
      state.lastHintTime = Date.now() - 1000; // 1 second ago

      const hint = getHint(state, []);

      expect(hint).toBeNull();
    });

    it('returns slow-down hint on low accuracy (>5% error rate)', () => {
      let state = createHintState();
      // Simulate 25 keystrokes with ~92% accuracy (>5% error rate triggers hint)
      for (let i = 0; i < 23; i++) {
        state = updateHintState(state, true);
      }
      for (let i = 0; i < 2; i++) {
        state = updateHintState(state, false);
      }

      vi.advanceTimersByTime(6000); // Past cooldown

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('slow-down');
      expect(hint!.type).toBe('warning');
      expect(hint!.message).toContain('accuracy');
    });

    it('does not show slow-down hint at exactly 95% accuracy', () => {
      let state = createHintState();
      // Simulate 20 keystrokes with exactly 95% accuracy (1 error in 20)
      for (let i = 0; i < 19; i++) {
        state = updateHintState(state, true);
      }
      state = updateHintState(state, false);

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      // At exactly 95%, the hint should not trigger (accuracy < 0.95 is false when accuracy === 0.95)
      expect(hint?.id).not.toBe('slow-down');
    });

    it('returns problem-key hint when key has 3+ errors', () => {
      let state = createHintState();
      state = updateHintState(state, false, 'e', 'r');
      state = updateHintState(state, false, 'e', 'r');
      state = updateHintState(state, false, 'e', 'r');

      // Add some correct keystrokes to avoid low accuracy hint
      for (let i = 0; i < 30; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('problem-key-e');
      expect(hint!.message).toContain("'e'");
    });

    it('returns Space for space key in problem hint', () => {
      let state = createHintState();
      state = updateHintState(state, false, ' ', 'x');
      state = updateHintState(state, false, ' ', 'x');
      state = updateHintState(state, false, ' ', 'x');

      // Add correct keystrokes
      for (let i = 0; i < 30; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.message).toContain("'Space'");
    });

    it('returns great-accuracy hint after 20 consecutive correct', () => {
      let state = createHintState();
      for (let i = 0; i < 25; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('great-accuracy');
      expect(hint!.type).toBe('success');
    });

    it('does not show great-accuracy hint twice', () => {
      let state = createHintState();
      for (let i = 0; i < 25; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      let hint = getHint(state, []);
      expect(hint!.id).toBe('great-accuracy');

      // Mark as shown
      state = markHintShown(state, 'great-accuracy');

      vi.advanceTimersByTime(6000);

      hint = getHint(state, []);
      // Should not show great-accuracy again
      expect(hint?.id).not.toBe('great-accuracy');
    });

    it('returns take-break hint after 10 minutes', () => {
      let state = createHintState();
      state.sessionStartTime = Date.now() - 11 * 60 * 1000; // 11 minutes ago

      // Add some keystrokes
      for (let i = 0; i < 10; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('take-break');
      expect(hint!.type).toBe('info');
    });

    it('returns speed-up hint for very accurate typing', () => {
      let state = createHintState();
      for (let i = 0; i < 35; i++) {
        state = updateHintState(state, true);
      }

      vi.advanceTimersByTime(6000);

      // First hint will be great-accuracy
      let hint = getHint(state, []);
      state = markHintShown(state, hint!.id);

      vi.advanceTimersByTime(6000);

      hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('speed-up');
    });

    it('prioritizes higher priority hints', () => {
      let state = createHintState();
      // Create conditions for both slow-down (priority 100) and take-break (priority 30)
      state.sessionStartTime = Date.now() - 11 * 60 * 1000;

      // Low accuracy
      for (let i = 0; i < 15; i++) {
        state = updateHintState(state, true);
      }
      for (let i = 0; i < 15; i++) {
        state = updateHintState(state, false);
      }

      vi.advanceTimersByTime(6000);

      const hint = getHint(state, []);

      expect(hint).not.toBeNull();
      expect(hint!.id).toBe('slow-down'); // Higher priority
    });
  });

  describe('markHintShown', () => {
    it('adds hint id to shownHints', () => {
      let state = createHintState();
      state = markHintShown(state, 'test-hint');

      expect(state.shownHints.has('test-hint')).toBe(true);
    });

    it('updates lastHintTime', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00'));

      let state = createHintState();
      state = markHintShown(state, 'test-hint');

      expect(state.lastHintTime).toBe(Date.now());
    });
  });

  describe('resetHintState', () => {
    it('returns fresh state', () => {
      const state = resetHintState();

      expect(state.totalKeystrokes).toBe(0);
      expect(state.errorCount).toBe(0);
      expect(state.consecutiveCorrect).toBe(0);
    });
  });

  describe('getHintI18nKey', () => {
    it('returns correct i18n key for slow-down', () => {
      const hint = { id: 'slow-down', message: '', type: 'warning' as const, priority: 100 };
      expect(getHintI18nKey(hint)).toBe('hint.slowDown');
    });

    it('returns correct i18n key for great-accuracy', () => {
      const hint = { id: 'great-accuracy', message: '', type: 'success' as const, priority: 50 };
      expect(getHintI18nKey(hint)).toBe('hint.greatAccuracy');
    });

    it('returns correct i18n key for take-break', () => {
      const hint = { id: 'take-break', message: '', type: 'info' as const, priority: 30 };
      expect(getHintI18nKey(hint)).toBe('hint.takeBreak');
    });

    it('returns correct i18n key for speed-up', () => {
      const hint = { id: 'speed-up', message: '', type: 'info' as const, priority: 40 };
      expect(getHintI18nKey(hint)).toBe('hint.speedUp');
    });

    it('returns correct i18n key for problem-key hints', () => {
      const hint = { id: 'problem-key-a', message: '', type: 'warning' as const, priority: 90 };
      expect(getHintI18nKey(hint)).toBe('hint.watchKey');
    });

    it('returns empty string for unknown hints', () => {
      const hint = { id: 'unknown', message: '', type: 'info' as const, priority: 0 };
      expect(getHintI18nKey(hint)).toBe('');
    });
  });

  describe('getHintParams', () => {
    it('returns key param for problem-key hints', () => {
      const hint = { id: 'problem-key-e', message: '', type: 'warning' as const, priority: 90 };
      expect(getHintParams(hint)).toEqual({ key: 'e' });
    });

    it('returns Space for space key', () => {
      const hint = { id: 'problem-key- ', message: '', type: 'warning' as const, priority: 90 };
      expect(getHintParams(hint)).toEqual({ key: 'Space' });
    });

    it('returns empty object for non-problem-key hints', () => {
      const hint = { id: 'slow-down', message: '', type: 'warning' as const, priority: 100 };
      expect(getHintParams(hint)).toEqual({});
    });
  });
});
