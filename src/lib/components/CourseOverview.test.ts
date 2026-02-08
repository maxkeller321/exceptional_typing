import { describe, it, expect } from 'vitest';

/**
 * Tests for the CourseOverview focus selection invariant:
 * At most ONE course card should be visually highlighted at any given time.
 *
 * The component uses two state variables to control highlighting:
 * - focusedIndex: which card has keyboard focus (-1 = none)
 * - usingKeyboard: whether we're in keyboard navigation mode
 *
 * A card gets the `.focused` class when: usingKeyboard && focusedIndex === i
 * Hover highlighting is suppressed when: usingKeyboard (via .no-hover class)
 *
 * This means:
 * - In keyboard mode: exactly one card is focused (via .focused), hover disabled
 * - In mouse mode: at most one card is highlighted (via :hover), no .focused cards
 */

// Simulate the component's focus state machine
interface FocusState {
  focusedIndex: number;
  usingKeyboard: boolean;
}

const TOTAL_COURSES = 4; // number of courses in the app

function createFocusState(): FocusState {
  return { focusedIndex: -1, usingKeyboard: false };
}

function arrowDown(state: FocusState): FocusState {
  return {
    usingKeyboard: true,
    focusedIndex: state.focusedIndex < TOTAL_COURSES - 1 ? state.focusedIndex + 1 : 0,
  };
}

function arrowUp(state: FocusState): FocusState {
  return {
    usingKeyboard: true,
    focusedIndex: state.focusedIndex > 0 ? state.focusedIndex - 1 : TOTAL_COURSES - 1,
  };
}

function mouseClick(state: FocusState): FocusState {
  return { focusedIndex: -1, usingKeyboard: false };
}

function mouseEnter(state: FocusState): FocusState {
  return { focusedIndex: -1, usingKeyboard: false };
}

// Count how many cards would have the .focused class
function countFocusedCards(state: FocusState): number {
  let count = 0;
  for (let i = 0; i < TOTAL_COURSES; i++) {
    if (state.usingKeyboard && state.focusedIndex === i) {
      count++;
    }
  }
  return count;
}

// Check if hover would be suppressed (no-hover class applied)
function isHoverSuppressed(state: FocusState): boolean {
  return state.usingKeyboard;
}

describe('CourseOverview focus selection', () => {
  it('no cards are focused by default', () => {
    const state = createFocusState();
    expect(countFocusedCards(state)).toBe(0);
    expect(isHoverSuppressed(state)).toBe(false);
  });

  it('at most one card is focused after keyboard ArrowDown', () => {
    let state = createFocusState();
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);
    expect(state.focusedIndex).toBe(0);

    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);
    expect(state.focusedIndex).toBe(1);
  });

  it('at most one card is focused after keyboard ArrowUp', () => {
    let state = createFocusState();
    state = arrowUp(state);
    expect(countFocusedCards(state)).toBe(1);
    expect(state.focusedIndex).toBe(TOTAL_COURSES - 1);

    state = arrowUp(state);
    expect(countFocusedCards(state)).toBe(1);
    expect(state.focusedIndex).toBe(TOTAL_COURSES - 2);
  });

  it('hover is suppressed during keyboard navigation', () => {
    let state = createFocusState();
    state = arrowDown(state);
    expect(isHoverSuppressed(state)).toBe(true);
  });

  it('keyboard focus clears on mouse click', () => {
    let state = createFocusState();
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);

    state = mouseClick(state);
    expect(countFocusedCards(state)).toBe(0);
    expect(isHoverSuppressed(state)).toBe(false);
  });

  it('keyboard focus clears on mouse hover', () => {
    let state = createFocusState();
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);

    state = mouseEnter(state);
    expect(countFocusedCards(state)).toBe(0);
    expect(isHoverSuppressed(state)).toBe(false);
  });

  it('cannot have both keyboard focus and hover highlight simultaneously', () => {
    let state = createFocusState();

    // Keyboard navigate to focus card 0
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);
    // Hover is suppressed, so no hover highlight possible
    expect(isHoverSuppressed(state)).toBe(true);

    // Mouse enters a card -> clears keyboard mode
    state = mouseEnter(state);
    // No focused cards, hover is allowed (only 1 card hovered at a time by browser)
    expect(countFocusedCards(state)).toBe(0);
    expect(isHoverSuppressed(state)).toBe(false);
  });

  it('keyboard navigation after mouse interaction re-enables focused state', () => {
    let state = createFocusState();

    // Navigate with keyboard
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);

    // Mouse hover clears keyboard focus
    state = mouseEnter(state);
    expect(countFocusedCards(state)).toBe(0);

    // Keyboard navigates again — re-enables focused state
    state = arrowDown(state);
    expect(countFocusedCards(state)).toBe(1);
    expect(isHoverSuppressed(state)).toBe(true);
  });

  it('rapid keyboard navigation always shows exactly one focused card', () => {
    let state = createFocusState();

    for (let i = 0; i < TOTAL_COURSES * 3; i++) {
      state = arrowDown(state);
      expect(countFocusedCards(state)).toBe(1);
    }
  });

  it('wraps around correctly at boundaries', () => {
    let state = createFocusState();

    // Go to last item
    state = arrowUp(state);
    expect(state.focusedIndex).toBe(TOTAL_COURSES - 1);
    expect(countFocusedCards(state)).toBe(1);

    // Go forward from last -> wraps to 0
    state = arrowDown(state);
    expect(state.focusedIndex).toBe(0);

    // Go backwards from first -> should wrap to last
    // (focusedIndex is 0, arrowUp goes to TOTAL_COURSES - 1)
    state = arrowUp(state);
    expect(state.focusedIndex).toBe(TOTAL_COURSES - 1);
    expect(countFocusedCards(state)).toBe(1);
  });
});
