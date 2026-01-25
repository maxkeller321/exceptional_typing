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
  lessonSourceView,
  getLessonSourceView,
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
    lessonSourceView.set(null);
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

    it('starts at task index 0 when no progress exists', () => {
      currentTaskIndex.set(5);
      selectLesson(mockLesson);

      expect(get(currentTaskIndex)).toBe(0);
    });

    it('navigates to lesson view', () => {
      navigateTo('home');
      selectLesson(mockLesson);

      expect(get(currentView)).toBe('lesson');
    });

    it('sets the current task to the first task when no progress exists', () => {
      selectLesson(mockLesson);

      expect(get(currentTask)).toEqual(mockTask1);
    });

    it('starts at task 0 when switching to a different lesson without progress', () => {
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

      // Select the new lesson - should start at task 0 (no progress)
      selectLesson(anotherLesson);
      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)).toEqual(mockTask1);
    });

    it('restores last task index when lesson has saved progress', () => {
      // Set up progress with lastTaskIndex = 2
      lessonProgress.set(new Map([
        ['lesson-1', {
          lessonId: 'lesson-1',
          completedTasks: 2,
          totalTasks: 3,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.9,
          lastTaskIndex: 2,
        }]
      ]));

      selectLesson(mockLesson);

      expect(get(currentTaskIndex)).toBe(2);
      expect(get(currentTask)).toEqual(mockTask3);
    });

    it('clamps restored task index to valid range if tasks were removed', () => {
      // Set up progress with lastTaskIndex = 10 (out of bounds)
      lessonProgress.set(new Map([
        ['lesson-1', {
          lessonId: 'lesson-1',
          completedTasks: 2,
          totalTasks: 3,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.9,
          lastTaskIndex: 10, // Invalid - greater than tasks.length - 1
        }]
      ]));

      selectLesson(mockLesson);

      // Should clamp to last valid index (2)
      expect(get(currentTaskIndex)).toBe(2);
    });

    it('handles negative lastTaskIndex gracefully', () => {
      // Set up progress with negative lastTaskIndex
      lessonProgress.set(new Map([
        ['lesson-1', {
          lessonId: 'lesson-1',
          completedTasks: 0,
          totalTasks: 3,
          taskResults: [],
          bestWpm: 0,
          averageAccuracy: 0,
          lastTaskIndex: -5, // Invalid
        }]
      ]));

      selectLesson(mockLesson);

      // Should clamp to 0
      expect(get(currentTaskIndex)).toBe(0);
    });

    it('restores to task 0 when lastTaskIndex is undefined in progress', () => {
      // Set up progress without lastTaskIndex
      lessonProgress.set(new Map([
        ['lesson-1', {
          lessonId: 'lesson-1',
          completedTasks: 1,
          totalTasks: 3,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.9,
          // lastTaskIndex is undefined
        }]
      ]));

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

    it('saves the task index to lesson progress', () => {
      // First, record a result to create progress entry
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      nextTask();

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress?.lastTaskIndex).toBe(1);
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

    it('multiple rapid calls in sequence each advance exactly one step', () => {
      expect(get(currentTaskIndex)).toBe(0);

      // Simulate rapid clicks - each should advance exactly one step
      const result1 = nextTask();
      expect(result1).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);

      const result2 = nextTask();
      expect(result2).toBe(true);
      expect(get(currentTaskIndex)).toBe(2);

      // At last task, should not advance
      const result3 = nextTask();
      expect(result3).toBe(false);
      expect(get(currentTaskIndex)).toBe(2);
    });

    it('nextTask is idempotent at last task (multiple calls do not change state)', () => {
      currentTaskIndex.set(2); // Last task
      expect(get(currentTaskIndex)).toBe(2);

      // Multiple calls at last task should have no effect
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);
    });

    it('currentTask updates synchronously after nextTask', () => {
      expect(get(currentTask)?.id).toBe('task-1');

      nextTask();

      // currentTask should immediately reflect the new task
      expect(get(currentTask)?.id).toBe('task-2');
      expect(get(currentTaskIndex)).toBe(1);
    });

    it('nextTask returns true only once per valid call (navigation guard)', () => {
      // First call should succeed
      const result1 = nextTask();
      expect(result1).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);

      // Verify the index actually changed before the next call
      const indexAfterFirst = get(currentTaskIndex);
      expect(indexAfterFirst).toBe(1);

      // Second call should also succeed (each call advances by exactly 1)
      const result2 = nextTask();
      expect(result2).toBe(true);
      expect(get(currentTaskIndex)).toBe(2);

      // At last task, should not advance
      const result3 = nextTask();
      expect(result3).toBe(false);
      expect(get(currentTaskIndex)).toBe(2);
    });

    it('nextTask and previousTask do not interfere with each other', () => {
      // Advance forward
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Go back
      previousTask();
      expect(get(currentTaskIndex)).toBe(0);

      // Advance forward again should work
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);
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

    it('saves the task index to lesson progress', () => {
      // First, record a result to create progress entry
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      // Advance to task 2
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Go back to task 1
      previousTask();

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress?.lastTaskIndex).toBe(0);
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

    it('saves the current task index when recording a result', () => {
      // Navigate to task 2
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Record result for task 2
      recordTaskResult({
        taskId: 'task-2',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress?.lastTaskIndex).toBe(1);
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

  describe('Per-Task Statistics', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('stores individual task result with all metrics', () => {
      const result: TaskResult = {
        taskId: 'task-1',
        wpm: 65,
        rawWpm: 72,
        accuracy: 0.92,
        trueAccuracy: 0.85,
        totalKeystrokes: 50,
        backspaceCount: 8,
        duration: 10000,
        errors: [
          { index: 5, expected: 'a', typed: 's', timestamp: Date.now() },
          { index: 12, expected: 'e', typed: 'r', timestamp: Date.now() },
        ],
        passed: true,
        completedAt: Date.now(),
      };

      recordTaskResult(result);

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress).toBeDefined();
      expect(progress!.taskResults).toHaveLength(1);

      const storedResult = progress!.taskResults[0];
      expect(storedResult.taskId).toBe('task-1');
      expect(storedResult.wpm).toBe(65);
      expect(storedResult.rawWpm).toBe(72);
      expect(storedResult.accuracy).toBe(0.92);
      expect(storedResult.trueAccuracy).toBe(0.85);
      expect(storedResult.totalKeystrokes).toBe(50);
      expect(storedResult.backspaceCount).toBe(8);
      expect(storedResult.duration).toBe(10000);
      expect(storedResult.errors).toHaveLength(2);
      expect(storedResult.passed).toBe(true);
    });

    it('tracks multiple attempts for the same task', () => {
      // First attempt - failed
      recordTaskResult({
        taskId: 'task-1',
        wpm: 40,
        rawWpm: 45,
        accuracy: 0.75,
        duration: 8000,
        errors: [{ index: 1, expected: 'a', typed: 'b', timestamp: Date.now() }],
        passed: false,
      });

      // Second attempt - passed
      recordTaskResult({
        taskId: 'task-1',
        wpm: 55,
        rawWpm: 60,
        accuracy: 0.92,
        duration: 7000,
        errors: [],
        passed: true,
      });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.taskResults).toHaveLength(2);
      expect(progress!.completedTasks).toBe(1); // Only one unique passed task
    });

    it('calculates per-lesson best WPM from all attempts', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 45,
        rawWpm: 50,
        accuracy: 0.9,
        duration: 5000,
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-1',
        wpm: 70, // Higher WPM on retry
        rawWpm: 75,
        accuracy: 0.95,
        duration: 4000,
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-2',
        wpm: 55,
        rawWpm: 60,
        accuracy: 0.88,
        duration: 6000,
        errors: [],
        passed: true,
      });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.bestWpm).toBe(70); // Best across all attempts
    });

    it('calculates per-lesson average accuracy', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.80,
        duration: 5000,
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-2',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.90,
        duration: 5000,
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-3',
        wpm: 50,
        rawWpm: 55,
        accuracy: 1.0,
        duration: 5000,
        errors: [],
        passed: true,
      });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.averageAccuracy).toBeCloseTo(0.9, 5); // (0.8 + 0.9 + 1.0) / 3
    });

    it('distinguishes between passed and failed tasks for completion count', () => {
      // Pass task 1
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      // Fail task 2
      recordTaskResult({
        taskId: 'task-2',
        wpm: 30,
        rawWpm: 35,
        accuracy: 0.6,
        duration: 5000,
        errors: [{ index: 1, expected: 'a', typed: 'b', timestamp: Date.now() }],
        passed: false,
      });

      // Pass task 3
      recordTaskResult({
        taskId: 'task-3',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.taskResults).toHaveLength(3);
      expect(progress!.completedTasks).toBe(2); // Only passed tasks count
    });
  });

  describe('Overall User Statistics', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('accumulates total practice time across sessions', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 30000, // 30 seconds
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-2',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 45000, // 45 seconds
        errors: [],
        passed: true,
      });

      const stats = get(userStats);
      expect(stats.totalPracticeTime).toBe(75000); // 75 seconds total
    });

    it('calculates total words typed based on WPM and duration', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 60, // 60 words per minute
        rawWpm: 65,
        accuracy: 0.95,
        duration: 60000, // 1 minute
        errors: [],
        passed: true,
      });

      const stats = get(userStats);
      expect(stats.totalWordsTyped).toBe(60); // 60 WPM * 1 minute
    });

    it('updates average WPM progressively', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 40,
        rawWpm: 45,
        accuracy: 0.95,
        duration: 60000,
        errors: [],
        passed: true,
      });

      let stats = get(userStats);
      expect(stats.averageWpm).toBe(40);

      recordTaskResult({
        taskId: 'task-2',
        wpm: 60,
        rawWpm: 65,
        accuracy: 0.95,
        duration: 60000,
        errors: [],
        passed: true,
      });

      stats = get(userStats);
      // Progressive average should be calculated
      expect(stats.averageWpm).toBeGreaterThan(40);
      expect(stats.averageWpm).toBeLessThan(60);
    });

    it('tracks problem keys from all sessions', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.8,
        duration: 5000,
        errors: [
          { index: 1, expected: 'a', typed: 'b', timestamp: Date.now() },
          { index: 3, expected: 'a', typed: 'c', timestamp: Date.now() },
        ],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-2',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.85,
        duration: 5000,
        errors: [
          { index: 5, expected: 'e', typed: 'r', timestamp: Date.now() },
          { index: 7, expected: 'a', typed: 'd', timestamp: Date.now() },
        ],
        passed: true,
      });

      const stats = get(userStats);
      expect(stats.problemKeys.get('a')).toBe(3); // 'a' was mistyped 3 times
      expect(stats.problemKeys.get('e')).toBe(1); // 'e' was mistyped once
    });

    it('tracks total keystrokes and backspaces', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        trueAccuracy: 0.85,
        totalKeystrokes: 100,
        backspaceCount: 15,
        duration: 5000,
        errors: [],
        passed: true,
      });

      recordTaskResult({
        taskId: 'task-2',
        wpm: 55,
        rawWpm: 60,
        accuracy: 0.92,
        trueAccuracy: 0.80,
        totalKeystrokes: 80,
        backspaceCount: 10,
        duration: 4000,
        errors: [],
        passed: true,
      });

      const stats = get(userStats);
      expect(stats.totalKeystrokes).toBe(180); // 100 + 80
      expect(stats.totalBackspaces).toBe(25); // 15 + 10
    });

    it('handles missing trueAccuracy by falling back to accuracy', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        // trueAccuracy is NOT provided
        duration: 5000,
        errors: [],
        passed: true,
      });

      const stats = get(userStats);
      expect(stats.averageTrueAccuracy).toBe(0.95); // Falls back to accuracy
    });

    it('handles missing totalKeystrokes and backspaceCount gracefully', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
        // totalKeystrokes and backspaceCount are NOT provided
      });

      const stats = get(userStats);
      expect(stats.totalKeystrokes).toBe(0);
      expect(stats.totalBackspaces).toBe(0);
    });

    it('calculates correct keystrokes accounting for backspaces and errors', () => {
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.9,
        totalKeystrokes: 100, // Total keys pressed
        backspaceCount: 10, // 10 backspaces
        duration: 5000,
        errors: [
          { index: 1, expected: 'a', typed: 'b', timestamp: Date.now() },
          { index: 2, expected: 'c', typed: 'd', timestamp: Date.now() },
        ], // 2 errors
        passed: true,
      });

      const stats = get(userStats);
      // Correct keystrokes = total - backspaces - errors = 100 - 10 - 2 = 88
      expect(stats.totalCorrectKeystrokes).toBe(88);
    });
  });

  describe('Statistics initialization and reset', () => {
    it('initializes with default stats', () => {
      const stats = get(userStats);
      expect(stats.totalPracticeTime).toBe(0);
      expect(stats.totalWordsTyped).toBe(0);
      expect(stats.averageWpm).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
      expect(stats.averageTrueAccuracy).toBe(0);
      expect(stats.totalKeystrokes).toBe(0);
      expect(stats.totalBackspaces).toBe(0);
      expect(stats.totalCorrectKeystrokes).toBe(0);
      expect(stats.lessonsCompleted).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.lastPracticeDate).toBeNull();
      expect(stats.problemKeys.size).toBe(0);
    });

    it('initializes lesson progress as empty', () => {
      const progress = get(lessonProgress);
      expect(progress.size).toBe(0);
    });
  });

  describe('Task navigation after completing a task', () => {
    beforeEach(() => {
      selectLesson(mockLesson);
    });

    it('navigating to next task after recording result works correctly', () => {
      // Complete task 1
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      expect(get(currentTaskIndex)).toBe(0);

      // Navigate to next task
      const advanced = nextTask();

      expect(advanced).toBe(true);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)?.id).toBe('task-2');
    });

    it('completing task and navigating preserves all task results', () => {
      // Complete task 1
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      // Navigate to task 2
      nextTask();

      // Complete task 2
      recordTaskResult({
        taskId: 'task-2',
        wpm: 55,
        rawWpm: 60,
        accuracy: 0.98,
        duration: 4000,
        errors: [],
        passed: true,
      });

      // Both results should be recorded
      const progress = get(lessonProgress).get('lesson-1');
      expect(progress!.taskResults).toHaveLength(2);
      expect(progress!.completedTasks).toBe(2);
    });

    it('sequential task navigation does not skip tasks', () => {
      // This test ensures that calling nextTask multiple times
      // advances sequentially without skipping

      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)?.id).toBe('task-1');

      // Complete and advance to task 2
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();

      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)?.id).toBe('task-2');

      // Complete and advance to task 3
      recordTaskResult({
        taskId: 'task-2',
        wpm: 55,
        rawWpm: 60,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();

      expect(get(currentTaskIndex)).toBe(2);
      expect(get(currentTask)?.id).toBe('task-3');

      // At last task, nextTask should not change anything
      recordTaskResult({
        taskId: 'task-3',
        wpm: 60,
        rawWpm: 65,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      const advanced = nextTask();

      expect(advanced).toBe(false);
      expect(get(currentTaskIndex)).toBe(2);
      expect(get(currentTask)?.id).toBe('task-3');
    });

    it('direct task index manipulation does not cause skipping', () => {
      // Verify that setting taskIndex directly works as expected
      currentTaskIndex.set(0);
      expect(get(currentTask)?.id).toBe('task-1');

      currentTaskIndex.set(1);
      expect(get(currentTask)?.id).toBe('task-2');

      currentTaskIndex.set(2);
      expect(get(currentTask)?.id).toBe('task-3');

      // Setting same index again should not change task
      currentTaskIndex.set(2);
      expect(get(currentTask)?.id).toBe('task-3');
    });

    it('only counts tasks with passed:true as completed', () => {
      // Complete task 1 with passed: true
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      let progress = get(lessonProgress).get('lesson-1');
      expect(progress!.completedTasks).toBe(1);

      // Navigate to task 2 and complete with passed: false
      nextTask();
      recordTaskResult({
        taskId: 'task-2',
        wpm: 30,
        rawWpm: 35,
        accuracy: 0.5,
        duration: 8000,
        errors: [{ index: 0, expected: 'a', typed: 'b', timestamp: Date.now() }],
        passed: false,
      });

      // Only task 1 should be counted as completed
      progress = get(lessonProgress).get('lesson-1');
      expect(progress!.completedTasks).toBe(1);
      expect(progress!.taskResults).toHaveLength(2);
    });

    it('navigation without completion does not mark task as completed', () => {
      // Just navigate forward without completing any task
      nextTask();
      nextTask();

      // No tasks should be marked as completed
      const progress = get(lessonProgress).get('lesson-1');
      // Progress may not exist if no results recorded
      expect(progress?.completedTasks ?? 0).toBe(0);
    });
  });

  describe('Lesson task index persistence', () => {
    const anotherLesson: Lesson = {
      id: 'lesson-2',
      name: 'Another Lesson',
      description: 'Another test lesson',
      tasks: [mockTask1, mockTask2],
      category: 'fundamentals',
    };

    beforeEach(() => {
      lessonProgress.set(new Map());
    });

    it('remembers task position when leaving and returning to a lesson', () => {
      // Start lesson 1 and progress to task 2
      selectLesson(mockLesson);
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Switch to a different lesson
      selectLesson(anotherLesson);
      expect(get(currentTaskIndex)).toBe(0);
      expect(get(selectedLesson)?.id).toBe('lesson-2');

      // Return to lesson 1 - should restore to task 2 (index 1)
      selectLesson(mockLesson);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)?.id).toBe('task-2');
    });

    it('persists task index through multiple lesson switches', () => {
      // Progress lesson 1 to task 3 (index 2)
      selectLesson(mockLesson);
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);

      // Progress lesson 2 to task 2 (index 1)
      selectLesson(anotherLesson);
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Return to lesson 1 - should be at task 3
      selectLesson(mockLesson);
      expect(get(currentTaskIndex)).toBe(2);
      expect(get(currentTask)?.id).toBe('task-3');

      // Return to lesson 2 - should be at task 2
      selectLesson(anotherLesson);
      expect(get(currentTaskIndex)).toBe(1);
      expect(get(currentTask)?.id).toBe('task-2');
    });

    it('updates lastTaskIndex when going backwards with previousTask', () => {
      selectLesson(mockLesson);

      // Record result to create progress
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });

      // Navigate forward then backward
      nextTask();
      nextTask();
      expect(get(currentTaskIndex)).toBe(2);

      previousTask();
      expect(get(currentTaskIndex)).toBe(1);

      // Leave and return - should be at task 2 (index 1)
      selectLesson(anotherLesson);
      selectLesson(mockLesson);
      expect(get(currentTaskIndex)).toBe(1);
    });

    it('starts fresh for lessons without any progress', () => {
      // Lesson 1 has progress at task 2
      selectLesson(mockLesson);
      recordTaskResult({
        taskId: 'task-1',
        wpm: 50,
        rawWpm: 55,
        accuracy: 0.95,
        duration: 5000,
        errors: [],
        passed: true,
      });
      nextTask();

      // Lesson 2 has no progress - should start at task 1
      selectLesson(anotherLesson);
      expect(get(currentTaskIndex)).toBe(0);
      expect(get(currentTask)?.id).toBe('task-1');
    });
  });

  describe('Lesson source view tracking (navigation back)', () => {
    it('tracks the source view when selecting a lesson', () => {
      // Start from home
      navigateTo('home');
      selectLesson(mockLesson);

      // Should track that we came from home
      expect(get(lessonSourceView)).toBe('home');
    });

    it('tracks course view as source when lesson started from course', () => {
      // Start from course view
      navigateTo('course');
      selectLesson(mockLesson, 'course');

      // Should track that we came from course
      expect(get(lessonSourceView)).toBe('course');
    });

    it('getLessonSourceView returns home when no source is set', () => {
      lessonSourceView.set(null);
      expect(getLessonSourceView()).toBe('home');
    });

    it('getLessonSourceView returns the stored source view', () => {
      lessonSourceView.set('course');
      expect(getLessonSourceView()).toBe('course');

      lessonSourceView.set('home');
      expect(getLessonSourceView()).toBe('home');

      lessonSourceView.set('stats');
      expect(getLessonSourceView()).toBe('stats');
    });

    it('explicit fromView parameter overrides current view', () => {
      // Current view is home
      navigateTo('home');

      // But we explicitly say we came from course
      selectLesson(mockLesson, 'course');

      expect(get(lessonSourceView)).toBe('course');
    });

    it('uses current view when no fromView parameter provided', () => {
      // Current view is stats
      navigateTo('stats');

      // No fromView parameter
      selectLesson(mockLesson);

      expect(get(lessonSourceView)).toBe('stats');
    });

    it('tracks source view correctly across multiple lesson selections', () => {
      const anotherLesson: Lesson = {
        id: 'lesson-2',
        name: 'Another Lesson',
        description: 'Another test lesson',
        tasks: [mockTask1, mockTask2],
        category: 'home_row',
        difficulty: 'beginner',
      };

      // First, select lesson from home
      navigateTo('home');
      selectLesson(mockLesson);
      expect(get(lessonSourceView)).toBe('home');

      // Then go to course view and select another lesson
      navigateTo('course');
      selectLesson(anotherLesson, 'course');
      expect(get(lessonSourceView)).toBe('course');

      // Source view should now be course, not home
      expect(getLessonSourceView()).toBe('course');
    });
  });
});
