import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { activityStore, activityData, todayActivity, totalSessions } from './activity';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock user store
vi.mock('./user', () => ({
  currentUser: {
    subscribe: (callback: (value: { id: number } | null) => void) => {
      callback({ id: 1 });
      return () => {};
    },
  },
}));

describe('Activity Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    activityStore.reset();
  });

  describe('recordSession', () => {
    it('should record a new session for today', () => {
      activityStore.recordSession(60000, 100); // 1 minute, 100 chars

      const today = new Date().toISOString().split('T')[0];
      const activity = activityStore.getActivity(today);

      expect(activity).not.toBeNull();
      expect(activity?.practiceTime).toBe(60000);
      expect(activity?.characters).toBe(100);
      expect(activity?.sessions).toBe(1);
    });

    it('should accumulate sessions on the same day', () => {
      activityStore.recordSession(60000, 100);
      activityStore.recordSession(30000, 50);

      const today = new Date().toISOString().split('T')[0];
      const activity = activityStore.getActivity(today);

      expect(activity?.practiceTime).toBe(90000);
      expect(activity?.characters).toBe(150);
      expect(activity?.sessions).toBe(2);
    });

    it('should persist to localStorage', () => {
      activityStore.recordSession(60000, 100);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      expect(savedData).toContain('practiceTime');
      expect(savedData).toContain('60000');
    });
  });

  describe('getActivity', () => {
    it('should return null for dates with no activity', () => {
      const activity = activityStore.getActivity('2024-01-01');
      expect(activity).toBeNull();
    });

    it('should return activity data for dates with activity', () => {
      activityStore.recordSession(60000, 100);
      const today = new Date().toISOString().split('T')[0];

      const activity = activityStore.getActivity(today);
      expect(activity).not.toBeNull();
      expect(activity?.date).toBe(today);
    });
  });

  describe('getAllActivity', () => {
    it('should return empty array when no activity', () => {
      const allActivity = activityStore.getAllActivity();
      expect(allActivity).toEqual([]);
    });

    it('should return all recorded activity', () => {
      activityStore.recordSession(60000, 100);
      activityStore.recordSession(30000, 50);

      const allActivity = activityStore.getAllActivity();
      expect(allActivity.length).toBe(1); // Same day, so only 1 entry
      expect(allActivity[0].sessions).toBe(2);
    });
  });

  describe('getRecentActivity', () => {
    it('should return activity for recent days', () => {
      activityStore.recordSession(60000, 100);

      const recentActivity = activityStore.getRecentActivity(7);
      expect(recentActivity.length).toBe(1);
    });

    it('should return empty array when no recent activity', () => {
      const recentActivity = activityStore.getRecentActivity(7);
      expect(recentActivity.length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear all activity data', () => {
      activityStore.recordSession(60000, 100);
      expect(activityStore.getAllActivity().length).toBe(1);

      activityStore.reset();
      expect(activityStore.getAllActivity().length).toBe(0);
    });

    it('should remove data from localStorage', () => {
      activityStore.recordSession(60000, 100);
      activityStore.reset();

      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('derived stores', () => {
    describe('activityData', () => {
      it('should return activity as array', () => {
        activityStore.recordSession(60000, 100);

        const data = get(activityData);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
      });
    });

    describe('todayActivity', () => {
      it('should return null when no activity today', () => {
        const today = get(todayActivity);
        expect(today).toBeNull();
      });

      it('should return today\'s activity', () => {
        activityStore.recordSession(60000, 100);

        const today = get(todayActivity);
        expect(today).not.toBeNull();
        expect(today?.practiceTime).toBe(60000);
      });
    });

    describe('totalSessions', () => {
      it('should return 0 when no sessions', () => {
        const total = get(totalSessions);
        expect(total).toBe(0);
      });

      it('should return total session count', () => {
        activityStore.recordSession(60000, 100);
        activityStore.recordSession(30000, 50);

        const total = get(totalSessions);
        expect(total).toBe(2);
      });
    });
  });
});

describe('Activity Heatmap Data Format', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    activityStore.reset();
  });

  it('should provide data in correct format for heatmap', () => {
    activityStore.recordSession(60000, 100);

    const data = get(activityData);
    expect(data.length).toBeGreaterThan(0);

    const dayData = data[0];
    expect(dayData).toHaveProperty('date');
    expect(dayData).toHaveProperty('practiceTime');
    expect(dayData).toHaveProperty('characters');
    expect(dayData).toHaveProperty('sessions');

    // Date should be in YYYY-MM-DD format
    expect(dayData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should calculate intensity levels correctly', () => {
    // Less than 5 minutes = level 1
    activityStore.recordSession(4 * 60000, 100);
    let data = activityStore.getAllActivity();
    expect(data[0].practiceTime).toBe(4 * 60000);

    activityStore.reset();

    // 5-15 minutes = level 2
    activityStore.recordSession(10 * 60000, 200);
    data = activityStore.getAllActivity();
    expect(data[0].practiceTime).toBe(10 * 60000);

    activityStore.reset();

    // 15-30 minutes = level 3
    activityStore.recordSession(20 * 60000, 400);
    data = activityStore.getAllActivity();
    expect(data[0].practiceTime).toBe(20 * 60000);

    activityStore.reset();

    // 30+ minutes = level 4
    activityStore.recordSession(45 * 60000, 900);
    data = activityStore.getAllActivity();
    expect(data[0].practiceTime).toBe(45 * 60000);
  });
});
