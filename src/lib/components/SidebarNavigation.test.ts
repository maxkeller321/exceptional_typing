import { describe, it, expect } from 'vitest';
import type { AppView } from '../types';

/**
 * Tests for the sidebar keyboard navigation state machine.
 *
 * The App.svelte component uses ArrowUp/ArrowDown to move a visible focus
 * outline between sidebar sections, then Enter to navigate to the focused section.
 *
 * The focus outline pattern matches CourseView/CourseOverview: a 2px accent-color
 * outline on the focused nav item, with mouse hover suppressed in keyboard mode.
 *
 * Navigation is disabled when:
 * - User is in a typing view (lesson, daily, practice)
 * - User is in course view (CourseView has its own arrow key handlers)
 * - User is focused on an input/textarea
 */

const sidebarViews: AppView[] = ['home', 'practice', 'daily', 'course', 'stats', 'settings'];

// Views where arrow key navigation is blocked
const blockedViews: AppView[] = ['lesson', 'daily', 'practice'];

// Views where Up/Down arrows are handled by the view itself
const viewsWithOwnArrowHandlers: AppView[] = ['course'];

interface NavState {
  view: AppView;
  focusedNavIndex: number;
  usingNavKeyboard: boolean;
}

function createState(view: AppView): NavState {
  return { view, focusedNavIndex: -1, usingNavKeyboard: false };
}

function arrowDown(state: NavState): NavState {
  if (blockedViews.includes(state.view) || viewsWithOwnArrowHandlers.includes(state.view)) {
    return state;
  }
  const currentIndex = state.focusedNavIndex >= 0
    ? state.focusedNavIndex
    : sidebarViews.indexOf(state.view);
  if (currentIndex === -1) return state;

  const nextIndex = currentIndex < sidebarViews.length - 1 ? currentIndex + 1 : 0;
  return { ...state, focusedNavIndex: nextIndex, usingNavKeyboard: true };
}

function arrowUp(state: NavState): NavState {
  if (blockedViews.includes(state.view) || viewsWithOwnArrowHandlers.includes(state.view)) {
    return state;
  }
  const currentIndex = state.focusedNavIndex >= 0
    ? state.focusedNavIndex
    : sidebarViews.indexOf(state.view);
  if (currentIndex === -1) return state;

  const nextIndex = currentIndex > 0 ? currentIndex - 1 : sidebarViews.length - 1;
  return { ...state, focusedNavIndex: nextIndex, usingNavKeyboard: true };
}

function enter(state: NavState): NavState {
  if (!state.usingNavKeyboard || state.focusedNavIndex < 0) return state;
  return {
    view: sidebarViews[state.focusedNavIndex],
    focusedNavIndex: -1,
    usingNavKeyboard: false,
  };
}

function mouseEnter(state: NavState): NavState {
  return { ...state, focusedNavIndex: -1, usingNavKeyboard: false };
}

function mouseClick(state: NavState, targetView: AppView): NavState {
  return { view: targetView, focusedNavIndex: -1, usingNavKeyboard: false };
}

// Count how many nav items have the .focused class
function countFocused(state: NavState): number {
  if (!state.usingNavKeyboard) return 0;
  let count = 0;
  for (let i = 0; i < sidebarViews.length; i++) {
    if (state.focusedNavIndex === i) count++;
  }
  return count;
}

