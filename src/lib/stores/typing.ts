import { writable, derived, get } from 'svelte/store';
import type { TypingState, ErrorInfo, TaskResult, Task, KeystrokeEvent } from '../types';

function createTypingStore() {
  const initialState: TypingState = {
    currentIndex: 0,
    typed: '',
    errors: [],
    startTime: null,
    endTime: null,
    isComplete: false,
    isPaused: false,
  };

  const { subscribe, set, update } = writable<TypingState>(initialState);
  const targetText = writable<string>('');
  const currentTask = writable<Task | null>(null);
  const keystrokes = writable<KeystrokeEvent[]>([]);

  // True accuracy tracking - counts all keystrokes including corrections
  const totalKeypresses = writable<number>(0);
  const backspaceCount = writable<number>(0);

  function reset(task?: Task) {
    set(initialState);
    keystrokes.set([]);
    totalKeypresses.set(0);
    backspaceCount.set(0);
    if (task) {
      currentTask.set(task);
      targetText.set(task.targetText);
    }
  }

  function handleKeyPress(key: string): void {
    const now = Date.now();

    // Track all keypresses for true accuracy
    totalKeypresses.update(n => n + 1);

    update((state) => {
      if (state.isComplete || state.isPaused) return state;

      const target = get(targetText);
      const expectedChar = target[state.currentIndex];

      // Start timer on first keypress
      const startTime = state.startTime ?? now;

      // Check if correct
      const isCorrect = key === expectedChar;

      // Record keystroke event for analytics
      const keystrokeEvent: KeystrokeEvent = {
        char: key,
        timestamp: now,
        index: state.currentIndex,
        isCorrect,
      };
      keystrokes.update(k => [...k, keystrokeEvent]);

      const newErrors = isCorrect
        ? state.errors
        : [
            ...state.errors,
            {
              index: state.currentIndex,
              expected: expectedChar,
              typed: key,
              timestamp: now,
            } as ErrorInfo,
          ];

      const newIndex = state.currentIndex + 1;
      const isComplete = newIndex >= target.length;

      return {
        ...state,
        currentIndex: newIndex,
        typed: state.typed + key,
        errors: newErrors,
        startTime,
        endTime: isComplete ? now : null,
        isComplete,
      };
    });
  }

  function handleBackspace(): void {
    // Track backspace for true accuracy
    backspaceCount.update(n => n + 1);
    totalKeypresses.update(n => n + 1);

    update((state) => {
      if (state.currentIndex === 0 || state.isComplete) return state;

      const newIndex = state.currentIndex - 1;

      // Remove error at this position if exists
      const newErrors = state.errors.filter((e) => e.index !== newIndex);

      return {
        ...state,
        currentIndex: newIndex,
        typed: state.typed.slice(0, -1),
        errors: newErrors,
      };
    });
  }

  function pause(): void {
    update((state) => ({ ...state, isPaused: true }));
  }

  function resume(): void {
    update((state) => ({ ...state, isPaused: false }));
  }

  function getResult(): TaskResult | null {
    const state = get({ subscribe });
    const task = get(currentTask);
    const target = get(targetText);

    if (!state.isComplete || !state.startTime || !state.endTime || !task) {
      return null;
    }

    const duration = state.endTime - state.startTime;
    const minutes = duration / 60000;
    const wordCount = target.length / 5; // Standard: 5 chars = 1 word
    const errorCount = state.errors.length;

    const rawWpm = wordCount / minutes;
    const wpm = Math.max(0, (wordCount - errorCount) / minutes);
    const accuracy = Math.max(0, (target.length - errorCount) / target.length);

    // Get true accuracy stats
    const trueAccuracyStats = getTrueAccuracyStats();

    return {
      taskId: task.id,
      wpm: Math.round(wpm * 10) / 10,
      rawWpm: Math.round(rawWpm * 10) / 10,
      accuracy: Math.round(accuracy * 1000) / 1000,
      trueAccuracy: Math.round(trueAccuracyStats.trueAccuracy * 1000) / 1000,
      totalKeystrokes: trueAccuracyStats.totalKeypresses,
      backspaceCount: trueAccuracyStats.backspaces,
      errors: state.errors,
      duration,
      completedAt: state.endTime,
      passed: accuracy >= task.minAccuracy,
    };
  }

  // Derived stores for reactive UI
  const progress = derived([{ subscribe }, targetText], ([$state, $target]) => {
    if (!$target) return 0;
    return ($state.currentIndex / $target.length) * 100;
  });

  const liveWpm = derived([{ subscribe }, targetText], ([$state, $target]) => {
    if (!$state.startTime || $state.currentIndex === 0) return 0;

    const elapsed = (Date.now() - $state.startTime) / 60000;
    const words = $state.currentIndex / 5;
    return Math.round(words / elapsed);
  });

  const liveAccuracy = derived(
    [{ subscribe }, targetText],
    ([$state, $target]) => {
      if ($state.currentIndex === 0) return 100;
      const correct = $state.currentIndex - $state.errors.length;
      return Math.round((correct / $state.currentIndex) * 100);
    }
  );

  // True accuracy: correct characters / total keystrokes (including corrections)
  const liveTrueAccuracy = derived(
    [{ subscribe }, totalKeypresses],
    ([$state, $total]) => {
      if ($total === 0) return 100;
      // Correct keystrokes = characters typed - errors
      const correct = $state.currentIndex - $state.errors.length;
      return Math.round((correct / $total) * 100);
    }
  );

  function getKeystrokes(): KeystrokeEvent[] {
    return get(keystrokes);
  }

  function getTrueAccuracyStats(): { totalKeypresses: number; backspaces: number; trueAccuracy: number } {
    const total = get(totalKeypresses);
    const backspaces = get(backspaceCount);
    const state = get({ subscribe });
    const correct = state.currentIndex - state.errors.length;
    const trueAccuracy = total > 0 ? correct / total : 1;
    return { totalKeypresses: total, backspaces, trueAccuracy };
  }

  function getTargetText(): string {
    return get(targetText);
  }

  return {
    subscribe,
    targetText: { subscribe: targetText.subscribe },
    currentTask: { subscribe: currentTask.subscribe },
    keystrokes: { subscribe: keystrokes.subscribe },
    progress,
    liveWpm,
    liveAccuracy,
    liveTrueAccuracy,
    reset,
    handleKeyPress,
    handleBackspace,
    pause,
    resume,
    getResult,
    getKeystrokes,
    getTargetText,
    getTrueAccuracyStats,
  };
}

export const typingStore = createTypingStore();
