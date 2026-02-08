import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import {
  courseStore,
  isEnrolled,
  currentStageId,
  completedStagesCount,
  courseProgressPercent,
  currentSkippableStageId,
  tenFingerCourse,
  cliCourse,
  claudeCodeCourse,
  allCourses,
} from './course';
import { lessonProgress } from './app';
import type { LessonProgress } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock currentUser store
vi.mock('./user', () => ({
  currentUser: {
    subscribe: (fn: (value: { id: number } | null) => void) => {
      fn({ id: 1 });
      return () => {};
    },
  },
}));

describe('Course Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the course store by re-enrolling
    courseStore.resetAll();
    // Always start with ten-finger course selected for consistent tests
    courseStore.selectCourse(tenFingerCourse.id);
  });

  describe('Enrollment', () => {
    it('enrolls in a course', () => {
      expect(courseStore.isEnrolled()).toBe(false);

      courseStore.enroll();

      expect(courseStore.isEnrolled()).toBe(true);
    });

    it('sets first stage as current when enrolling', () => {
      courseStore.enroll();

      const progress = courseStore.getProgress();
      expect(progress?.currentStageId).toBe(tenFingerCourse.stages[0].id);
    });

    it('initializes with empty completed and skipped stages', () => {
      courseStore.enroll();

      const progress = courseStore.getProgress();
      expect(progress?.completedStages).toEqual([]);
      expect(progress?.skippedStages).toEqual([]);
    });
  });

  describe('Stage Unlocking', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('first stage is always unlocked', () => {
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[0].id)).toBe(true);
    });

    it('subsequent stages are locked by default', () => {
      // Stage 2 is unlocked because its previous stage (stage 1) is currentStageId
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[1].id)).toBe(true);
      // Stage 3 is locked because stage 2 is neither completed, skipped, nor currentStageId
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[2].id)).toBe(false);
    });

    it('stage is unlocked after previous stage is completed', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];
      const stage3 = tenFingerCourse.stages[2];

      // Stage 2 is already unlocked (prev is currentStageId)
      expect(courseStore.isStageUnlocked(stage2.id)).toBe(true);
      // Stage 3 is locked
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(false);

      courseStore.completeStage(stage1.id);

      // After completing stage 1, currentStageId moves to stage 2
      // Stage 3 is now unlocked (prev stage 2 is currentStageId)
      expect(courseStore.isStageUnlocked(stage2.id)).toBe(true);
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(true);
    });
  });

  describe('Skipping Stages', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('skipping to a stage marks previous stages as skipped', () => {
      const stage3 = tenFingerCourse.stages[2];
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];

      courseStore.skipToStage(stage3.id);

      expect(courseStore.isStageSkipped(stage1.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage2.id)).toBe(true);
    });

    it('skipped stage is unlocked', () => {
      const stage3 = tenFingerCourse.stages[2];

      expect(courseStore.isStageUnlocked(stage3.id)).toBe(false);

      courseStore.skipToStage(stage3.id);

      expect(courseStore.isStageUnlocked(stage3.id)).toBe(true);
    });

    it('skipped stage is added to skippedStages array', () => {
      const stage3 = tenFingerCourse.stages[2];

      courseStore.skipToStage(stage3.id);

      expect(courseStore.isStageSkipped(stage3.id)).toBe(true);
    });

    it('sets current stage to the skipped-to stage', () => {
      const stage3 = tenFingerCourse.stages[2];

      courseStore.skipToStage(stage3.id);

      const progress = courseStore.getProgress();
      expect(progress?.currentStageId).toBe(stage3.id);
    });

    it('does not mark completed stages as skipped', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage3 = tenFingerCourse.stages[2];

      // Complete stage 1 first
      courseStore.completeStage(stage1.id);

      // Then skip to stage 3
      courseStore.skipToStage(stage3.id);

      // Stage 1 should be completed, not skipped
      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage1.id)).toBe(false);
    });

    it('skipping does not affect already skipped stages', () => {
      const stage2 = tenFingerCourse.stages[1];
      const stage4 = tenFingerCourse.stages[3];

      // Skip to stage 2
      courseStore.skipToStage(stage2.id);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id)).toBe(true);

      // Then skip to stage 4
      courseStore.skipToStage(stage4.id);

      // All skipped stages should remain skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[1].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[2].id)).toBe(true);
    });
  });

  describe('Completing Skipped Stages', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('completing a skipped stage removes it from skippedStages', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3 (stage 1 and 2 become skipped, stage 3 is also in skippedStages)
      courseStore.skipToStage(stage3.id);

      expect(courseStore.isStageSkipped(stage1.id)).toBe(true);

      // Go back and complete stage 1
      courseStore.completeStage(stage1.id);

      // Stage 1 should now be completed, not skipped
      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage1.id)).toBe(false);
    });

    it('completing the target skipped stage removes it from skippedStages', () => {
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3
      courseStore.skipToStage(stage3.id);

      expect(courseStore.isStageSkipped(stage3.id)).toBe(true);

      // Complete stage 3
      courseStore.completeStage(stage3.id);

      // Stage 3 should now be completed, not skipped
      expect(courseStore.isStageCompleted(stage3.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage3.id)).toBe(false);
    });

    it('completing a skipped stage counts towards progress', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3
      courseStore.skipToStage(stage3.id);

      // Complete all three stages
      courseStore.completeStage(stage1.id);
      courseStore.completeStage(stage2.id);
      courseStore.completeStage(stage3.id);

      const progress = courseStore.getProgress();
      expect(progress?.completedStages).toContain(stage1.id);
      expect(progress?.completedStages).toContain(stage2.id);
      expect(progress?.completedStages).toContain(stage3.id);
      expect(progress?.completedStages.length).toBe(3);
    });

    it('skipped stages can be completed in any order', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3
      courseStore.skipToStage(stage3.id);

      // Complete stage 2 first (out of order)
      courseStore.completeStage(stage2.id);
      expect(courseStore.isStageCompleted(stage2.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage2.id)).toBe(false);

      // Then complete stage 1
      courseStore.completeStage(stage1.id);
      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage1.id)).toBe(false);

      // Finally complete stage 3
      courseStore.completeStage(stage3.id);
      expect(courseStore.isStageCompleted(stage3.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage3.id)).toBe(false);
    });

    it('progress percentage reflects completed skipped stages', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3
      courseStore.skipToStage(stage3.id);

      const initialProgress = courseStore.getProgressPercentage();

      // Complete skipped stage 1
      courseStore.completeStage(stage1.id);

      const newProgress = courseStore.getProgressPercentage();

      // Progress should have increased
      expect(newProgress).toBeGreaterThan(initialProgress);
    });
  });

  describe('Stage Completion', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('marks stage as completed', () => {
      const stage1 = tenFingerCourse.stages[0];

      courseStore.completeStage(stage1.id);

      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
    });

    it('moves to next stage after completion', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];

      courseStore.completeStage(stage1.id);

      const progress = courseStore.getProgress();
      expect(progress?.currentStageId).toBe(stage2.id);
    });

    it('sets completedAt when last stage is completed', () => {
      // Complete all stages
      for (const stage of tenFingerCourse.stages) {
        courseStore.completeStage(stage.id);
      }

      const progress = courseStore.getProgress();
      expect(progress?.completedAt).not.toBeNull();
    });

    it('does not duplicate completed stages on multiple calls', () => {
      const stage1 = tenFingerCourse.stages[0];

      courseStore.completeStage(stage1.id);
      courseStore.completeStage(stage1.id);
      courseStore.completeStage(stage1.id);

      const progress = courseStore.getProgress();
      const stage1Count = progress?.completedStages.filter(id => id === stage1.id).length;
      expect(stage1Count).toBe(1);
    });
  });

  describe('Progress Calculation', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('starts with 0% progress', () => {
      expect(courseStore.getProgressPercentage()).toBe(0);
    });

    it('calculates progress based on completed stages', () => {
      const totalStages = tenFingerCourse.stages.length;

      courseStore.completeStage(tenFingerCourse.stages[0].id);

      const expectedProgress = Math.round((1 / totalStages) * 100);
      expect(courseStore.getProgressPercentage()).toBe(expectedProgress);
    });

    it('reaches 100% when all stages are completed', () => {
      for (const stage of tenFingerCourse.stages) {
        courseStore.completeStage(stage.id);
      }

      expect(courseStore.getProgressPercentage()).toBe(100);
    });

    it('skipped stages do not count towards progress until completed', () => {
      const stage3 = tenFingerCourse.stages[2];

      // Skip to stage 3
      courseStore.skipToStage(stage3.id);

      // Progress should still be 0% (skipped stages don't count)
      expect(courseStore.getProgressPercentage()).toBe(0);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('reset removes all progress for a course', () => {
      courseStore.completeStage(tenFingerCourse.stages[0].id);
      courseStore.completeStage(tenFingerCourse.stages[1].id);

      courseStore.reset();

      expect(courseStore.isEnrolled()).toBe(false);
    });

    it('resetAll removes all course progress', () => {
      courseStore.completeStage(tenFingerCourse.stages[0].id);

      courseStore.resetAll();

      expect(courseStore.isEnrolled()).toBe(false);
    });
  });

  describe('Derived Stores', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('isEnrolled derived store reflects enrollment status', () => {
      expect(get(isEnrolled)).toBe(true);

      courseStore.reset();

      expect(get(isEnrolled)).toBe(false);
    });

    it('currentStageId derived store reflects current stage', () => {
      expect(get(currentStageId)).toBe(tenFingerCourse.stages[0].id);

      courseStore.completeStage(tenFingerCourse.stages[0].id);

      expect(get(currentStageId)).toBe(tenFingerCourse.stages[1].id);
    });

    it('completedStagesCount derived store reflects completed count', () => {
      expect(get(completedStagesCount)).toBe(0);

      courseStore.completeStage(tenFingerCourse.stages[0].id);
      courseStore.completeStage(tenFingerCourse.stages[1].id);

      expect(get(completedStagesCount)).toBe(2);
    });

    it('courseProgressPercent derived store reflects progress', () => {
      expect(get(courseProgressPercent)).toBe(0);

      courseStore.completeStage(tenFingerCourse.stages[0].id);

      const expectedProgress = Math.round((1 / tenFingerCourse.stages.length) * 100);
      expect(get(courseProgressPercent)).toBe(expectedProgress);
    });

    it('currentSkippableStageId derived store reflects skippable stage', () => {
      // Initially, stage 1 (Foundation) is the skippable stage
      expect(get(currentSkippableStageId)).toBe(tenFingerCourse.stages[0].id);

      // Skip stage 1
      courseStore.skipCurrentStage();

      // Now stage 2 should be skippable
      expect(get(currentSkippableStageId)).toBe(tenFingerCourse.stages[1].id);
    });

    it('currentSkippableStageId updates reactively when stages are skipped', () => {
      // Skip multiple stages
      courseStore.skipCurrentStage();
      courseStore.skipCurrentStage();
      courseStore.skipCurrentStage();

      // Stage 4 should be skippable (stages 1,2,3 are skipped)
      expect(get(currentSkippableStageId)).toBe(tenFingerCourse.stages[3].id);

      // Verify the skipped stages
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[1].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[2].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[3].id)).toBe(false);
    });
  });

  describe('Multiple Courses Support', () => {
    beforeEach(() => {
      courseStore.resetAll();
    });

    it('allCourses contains all available courses', () => {
      expect(allCourses.length).toBe(3);
      expect(allCourses.find(c => c.id === 'ten-finger')).toBeDefined();
      expect(allCourses.find(c => c.id === 'cli-mastery')).toBeDefined();
      expect(allCourses.find(c => c.id === 'claude-code')).toBeDefined();
    });

    it('cliCourse has correct structure', () => {
      expect(cliCourse.id).toBe('cli-mastery');
      expect(cliCourse.name).toBe('Command Line Mastery');
      expect(cliCourse.stages.length).toBeGreaterThan(0);
      // First stage should not require previous completion
      expect(cliCourse.stages[0].unlockCriteria.previousStageComplete).toBe(false);
    });

    it('can select different courses', () => {
      // Default is ten-finger
      courseStore.selectCourse(tenFingerCourse.id);
      expect(courseStore.isEnrolled()).toBe(false);

      // Switch to CLI course
      courseStore.selectCourse(cliCourse.id);
      expect(courseStore.isEnrolled()).toBe(false);
    });

    it('enrolling in one course does not affect another', () => {
      // Enroll in ten-finger course
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.enroll();
      expect(courseStore.isEnrolled(tenFingerCourse.id)).toBe(true);

      // CLI course should not be enrolled
      expect(courseStore.isEnrolled(cliCourse.id)).toBe(false);

      // Now enroll in CLI course
      courseStore.selectCourse(cliCourse.id);
      courseStore.enroll();
      expect(courseStore.isEnrolled(cliCourse.id)).toBe(true);

      // Ten-finger should still be enrolled
      expect(courseStore.isEnrolled(tenFingerCourse.id)).toBe(true);
    });

    it('progress is tracked separately per course', () => {
      // Enroll and make progress in ten-finger
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.enroll();
      courseStore.completeStage(tenFingerCourse.stages[0].id);
      expect(courseStore.getProgressPercentage(tenFingerCourse.id)).toBeGreaterThan(0);

      // Enroll in CLI course
      courseStore.selectCourse(cliCourse.id);
      courseStore.enroll();
      // CLI course should have 0% progress
      expect(courseStore.getProgressPercentage(cliCourse.id)).toBe(0);

      // Ten-finger progress should be preserved
      expect(courseStore.getProgressPercentage(tenFingerCourse.id)).toBeGreaterThan(0);
    });

    it('skipping stages works independently per course', () => {
      // Enroll in both courses
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.enroll();
      courseStore.selectCourse(cliCourse.id);
      courseStore.enroll();

      // Skip stages in ten-finger course
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.skipCurrentStage();
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id, tenFingerCourse.id)).toBe(true);

      // CLI course should have no skipped stages
      expect(courseStore.isStageSkipped(cliCourse.stages[0].id, cliCourse.id)).toBe(false);
    });

    it('can get progress for specific course without selecting it', () => {
      // Enroll in ten-finger only
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.enroll();
      courseStore.completeStage(tenFingerCourse.stages[0].id);

      // Switch to CLI course
      courseStore.selectCourse(cliCourse.id);

      // Can still get ten-finger progress
      const tenFingerProgress = courseStore.getProgress(tenFingerCourse.id);
      expect(tenFingerProgress).not.toBeNull();
      expect(tenFingerProgress?.completedStages.length).toBe(1);
    });

    it('resetting one course does not affect another', () => {
      // Enroll in both
      courseStore.selectCourse(tenFingerCourse.id);
      courseStore.enroll();
      courseStore.completeStage(tenFingerCourse.stages[0].id);

      courseStore.selectCourse(cliCourse.id);
      courseStore.enroll();

      // Reset ten-finger
      courseStore.reset(tenFingerCourse.id);

      // Ten-finger should be unenrolled
      expect(courseStore.isEnrolled(tenFingerCourse.id)).toBe(false);

      // CLI should still be enrolled
      expect(courseStore.isEnrolled(cliCourse.id)).toBe(true);
    });

    it('CLI course has 15 stages', () => {
      expect(cliCourse.stages.length).toBe(15);
    });

    it('CLI course stages have valid lessons', () => {
      for (const stage of cliCourse.stages) {
        expect(stage.lessons.length).toBeGreaterThan(0);
        expect(stage.name).toBeTruthy();
        expect(stage.description).toBeTruthy();
      }
    });

    it('Claude Code course has correct structure', () => {
      expect(claudeCodeCourse.id).toBe('claude-code');
      expect(claudeCodeCourse.name).toBe('Claude Code Mastery');
      expect(claudeCodeCourse.stages.length).toBeGreaterThan(0);
      expect(claudeCodeCourse.stages[0].unlockCriteria.previousStageComplete).toBe(false);
    });

    it('Claude Code course has 14 stages', () => {
      expect(claudeCodeCourse.stages.length).toBe(14);
    });

    it('Claude Code course stages have valid lessons', () => {
      for (const stage of claudeCodeCourse.stages) {
        expect(stage.lessons.length).toBeGreaterThan(0);
        expect(stage.name).toBeTruthy();
        expect(stage.description).toBeTruthy();
      }
    });

    it('can enroll in Claude Code course independently', () => {
      courseStore.selectCourse(claudeCodeCourse.id);
      expect(courseStore.isEnrolled()).toBe(false);
      courseStore.enroll();
      expect(courseStore.isEnrolled()).toBe(true);
      expect(courseStore.isEnrolled(tenFingerCourse.id)).toBe(false);
      expect(courseStore.isEnrolled(cliCourse.id)).toBe(false);
    });
  });

  describe('Auto-completion of stages when all lessons are done', () => {
    beforeEach(() => {
      courseStore.enroll();
      lessonProgress.set(new Map());
    });

    it('auto-completes stage when all its lessons are completed', () => {
      const stage1 = tenFingerCourse.stages[0];

      // Simulate completing all lessons in stage 1
      const progressMap = new Map<string, LessonProgress>();
      for (const lessonId of stage1.lessons) {
        progressMap.set(lessonId, {
          lessonId,
          completedTasks: 4, // Assume 4 tasks
          totalTasks: 4,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.95,
        });
      }

      // Update lesson progress - this should trigger auto-completion
      lessonProgress.set(progressMap);

      // Stage should now be completed
      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
    });

    it('auto-removes skipped status when stage is auto-completed', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];

      // Skip to stage 2 (stage 1 becomes skipped)
      courseStore.skipToStage(stage2.id);
      expect(courseStore.isStageSkipped(stage1.id)).toBe(true);

      // Now complete all lessons in stage 1
      const progressMap = new Map<string, LessonProgress>();
      for (const lessonId of stage1.lessons) {
        progressMap.set(lessonId, {
          lessonId,
          completedTasks: 4,
          totalTasks: 4,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.95,
        });
      }

      lessonProgress.set(progressMap);

      // Stage 1 should now be completed, not skipped
      expect(courseStore.isStageCompleted(stage1.id)).toBe(true);
      expect(courseStore.isStageSkipped(stage1.id)).toBe(false);
    });

    it('does not auto-complete stage if some lessons are incomplete', () => {
      const stage1 = tenFingerCourse.stages[0];

      // Only complete some lessons in stage 1
      const progressMap = new Map<string, LessonProgress>();
      if (stage1.lessons.length > 0) {
        progressMap.set(stage1.lessons[0], {
          lessonId: stage1.lessons[0],
          completedTasks: 4,
          totalTasks: 4,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.95,
        });
      }
      // Other lessons not completed

      lessonProgress.set(progressMap);

      // Stage should NOT be completed
      expect(courseStore.isStageCompleted(stage1.id)).toBe(false);
    });

    it('does not auto-complete stage if lesson has fewer completed tasks than total', () => {
      const stage1 = tenFingerCourse.stages[0];

      // All lessons present but not fully completed
      const progressMap = new Map<string, LessonProgress>();
      for (const lessonId of stage1.lessons) {
        progressMap.set(lessonId, {
          lessonId,
          completedTasks: 2, // Only 2 of 4 tasks done
          totalTasks: 4,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.95,
        });
      }

      lessonProgress.set(progressMap);

      // Stage should NOT be completed
      expect(courseStore.isStageCompleted(stage1.id)).toBe(false);
    });

    it('updates course progress when stage is auto-completed', () => {
      const stage1 = tenFingerCourse.stages[0];

      expect(courseStore.getProgressPercentage()).toBe(0);

      // Complete all lessons in stage 1
      const progressMap = new Map<string, LessonProgress>();
      for (const lessonId of stage1.lessons) {
        progressMap.set(lessonId, {
          lessonId,
          completedTasks: 4,
          totalTasks: 4,
          taskResults: [],
          bestWpm: 50,
          averageAccuracy: 0.95,
        });
      }

      lessonProgress.set(progressMap);

      // Progress should have increased
      const expectedProgress = Math.round((1 / tenFingerCourse.stages.length) * 100);
      expect(courseStore.getProgressPercentage()).toBe(expectedProgress);
    });
  });

  describe('First locked stage detection (Skip button visibility)', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('returns third stage as first locked when only enrolled', () => {
      // Stage 1 is unlocked (current), stage 2 is unlocked (prev is currentStageId)
      // Stage 3 is the first locked
      const firstLocked = courseStore.getFirstLockedStageId();
      expect(firstLocked).toBe(tenFingerCourse.stages[2].id);
    });

    it('returns fourth stage as first locked after completing first stage', () => {
      // Complete stage 1
      courseStore.completeStage(tenFingerCourse.stages[0].id);

      // Now current is stage 2, so:
      // Stage 2 is unlocked (completed prev)
      // Stage 3 is unlocked (prev is currentStageId)
      // Stage 4 is first locked
      const firstLocked = courseStore.getFirstLockedStageId();
      expect(firstLocked).toBe(tenFingerCourse.stages[3].id);
    });

    it('returns null when all stages are unlocked', () => {
      // Complete all stages
      for (const stage of tenFingerCourse.stages) {
        courseStore.completeStage(stage.id);
      }

      const firstLocked = courseStore.getFirstLockedStageId();
      expect(firstLocked).toBeNull();
    });

    it('returns correct stage after skipping', () => {
      // Skip to stage 3 (stages 1, 2, 3 become skipped/unlocked)
      // Since stage 3 is in skippedStages, stage 4 becomes unlocked too
      // (because its previous stage - stage 3 - is in skippedStages)
      courseStore.skipToStage(tenFingerCourse.stages[2].id);

      // Stage 5 should be first locked
      const firstLocked = courseStore.getFirstLockedStageId();
      expect(firstLocked).toBe(tenFingerCourse.stages[4].id);
    });

    it('moves first locked stage when current first locked is skipped', () => {
      // Initially stage 3 is first locked (stage 1 current, stage 2 unlocked via currentStageId)
      expect(courseStore.getFirstLockedStageId()).toBe(tenFingerCourse.stages[2].id);

      // Skip to stage 2 (stages 0, 1, 2 become skipped, currentStageId becomes stage 2)
      // Wait - skipToStage adds the TARGET to skippedStages and sets it as currentStageId
      // So after skipToStage(stage 2):
      // - skippedStages = [stage 0, stage 1, stage 2]
      // - currentStageId = stage 2
      // Stage 3: prev is stage 2, which is in skippedStages AND is currentStageId -> unlocked
      // Stage 4: prev is stage 3, which is NOT in skippedStages, NOT completed, NOT currentStageId -> LOCKED
      courseStore.skipToStage(tenFingerCourse.stages[1].id);

      // Now stage 4 should be first locked
      // (stages 0,1 skipped, stage 2 unlocked AND is currentStageId, stage 3 unlocked via prev=currentStageId)
      // Wait, I made an error. Let me re-check skipToStage behavior:
      // skipToStage(stage 1) adds stages 0 and 1 to skippedStages and sets currentStageId to stage 1
      // So: skippedStages = [0, 1], currentStageId = 1
      // Stage 2: prev is stage 1, stage 1 IS in skippedStages AND IS currentStageId -> unlocked
      // Stage 3: prev is stage 2, stage 2 is NOT in skippedStages, NOT completed, NOT currentStageId -> locked
      expect(courseStore.getFirstLockedStageId()).toBe(tenFingerCourse.stages[3].id);
    });

    it('only one stage should be skippable at a time', () => {
      // The first locked stage should be the only one that can be skipped
      const firstLocked = courseStore.getFirstLockedStageId();

      // All stages before firstLocked should be either unlocked, completed, or skipped
      for (const stage of tenFingerCourse.stages) {
        if (stage.id === firstLocked) break;

        const isUnlockedOrCompleted =
          courseStore.isStageUnlocked(stage.id) ||
          courseStore.isStageCompleted(stage.id) ||
          courseStore.isStageSkipped(stage.id);

        expect(isUnlockedOrCompleted).toBe(true);
      }
    });
  });

  describe('Current skippable stage detection (Skip button on current stage)', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('returns first stage as skippable when only enrolled', () => {
      // Stage 1 is unlocked, not completed, not skipped
      const skippable = courseStore.getCurrentSkippableStageId();
      expect(skippable).toBe(tenFingerCourse.stages[0].id);
    });

    it('returns second stage as skippable after completing first stage', () => {
      // Complete stage 1
      courseStore.completeStage(tenFingerCourse.stages[0].id);

      // Now stage 2 is unlocked, not completed, not skipped
      const skippable = courseStore.getCurrentSkippableStageId();
      expect(skippable).toBe(tenFingerCourse.stages[1].id);
    });

    it('returns null when all stages are completed', () => {
      // Complete all stages
      for (const stage of tenFingerCourse.stages) {
        courseStore.completeStage(stage.id);
      }

      const skippable = courseStore.getCurrentSkippableStageId();
      expect(skippable).toBeNull();
    });

    it('returns the stage AFTER skipped stages (not the skipped ones)', () => {
      // Skip to stage 3 - stages 0,1,2 become skipped
      courseStore.skipToStage(tenFingerCourse.stages[2].id);

      // Stages 0,1,2 are skipped (show ⏭ icon)
      // Stage 3 is unlocked (because stage 2 is skipped) but NOT in skippedStages
      // So stage 3 should be skippable (shows number, not skip icon)
      const skippable = courseStore.getCurrentSkippableStageId();

      // The skippable stage should be the first unlocked, non-completed, non-skipped stage
      // After skipping to stage 2, stages 0,1,2 are in skippedStages
      // Stage 3 is unlocked (prev is skipped) but NOT skipped itself
      expect(skippable).toBe(tenFingerCourse.stages[3].id);

      // Verify earlier stages ARE skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[1].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[2].id)).toBe(true);

      // And the skippable stage is NOT skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[3].id)).toBe(false);
    });

    it('returns null for the last stage', () => {
      // Complete all but the last stage
      for (let i = 0; i < tenFingerCourse.stages.length - 1; i++) {
        courseStore.completeStage(tenFingerCourse.stages[i].id);
      }

      // Last stage is unlocked but can't be skipped (nowhere to go)
      const skippable = courseStore.getCurrentSkippableStageId();
      expect(skippable).toBeNull();
    });

    it('skippable stage is unlocked, not completed, and not skipped', () => {
      const skippable = courseStore.getCurrentSkippableStageId();

      if (skippable) {
        expect(courseStore.isStageUnlocked(skippable)).toBe(true);
        expect(courseStore.isStageCompleted(skippable)).toBe(false);
        expect(courseStore.isStageSkipped(skippable)).toBe(false);
      }
    });

    it('skip button appears on Full Alphabet (stage after skipped stages)', () => {
      // This test simulates the user's scenario from the screenshot:
      // User skipped to "Bottom Row Right" (stage index 6)
      // Stages 0-6 become skipped
      // "Full Alphabet" (stage 7) is unlocked but NOT skipped
      // Skip button should appear on "Full Alphabet"
      const bottomRowRightIndex = 6;
      const fullAlphabetIndex = 7;

      courseStore.skipToStage(tenFingerCourse.stages[bottomRowRightIndex].id);

      // Verify stages 0-6 are skipped
      for (let i = 0; i <= bottomRowRightIndex; i++) {
        expect(courseStore.isStageSkipped(tenFingerCourse.stages[i].id)).toBe(true);
      }

      // Full Alphabet should NOT be skipped (it's unlocked because prev is skipped)
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[fullAlphabetIndex].id)).toBe(false);
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[fullAlphabetIndex].id)).toBe(true);

      // The skip button should appear on Full Alphabet, not on any skipped stage
      const skippable = courseStore.getCurrentSkippableStageId();
      expect(skippable).toBe(tenFingerCourse.stages[fullAlphabetIndex].id);
    });

    it('skip button never appears on a skipped stage', () => {
      // Skip to stage 5
      courseStore.skipToStage(tenFingerCourse.stages[5].id);

      const skippable = courseStore.getCurrentSkippableStageId();

      // The skippable stage should never be one that's already skipped
      if (skippable) {
        expect(courseStore.isStageSkipped(skippable)).toBe(false);
      }

      // All stages before the skippable one should be either completed or skipped
      if (skippable) {
        const skippableIndex = tenFingerCourse.stages.findIndex((s) => s.id === skippable);
        for (let i = 0; i < skippableIndex; i++) {
          const stage = tenFingerCourse.stages[i];
          const isCompletedOrSkipped =
            courseStore.isStageCompleted(stage.id) || courseStore.isStageSkipped(stage.id);
          expect(isCompletedOrSkipped).toBe(true);
        }
      }
    });
  });

  describe('skipCurrentStage (Skip button functionality)', () => {
    beforeEach(() => {
      courseStore.enroll();
    });

    it('marks the current stage as skipped', () => {
      const stage1 = tenFingerCourse.stages[0];

      // Stage 1 should not be skipped initially
      expect(courseStore.isStageSkipped(stage1.id)).toBe(false);

      // Skip the current stage
      courseStore.skipCurrentStage();

      // Stage 1 should now be skipped
      expect(courseStore.isStageSkipped(stage1.id)).toBe(true);
    });

    it('moves currentStageId to the next stage', () => {
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];

      // Current stage should be stage 1
      expect(courseStore.getProgress()?.currentStageId).toBe(stage1.id);

      // Skip the current stage
      courseStore.skipCurrentStage();

      // Current stage should now be stage 2
      expect(courseStore.getProgress()?.currentStageId).toBe(stage2.id);
    });

    it('does NOT mark the next stage as skipped', () => {
      const stage2 = tenFingerCourse.stages[1];

      // Skip stage 1
      courseStore.skipCurrentStage();

      // Stage 2 should NOT be skipped (it's the new current stage)
      expect(courseStore.isStageSkipped(stage2.id)).toBe(false);
    });

    it('unlocks the next stage after skipping', () => {
      const stage2 = tenFingerCourse.stages[1];
      const stage3 = tenFingerCourse.stages[2];

      // Stage 2 is already unlocked (because stage 1 is currentStageId)
      expect(courseStore.isStageUnlocked(stage2.id)).toBe(true);
      // Stage 3 is locked initially
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(false);

      // Skip stage 1
      courseStore.skipCurrentStage();

      // Stage 2 should still be unlocked (now it's the current stage)
      expect(courseStore.isStageUnlocked(stage2.id)).toBe(true);
      // Stage 3 should now be unlocked (because stage 2 is currentStageId)
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(true);
    });

    it('unlocks the stage AFTER the new current stage (for UI display)', () => {
      // This is the critical fix test:
      // When we skip stage 1, stage 2 becomes currentStageId (but NOT in skippedStages)
      // Stage 3 should be unlocked because its previous stage (stage 2) is currentStageId
      const stage1 = tenFingerCourse.stages[0];
      const stage2 = tenFingerCourse.stages[1];
      const stage3 = tenFingerCourse.stages[2];
      const stage4 = tenFingerCourse.stages[3];

      // Initially: stage 1 is current, stage 2 unlocked (prev is current), stage 3 locked
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(false);
      expect(courseStore.isStageUnlocked(stage4.id)).toBe(false);

      // Skip stage 1
      courseStore.skipCurrentStage();

      // Verify stage 1 is skipped
      expect(courseStore.isStageSkipped(stage1.id)).toBe(true);

      // Verify stage 2 is the current stage and NOT skipped
      expect(courseStore.getProgress()?.currentStageId).toBe(stage2.id);
      expect(courseStore.isStageSkipped(stage2.id)).toBe(false);

      // Stage 3 should now be unlocked (because its previous stage is currentStageId)
      // This was the bug - stage 3 remained locked because stage 2 wasn't in skippedStages
      expect(courseStore.isStageUnlocked(stage3.id)).toBe(true);

      // Stage 4 should still be locked
      expect(courseStore.isStageUnlocked(stage4.id)).toBe(false);
    });

    it('skip button moves to the new current stage after skipping', () => {
      // Initially skip button should be on stage 1
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[0].id);

      // Skip stage 1
      courseStore.skipCurrentStage();

      // Now skip button should be on stage 2 (the new current stage)
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[1].id);
    });

    it('allows multiple consecutive skips', () => {
      // Skip stage 1, 2, 3
      courseStore.skipCurrentStage();
      courseStore.skipCurrentStage();
      courseStore.skipCurrentStage();

      // Stages 1, 2, 3 should be skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[0].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[1].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[2].id)).toBe(true);

      // Stage 4 should be the current stage and NOT skipped
      expect(courseStore.getProgress()?.currentStageId).toBe(tenFingerCourse.stages[3].id);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[3].id)).toBe(false);

      // Skip button should be on stage 4
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[3].id);
    });

    it('does nothing when on the last stage', () => {
      // Complete all stages except the last one
      for (let i = 0; i < tenFingerCourse.stages.length - 1; i++) {
        courseStore.completeStage(tenFingerCourse.stages[i].id);
      }

      const lastStageId = tenFingerCourse.stages[tenFingerCourse.stages.length - 1].id;
      expect(courseStore.getProgress()?.currentStageId).toBe(lastStageId);

      // Try to skip the last stage
      courseStore.skipCurrentStage();

      // Should still be on the last stage (can't skip)
      expect(courseStore.getProgress()?.currentStageId).toBe(lastStageId);
      expect(courseStore.isStageSkipped(lastStageId)).toBe(false);
    });

    it('simulates user clicking Skip on Full Alphabet', () => {
      // First, skip to Full Alphabet (stage 7) using skipToStage
      // This simulates the user having previously skipped through stages
      courseStore.skipToStage(tenFingerCourse.stages[6].id); // Skip to Bottom Row Right

      // Now the skippable stage should be Full Alphabet (stage 7)
      // because stages 0-6 are skipped
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[7].id);

      // User clicks Skip on Full Alphabet
      courseStore.skipCurrentStage();

      // Full Alphabet (stage 7) should now be skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[7].id)).toBe(true);

      // Current stage should be Shift & Capitals (stage 8)
      expect(courseStore.getProgress()?.currentStageId).toBe(tenFingerCourse.stages[8].id);

      // Shift & Capitals should NOT be skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[8].id)).toBe(false);

      // Skip button should now be on Shift & Capitals
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[8].id);
    });

    it('complete skip flow: skip marks as skipped, moves down, unlocks next, shows skip on new current', () => {
      // This test verifies the COMPLETE user experience after clicking Skip:
      // 1. The current stage gets marked as skipped (shows ⏭ icon)
      // 2. We move to the next stage (selectedStageId updates)
      // 3. The stage AFTER the new current stage is unlocked (no lock icon)
      // 4. The skip button appears on the new current stage

      // Start with some stages already skipped (like user's scenario)
      // Skip to stage 5 (stages 0-5 become skipped, currentStageId = stage 5)
      courseStore.skipToStage(tenFingerCourse.stages[5].id);

      // After skipToStage(5):
      // - Stages 0-5 are in skippedStages
      // - currentStageId is stage 5
      // - Stage 6 is unlocked (prev stage 5 is in skippedStages AND is currentStageId)
      // - Stage 7 is unlocked (prev stage 6 has prev in skippedStages... wait, let me think)

      // Actually, stage 7's prev is stage 6. Stage 6 is NOT in skippedStages, completed, or currentStageId
      // Wait - let me re-read the logic. After skipToStage(5):
      // - currentStageId = stage 5
      // - skippedStages = [0, 1, 2, 3, 4, 5]
      // So for stage 6: prev is stage 5 which IS in skippedStages -> unlocked
      // For stage 7: prev is stage 6 which is NOT in skippedStages, NOT completed, but stage 5 is currentStageId
      // Hmm, stage 7's prev (stage 6) is not currentStageId, so stage 7 should be locked

      // Let me verify the initial state: skip button should be on stage 6
      const initialSkippable = courseStore.getCurrentSkippableStageId();
      expect(initialSkippable).toBe(tenFingerCourse.stages[6].id);
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[6].id)).toBe(true);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[6].id)).toBe(false);

      // Stage 7: its prev is stage 6. Stage 6 is NOT in skippedStages/completed.
      // Is stage 6 the currentStageId? No, stage 5 is. So stage 7 should be locked.
      // But wait - we want the stage after currentStageId to be unlocked, not the stage after that.
      // The fix was: prev is currentStageId -> unlocked
      // Stage 6's prev is stage 5, stage 5 IS currentStageId -> stage 6 is unlocked
      // Stage 7's prev is stage 6, stage 6 is NOT currentStageId -> stage 7 depends on stage 6's status
      // Stage 6 is not in completed/skipped, so stage 7 should be locked

      // Actually I need to re-check. After skipToStage(5), is currentStageId stage 5 or 6?
      // Looking at skipToStage: it sets currentStageId = stageId = stage 5
      // So currentStageId is stage 5

      // For getCurrentSkippableStageId(): finds first unlocked, non-completed, non-skipped
      // Stage 5 is in skippedStages, so it's skipped -> not skippable
      // Stage 6: unlocked (prev in skippedStages), not completed, not skipped -> SKIPPABLE

      // So stage 7's unlock status: prev is stage 6, which is NOT:
      // - in completedStages
      // - in skippedStages
      // - currentStageId (which is 5)
      // So stage 7 should be LOCKED

      // Let me verify this and adjust the test
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[7].id)).toBe(false);

      // Click Skip on stage 6 (the current skippable stage)
      courseStore.skipCurrentStage();

      // After skipCurrentStage():
      // - Stage 6 gets added to skippedStages
      // - currentStageId moves to stage 7

      // 1. Stage 6 should now be skipped
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[6].id)).toBe(true);

      // 2. Current stage should move to stage 7
      expect(courseStore.getProgress()?.currentStageId).toBe(tenFingerCourse.stages[7].id);

      // 3. Stage 8 should be unlocked (because its prev stage 7 is currentStageId)
      expect(courseStore.isStageUnlocked(tenFingerCourse.stages[8].id)).toBe(true);
      // Stage 8 should NOT be completed or skipped
      expect(courseStore.isStageCompleted(tenFingerCourse.stages[8].id)).toBe(false);
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[8].id)).toBe(false);

      // 4. Skip button should now be on stage 7 (first unlocked, non-completed, non-skipped)
      expect(courseStore.getCurrentSkippableStageId()).toBe(tenFingerCourse.stages[7].id);

      // And stage 7 should NOT be skipped (it's the new current working stage)
      expect(courseStore.isStageSkipped(tenFingerCourse.stages[7].id)).toBe(false);
    });
  });
});
