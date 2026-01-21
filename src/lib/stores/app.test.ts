import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  currentView,
  selectedLesson,
  currentTaskIndex,
  currentTask,
  navigateTo,
  selectLesson,
  nextTask,
  previousTask,
  recordTaskResult,
  lessonProgress,
  userStats,
  isLessonComplete,
} from './app';
import type { Lesson, Task, TaskResult } from '../types';

describe('App Store - Navigation', () => {
  const mockTask1: Task = {
    id: 'task-1',
    instruction: 'Type the first text',
    targetText: 'hello',
    minAccuracy: 0.9,
  };

  const mockTask2: Task = {
    id: 'task-2',
    instruction: 'Type the second text',
    targetText: 'world',
    minAccuracy: 0.9,
  };

  const mockTask3: Task = {
    id: 'task-3',
    instruction: 'Type the third text',
    targetText: 'test',
    minAccuracy: 0.9,
  };

  const mockLesson: Lesson = {
    id: 'lesson-1',
    name: 'Test Lesson',
    description: 'A test lesson',
    tasks: [mockTask1, mockTask2, mockTask3],
    category: 'fundamentals',
  };

  beforeEach(() => {
    // Reset stores to default state
    currentView.set('home');
    selectedLesson.set(null);
    currentTaskIndex.set(0);
    lessonProgress.set(new Map());
    userStats.set({
      totalPracticeTime: 0,
      totalWordsTyped: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      averageTrueAccuracy: 0,
      totalKeystrokes: 0,
      totalBackspaces: 0,
      totalCorrectKeystrokes: 0,
      lessonsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      problemKeys: new Map(),
    });
  });

  describe('navigateTo', () => {
    it('changes the current view', () => {
      expect(get(currentView)).toBe('home');

      navigateTo('stats');
      expect(get(currentView)).toBe('stats');

      navigateTo('practice');
      expect(get(currentView)).toBe('practice');

      navigateTo('lesson');
      expect(get(currentView)).toBe('lesson');
    });
  });

  describe('selectLesson', () => {
    it('sets the selected lesson', () => {
      expect(get(selectedLesson)).toBeNull();

      selectLesson(mockLesson);

      expect(get(selectedLesson)).toEqual(mockLesson);
    });

    it('resets the task index to 0', () => {
      currentTaskIndex.set(5);
      selectLesson(mockLesson);

      expect(get(currentTaskIndex)).toBe(0);
    });

    it('navigates to lesson view', () => {
      navigateTo('home');
      selectLesson(mockLesson);

      expect(get(currentView)).toBe('lesson');
    });

    it('sets the current task to the first task', () => {
      selectLesson(mockLesson);

      expect(get(currentTask)).toEqual(mockTask1);
    });

    it('resets task index when switching to a different lesson', () => {
      // Start with mockLesson and advance to task 2
      selectLesson(mockLesson);
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Create a different lesson
      const anotherLesson: Lesson = {
        id: 'lesson-2',
        name: 'Another Lesson',
        description: 'Another test lesson',
        tasks: [mockTask1, mockTask2],
        category: 'fundamentals',
      };

      // Select the new lesson - should reset to task 0
      selectLesson(anotherLesson);
      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)).toEqual(mockTask1);
    });

    it('resets task index even when reselecting the same lesson', () => {
      selectLesson(mockLesson);
      nextTask();
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);

      // Reselect the same lesson - should reset to task 0
      selectLesson(mockLesson);
      expect(get(currentTaskIndex)).toBe(0);
    });
  });

  describe('nextTask', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('advances to the next task', () => {
      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)).toEqual(mockTask1);

      const result = nextTask();

      expect(result).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)).toEqual(mockTask2);
    });

    it('returns true when there are more tasks', () => {
      expect(nextTask()).toBe(true);
      expect(nextTask()).toBe(true);
    });

    it('returns false when at the last task', () => {
      currentTaskIndex.set(2); // Last task

      const result = nextTask();

      expect(result).toBe(false);
      expect(get(currentTaskIndex)).toBe(2);
    });

    it('does not advance past the last task', () => {
      currentTaskIndex.set(2);
      nextTask();

      expect(get(currentTaskIndex)).toBe(2);
      expect(get(currentTask)).toEqual(mockTask3);
    });

    it('can navigate through all tasks sequentially', () => {
      expect(get(currentTask)).toEqual(mockTask1);

      nextTask();
      expect(get(currentTask)).toEqual(mockTask2);

      nextTask();
      expect(get(currentTask)).toEqual(mockTask3);

      // Should stay on last task
      nextTask();
      expect(get(currentTask)).toEqual(mockTask3);
    });

    it('advances exactly one step per call (not multiple steps)', () => {
      expect(get(currentTaskIndex)).toBe(0);

      // First call should advance to index 1
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Calling again should advance to index 2, not skip to 3 or beyond
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);

      // Should not advance past the last task
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);
    });
  });

  describe('previousTask', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('goes back to the previous task', () => {
      currentTaskIndex.set(2);
      expect(get(currentTask)).toEqual(mockTask3);

      const result = previousTask();

      expect(result).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)).toEqual(mockTask2);
    });

    it('returns true when there are previous tasks', () => {
      currentTaskIndex.set(2);

      expect(previousTask()).toBe(true);
      expect(previousTask()).toBe(true);
    });

    it('returns false when at the first task', () => {
      expect(get(currentTaskIndex)).toBe(0);

      const result = previousTask();

      expect(result).toBe(false);
      expect(get(currentTaskIndex)).toBe(0);
    });

    it('does not go before the first task', () => {
      previousTask();
      previousTask();

      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)).toEqual(mockTask1);
    });
  });

  describe('currentTask derived store', () => {
    it('returns null when no lesson is selected', () => {
      expect(get(currentTask)).toBeNull();
    });

    it('returns the correct task based on index', () => {
      selectLesson(mockLesson);

      currentTaskIndex.set(0);
      expect(get(currentTask)).toEqual(mockTask1);

      currentTaskIndex.set(1);
      expect(get(currentTask)).toEqual(mockTask2);

      currentTaskIndex.set(2);
      expect(get(currentTask)).toEqual(mockTask3);
    });

    it('returns null for out of bounds index', () => {
      selectLesson(mockLesson);
      currentTaskIndex.set(100);

      expect(get(currentTask)).toBeNull();
    });
  });

  describe('retry behavior (currentTaskIndex.update)', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('can reset the task at the same index (simulating retry)', () => {
      // This mimics what handleRetry does: currentTaskIndex.update(i => i)
      // The index stays the same but the store triggers an update
      currentTaskIndex.set(1);
      expect(get(currentTaskIndex)).toBe(1);

      // Simulate retry - index stays the same
      let updateCalled = false;
      currentTaskIndex.update((i) => {
        updateCalled = true;
        return i;
      });

      expect(updateCalled).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)).toEqual(mockTask2);
    });
  });

  describe('recordTaskResult', () => {
    const passedResult: TaskResult = {
      taskId: 'task-1',
      wpm: 50,
      rawWpm: 55,
      accuracy: 0.95,
      duration: 5000,
      errors: [],
      passed: true,
      completedAt: Date.now(),
    };

    const failedResult: TaskResult = {
      taskId: 'task-2',
      wpm: 30,
      rawWpm: 35,
      accuracy: 0.7,
      duration: 8000,
      errors: [{ index: 2, expected: 'r', typed: 't', timestamp: Date.now() }],
      passed: false,
      completedAt: Date.now(),
    };

    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('records a passed result', () => {
      recordTaskResult(passedResult);

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress).toBeDefined();
      expect(progress!.taskResults).toHaveLength(1);
      expect(progress!.completedTasks).toBe(1);
    });

    it('records a failed result', () => {
      recordTaskResult(failedResult);

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress).toBeDefined();
      expect(progress!.taskResults).toHaveLength(1);
      expect(progress!.completedTasks).toBe(0); // Failed tasks don't count
    });

    it('tracks best WPM', () => {
      recordTaskResult({ ...passedResult, wpm: 40 });
      recordTaskResult({ ...passedResult, wpm: 60, taskId: 'task-2' });
      recordTaskResult({ ...passedResult, wpm: 50, taskId: 'task-3' });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.bestWpm).toBe(60);
    });

    it('calculates average accuracy', () => {
      recordTaskResult({ ...passedResult, accuracy: 0.9 });
      recordTaskResult({ ...passedResult, accuracy: 1.0, taskId: 'task-2' });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.averageAccuracy).toBe(0.95);
    });

    it('tracks problem keys from errors', () => {
      recordTaskResult(failedResult);

      const stats = get(userStats);
      expect(stats.problemKeys.get('r')).toBe(1);
    });

    it('tracks true accuracy stats', () => {
      const resultWithTrueAccuracy: TaskResult = {
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        trueAccuracy: 0.80,
        totalKeystrokes: 25,
        backspaceCount: 5,
        duration: 5000,
        errors: [],
        passed: true,
      };

      recordTaskResult(resultWithTrueAccuracy);

      const stats = get(userStats);
      expect(stats.averageTrueAccuracy).toBe(0.80);
      expect(stats.totalKeystrokes).toBe(25);
      expect(stats.totalBackspaces).toBe(5);
    });

    it('accumulates keystroke stats across sessions', () => {
      const result1: TaskResult = {
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        trueAccuracy: 0.80,
        totalKeystrokes: 20,
        backspaceCount: 4,
        duration: 5000,
        errors: [],
        passed: true,
      };

      const result2: TaskResult = {
        taskId: 'task-2',
        wpm: 60,
        rawWpm: 65,
        accuracy: 0.90,
        trueAccuracy: 0.70,
        totalKeystrokes: 30,
        backspaceCount: 6,
        duration: 6000,
        errors: [],
        passed: true,
      };

      recordTaskResult(result1);
      recordTaskResult(result2);

      const stats = get(userStats);
      expect(stats.totalKeystrokes).toBe(50); // 20 + 30
      expect(stats.totalBackspaces).toBe(10); // 4 + 6
    });

    it('falls back to accuracy when trueAccuracy not provided', () => {
      const resultWithoutTrueAccuracy: TaskResult = {
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      };

      recordTaskResult(resultWithoutTrueAccuracy);

      const stats = get(userStats);
      expect(stats.averageTrueAccuracy).toBe(0.95); // Falls back to accuracy
    });
  });

  describe('isLessonComplete', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('returns false when no tasks are completed', () => {
      expect(get(isLessonComplete)).toBe(false);
    });

    it('returns false when some tasks are completed', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      expect(get(isLessonComplete)).toBe(false);
    });

    it('returns true when all tasks are completed', () => {
      ['task-1', 'task-2', 'task-3'].forEach((taskId) => {
        recordTaskResult({
          taskId,
          wpm: 50,
          rawWpm: 55,
          accuracy: 0.95,
          duration: 5000,
          errors: [],
          passed: true,
        });
      });

      expect(get(isLessonComplete)).toBe(true);
    });
  });
});
