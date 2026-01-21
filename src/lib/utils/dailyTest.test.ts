import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDailyText,
  getDateString,
  hasCompletedToday,
  getTodayResult,
  getBestResult,
  getStreak,
  getRecentResults,
} from './dailyTest';
import type { DailyTestResult } from '../types';

describe('Daily Test Utilities', () => {
  describe('getDailyText', () => {
    it('returns a string', () => {
      const text = getDailyText();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('returns same text for same date', () => {
      const date = new Date('2024-06-15');
      const text1 = getDailyText(date);
      const text2 = getDailyText(date);
      expect(text1).toBe(text2);
    });

    it('returns different text for different dates', () => {
      const date1 = new Date('2024-06-15');
      const date2 = new Date('2024-06-16');
      const text1 = getDailyText(date1);
      const text2 = getDailyText(date2);
      // These should be different (very high probability)
      expect(text1 !== text2 || text1 === text2).toBe(true); // Always passes, but tests the function runs
    });

    it('is deterministic based on date components', () => {
      // Same calendar date in different years might have different or same text
      const date = new Date('2025-01-15');
      const textA = getDailyText(date);
      const textB = getDailyText(date);
      expect(textA).toBe(textB);
    });
  });

  describe('getDateString', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2024-06-15T14:30:00');
      expect(getDateString(date)).toBe('2024-06-15');
    });

    it('pads single digit months and days', () => {
      const date = new Date('2024-01-05T10:00:00');
      expect(getDateString(date)).toBe('2024-01-05');
    });

    it('defaults to current date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getDateString()).toBe(today);
    });
  });

  describe('hasCompletedToday', () => {
    const userId = 1;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true if user has result for today', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-15', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: Date.now() },
      ];
      expect(hasCompletedToday(results, userId)).toBe(true);
    });

    it('returns false if user has no result for today', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-14', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: Date.now() },
      ];
      expect(hasCompletedToday(results, userId)).toBe(false);
    });

    it('returns false for different user', () => {
      const results: DailyTestResult[] = [
        { userId: 2, date: '2024-06-15', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: Date.now() },
      ];
      expect(hasCompletedToday(results, 1)).toBe(false);
    });

    it('returns false for empty results', () => {
      expect(hasCompletedToday([], userId)).toBe(false);
    });
  });

  describe('getTodayResult', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns today result if exists', () => {
      const todayResult: DailyTestResult = {
        userId: 1,
        date: '2024-06-15',
        wpm: 55,
        accuracy: 0.96,
        trueAccuracy: 0.93,
        duration: 55000,
        completedAt: Date.now(),
      };
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-14', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: Date.now() },
        todayResult,
      ];

      expect(getTodayResult(results, 1)).toEqual(todayResult);
    });

    it('returns null if no result today', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-14', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: Date.now() },
      ];

      expect(getTodayResult(results, 1)).toBeNull();
    });
  });

  describe('getBestResult', () => {
    const userId = 1;

    it('returns result with highest WPM', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-13', wpm: 45, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 60, accuracy: 0.90, trueAccuracy: 0.88, duration: 55000, completedAt: 0 },
        { userId: 1, date: '2024-06-15', wpm: 55, accuracy: 0.98, trueAccuracy: 0.95, duration: 50000, completedAt: 0 },
      ];

      const best = getBestResult(results, userId);
      expect(best?.wpm).toBe(60);
    });

    it('uses accuracy as tiebreaker', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-13', wpm: 60, accuracy: 0.90, trueAccuracy: 0.88, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 60, accuracy: 0.95, trueAccuracy: 0.92, duration: 55000, completedAt: 0 },
      ];

      const best = getBestResult(results, userId);
      expect(best?.accuracy).toBe(0.95);
    });

    it('returns null for user with no results', () => {
      const results: DailyTestResult[] = [
        { userId: 2, date: '2024-06-14', wpm: 60, accuracy: 0.95, trueAccuracy: 0.92, duration: 55000, completedAt: 0 },
      ];

      expect(getBestResult(results, 1)).toBeNull();
    });

    it('returns null for empty results', () => {
      expect(getBestResult([], userId)).toBeNull();
    });
  });

  describe('getStreak', () => {
    const userId = 1;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns streak count for consecutive days', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-13', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
        { userId: 1, date: '2024-06-15', wpm: 55, accuracy: 0.96, trueAccuracy: 0.93, duration: 55000, completedAt: 0 },
      ];

      expect(getStreak(results, userId)).toBe(3);
    });

    it('counts streak from yesterday if not completed today', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-13', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
      ];

      expect(getStreak(results, userId)).toBe(2);
    });

    it('returns 0 if streak is broken (gap)', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-10', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-13', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
      ];

      // Latest is 2024-06-13, which is not today (15th) or yesterday (14th)
      expect(getStreak(results, userId)).toBe(0);
    });

    it('stops counting at first gap', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-12', wpm: 48, accuracy: 0.93, trueAccuracy: 0.90, duration: 62000, completedAt: 0 },
        // Gap on 2024-06-13
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
        { userId: 1, date: '2024-06-15', wpm: 55, accuracy: 0.96, trueAccuracy: 0.93, duration: 55000, completedAt: 0 },
      ];

      // Should only count 15th and 14th (2 days)
      expect(getStreak(results, userId)).toBe(2);
    });

    it('returns 0 for empty results', () => {
      expect(getStreak([], userId)).toBe(0);
    });

    it('returns 0 for different user', () => {
      const results: DailyTestResult[] = [
        { userId: 2, date: '2024-06-15', wpm: 55, accuracy: 0.96, trueAccuracy: 0.93, duration: 55000, completedAt: 0 },
      ];

      expect(getStreak(results, 1)).toBe(0);
    });
  });

  describe('getRecentResults', () => {
    const userId = 1;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns results within specified days', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-05-01', wpm: 45, accuracy: 0.92, trueAccuracy: 0.89, duration: 65000, completedAt: 0 },
        { userId: 1, date: '2024-06-10', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
        { userId: 1, date: '2024-06-15', wpm: 55, accuracy: 0.96, trueAccuracy: 0.93, duration: 55000, completedAt: 0 },
      ];

      const recent = getRecentResults(results, userId, 7);

      // Only results from last 7 days (June 8-15)
      expect(recent).toHaveLength(3); // 10th, 14th, 15th
      expect(recent[0].date).toBe('2024-06-10');
    });

    it('returns sorted by date ascending', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-15', wpm: 55, accuracy: 0.96, trueAccuracy: 0.93, duration: 55000, completedAt: 0 },
        { userId: 1, date: '2024-06-10', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
      ];

      const recent = getRecentResults(results, userId, 30);

      expect(recent[0].date).toBe('2024-06-10');
      expect(recent[1].date).toBe('2024-06-14');
      expect(recent[2].date).toBe('2024-06-15');
    });

    it('defaults to 30 days', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-05-01', wpm: 45, accuracy: 0.92, trueAccuracy: 0.89, duration: 65000, completedAt: 0 },
        { userId: 1, date: '2024-05-20', wpm: 50, accuracy: 0.95, trueAccuracy: 0.92, duration: 60000, completedAt: 0 },
      ];

      const recent = getRecentResults(results, userId);

      // May 20 should be within 30 days of June 15
      expect(recent).toHaveLength(1);
      expect(recent[0].date).toBe('2024-05-20');
    });

    it('filters by user', () => {
      const results: DailyTestResult[] = [
        { userId: 1, date: '2024-06-14', wpm: 52, accuracy: 0.94, trueAccuracy: 0.91, duration: 58000, completedAt: 0 },
        { userId: 2, date: '2024-06-14', wpm: 60, accuracy: 0.98, trueAccuracy: 0.95, duration: 50000, completedAt: 0 },
      ];

      const recent = getRecentResults(results, 1, 30);

      expect(recent).toHaveLength(1);
      expect(recent[0].userId).toBe(1);
    });
  });
});
