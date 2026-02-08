import { writable, derived, get } from 'svelte/store';
import type { CourseProgress, CourseStage, Course } from '../types';
import { currentUser } from './user';
import { getStorage } from '../services';
import {
  tenFingerCourse,
  cliCourse,
  claudeCodeCourse,
  sqlCourse,
  allCourses,
  getCourseStage,
  getCliCourseStage,
} from '../data/courses';
import { lessonProgress } from './app';

// Internal store for all course progress (keyed by courseId)
const allProgressInternal = writable<Map<string, CourseProgress>>(new Map());

// Currently selected course
const selectedCourseInternal = writable<Course>(tenFingerCourse);

// Track current user ID
let currentUserId: number | null = null;

// Subscribe to user changes
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadAllProgress(user.id);
  } else {
    currentUserId = null;
    allProgressInternal.set(new Map());
  }
});

// Load all course progress from storage
function loadAllProgress(userId: number): void {
  if (typeof window === 'undefined') return;

  getStorage().getAllCourseProgress(userId).then((progress) => {
    allProgressInternal.set(progress);
  }).catch(() => {
    allProgressInternal.set(new Map());
  });
}

// Save all course progress via storage service (fire-and-forget)
function saveAllProgress(progressMap: Map<string, CourseProgress>): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  getStorage().saveCourseProgress(currentUserId, progressMap).catch(console.error);
}

// Helper to get the correct course by ID
function getCourseById(courseId: string): Course | null {
  return allCourses.find((c) => c.id === courseId) || null;
}

// Helper to get stage from any course
function getStageFromCourse(course: Course, stageId: string): CourseStage | undefined {
  return course.stages.find((s) => s.id === stageId);
}

// Check if all lessons in a stage are completed
function areAllStageLessonsCompleted(stage: CourseStage): boolean {
  const lessonProgressMap = get(lessonProgress);

  for (const lessonId of stage.lessons) {
    const progress = lessonProgressMap.get(lessonId);
    if (!progress) return false;

    // We need to know the total tasks for this lesson
    // The progress object stores totalTasks
    if (progress.completedTasks < progress.totalTasks) {
      return false;
    }
  }

  return stage.lessons.length > 0;
}