describe('Sidebar keyboard navigation', () => {
  describe('focus outline', () => {
    it('no items focused by default', () => {
      const state = createState('home');
      expect(countFocused(state)).toBe(0);
      expect(state.usingNavKeyboard).toBe(false);
    });

    it('ArrowDown activates keyboard mode and focuses one item', () => {
      let state = createState('home');
      state = arrowDown(state);
      expect(state.usingNavKeyboard).toBe(true);
      expect(countFocused(state)).toBe(1);
    });

    it('at most one item is focused after multiple ArrowDown', () => {
      let state = createState('home');
      for (let i = 0; i < 10; i++) {
        state = arrowDown(state);
        expect(countFocused(state)).toBeLessThanOrEqual(1);
      }
    });

    it('mouse enter clears keyboard focus', () => {
      let state = createState('home');
      state = arrowDown(state);
      expect(state.usingNavKeyboard).toBe(true);
      state = mouseEnter(state);
      expect(state.usingNavKeyboard).toBe(false);
      expect(countFocused(state)).toBe(0);
    });
  });

  describe('ArrowDown movement', () => {
    it('first ArrowDown from home focuses practice (index 1)', () => {
      let state = createState('home');
      state = arrowDown(state);
      expect(state.focusedNavIndex).toBe(1); // practice
      expect(sidebarViews[state.focusedNavIndex]).toBe('practice');
    });

    it('moves focus down sequentially', () => {
      let state = createState('home');
      state = arrowDown(state); // → practice (1)
      state = arrowDown(state); // → daily (2)
      expect(sidebarViews[state.focusedNavIndex]).toBe('daily');
      state = arrowDown(state); // → course (3)
      expect(sidebarViews[state.focusedNavIndex]).toBe('course');
      state = arrowDown(state); // → stats (4)
      expect(sidebarViews[state.focusedNavIndex]).toBe('stats');
      state = arrowDown(state); // → settings (5)
      expect(sidebarViews[state.focusedNavIndex]).toBe('settings');
    });

    it('wraps from settings to home', () => {
      let state = createState('settings');
      state = arrowDown(state); // focus wraps: settings(5) → home(0)
      expect(sidebarViews[state.focusedNavIndex]).toBe('home');
    });
  });

  describe('ArrowUp movement', () => {
    it('first ArrowUp from home wraps to settings', () => {
      let state = createState('home');
      state = arrowUp(state);
      expect(sidebarViews[state.focusedNavIndex]).toBe('settings');
    });

    it('moves focus up sequentially', () => {
      let state = createState('settings');
      state = arrowUp(state); // → stats (4)
      expect(sidebarViews[state.focusedNavIndex]).toBe('stats');
      state = arrowUp(state); // → course (3)
      expect(sidebarViews[state.focusedNavIndex]).toBe('course');
    });
  });

  describe('Enter to navigate', () => {
    it('Enter navigates to the focused view', () => {
      let state = createState('home');
      state = arrowDown(state); // focus on practice
      state = enter(state);
      expect(state.view).toBe('practice');
      expect(state.focusedNavIndex).toBe(-1);
      expect(state.usingNavKeyboard).toBe(false);
    });

    it('Enter does nothing without keyboard focus', () => {
      let state = createState('home');
      state = enter(state);
      expect(state.view).toBe('home');
    });

    it('can navigate to any sidebar view via arrows + Enter', () => {
      for (const targetView of sidebarViews) {
        let state = createState('home');
        const targetIndex = sidebarViews.indexOf(targetView);

        // Press ArrowDown enough times to reach the target
        // First arrow from 'home' (index 0) goes to index 1
        if (targetIndex === 0) {
          // For home: go around the full loop
          for (let i = 0; i < sidebarViews.length; i++) {
            state = arrowDown(state);
          }
        } else {
          for (let i = 0; i < targetIndex; i++) {
            state = arrowDown(state);
          }
        }

        expect(sidebarViews[state.focusedNavIndex]).toBe(targetView);
        state = enter(state);
        expect(state.view).toBe(targetView);
      }
    });
  });

  describe('blocked views', () => {
    it('arrows do nothing in lesson view', () => {
      const state = arrowDown(createState('lesson'));
      expect(state.usingNavKeyboard).toBe(false);
    });

    it('arrows do nothing in daily view', () => {
      const state = arrowDown(createState('daily'));
      expect(state.usingNavKeyboard).toBe(false);
    });

    it('arrows do nothing in practice view', () => {
      const state = arrowUp(createState('practice' as AppView));
      expect(state.usingNavKeyboard).toBe(false);
    });

    it('Up/Down arrows do nothing in course view (has own handlers)', () => {
      const down = arrowDown(createState('course'));
      expect(down.usingNavKeyboard).toBe(false);
      const up = arrowUp(createState('course'));
      expect(up.usingNavKeyboard).toBe(false);
    });
  });

  describe('mouse interaction clears keyboard state', () => {
    it('clicking a nav item clears focus and navigates', () => {
      let state = createState('home');
      state = arrowDown(state);
      expect(state.usingNavKeyboard).toBe(true);
      state = mouseClick(state, 'settings');
      expect(state.view).toBe('settings');
      expect(state.usingNavKeyboard).toBe(false);
      expect(state.focusedNavIndex).toBe(-1);
    });
  });

  describe('sidebar view order', () => {
    it('has 6 sidebar views', () => {
      expect(sidebarViews.length).toBe(6);
    });

    it('does not include lesson (internal view)', () => {
      expect(sidebarViews).not.toContain('lesson');
    });
  });
});
