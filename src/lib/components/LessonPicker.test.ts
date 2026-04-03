import { describe, it, expect } from 'vitest';
import type { LessonCategory, Difficulty } from '../types';

/**
 * Tests for the LessonPicker keyboard navigation state machine.
 *
 * Navigation has two zones:
 * 1. Filter tabs (category/difficulty) — ArrowLeft/Right to cycle, Tab to switch row
 *    Shown with accent border-left indicator on the active filter group.
 * 2. Lesson card grid — ArrowDown enters the grid, ArrowUp/Down to move between rows,
 *    Enter to select. Focused card gets 2px accent outline (same as CourseView).
 *
 * Mouse interaction clears keyboard state (usingKeyboard=false, focusedCardIndex=-1).
 */

// All categories available in normal mode
const normalCategories: (LessonCategory | 'all')[] = [
  'all', 'home_row', 'top_row', 'bottom_row', 'numbers', 'symbols', 'words', 'sentences',
];

// All categories available in coder mode
const coderCategories: (LessonCategory | 'all')[] = [
  'all', 'home_row', 'top_row', 'bottom_row', 'numbers', 'symbols', 'words', 'sentences', 'code', 'commands', 'shortcuts',
];

const difficultyValues: (Difficulty | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

const GRID_COLS = 3;

interface FilterState {
  filterFocus: 'category' | 'difficulty';
  selectedCategory: LessonCategory | 'all';
  selectedDifficulty: Difficulty | 'all';
  mode: 'normal' | 'coder';
  focusedCardIndex: number;
  usingKeyboard: boolean;
  totalCards: number; // number of filtered lessons
}

function createDefaultState(totalCards: number = 12): FilterState {
  return {
    filterFocus: 'category',
    selectedCategory: 'home_row',
    selectedDifficulty: 'all',
    mode: 'normal',
    focusedCardIndex: -1,
    usingKeyboard: false,
    totalCards,
  };
}

function getCategories(mode: 'normal' | 'coder'): (LessonCategory | 'all')[] {
  return mode === 'coder' ? coderCategories : normalCategories;
}

function arrowRight(state: FilterState): FilterState {
  const next = { ...state, usingKeyboard: true };
  if (state.filterFocus === 'category') {
    const categories = getCategories(state.mode);
    const currentIndex = categories.indexOf(state.selectedCategory);
    next.selectedCategory = categories[(currentIndex + 1) % categories.length];
    next.focusedCardIndex = -1; // reset card focus on filter change
  } else {
    const currentIndex = difficultyValues.indexOf(state.selectedDifficulty);
    next.selectedDifficulty = difficultyValues[(currentIndex + 1) % difficultyValues.length];
    next.focusedCardIndex = -1;
  }
  return next;
}

function arrowLeft(state: FilterState): FilterState {
  const next = { ...state, usingKeyboard: true };
  if (state.filterFocus === 'category') {
    const categories = getCategories(state.mode);
    const currentIndex = categories.indexOf(state.selectedCategory);
    next.selectedCategory = categories[(currentIndex - 1 + categories.length) % categories.length];
    next.focusedCardIndex = -1;
  } else {
    const currentIndex = difficultyValues.indexOf(state.selectedDifficulty);
    next.selectedDifficulty = difficultyValues[(currentIndex - 1 + difficultyValues.length) % difficultyValues.length];
    next.focusedCardIndex = -1;
  }
  return next;
}

function tabKey(state: FilterState): FilterState {
  return {
    ...state,
    filterFocus: state.filterFocus === 'category' ? 'difficulty' : 'category',
    usingKeyboard: true,
  };
}

function arrowDown(state: FilterState): FilterState {
  if (state.totalCards === 0) return { ...state, usingKeyboard: true };
  const next = { ...state, usingKeyboard: true };
  if (state.focusedCardIndex < 0) {
    next.focusedCardIndex = 0;
  } else {
    const nextIndex = state.focusedCardIndex + GRID_COLS;
    if (nextIndex < state.totalCards) {
      next.focusedCardIndex = nextIndex;
    }
  }
  return next;
}

function arrowUp(state: FilterState): FilterState {
  const next = { ...state, usingKeyboard: true };
  if (state.focusedCardIndex >= GRID_COLS) {
    next.focusedCardIndex = state.focusedCardIndex - GRID_COLS;
  } else {
    // At top row — return to filter area
    next.focusedCardIndex = -1;
  }
  return next;
}

function enterKey(state: FilterState): { state: FilterState; selected: boolean } {
  if (state.focusedCardIndex >= 0 && state.focusedCardIndex < state.totalCards) {
    return { state: { ...state, usingKeyboard: false }, selected: true };
  }
  return { state, selected: false };
}

function mouseEnter(state: FilterState): FilterState {
  return { ...state, focusedCardIndex: -1, usingKeyboard: false };
}

// Count focused cards
function countFocusedCards(state: FilterState): number {
  if (!state.usingKeyboard || state.focusedCardIndex < 0) return 0;
  return 1;
}

// Check if filter indicator is visible
function isFilterIndicatorVisible(state: FilterState): boolean {
  return state.usingKeyboard && state.focusedCardIndex < 0;
}

describe('LessonPicker keyboard navigation', () => {
  describe('initial state', () => {
    it('starts with no card focused', () => {
      const state = createDefaultState();
      expect(state.focusedCardIndex).toBe(-1);
      expect(state.usingKeyboard).toBe(false);
    });

    it('starts with category filter focus', () => {
      expect(createDefaultState().filterFocus).toBe('category');
    });
  });

  describe('focus outline on cards', () => {
    it('no cards focused by default', () => {
      expect(countFocusedCards(createDefaultState())).toBe(0);
    });

    it('ArrowDown focuses first card', () => {
      let state = createDefaultState();
      state = arrowDown(state);
      expect(state.focusedCardIndex).toBe(0);
      expect(countFocusedCards(state)).toBe(1);
    });

    it('at most one card focused after multiple arrow presses', () => {
      let state = createDefaultState(9);
      for (let i = 0; i < 20; i++) {
        state = arrowDown(state);
        expect(countFocusedCards(state)).toBeLessThanOrEqual(1);
      }
    });

    it('mouse enter clears card focus', () => {
      let state = createDefaultState();
      state = arrowDown(state);
      expect(state.usingKeyboard).toBe(true);
      state = mouseEnter(state);
      expect(state.usingKeyboard).toBe(false);
      expect(countFocusedCards(state)).toBe(0);
    });
  });

  describe('card grid navigation', () => {
    it('ArrowDown from filters enters grid at index 0', () => {
      let state = createDefaultState(9);
      state = arrowDown(state);
      expect(state.focusedCardIndex).toBe(0);
    });

    it('ArrowDown moves by GRID_COLS (3) to next row', () => {
      let state = createDefaultState(9);
      state = arrowDown(state); // → 0
      state = arrowDown(state); // → 3
      expect(state.focusedCardIndex).toBe(3);
      state = arrowDown(state); // → 6
      expect(state.focusedCardIndex).toBe(6);
    });

    it('ArrowDown stops at last row (no wrap)', () => {
      let state = createDefaultState(9);
      state = arrowDown(state); // → 0
      state = arrowDown(state); // → 3
      state = arrowDown(state); // → 6
      state = arrowDown(state); // stays at 6 (9 > 6+3 is false)
      expect(state.focusedCardIndex).toBe(6);
    });

    it('ArrowUp moves up by GRID_COLS', () => {
      let state = { ...createDefaultState(9), focusedCardIndex: 6, usingKeyboard: true };
      state = arrowUp(state); // 6 → 3
      expect(state.focusedCardIndex).toBe(3);
      state = arrowUp(state); // 3 → 0
      expect(state.focusedCardIndex).toBe(0);
    });

    it('ArrowUp from top row returns to filters (index -1)', () => {
      let state = { ...createDefaultState(9), focusedCardIndex: 1, usingKeyboard: true };
      state = arrowUp(state);
      expect(state.focusedCardIndex).toBe(-1);
    });

    it('does nothing with 0 cards', () => {
      let state = createDefaultState(0);
      state = arrowDown(state);
      expect(state.focusedCardIndex).toBe(-1);
    });
  });

  describe('Enter to select card', () => {
    it('Enter selects the focused card', () => {
      let state = createDefaultState(9);
      state = arrowDown(state); // focus card 0
      const result = enterKey(state);
      expect(result.selected).toBe(true);
    });

    it('Enter does nothing when no card is focused', () => {
      const result = enterKey(createDefaultState());
      expect(result.selected).toBe(false);
    });

    it('Enter does nothing when focused index is out of range', () => {
      const state = { ...createDefaultState(3), focusedCardIndex: 5, usingKeyboard: true };
      const result = enterKey(state);
      expect(result.selected).toBe(false);
    });
  });

  describe('filter tab navigation (Left/Right)', () => {
    it('ArrowRight moves category forward', () => {
      const state = arrowRight(createDefaultState());
      expect(state.selectedCategory).toBe('top_row');
    });

    it('ArrowRight wraps from last category to all', () => {
      const state = arrowRight({ ...createDefaultState(), selectedCategory: 'sentences' });
      expect(state.selectedCategory).toBe('all');
    });

    it('ArrowLeft moves category backward', () => {
      const state = arrowLeft({ ...createDefaultState(), selectedCategory: 'top_row' });
      expect(state.selectedCategory).toBe('home_row');
    });

    it('ArrowLeft wraps from all to last category', () => {
      const state = arrowLeft({ ...createDefaultState(), selectedCategory: 'all' });
      expect(state.selectedCategory).toBe('sentences');
    });

    it('ArrowRight on difficulty moves forward', () => {
      const state = arrowRight({ ...createDefaultState(), filterFocus: 'difficulty' });
      expect(state.selectedDifficulty).toBe('beginner');
    });

    it('ArrowRight wraps from expert to all', () => {
      const state = arrowRight({ ...createDefaultState(), filterFocus: 'difficulty', selectedDifficulty: 'expert' });
      expect(state.selectedDifficulty).toBe('all');
    });

    it('filter change resets card focus', () => {
      let state = createDefaultState();
      state = arrowDown(state); // focus card 0
      expect(state.focusedCardIndex).toBe(0);
      state = arrowRight(state); // change filter → card focus reset
      expect(state.focusedCardIndex).toBe(-1);
    });
  });

  describe('Tab to switch filter rows', () => {
    it('Tab switches from category to difficulty', () => {
      expect(tabKey(createDefaultState()).filterFocus).toBe('difficulty');
    });

    it('Tab switches back from difficulty to category', () => {
      expect(tabKey({ ...createDefaultState(), filterFocus: 'difficulty' }).filterFocus).toBe('category');
    });

    it('preserves selected values on Tab', () => {
      const initial: FilterState = {
        ...createDefaultState(),
        selectedCategory: 'numbers',
        selectedDifficulty: 'intermediate',
      };
      const state = tabKey(initial);
      expect(state.selectedCategory).toBe('numbers');
      expect(state.selectedDifficulty).toBe('intermediate');
    });
  });

  describe('filter focus indicator', () => {
    it('shows category indicator when in keyboard mode with no card focused', () => {
      let state = createDefaultState();
      state = arrowRight(state); // activate keyboard mode
      expect(isFilterIndicatorVisible(state)).toBe(true);
    });

    it('hides indicator when a card is focused', () => {
      let state = createDefaultState();
      state = arrowDown(state); // focus a card
      expect(isFilterIndicatorVisible(state)).toBe(false);
    });

    it('hides indicator when not in keyboard mode', () => {
      expect(isFilterIndicatorVisible(createDefaultState())).toBe(false);
    });
  });

  describe('coder mode', () => {
    it('navigates through extra categories in coder mode', () => {
      let state: FilterState = { ...createDefaultState(), mode: 'coder', selectedCategory: 'sentences' };
      state = arrowRight(state);
      expect(state.selectedCategory).toBe('code');
      state = arrowRight(state);
      expect(state.selectedCategory).toBe('commands');
      state = arrowRight(state);
      expect(state.selectedCategory).toBe('shortcuts');
      state = arrowRight(state);
      expect(state.selectedCategory).toBe('all'); // wrap
    });
  });

  describe('full workflow', () => {
    it('filter with arrows → enter grid → select card', () => {
      let state = createDefaultState(6);
      // Navigate filter
      state = arrowRight(state); // category → top_row
      expect(state.selectedCategory).toBe('top_row');

      // Enter card grid
      state = arrowDown(state); // → card 0
      expect(state.focusedCardIndex).toBe(0);

      // Move down in grid
      state = arrowDown(state); // → card 3
      expect(state.focusedCardIndex).toBe(3);

      // Select with Enter
      const result = enterKey(state);
      expect(result.selected).toBe(true);
    });

    it('enter grid → go back to filters → change filter', () => {
      let state = createDefaultState(6);
      state = arrowDown(state); // → card 0
      state = arrowUp(state);   // → back to filters
      expect(state.focusedCardIndex).toBe(-1);
      state = arrowRight(state); // change category
      expect(state.selectedCategory).toBe('top_row');
    });
  });
});