// Create the course store
function createCourseStore() {
  return {
    // Subscribe to current course's progress
    get progress() {
      return derived(
        [allProgressInternal, selectedCourseInternal],
        ([$allProgress, $course]) => $allProgress.get($course.id) || null
      );
    },

    // Subscribe to selected course
    selectedCourse: { subscribe: selectedCourseInternal.subscribe },

    // Get all available courses
    get courses() {
      return allCourses;
    },

    // Select a course
    selectCourse(courseId: string): void {
      const course = getCourseById(courseId);
      if (course) {
        selectedCourseInternal.set(course);
      }
    },

    // Enroll in a course (or the currently selected one)
    enroll(courseId?: string): void {
      if (currentUserId === null) return;

      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      const progress: CourseProgress = {
        courseId: course.id,
        currentStageId: course.stages[0].id,
        completedStages: [],
        skippedStages: [],
        enrolledAt: new Date().toISOString(),
        completedAt: null,
      };

      allProgressInternal.update((map) => {
        map.set(course.id, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Check if enrolled in a course
    isEnrolled(courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      return get(allProgressInternal).has(targetCourseId);
    },

    // Get progress for a specific course
    getProgress(courseId?: string): CourseProgress | null {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      return get(allProgressInternal).get(targetCourseId) || null;
    },

    // Get current stage for selected course
    getCurrentStage(): CourseStage | null {
      const course = get(selectedCourseInternal);
      const progress = get(allProgressInternal).get(course.id);
      if (!progress?.currentStageId) return null;
      return getStageFromCourse(course, progress.currentStageId) || null;
    },

    // Check if a stage is unlocked
    isStageUnlocked(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return false;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return false;

      const stage = getStageFromCourse(course, stageId);
      if (!stage) return false;

      // First stage is always unlocked if enrolled
      if (!stage.unlockCriteria.previousStageComplete) return true;

      // Check if this stage was skipped to (explicitly unlocked)
      if (progress.skippedStages?.includes(stageId)) return true;

      // Check if previous stage is complete, skipped, or is the current stage
      const stageIndex = course.stages.findIndex((s) => s.id === stageId);
      if (stageIndex === 0) return true;

      const prevStage = course.stages[stageIndex - 1];
      // A stage is unlocked if the previous stage is:
      // 1. Completed (in completedStages)
      // 2. Skipped (in skippedStages)
      // 3. The current working stage (currentStageId) - this unlocks the next stage
      if (
        !progress.completedStages.includes(prevStage.id) &&
        !progress.skippedStages?.includes(prevStage.id) &&
        progress.currentStageId !== prevStage.id
      ) {
        return false;
      }

      // TODO: Check minWpm and minAccuracy from user stats
      return true;
    },

    // Check if a stage is completed
    isStageCompleted(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const progress = get(allProgressInternal).get(targetCourseId);
      return progress?.completedStages.includes(stageId) || false;
    },

    // Check if a stage was skipped
    isStageSkipped(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const progress = get(allProgressInternal).get(targetCourseId);
      return progress?.skippedStages?.includes(stageId) || false;
    },

    // Skip to a stage (unlock it and mark previous stages as skipped)
    skipToStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      const stageIndex = course.stages.findIndex((s) => s.id === stageId);
      if (stageIndex === -1) return;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        // Initialize skippedStages if it doesn't exist (for backwards compatibility)
        if (!progress.skippedStages) {
          progress.skippedStages = [];
        }

        // Mark all previous incomplete stages as skipped
        for (let i = 0; i < stageIndex; i++) {
          const prevStageId = course.stages[i].id;
          if (
            !progress.completedStages.includes(prevStageId) &&
            !progress.skippedStages.includes(prevStageId)
          ) {
            progress.skippedStages.push(prevStageId);
          }
        }

        // Add the target stage to skipped list to mark it as unlocked
        if (!progress.skippedStages.includes(stageId)) {
          progress.skippedStages.push(stageId);
        }

        // Set current stage to the skipped-to stage
        progress.currentStageId = stageId;

        map.set(targetCourseId, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Skip the current working stage and move to the next one
    // The "current working stage" is the first unlocked, non-completed, non-skipped stage
    // (the one showing a number in the UI, where the Skip button appears)
    // This marks that stage as skipped and moves currentStageId to the next stage
    // WITHOUT marking the next stage as skipped
    skipCurrentStage(courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      // Find the current working stage (the one that would show the Skip button)
      const skippableStageId = this.getCurrentSkippableStageId(targetCourseId);
      if (!skippableStageId) return;

      const skippableStageIndex = course.stages.findIndex((s) => s.id === skippableStageId);
      if (skippableStageIndex === -1 || skippableStageIndex >= course.stages.length - 1) {
        return;
      }

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        // Initialize skippedStages if it doesn't exist
        if (!progress.skippedStages) {
          progress.skippedStages = [];
        }

        // Mark the skippable stage as skipped (if not already completed or skipped)
        if (
          !progress.completedStages.includes(skippableStageId) &&
          !progress.skippedStages.includes(skippableStageId)
        ) {
          progress.skippedStages.push(skippableStageId);
        }

        // Move currentStageId to the next stage (without marking it as skipped)
        progress.currentStageId = course.stages[skippableStageIndex + 1].id;

        map.set(targetCourseId, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Mark a stage as completed
    completeStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        if (!progress.completedStages.includes(stageId)) {
          progress.completedStages.push(stageId);

          // Remove from skippedStages if it was there (stage is now properly completed)
          if (progress.skippedStages?.includes(stageId)) {
            progress.skippedStages = progress.skippedStages.filter(id => id !== stageId);
          }

          // Move to next stage
          const stageIndex = course.stages.findIndex((s) => s.id === stageId);
          if (stageIndex < course.stages.length - 1) {
            progress.currentStageId = course.stages[stageIndex + 1].id;
          } else {
            // Course completed
            progress.completedAt = new Date().toISOString();
          }

          map.set(targetCourseId, progress);
          saveAllProgress(map);
        }

        return map;
      });
    },

    // Set current stage
    setCurrentStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        progress.currentStageId = stageId;
        map.set(targetCourseId, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Get progress percentage for a course
    getProgressPercentage(courseId?: string): number {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return 0;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return 0;

      const totalStages = course.stages.length;
      const completedStages = progress.completedStages.length;
      return Math.round((completedStages / totalStages) * 100);
    },

    // Reset progress for a course
    reset(courseId?: string): void {
      if (currentUserId === null) return;
      const targetCourseId = courseId || get(selectedCourseInternal).id;

      allProgressInternal.update((map) => {
        map.delete(targetCourseId);
        saveAllProgress(map);
        return map;
      });
    },

    // Reset all course progress
    resetAll(): void {
      if (currentUserId === null) return;
      getStorage().deleteAllCourseProgress(currentUserId).catch(console.error);
      allProgressInternal.set(new Map());
    },

    // Get the first locked stage ID
    getFirstLockedStageId(courseId?: string): string | null {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return null;

      for (const stage of course.stages) {
        if (!this.isStageUnlocked(stage.id, targetCourseId)) {
          return stage.id;
        }
      }
      return null;
    },

    // Get the current skippable stage ID (for showing skip button)
    // This is the first stage that is unlocked, not completed, and not skipped
    // (i.e., the stage the user is actually working on - showing a number, not skip icon)
    getCurrentSkippableStageId(courseId?: string): string | null {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return null;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return null;

      // Find the first stage that is unlocked, not completed, and not skipped
      // This is the stage showing a number (not ✓, not ⏭, not 🔒)
      for (const stage of course.stages) {
        const isUnlocked = this.isStageUnlocked(stage.id, targetCourseId);
        const isCompleted = this.isStageCompleted(stage.id, targetCourseId);
        const isSkipped = this.isStageSkipped(stage.id, targetCourseId);

        if (isUnlocked && !isCompleted && !isSkipped) {
          // Don't show skip button if this is the last stage
          const stageIndex = course.stages.findIndex((s) => s.id === stage.id);
          if (stageIndex >= course.stages.length - 1) return null;

          return stage.id;
        }
      }
      return null;
    },

    // Check all stages and auto-complete any that have all lessons done
    checkAndCompleteStages(courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return;

      let hasChanges = false;

      for (const stage of course.stages) {
        // Skip if already completed
        if (progress.completedStages.includes(stage.id)) continue;

        // Check if all lessons in this stage are completed
        if (areAllStageLessonsCompleted(stage)) {
          // Mark stage as completed
          this.completeStage(stage.id, targetCourseId);
          hasChanges = true;
        }
      }
    },
  };
}

export const courseStore = createCourseStore();

// Subscribe to lesson progress changes and auto-complete stages
lessonProgress.subscribe(() => {
  // Check all enrolled courses for stage completion
  const progressMap = get(allProgressInternal);
  for (const [courseId] of progressMap) {
    courseStore.checkAndCompleteStages(courseId);
  }
});

// Derived stores
export const isEnrolled = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => $allProgress.has($course.id)
);

export const currentStageId = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    return progress?.currentStageId || null;
  }
);

export const completedStagesCount = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    return progress?.completedStages.length || 0;
  }
);

