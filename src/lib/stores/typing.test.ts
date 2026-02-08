import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { typingStore } from './typing';
import type { Task } from '../types';

describe('Typing Store', () => {
  const mockTask: Task = {
    id: 'test-task-1',
    instruction: 'Type the following text:',
    targetText: 'hello world',
    minAccuracy: 0.9,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    typingStore.reset(mockTask);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reset', () => {
    it('initializes state correctly', () => {
      const state = get(typingStore);

      expect(state.currentIndex).toBe(0);
      expect(state.typed).toBe('');
      expect(state.errors).toHaveLength(0);
      expect(state.startTime).toBeNull();
      expect(state.endTime).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('sets target text from task', () => {
      const target = typingStore.getTargetText();
      expect(target).toBe('hello world');
    });
  });

  describe('handleKeyPress', () => {
    it('advances index on correct keystroke', () => {
      typingStore.handleKeyPress('h');

      const state = get(typingStore);
      expect(state.currentIndex).toBe(1);
      expect(state.typed).toBe('h');
    });

    it('starts timer on first keystroke', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      typingStore.handleKeyPress('h');

      const state = get(typingStore);
      expect(state.startTime).toBe(Date.now());
    });

    it('records error on incorrect keystroke', () => {
      typingStore.handleKeyPress('x'); // Should be 'h'

      const state = get(typingStore);
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0].expected).toBe('h');
      expect(state.errors[0].typed).toBe('x');
      expect(state.errors[0].index).toBe(0);
    });

    it('completes when reaching end of text', () => {
      // Type "hello world" correctly
      'hello world'.split('').forEach((char) => {
        typingStore.handleKeyPress(char);
      });

      const state = get(typingStore);
      expect(state.isComplete).toBe(true);
      expect(state.endTime).not.toBeNull();
    });

    it('ignores input when complete', () => {
      // Complete the text
      'hello world'.split('').forEach((char) => {
        typingStore.handleKeyPress(char);
      });

      const stateAfterComplete = get(typingStore);
      typingStore.handleKeyPress('x');

      const stateAfterExtra = get(typingStore);
      expect(stateAfterExtra.currentIndex).toBe(stateAfterComplete.currentIndex);
    });

    it('ignores input when paused', () => {
      typingStore.handleKeyPress('h');
      typingStore.pause();
      typingStore.handleKeyPress('e');

      const state = get(typingStore);
      expect(state.currentIndex).toBe(1);
    });

    it('records keystroke events', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('e');

      const keystrokes = typingStore.getKeystrokes();
      expect(keystrokes).toHaveLength(2);
      expect(keystrokes[0].char).toBe('h');
      expect(keystrokes[0].isCorrect).toBe(true);
      expect(keystrokes[1].char).toBe('e');
    });
  });

  describe('handleBackspace', () => {
    it('moves index back', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('e');
      typingStore.handleBackspace();

      const state = get(typingStore);
      expect(state.currentIndex).toBe(1);
      expect(state.typed).toBe('h');
    });

    it('removes error at backspaced position', () => {
      typingStore.handleKeyPress('x'); // Error at index 0
      expect(get(typingStore).errors).toHaveLength(1);

      typingStore.handleBackspace();

      const state = get(typingStore);
      expect(state.errors).toHaveLength(0);
    });

    it('does nothing at index 0', () => {
      typingStore.handleBackspace();

      const state = get(typingStore);
      expect(state.currentIndex).toBe(0);
    });

    it('does nothing when complete', () => {
      'hello world'.split('').forEach((char) => {
        typingStore.handleKeyPress(char);
      });

      const indexBefore = get(typingStore).currentIndex;
      typingStore.handleBackspace();

      expect(get(typingStore).currentIndex).toBe(indexBefore);
    });

    it('tracks backspace count for true accuracy', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleBackspace();

      const stats = typingStore.getTrueAccuracyStats();
      expect(stats.backspaces).toBe(1);
    });
  });

  describe('pause and resume', () => {
    it('pause sets isPaused to true', () => {
      typingStore.pause();
      expect(get(typingStore).isPaused).toBe(true);
    });

    it('resume sets isPaused to false', () => {
      typingStore.pause();
      typingStore.resume();
      expect(get(typingStore).isPaused).toBe(false);
    });
  });

  describe('getResult', () => {
    it('returns null if not complete', () => {
      typingStore.handleKeyPress('h');

      const result = typingStore.getResult();
      expect(result).toBeNull();
    });

    it('returns correct result when complete', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      // Type correctly with one error
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('e');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('o');
      typingStore.handleKeyPress(' ');
      typingStore.handleKeyPress('w');
      typingStore.handleKeyPress('x'); // Error
      typingStore.handleBackspace();
      typingStore.handleKeyPress('o');
      typingStore.handleKeyPress('r');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('d');

      const result = typingStore.getResult();

      expect(result).not.toBeNull();
      expect(result!.taskId).toBe('test-task-1');
      expect(result!.errors).toHaveLength(0); // Corrected error
      expect(result!.accuracy).toBe(1); // 100% accuracy after correction
      expect(result!.passed).toBe(true);
    });

    it('calculates WPM correctly', () => {
      // Set initial time
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('h');

      // Advance 6 seconds (0.1 minutes)
      vi.setSystemTime(new Date('2024-01-01T12:00:06.000Z'));

      // Complete the rest
      'ello world'.split('').forEach((char) => {
        typingStore.handleKeyPress(char);
      });

      const result = typingStore.getResult();

      // "hello world" = 11 chars = 2.2 words
      // 0.1 minutes = 22 raw WPM
      expect(result).not.toBeNull();
      expect(result!.rawWpm).toBeGreaterThan(0);
    });

    it('marks as not passed if accuracy below minimum', () => {
      // Type with many errors (need below 90% accuracy)
      typingStore.handleKeyPress('x'); // error
      typingStore.handleKeyPress('x'); // error
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('o');
      typingStore.handleKeyPress(' ');
      typingStore.handleKeyPress('w');
      typingStore.handleKeyPress('o');
      typingStore.handleKeyPress('r');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('d');

      const result = typingStore.getResult();

      expect(result).not.toBeNull();
      expect(result!.accuracy).toBeLessThan(0.9);
      expect(result!.passed).toBe(false);
    });
  });

  describe('derived stores', () => {
    it('progress updates correctly', () => {
      const progress = get(typingStore.progress);
      expect(progress).toBe(0);

      // Type half the text (5.5 chars of 11)
      'hello'.split('').forEach((char) => {
        typingStore.handleKeyPress(char);
      });

      const newProgress = get(typingStore.progress);
      expect(newProgress).toBeCloseTo(45.45, 1); // 5/11 * 100
    });

    it('liveAccuracy updates correctly', () => {
      // Start at 100%
      expect(get(typingStore.liveAccuracy)).toBe(100);

      // Type 2 correct, 1 error
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('e');
      typingStore.handleKeyPress('x'); // error

      // 2/3 correct = 67%
      expect(get(typingStore.liveAccuracy)).toBe(67);
    });
  });

  describe('true accuracy tracking', () => {
    it('tracks total keypresses including corrections', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('x'); // wrong
      typingStore.handleBackspace();
      typingStore.handleKeyPress('e');

      const stats = typingStore.getTrueAccuracyStats();

      // 4 keypresses: h, x, backspace, e
      expect(stats.totalKeypresses).toBe(4);
      expect(stats.backspaces).toBe(1);
    });

    it('calculates true accuracy correctly', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('e');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('l');
      typingStore.handleKeyPress('o');

      const stats = typingStore.getTrueAccuracyStats();

      // 5 correct out of 5 keypresses = 100%
      expect(stats.trueAccuracy).toBe(1);
    });

    it('true accuracy lower when corrections made', () => {
      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('x'); // wrong
      typingStore.handleBackspace();
      typingStore.handleKeyPress('e');

      const stats = typingStore.getTrueAccuracyStats();

      // currentIndex: 2, errors: 0, totalKeypresses: 4
      // trueAccuracy: 2/4 = 0.5
      expect(stats.trueAccuracy).toBe(0.5);
    });

    it('liveTrueAccuracy updates reactively', () => {
      expect(get(typingStore.liveTrueAccuracy)).toBe(100);

      typingStore.handleKeyPress('h');
      typingStore.handleKeyPress('x'); // wrong
      typingStore.handleBackspace();
      typingStore.handleKeyPress('e');

      expect(get(typingStore.liveTrueAccuracy)).toBe(50); // 2/4 correct
    });
  });

  describe('Next Task transition (reset before subscribe)', () => {
    const task1: Task = {
      id: 'task-1',
      instruction: 'Type this',
      targetText: 'ab',
      minAccuracy: 0.5,
    };

    const task2: Task = {
      id: 'task-2',
      instruction: 'Type this',
      targetText: 'cd',
      minAccuracy: 0.5,
    };

    it('after completing a task, isComplete is true', () => {
      typingStore.reset(task1);
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('a');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('b');

      const state = get(typingStore);
      expect(state.isComplete).toBe(true);
    });

    it('reset() clears isComplete before subscribing to a new task', () => {
      // Complete task 1
      typingStore.reset(task1);
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('a');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('b');
      expect(get(typingStore).isComplete).toBe(true);

      // Now simulate what TypingArea.onMount does:
      // Reset BEFORE subscribing (the fix)
      typingStore.reset(task2);

      // Subscribe — should see isComplete: false
      let completionFired = false;
      const unsub = typingStore.subscribe(s => {
        if (s.isComplete) {
          completionFired = true;
        }
      });

      // The subscription should NOT see a completed state
      expect(completionFired).toBe(false);
      expect(get(typingStore).isComplete).toBe(false);

      unsub();
    });

    it('subscribing WITHOUT reset first sees stale isComplete: true', () => {
      // Complete task 1
      typingStore.reset(task1);
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('a');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('b');
      expect(get(typingStore).isComplete).toBe(true);

      // Subscribe WITHOUT resetting first (the old buggy behavior)
      let completionFired = false;
      const unsub = typingStore.subscribe(s => {
        if (s.isComplete) {
          completionFired = true;
        }
      });

      // The subscription DOES see stale completed state — this proves the bug
      expect(completionFired).toBe(true);

      unsub();
    });

    it('after reset, new task can be completed independently', () => {
      // Complete task 1
      typingStore.reset(task1);
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('a');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('b');
      expect(get(typingStore).isComplete).toBe(true);

      // Reset to task 2
      typingStore.reset(task2);
      expect(get(typingStore).isComplete).toBe(false);
      expect(get(typingStore).currentIndex).toBe(0);

      // Complete task 2
      vi.setSystemTime(new Date('2024-01-01T12:00:01.000Z'));
      typingStore.handleKeyPress('c');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('d');

      const state = get(typingStore);
      expect(state.isComplete).toBe(true);
      expect(state.currentIndex).toBe(2);
    });

    it('simulates full Next Task flow without false completion', () => {
      // Complete task 1
      typingStore.reset(task1);
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      typingStore.handleKeyPress('a');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('b');
      expect(get(typingStore).isComplete).toBe(true);

      // Simulate handleNextTask + TypingArea remount:
      // 1. Reset first (as fixed TypingArea.onMount does)
      typingStore.reset(task2);

      // 2. Subscribe (as TypingArea.onMount does after reset)
      const completions: boolean[] = [];
      const unsub = typingStore.subscribe(s => {
        completions.push(s.isComplete);
      });

      // Initial subscription should see isComplete: false
      expect(completions).toEqual([false]);

      // 3. Type in new task — should complete normally
      vi.setSystemTime(new Date('2024-01-01T12:00:01.000Z'));
      typingStore.handleKeyPress('c');
      vi.advanceTimersByTime(500);
      typingStore.handleKeyPress('d');

      // Should have seen: false (initial), false (first key), true (completion)
      expect(completions[0]).toBe(false);
      expect(completions[completions.length - 1]).toBe(true);

      unsub();
    });
  });
});
