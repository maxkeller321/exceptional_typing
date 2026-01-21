import type { ErrorInfo } from '../types';

export interface TypingHint {
  id: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  priority: number; // Higher = more important
}

interface HintState {
  totalKeystrokes: number;
  errorCount: number;
  consecutiveCorrect: number;
  keyErrorCounts: Map<string, number>;
  sessionStartTime: number;
  lastHintTime: number;
  shownHints: Set<string>;
}

// Minimum interval between hints (ms)
const HINT_COOLDOWN = 5000;

// Create a new hint state
export function createHintState(): HintState {
  return {
    totalKeystrokes: 0,
    errorCount: 0,
    consecutiveCorrect: 0,
    keyErrorCounts: new Map(),
    sessionStartTime: Date.now(),
    lastHintTime: 0,
    shownHints: new Set(),
  };
}

// Update state with a keystroke
export function updateHintState(
  state: HintState,
  isCorrect: boolean,
  expectedKey?: string,
  typedKey?: string
): HintState {
  const newState = { ...state };
  newState.totalKeystrokes++;

  if (isCorrect) {
    newState.consecutiveCorrect++;
    newState.errorCount = Math.max(0, newState.errorCount - 0.5); // Decay errors slowly
  } else {
    newState.consecutiveCorrect = 0;
    newState.errorCount++;

    // Track problematic keys
    if (expectedKey) {
      const currentCount = newState.keyErrorCounts.get(expectedKey) || 0;
      newState.keyErrorCounts.set(expectedKey, currentCount + 1);
    }
  }

  return newState;
}

// Get the most appropriate hint based on current state
export function getHint(state: HintState, errors: ErrorInfo[]): TypingHint | null {
  const now = Date.now();

  // Respect cooldown
  if (now - state.lastHintTime < HINT_COOLDOWN) {
    return null;
  }

  // Calculate current accuracy
  const accuracy = state.totalKeystrokes > 0
    ? (state.totalKeystrokes - state.errorCount) / state.totalKeystrokes
    : 1;

  const hints: TypingHint[] = [];

  // High error rate hint (triggers at >5% error rate, i.e. <95% accuracy)
  if (accuracy < 0.95 && state.totalKeystrokes > 20) {
    hints.push({
      id: 'slow-down',
      message: 'Slow down and focus on accuracy over speed.',
      type: 'warning',
      priority: 100,
    });
  }

  // Problematic key hint
  const problemKey = getMostProblematicKey(state.keyErrorCounts);
  if (problemKey && state.keyErrorCounts.get(problemKey)! >= 3) {
    hints.push({
      id: `problem-key-${problemKey}`,
      message: `Watch out for the '${problemKey === ' ' ? 'Space' : problemKey}' key`,
      type: 'warning',
      priority: 90,
    });
  }

  // Great accuracy hint
  if (state.consecutiveCorrect >= 20 && !state.shownHints.has('great-accuracy')) {
    hints.push({
      id: 'great-accuracy',
      message: 'Great accuracy! Keep it up!',
      type: 'success',
      priority: 50,
    });
  }

  // Long session hint
  const sessionDuration = now - state.sessionStartTime;
  if (sessionDuration > 10 * 60 * 1000 && !state.shownHints.has('take-break')) {
    hints.push({
      id: 'take-break',
      message: 'Consider taking a short break',
      type: 'info',
      priority: 30,
    });
  }

  // Speed improvement hint
  if (state.consecutiveCorrect >= 30 && accuracy > 0.95 && !state.shownHints.has('speed-up')) {
    hints.push({
      id: 'speed-up',
      message: 'You\'re very accurate! Try increasing your speed.',
      type: 'info',
      priority: 40,
    });
  }

  // Return highest priority hint
  if (hints.length === 0) return null;

  hints.sort((a, b) => b.priority - a.priority);
  return hints[0];
}

// Get the most problematic key
function getMostProblematicKey(keyErrorCounts: Map<string, number>): string | null {
  let maxKey: string | null = null;
  let maxCount = 0;

  for (const [key, count] of keyErrorCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxKey = key;
    }
  }

  return maxKey;
}

// Mark a hint as shown
export function markHintShown(state: HintState, hintId: string): HintState {
  const newState = { ...state };
  newState.shownHints.add(hintId);
  newState.lastHintTime = Date.now();
  return newState;
}

// Reset hint state for a new session
export function resetHintState(): HintState {
  return createHintState();
}

// Get hint message for i18n key
export function getHintI18nKey(hint: TypingHint): string {
  switch (hint.id) {
    case 'slow-down':
      return 'hint.slowDown';
    case 'great-accuracy':
      return 'hint.greatAccuracy';
    case 'take-break':
      return 'hint.takeBreak';
    case 'speed-up':
      return 'hint.speedUp';
    default:
      if (hint.id.startsWith('problem-key-')) {
        return 'hint.watchKey';
      }
      return '';
  }
}

// Get hint params for i18n
export function getHintParams(hint: TypingHint): Record<string, string> {
  if (hint.id.startsWith('problem-key-')) {
    const key = hint.id.replace('problem-key-', '');
    return { key: key === ' ' ? 'Space' : key };
  }
  return {};
}