export const courseProgressPercent = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    if (!progress) return 0;
    return Math.round((progress.completedStages.length / $course.stages.length) * 100);
  }
);

// Derived store for the current skippable stage ID (reactive version)
// This is needed because the component needs to react to progress changes
export const currentSkippableStageId = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    if (!progress) return null;

    // Find the first stage that is unlocked, not completed, and not skipped
    for (const stage of $course.stages) {
      // Check unlock status inline (can't call courseStore methods in derived)
      let isUnlocked = false;
      const stageObj = $course.stages.find((s) => s.id === stage.id);
      if (stageObj) {
        if (!stageObj.unlockCriteria.previousStageComplete) {
          isUnlocked = true;
        } else if (progress.skippedStages?.includes(stage.id)) {
          isUnlocked = true;
        } else {
          const stageIndex = $course.stages.findIndex((s) => s.id === stage.id);
          if (stageIndex === 0) {
            isUnlocked = true;
          } else {
            const prevStage = $course.stages[stageIndex - 1];
            if (
              progress.completedStages.includes(prevStage.id) ||
              progress.skippedStages?.includes(prevStage.id) ||
              progress.currentStageId === prevStage.id
            ) {
              isUnlocked = true;
            }
          }
        }
      }

      const isCompleted = progress.completedStages.includes(stage.id);
      const isSkipped = progress.skippedStages?.includes(stage.id) || false;

      if (isUnlocked && !isCompleted && !isSkipped) {
        // Don't show skip button on the last stage
        const stageIndex = $course.stages.findIndex((s) => s.id === stage.id);
        if (stageIndex >= $course.stages.length - 1) return null;
        return stage.id;
      }
    }
    return null;
  }
);

// Reactive store exposing the full progress map (for components that need to react to any progress change)
export const allCourseProgress = derived(
  allProgressInternal,
  ($allProgress) => $allProgress
);

// Export all courses for easy access
export { allCourses, tenFingerCourse, cliCourse, claudeCodeCourse, sqlCourse };
